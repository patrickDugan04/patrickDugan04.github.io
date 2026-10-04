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
      var w2 = mul(w, k);
      pt.z = fromW(w2);
      if (Math.abs(pt.z.x) > reach || Math.abs(pt.z.y) > reach) { spawn(pt, false); return; }
      var sc = toScreen(pt.z);
      if (sound.on && sc[0] > 0 && sc[0] < W && sc[1] > 0 && sc[1] < H) {
        // Notes: a particle crossing the ray arg w = 0 (pitch from its orbit
        // |w|), or landing near the attracting point (pitch from arg w).
        var a0 = Math.atan2(w.y, w.x), a1 = Math.atan2(w2.y, w2.x), wm2 = Math.hypot(w2.x, w2.y);
        if (a0 < 0 && a1 >= 0 && a1 - a0 < 1) sound.note(0.5 + Math.log(wm2) / 5, sc, "auto");
        else if (wm >= 0.12 && wm2 < 0.12) sound.note((a1 / (2 * Math.PI)) + 0.5, sc, "auto");
        // Strum: a particle entering the pointer's circle.
        var inside = !!pointer && !dragging && Math.hypot(sc[0] - pointer[0], sc[1] - pointer[1]) < STRUM_R;
        if (inside && !pt.inside) sound.note(0.5 + Math.log(wm2) / 5, sc, "strum");
        pt.inside = inside;
      }
      pt.trail.push(sc);
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
    drawRipples(lastDt);
    drawFixed();
    if (readout) {
      var kAbs = Math.exp(l.rho), kArg = l.theta;
      readout.textContent =
        classify(l) + " · k = e^λ, |k| = " + kAbs.toFixed(2) + ", arg k = " + kArg.toFixed(2);
    }
  }

  // ---- optional sound (MathSound) ---------------------------------------------
  // Off until the visitor asks. Particles pluck notes as they complete an orbit
  // or land on the attracting point; the pointer strums particles it passes
  // over; the drone's chord follows the flow type and the distance between the
  // fixed points, panned toward each point.
  var MS = window.MathSound;
  var sound = { on: false, ripples: [], drone: null, key: "", frames: 0 };
  var buckets = { auto: { n: 3, rate: 4, max: 3 }, strum: { n: 3, rate: 10, max: 3 } };
  var pointer = null;

  sound.note = function (pos, sc, kind) {
    if (!MS || !MS.running()) return;
    var bk = buckets[kind], now = performance.now() / 1000;
    bk.n = Math.min(bk.max, bk.n + (now - (bk.last || now)) * bk.rate);
    bk.last = now;
    if (bk.n < 1 || (kind === "auto" && Math.random() < 0.35)) return;
    bk.n -= 1;
    var idx = Math.floor(Math.min(0.999, Math.max(0, pos)) * 15);
    MS.pluck(MS.degree(idx + 3), { pan: (sc[0] / W) * 1.4 - 0.7, gain: kind === "strum" ? 0.085 : 0.065 });
    sound.ripples.push({ x: sc[0], y: sc[1], age: 0, strong: kind === "strum" });
  };

  var CHORDS = {           // pentatonic degrees, 0 = D
    elliptic: [0, 3, 5, 7],
    loxodromic: [0, 2, 5, 8],
    hyperbolic: [0, 3, 4, 6],
    "parabolic-ish": [0, 3, 5, 6],
  };
  sound.update = function (l, active) {
    if (!MS || !sound.on) return;
    MS.setVisible(active);
    if (!active || !l) return;
    if (!sound.drone) sound.drone = MS.drone();
    var d = Math.hypot(p.x - q.x, p.y - q.y);
    var shift = Math.max(-3, Math.min(4, Math.round((d - 1.9) * 2)));
    var type = classify(l), key = type + shift;
    var sp = toScreen(p), sq = toScreen(q);
    var pans = [sp[0] / W * 1.6 - 0.8, sq[0] / W * 1.6 - 0.8, sp[0] / W * 1.6 - 0.8, sq[0] / W * 1.6 - 0.8];
    if (key !== sound.key || sound.frames++ % 8 === 0) {
      var freqs = CHORDS[type].map(function (g) { return MS.degree(g + shift - 5); });
      sound.drone.setChord(freqs, pans, key !== sound.key ? (dragging ? 0.08 : 0.7) : undefined);
      sound.key = key;
    }
    sound.drone.setBrightness(0.25 + 0.45 * Math.min(1, Math.abs(l.theta) / 0.85) + (dragging ? 0.3 : 0));
  };

  function drawRipples(dt) {
    sound.ripples = sound.ripples.filter(function (r) { r.age += dt; return r.age < 0.7; });
    sound.ripples.forEach(function (r) {
      var f = r.age / 0.7;
      ctx.strokeStyle = "rgba(82,173,200," + ((1 - f) * (r.strong ? 0.9 : 0.6)).toFixed(3) + ")";
      ctx.lineWidth = r.strong ? 1.6 : 1.2;
      ctx.beginPath(); ctx.arc(r.x, r.y, 2 + f * (r.strong ? 16 : 11), 0, 2 * Math.PI); ctx.stroke();
    });
    if (sound.on && pointer && !dragging) {
      ctx.strokeStyle = "rgba(122,130,136,0.35)"; ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.arc(pointer[0], pointer[1], STRUM_R, 0, 2 * Math.PI); ctx.stroke();
      ctx.setLineDash([]);
    }
  }
  var STRUM_R = 26;

  if (MS && MS.supported) {
    var soundBtn = MS.toggleButton(function (on) {
      sound.on = on;
      soundBtn.title = on ? "Move over the flow to strum it; drag a fixed point to bend the chord" : "Turn on sound";
      if (hint) hint.hidden = !on;
    });
    soundBtn.title = "Turn on sound";
    cv.parentNode.insertBefore(soundBtn, cv);
    var hint = document.createElement("span");
    hint.className = "mathfig__hint";
    hint.textContent = "Move over the flow to strum it \u00b7 drag a fixed point to bend the chord";
    hint.hidden = true;
    cv.parentNode.insertBefore(hint, cv);
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
  cv.addEventListener("pointermove", function (e) {
    var r = cv.getBoundingClientRect();
    pointer = [e.clientX - r.left, e.clientY - r.top];
    if (dragging) place(dragging, pick(e).z);
  });
  cv.addEventListener("pointerup", function (e) { dragging = null; if (e.pointerType === "touch") pointer = null; });
  cv.addEventListener("pointerleave", function () { pointer = null; });
  cv.addEventListener("dblclick", function () { userMoved = false; });

  var visible = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(cv);
  }

  var last = null, lastDt = 0;
  function frame(ts) {
    if (last === null) last = ts;
    var dt = Math.min(0.05, (ts - last) / 1000);
    last = ts;
    lastDt = dt;
    var active = visible && !document.hidden;
    if (active) { var l = step(dt); render(l); sound.update(l, true); }
    else sound.update(null, false);
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
