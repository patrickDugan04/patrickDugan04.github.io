/*
 * Chain-polynomial root explorer. Draws random posets, computes c_P(t), and
 * plots every root in the complex plane against the interval [-4, 0].
 * Expects chain-roots-core.js to be loaded first, and a
 * <div class="mathfig" data-chain-roots> to mount into.
 */
(function () {
  "use strict";
  var C = window.ChainRoots;
  var mount = document.querySelector("[data-chain-roots]");
  if (!C || !mount) return;

  var COL = {
    text: "#494e52",
    gray: "#7a8288",
    light: "#bdc1c4",
    faint: "#f2f3f3",
    blue: "#52adc8",
    red: "#ee5f5b",
  };
  var font = getComputedStyle(document.body).fontFamily;
  var mono = 'Monaco, Consolas, "Lucida Console", monospace';
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  mount.innerHTML =
    '<div class="mathfig__panel">' +
    '<div class="mathfig__controls">' +
    '<div class="mathfig__seg" role="group" aria-label="Poset family">' +
    '<button class="mathfig__btn is-active" data-mode="graded">Graded posets</button>' +
    '<button class="mathfig__btn" data-mode="any">Any poset</button>' +
    '<button class="mathfig__btn" data-mode="extremal">Extremal family</button>' +
    "</div>" +
    '<div class="mathfig__seg">' +
    '<button class="mathfig__btn" data-act="play"></button>' +
    '<button class="mathfig__btn" data-act="step">Step</button>' +
    '<button class="mathfig__btn" data-act="clear">Clear</button>' +
    "</div></div>" +
    '<div class="mathfig__plots">' +
    '<canvas aria-label="Roots of chain polynomials in the complex plane"></canvas>' +
    '<canvas aria-label="Hasse diagram of the current poset"></canvas>' +
    "</div>" +
    '<div class="mathfig__stats" aria-live="polite"></div>' +
    "</div>";

  var cvs = mount.querySelectorAll("canvas");
  var plot = cvs[0], hasseCv = cvs[1];
  var stats = mount.querySelector(".mathfig__stats");
  var playBtn = mount.querySelector('[data-act="play"]');

  var EXT_K = 4, EXT_T_MAX = 20;
  var state;
  var playing = !reduced;
  var seed = 1;

  function reset() {
    state = {
      roots: [],      // accumulated [re, im, escaped]
      current: null,  // { P, roots, H }
      count: 0,
      realCount: 0,
      least: 0,
      escapes: 0,
      T: 0,
      trail: [],      // extremal mode: least root per T
    };
  }

  var mode = "graded";
  reset();

  function draw() {
    var P;
    if (mode === "graded") {
      P = C.randomGraded(C.mulberry32(seed++), { minRanks: 3, maxRanks: 9, maxWidth: 5, density: 0.3 });
    } else if (mode === "any") {
      P = C.randomUngraded(C.mulberry32(seed++), { minElems: 6, maxElems: 13, edgeProb: 0.3 });
    } else {
      state.T = state.T >= EXT_T_MAX ? 1 : state.T + 1;
      if (state.T === 1) { state.roots = []; state.trail = []; }
      P = C.deBruijn(EXT_K, state.T);
    }
    var roots = C.polyRoots(C.chainPolynomial(P));
    var least = 0;
    roots.forEach(function (r) {
      var esc = r[1] === 0 && r[0] < -4 - 1e-9;
      if (r[1] === 0) { state.realCount++; least = Math.min(least, r[0]); }
      if (esc) state.escapes++;
      state.roots.push([r[0], r[1], esc]);
    });
    if (state.roots.length > 6000) state.roots.splice(0, state.roots.length - 6000);
    state.least = Math.min(state.least, least);
    state.count++;
    if (mode === "extremal") state.trail.push([state.T, least]);
    state.current = { P: P, roots: roots, H: C.hasse(P), least: least };
    render();
  }

  // ---- canvas helpers -------------------------------------------------
  function setup(cv) {
    var dpr = window.devicePixelRatio || 1;
    var w = cv.clientWidth, h = cv.clientHeight;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    }
    var ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx: ctx, w: w, h: h };
  }

  function renderPlot() {
    var g = setup(plot), ctx = g.ctx, w = g.w, h = g.h;
    var x0 = -6.5, x1 = 1, pad = 10;
    var sx = (w - 2 * pad) / (x1 - x0);
    var yr = (h / 2 - pad) / sx;           // equal aspect ratio
    function X(x) { return pad + (x - x0) * sx; }
    function Y(y) { return h / 2 - y * sx; }

    // Shaded strip for [-4, 0] and gridlines at integers.
    ctx.fillStyle = "rgba(82,173,200,0.10)";
    ctx.fillRect(X(-4), 0, X(0) - X(-4), h);
    ctx.strokeStyle = COL.faint; ctx.lineWidth = 1;
    for (var i = Math.ceil(x0); i <= x1; i++) {
      ctx.beginPath(); ctx.moveTo(X(i) + 0.5, 0); ctx.lineTo(X(i) + 0.5, h); ctx.stroke();
    }
    for (var j = -Math.floor(yr); j <= Math.floor(yr); j++) {
      if (!j) continue;
      ctx.beginPath(); ctx.moveTo(0, Y(j) + 0.5); ctx.lineTo(w, Y(j) + 0.5); ctx.stroke();
    }
    // Axes and labels.
    ctx.strokeStyle = COL.light;
    ctx.beginPath(); ctx.moveTo(0, Y(0) + 0.5); ctx.lineTo(w, Y(0) + 0.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(X(0) + 0.5, 0); ctx.lineTo(X(0) + 0.5, h); ctx.stroke();
    ctx.strokeStyle = COL.blue; ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(X(-4) + 0.5, 0); ctx.lineTo(X(-4) + 0.5, h); ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = "11px " + font; ctx.fillStyle = COL.gray; ctx.textAlign = "center";
    for (i = Math.ceil(x0); i <= x1; i++) ctx.fillText(i < 0 ? "−" + -i : String(i), X(i), Y(0) + 14);
    ctx.textAlign = "center"; ctx.fillStyle = COL.blue;
    ctx.fillText("[−4, 0]", X(-2), 14);
    ctx.fillStyle = COL.gray; ctx.textAlign = "right";
    ctx.fillText("Re t", w - 4, Y(0) - 6);

    // Extremal mode: the limiting value for k = EXT_K.
    if (mode === "extremal") {
      var lim = C.deBruijnLimit(EXT_K);
      ctx.strokeStyle = COL.text; ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(X(lim) + 0.5, 0); ctx.lineTo(X(lim) + 0.5, h); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = COL.text; ctx.textAlign = "right";
      ctx.fillText("limit " + fmt(lim), X(lim) - 4, h - 8);
    }

    // Accumulated roots; off-screen real roots pile up as a marker at the left edge.
    var offLeft = 0, offMin = 0;
    state.roots.forEach(function (r) {
      if (r[0] < x0) { if (r[1] === 0) { offLeft++; offMin = Math.min(offMin, r[0]); } return; }
      if (Math.abs(r[1]) > yr) return;
      ctx.beginPath();
      if (r[1] === 0) {
        ctx.fillStyle = r[2] ? "rgba(238,95,91,0.55)" : "rgba(82,173,200,0.35)";
        ctx.arc(X(r[0]), Y(0), 2.6, 0, 2 * Math.PI);
      } else {
        ctx.fillStyle = "rgba(122,130,136,0.22)";
        ctx.arc(X(r[0]), Y(r[1]), 1.6, 0, 2 * Math.PI);
      }
      ctx.fill();
    });
    if (offLeft) {
      ctx.fillStyle = COL.red; ctx.textAlign = "left";
      ctx.fillText("← " + offLeft + " more, down to " + fmt(offMin), 4, Y(0) - 8);
    }

    // The current polynomial's roots, emphasised.
    if (state.current) {
      state.current.roots.forEach(function (r) {
        var x = Math.max(x0, r[0]);
        if (Math.abs(r[1]) > yr) return;
        var esc = r[1] === 0 && r[0] < -4 - 1e-9;
        ctx.beginPath(); ctx.arc(X(x), Y(r[1]), 4.5, 0, 2 * Math.PI);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = esc ? COL.red : r[1] === 0 ? COL.blue : COL.gray;
        ctx.stroke();
      });
    }
    if (mode === "extremal" && state.trail.length) {
      ctx.fillStyle = COL.text; ctx.textAlign = "left";
      ctx.fillText("L(" + EXT_K + ", " + state.T + "): " + (state.T + 1) + " ranks \u00d7 " + EXT_K * EXT_K, 6, 14);
    }
  }

  function renderHasse() {
    var g = setup(hasseCv), ctx = g.ctx, w = g.w, h = g.h;
    ctx.strokeStyle = COL.faint; ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
    if (!state.current) return;
    var P = state.current.P, H = state.current.H;
    var rows = [], maxL = 0;
    H.level.forEach(function (l, v) { (rows[l] = rows[l] || []).push(v); maxL = Math.max(maxL, l); });
    var pos = [], pad = 16;
    // Order each row by the mean position of lower covers to cut crossings.
    var downs = [];
    H.covers.forEach(function (c) { (downs[c[1]] = downs[c[1]] || []).push(c[0]); });
    rows.forEach(function (row, l) {
      if (l > 0) {
        row.sort(function (a, b) { return bary(a) - bary(b); });
      }
      row.forEach(function (v, i) {
        pos[v] = [
          pad + ((i + 0.5) / row.length) * (w - 2 * pad),
          h - pad - (maxL ? (l / maxL) * (h - 2 * pad - 14) : (h - 2 * pad) / 2),
        ];
      });
    });
    function bary(v) {
      var d = downs[v];
      if (!d || !d.length) return 0;
      var s = 0; d.forEach(function (u) { s += pos[u][0]; }); return s / d.length;
    }
    var big = P.n > 60;
    ctx.strokeStyle = big ? "rgba(122,130,136,0.12)" : COL.light; ctx.lineWidth = 1;
    H.covers.forEach(function (c) {
      ctx.beginPath(); ctx.moveTo(pos[c[0]][0], pos[c[0]][1]); ctx.lineTo(pos[c[1]][0], pos[c[1]][1]); ctx.stroke();
    });
    ctx.fillStyle = COL.text;
    pos.forEach(function (p) { ctx.beginPath(); ctx.arc(p[0], p[1], big ? 1.5 : 3, 0, 2 * Math.PI); ctx.fill(); });
    ctx.font = "11px " + font; ctx.fillStyle = COL.gray; ctx.textAlign = "left";
    ctx.fillText(P.n + " elements" + (P.graded ? ", graded" : ""), 6, 14);
  }

  function fmt(x) { return (x < 0 ? "−" : "") + Math.abs(x).toFixed(4); }

  function renderStats() {
    var s = state;
    var c = s.current;
    if (mode === "extremal") {
      stats.innerHTML =
        "de Bruijn poset L(" + EXT_K + ", " + s.T + "): least root " + (c ? fmt(c.least) : "—") +
        " → " + fmt(C.deBruijnLimit(EXT_K)) + " as ranks grow; the bound −4 is approached as k → ∞, never crossed.";
      return;
    }
    stats.innerHTML =
      s.count + " posets · " + s.realCount + " real roots · least real root " + fmt(s.least) +
      ' · <span class="' + (s.escapes ? "is-bad" : "") + '">' + s.escapes + " outside [−4, 0]</span>";
  }

  function render() {
    renderPlot(); renderHasse(); renderStats();
    playBtn.textContent = playing ? "Pause" : "Play";
  }

  // ---- controls --------------------------------------------------------
  mount.querySelectorAll("[data-mode]").forEach(function (b) {
    b.addEventListener("click", function () {
      mount.querySelectorAll("[data-mode]").forEach(function (o) { o.classList.toggle("is-active", o === b); });
      mode = b.getAttribute("data-mode");
      reset(); draw();
    });
  });
  playBtn.addEventListener("click", function () { playing = !playing; render(); });
  mount.querySelector('[data-act="step"]').addEventListener("click", function () { playing = false; draw(); });
  mount.querySelector('[data-act="clear"]').addEventListener("click", function () { reset(); draw(); });

  // Run only while on screen.
  var visible = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(mount);
  }
  var last = 0;
  function tick(ts) {
    var every = mode === "extremal" ? 450 : 220;
    if (playing && visible && !document.hidden && ts - last > every) { last = ts; draw(); }
    requestAnimationFrame(tick);
  }
  window.addEventListener("resize", render);
  draw();
  requestAnimationFrame(tick);
})();
