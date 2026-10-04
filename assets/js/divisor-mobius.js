/*
 * The divisor lattice of n with the number-theoretic Möbius function on each
 * node. Selecting d highlights the interval [d, n] and computes the poset
 * Möbius function mu(d, n) by its recursion, which always equals mu(n/d).
 *
 * Full widget mounts on <div data-divisor-mobius>. Registers
 * MathWidgets.divisorMobius.thumb(canvas) -> frame(seconds).
 */
(function () {
  "use strict";
  var MW = (window.MathWidgets = window.MathWidgets || {});
  var COL = { text: "#494e52", gray: "#7a8288", light: "#bdc1c4", faint: "#f2f3f3", blue: "#52adc8", red: "#ee5f5b" };

  function factor(n) {
    var f = [];
    for (var q = 2; q * q <= n; q++) {
      if (n % q) continue;
      var e = 0; while (n % q === 0) { n /= q; e++; }
      f.push([q, e]);
    }
    if (n > 1) f.push([n, 1]);
    return f;
  }
  function divisors(n) {
    var d = [];
    for (var i = 1; i <= n; i++) if (n % i === 0) d.push(i);
    return d;
  }
  function mu(n) {
    var f = factor(n);
    for (var i = 0; i < f.length; i++) if (f[i][1] > 1) return 0;
    return f.length % 2 ? -1 : 1;
  }
  function bigOmega(n) { return factor(n).reduce(function (s, x) { return s + x[1]; }, 0); }
  function phi(n) { return factor(n).reduce(function (r, x) { return (r / x[0]) * (x[0] - 1); }, n); }

  // Poset Möbius function on the interval [a, b] of the divisor order.
  function posetMu(a, b) {
    var memo = {};
    function m(x) {           // mu(a, x)
      if (memo[x] !== undefined) return memo[x];
      if (x === a) return (memo[x] = 1);
      var s = 0;
      for (var y = a; y < x; y += a) if (x % y === 0) s += m(y);
      return (memo[x] = -s);
    }
    return m(b);
  }

  /*
   * Layout: rows by Omega(d); within a row, order by a projection that sends
   * each prime to its own direction, which keeps product-of-chains shapes tidy.
   */
  function layout(n, w, h, pad) {
    var ds = divisors(n), f = factor(n), k = f.length;
    var dir = f.map(function (_, i) { return k === 1 ? 0 : -1 + (2 * i) / (k - 1); });
    var rows = [], top = bigOmega(n);
    ds.forEach(function (d) {
      var x = 0, e;
      f.forEach(function (pe, i) { e = 0; var t = d; while (t % pe[0] === 0) { t /= pe[0]; e++; } x += dir[i] * e; });
      var r = bigOmega(d);
      (rows[r] = rows[r] || []).push({ d: d, key: x + d * 1e-6 });
    });
    var pos = {};
    rows.forEach(function (row, r) {
      row.sort(function (a, b) { return a.key - b.key; });
      row.forEach(function (o, i) {
        pos[o.d] = [
          pad + ((i + 0.5) / row.length) * (w - 2 * pad),
          h - pad - (top ? (r / top) * (h - 2 * pad) : (h - 2 * pad) / 2),
        ];
      });
    });
    var covers = [];
    ds.forEach(function (a) {
      f.forEach(function (pe) { if ((n / a) % pe[0] === 0) covers.push([a, a * pe[0]]); });
    });
    return { ds: ds, pos: pos, covers: covers };
  }

  function setup(cv) {
    var dpr = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    }
    var ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx: ctx, w: w, h: h };
  }

  function muColor(m) { return m > 0 ? COL.blue : m < 0 ? COL.red : COL.light; }

  function drawLattice(cv, n, sel, opts) {
    var s = setup(cv), ctx = s.ctx;
    var L = layout(n, s.w, s.h, opts.labels ? 26 : 12);
    var inInt = function (x) { return sel && x % sel === 0; };
    ctx.lineWidth = 1;
    L.covers.forEach(function (c) {
      var hi = inInt(c[0]) && inInt(c[1]);
      ctx.strokeStyle = hi ? COL.gray : sel ? COL.faint : COL.light;
      ctx.beginPath(); ctx.moveTo(L.pos[c[0]][0], L.pos[c[0]][1]); ctx.lineTo(L.pos[c[1]][0], L.pos[c[1]][1]); ctx.stroke();
    });
    var r = opts.labels ? Math.max(7, Math.min(12, 260 / L.ds.length)) : 3.2;
    L.ds.forEach(function (d) {
      var p = L.pos[d], m = mu(d), dim = sel && !inInt(d);
      ctx.globalAlpha = dim ? 0.3 : 1;
      ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 2 * Math.PI);
      ctx.fillStyle = m === 0 ? "#fff" : muColor(m); ctx.fill();
      ctx.strokeStyle = m === 0 ? COL.light : muColor(m); ctx.lineWidth = d === sel ? 2.5 : 1; ctx.stroke();
      if (d === sel) { ctx.strokeStyle = COL.text; ctx.beginPath(); ctx.arc(p[0], p[1], r + 3, 0, 2 * Math.PI); ctx.stroke(); }
      if (opts.labels) {
        ctx.fillStyle = m === 0 ? COL.gray : "#fff";
        ctx.font = (d > 99 ? 9 : 10) + "px " + opts.font;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(String(d), p[0], p[1] + 0.5);
      }
      ctx.globalAlpha = 1;
    });
    return L;
  }

  var PRESET_N = [12, 30, 36, 60, 72, 210, 360];

  function mount(el) {
    var font = getComputedStyle(document.body).fontFamily;
    el.innerHTML =
      '<div class="mathfig__panel">' +
      '<div class="mathfig__controls">' +
      '<label class="mathfig__field">n = <input type="number" min="1" max="2000" aria-label="n"></label>' +
      '<div class="mathfig__seg mathfig__presets"></div>' +
      "</div>" +
      '<canvas class="mathfig__tall" aria-label="Divisor lattice of n coloured by the Möbius function"></canvas>' +
      '<div class="mathfig__stats" aria-live="polite"></div>' +
      "</div>";
    var input = el.querySelector("input"), cv = el.querySelector("canvas"), stats = el.querySelector(".mathfig__stats");
    var seg = el.querySelector(".mathfig__presets");
    var n = 60, sel = null, L = null;
    PRESET_N.forEach(function (v) {
      var b = document.createElement("button");
      b.className = "mathfig__btn"; b.textContent = v;
      b.addEventListener("click", function () { input.value = v; setN(v); });
      seg.appendChild(b);
    });

    function fmtSigned(terms) {
      return terms.map(function (t, i) {
        return (t < 0 ? (i ? " − " : "−") : i ? " + " : "") + Math.abs(t);
      }).join("");
    }
    function describe() {
      var ds = divisors(n);
      var sum = ds.reduce(function (s, d) { return s + mu(d); }, 0);
      var terms = ds.filter(function (d) { return mu(d) !== 0; }).map(function (d) { return mu(d) * (n / d); });
      var html =
        "<b>Σ<sub>d|n</sub> μ(d) = " + sum + "</b>" + (n > 1 ? " (it vanishes for every n > 1)" : "") +
        ". Inverting n = Σ<sub>d|n</sub> φ(d): φ(" + n + ") = " + fmtSigned(terms) + " = " + phi(n) + ".";
      if (sel) {
        var pm = posetMu(sel, n);
        html += "<br>Interval [" + sel + ", " + n + "] of the divisor poset: μ<sub>poset</sub>(" + sel + ", " + n +
          ") = " + pm + " = μ(" + n / sel + "), as it must be.";
      } else {
        html += "<br>Click a divisor d to see the interval [d, n] and its poset Möbius function.";
      }
      stats.innerHTML = html;
    }
    function draw() { L = drawLattice(cv, n, sel, { labels: true, font: font }); }
    function setN(v) {
      v = Math.max(1, Math.min(2000, Math.floor(v) || 1));
      if (divisors(v).length > 48) { stats.textContent = v + " has too many divisors to draw clearly; try one with at most 48."; return; }
      n = v; sel = null;
      seg.querySelectorAll("button").forEach(function (b) { b.classList.toggle("is-active", +b.textContent === n); });
      draw(); describe();
    }
    input.addEventListener("change", function () { setN(+input.value); });
    cv.addEventListener("click", function (e) {
      if (!L) return;
      var r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, best = null, bd = 1e9;
      L.ds.forEach(function (d) {
        var q = Math.hypot(L.pos[d][0] - x, L.pos[d][1] - y);
        if (q < bd) { bd = q; best = d; }
      });
      sel = bd < 22 && best !== sel ? best : null;
      draw(); describe();
    });
    window.addEventListener("resize", draw);
    input.value = n;
    setN(n);
  }

  function thumb(cv) {
    var seq = [12, 30, 36, 60, 210, 72];
    return function (sec) {
      var i = Math.floor(sec / 2.4), n = seq[i % seq.length];
      var ds = divisors(n), sel = ds[Math.floor((sec % 2.4) / 2.4 * ds.length)];
      drawLattice(cv, n, sel, { labels: false });
    };
  }

  MW.divisorMobius = { thumb: thumb, posetMu: posetMu, mu: mu };
  document.querySelectorAll("[data-divisor-mobius]").forEach(mount);
})();
