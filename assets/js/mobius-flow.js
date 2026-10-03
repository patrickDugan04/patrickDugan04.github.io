/*
 * Möbius flow: particles carried by a one-parameter group of Möbius
 * transformations with fixed points p and q. In the coordinate
 * w = (z - p) / (z - q) the flow is w -> e^{lambda t} w, so the orbits are the
 * Steiner circles of p and q. lambda drifts between the elliptic (real part
 * zero), hyperbolic (imaginary part zero) and loxodromic cases.
 * Mounts on <canvas data-mobius-flow>; writes a live readout to
 * [data-mobius-readout] if present.
 */
(function () {
  "use strict";
  var cv = document.querySelector("[data-mobius-flow]");
  if (!cv) return;
  var readout = document.querySelector("[data-mobius-readout]");
  var ctx = cv.getContext("2d");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var BLUE = [82, 173, 200], GRAY = [122, 130, 136];
  var TRAIL = 30;
  var SPEED = 1.7;   // flow time per real second

  // Phases of lambda = rho + i theta; the flow eases between them.
  var PHASES = [
    { rho: -0.45, theta: 0.85, name: "loxodromic" },
    { rho: 0, theta: 0.7, name: "elliptic" },
    { rho: -0.6, theta: 0, name: "hyperbolic" },
  ];
  var PHASE_SECONDS = 9;

  var W = 0, H = 0, unit = 1, dpr = 1;
  var p = { x: -0.9, y: 0.1 }, q = { x: 0.9, y: -0.1 };   // sink, source
  var userMoved = false;
  var particles = [];
  var t = 0;

  // ---- complex helpers on {x, y} ----------------------------------------
  function sub(a, b) { return { x: a.x - b.x, y: a.y - b.y }; }
  function mul(a, b) { return { x: a.x * b.x - a.y * b.y, y: a.x * b.y + a.y * b.x }; }
  function div(a, b) {
    var m = b.x * b.x + b.y * b.y;
    return { x: (a.x * b.x + a.y * b.y) / m, y: (a.y * b.x - a.x * b.y) / m };
  }
  function toW(z) { return div(sub(z, p), sub(z, q)); }
  function fromW(w) { return div(sub(mul(w, q), p), sub(w, { x: 1, y: 0 })); }

  function toScreen(z) { return [W / 2 + z.x * unit, H / 2 - z.y * unit]; }
  function fromScreen(sx, sy) { return { x: (sx - W / 2) / unit, y: (H / 2 - sy) / unit }; }

  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    unit = Math.min(W / 4.2, H / 2.4);
    var n = Math.round(Math.min(420, (W * H) / 900));
    particles = [];
    for (var i = 0; i < n; i++) particles.push(spawn({}, true));
  }

  function spawn(pt, anyAge) {
    pt.z = fromScreen(Math.random() * W, Math.random() * H);
    pt.life = 3 + Math.random() * 5;
    pt.age = anyAge ? Math.random() * pt.life : 0;
    pt.trail = [];
    return pt;
  }

  // Current lambda, eased between phases.
  function lambda() {
    var s = t / PHASE_SECONDS, i = Math.floor(s) % PHASES.length;
    var a = PHASES[i], b = PHASES[(i + 1) % PHASES.length];
    var f = s - Math.floor(s);
    var e = f < 0.7 ? 0 : (1 - Math.cos(((f - 0.7) / 0.3) * Math.PI)) / 2;
    return { rho: a.rho + (b.rho - a.rho) * e, theta: a.theta + (b.theta - a.theta) * e };
  }

  function classify(l) {
    var r = Math.abs(l.rho) < 0.02, th = Math.abs(l.theta) < 0.02;
    return r && th ? "parabolic-ish" : r ? "elliptic" : th ? "hyperbolic" : "loxodromic";
  }

  function step(dt) {
    t += dt;
    if (!userMoved) {
      // Slow drift of the fixed points so the picture never sits still.
      p = { x: -0.95 + 0.25 * Math.sin(t * 0.13), y: 0.15 * Math.cos(t * 0.17) };
      q = { x: 0.95 + 0.2 * Math.cos(t * 0.11), y: -0.12 + 0.15 * Math.sin(t * 0.19) };
    }
    var l = lambda();
    var h = dt * SPEED, mag = Math.exp(l.rho * h);
    var k = { x: mag * Math.cos(l.theta * h), y: mag * Math.sin(l.theta * h) };
    var reach = 1.6 * Math.max(W, H) / unit;
    particles.forEach(function (pt) {
      pt.age += dt;
      var w = toW(pt.z);
      var wm = Math.hypot(w.x, w.y);
      if (pt.age > pt.life || wm < 0.015 || wm > 70 || !isFinite(wm)) { spawn(pt, false); return; }
      pt.z = fromW(mul(w, k));
      if (Math.abs(pt.z.x) > reach || Math.abs(pt.z.y) > reach) { spawn(pt, false); return; }
      pt.trail.push(toScreen(pt.z));
      if (pt.trail.length > TRAIL) pt.trail.shift();
    });
    return l;
  }

  // Faint Steiner net: circles |w| = r and arcs arg w = phi.
  function drawNet() {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(122,130,136,0.15)";
    var i, j, z, s;
    [0.25, 0.45, 0.7, 1, 1.45, 2.2, 4].forEach(function (r) {
      ctx.beginPath();
      for (j = 0; j <= 96; j++) {
        var a = (j / 96) * 2 * Math.PI;
        z = fromW({ x: r * Math.cos(a), y: r * Math.sin(a) });
        s = toScreen(z);
        if (j) ctx.lineTo(s[0], s[1]); else ctx.moveTo(s[0], s[1]);
      }
      ctx.stroke();
    });
    for (i = 0; i < 12; i++) {
      var phi = (i / 12) * 2 * Math.PI;
      ctx.beginPath();
      for (j = 1; j < 80; j++) {
        var rr = Math.tan((j / 80) * (Math.PI / 2));
        z = fromW({ x: rr * Math.cos(phi), y: rr * Math.sin(phi) });
        s = toScreen(z);
        if (j > 1) ctx.lineTo(s[0], s[1]); else ctx.moveTo(s[0], s[1]);
      }
      ctx.stroke();
    }
  }

  function drawParticles() {
    ctx.lineCap = "round";
    // One path per trail segment index, so alpha fades along each trail.
    for (var s = 1; s < TRAIL; s++) {
      var f = s / (TRAIL - 1);
      var c = [0, 1, 2].map(function (i) { return Math.round(GRAY[i] + (BLUE[i] - GRAY[i]) * f); });
      ctx.strokeStyle = "rgba(" + c.join(",") + "," + (0.05 + 0.75 * f * f).toFixed(3) + ")";
      ctx.lineWidth = 0.6 + 1.2 * f;
      ctx.beginPath();
      particles.forEach(function (pt) {
        var tr = pt.trail, off = TRAIL - tr.length;
        var a = tr[s - 1 - off], b = tr[s - off];
        if (!a || !b) return;
        if (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) > 80) return;
        ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
      });
      ctx.stroke();
    }
  }

  function drawFixed() {
    var sp = toScreen(p), sq = toScreen(q);
    ctx.fillStyle = "rgb(" + BLUE.join(",") + ")";
    ctx.beginPath(); ctx.arc(sp[0], sp[1], 4, 0, 2 * Math.PI); ctx.fill();
    ctx.strokeStyle = "#494e52"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(sq[0], sq[1], 4, 0, 2 * Math.PI); ctx.stroke();
  }

  function render(l) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    drawNet();
    drawParticles();
    drawFixed();
    if (readout) {
      var kAbs = Math.exp(l.rho), kArg = l.theta;
      readout.textContent =
        classify(l) + " · k = e^λ, |k| = " + kAbs.toFixed(2) + ", arg k = " + kArg.toFixed(2);
    }
  }

  // Click or drag moves whichever fixed point is nearer.
  var dragging = null;
  function pick(e) {
    var r = cv.getBoundingClientRect();
    var z = fromScreen(e.clientX - r.left, e.clientY - r.top);
    var dp = Math.hypot(z.x - p.x, z.y - p.y), dq = Math.hypot(z.x - q.x, z.y - q.y);
    return { z: z, which: dp <= dq ? "p" : "q" };
  }
  function place(which, z) {
    var other = which === "p" ? q : p;
    if (Math.hypot(z.x - other.x, z.y - other.y) < 0.08) return;
    if (which === "p") p = z; else q = z;
    if (reduced) render(lambda());
  }
  cv.addEventListener("pointerdown", function (e) {
    userMoved = true;
    var h = pick(e); dragging = h.which; place(h.which, h.z);
    cv.setPointerCapture(e.pointerId);
  });
  cv.addEventListener("pointermove", function (e) { if (dragging) place(dragging, pick(e).z); });
  cv.addEventListener("pointerup", function () { dragging = null; });
  cv.addEventListener("dblclick", function () { userMoved = false; });

  var visible = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(cv);
  }

  var last = null;
  function frame(ts) {
    if (last === null) last = ts;
    var dt = Math.min(0.05, (ts - last) / 1000);
    last = ts;
    if (visible && !document.hidden) render(step(dt));
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", function () { resize(); if (reduced) render(staticFrame()); });
  resize();

  function staticFrame() {
    // Reduced motion: advance the flow off-screen once, then hold still.
    for (var i = 0; i < 40; i++) step(1 / 30);
    return lambda();
  }
  if (reduced) render(staticFrame());
  else requestAnimationFrame(frame);
})();
