/*
 * Powers of g in (Z/pZ)^x drawn on a clock. The walk 1 -> g -> g^2 -> ...
 * returns to 1 after ord(g) steps; generators visit every residue.
 *
 * Full widget mounts on <div data-cyclic-clock>. Registers
 * MathWidgets.cyclicClock.thumb(canvas) -> frame(seconds).
 */
(function () {
  "use strict";
  var MW = (window.MathWidgets = window.MathWidgets || {});
  var COL = { text: "#494e52", gray: "#7a8288", light: "#bdc1c4", faint: "#f2f3f3", blue: "#52adc8" };
  var PRIMES = [5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61];

  function orbit(g, p) {
    var out = [1], x = g % p;
    while (x !== 1) { out.push(x); x = (x * g) % p; }
    return out;
  }
  function phi(n) {
    var r = n;
    for (var q = 2; q * q <= n; q++) if (n % q === 0) { while (n % q === 0) n /= q; r -= r / q; }
    if (n > 1) r -= r / n;
    return r;
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

  /*
   * Draw the clock for residue g mod p, with the walk drawn up to `progress`
   * steps (fractional allowed). Returns the positions, for hit-testing.
   */
  function drawClock(cv, p, g, progress, opts) {
    var s = setup(cv), ctx = s.ctx;
    var cx = s.w / 2, cy = s.h / 2, R = Math.min(s.w, s.h) / 2 - (opts.labels ? 22 : 8);
    var pos = [];
    for (var a = 1; a < p; a++) {
      var th = -Math.PI / 2 + (2 * Math.PI * (a - 1)) / (p - 1);
      pos[a] = [cx + R * Math.cos(th), cy + R * Math.sin(th)];
    }
    ctx.strokeStyle = COL.faint; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * Math.PI); ctx.stroke();

    var orb = orbit(g, p), n = orb.length, gen = n === p - 1;
    var visited = {};
    var steps = Math.min(progress, n);
    ctx.strokeStyle = gen ? COL.blue : COL.gray;
    ctx.lineWidth = opts.labels ? 1.6 : 1.2;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(pos[1][0], pos[1][1]);
    visited[1] = true;
    for (var k = 1; k <= Math.floor(steps); k++) {
      var b = orb[k % n];
      ctx.lineTo(pos[b][0], pos[b][1]);
      visited[b] = true;
    }
    var frac = steps - Math.floor(steps);
    if (frac > 0 && Math.floor(steps) < n) {
      var from = pos[orb[Math.floor(steps) % n]], to = pos[orb[(Math.floor(steps) + 1) % n]];
      ctx.lineTo(from[0] + (to[0] - from[0]) * frac, from[1] + (to[1] - from[1]) * frac);
    }
    ctx.stroke();

    var r = opts.labels ? Math.max(2.5, Math.min(5, 90 / p)) : 2;
    for (a = 1; a < p; a++) {
      ctx.beginPath(); ctx.arc(pos[a][0], pos[a][1], a === g ? r + 1.5 : r, 0, 2 * Math.PI);
      ctx.fillStyle = visited[a] ? (gen ? COL.blue : COL.text) : COL.light;
      ctx.fill();
      if (opts.labels && (p <= 31 || a === g || a === 1)) {
        var th2 = -Math.PI / 2 + (2 * Math.PI * (a - 1)) / (p - 1);
        ctx.fillStyle = a === g ? COL.text : COL.gray;
        ctx.font = (a === g ? "bold " : "") + "11px " + opts.font;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(String(a), cx + (R + 13) * Math.cos(th2), cy + (R + 13) * Math.sin(th2));
      }
    }
    if (opts.labels) {
      ctx.fillStyle = COL.gray; ctx.font = "12px " + opts.font; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("mod " + p, cx, cy);
    }
    return { pos: pos, R: R };
  }

  function mount(el) {
    var font = getComputedStyle(document.body).fontFamily;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.innerHTML =
      '<div class="mathfig__panel">' +
      '<div class="mathfig__controls">' +
      '<label class="mathfig__field">p = <select aria-label="Prime"></select></label>' +
      '<div class="mathfig__seg">' +
      '<button class="mathfig__btn" data-act="prev" aria-label="Previous g">← g</button>' +
      '<button class="mathfig__btn" data-act="next" aria-label="Next g">g →</button>' +
      '<button class="mathfig__btn" data-act="play"></button>' +
      "</div></div>" +
      '<canvas class="mathfig__square" aria-label="Powers of g around the residues mod p"></canvas>' +
      '<div class="mathfig__chips" aria-label="Order of each residue"></div>' +
      '<div class="mathfig__stats" aria-live="polite"></div>' +
      "</div>";
    var sel = el.querySelector("select"), cv = el.querySelector("canvas");
    var chips = el.querySelector(".mathfig__chips"), stats = el.querySelector(".mathfig__stats");
    var playBtn = el.querySelector('[data-act="play"]');
    PRIMES.forEach(function (q) {
      var o = document.createElement("option"); o.value = q; o.textContent = q; sel.appendChild(o);
    });
    var p = 13, g = 2, progress = 0, playing = !reduced, geom = null, lastSwitch = 0;
    sel.value = p;

    // Sound: each step of the walk plays its residue's note (low residues
    // low, high residues high); returning to 1 resolves on a chord.
    var MS = window.MathSound, soundOn = false;
    if (MS && MS.supported) {
      var btn = MS.toggleButton(function (on) { soundOn = on; if (on) { progress = 0; lastSwitch = performance.now(); } });
      btn.title = "Hear the orbit: each power of g plays a note";
      el.querySelector(".mathfig__controls").appendChild(btn);
    }
    function play(a, k, n) {
      if (!soundOn) return;
      var pan = geom ? (geom.pos[a][0] / cv.clientWidth) * 1.4 - 0.7 : 0;
      if (k === n) {
        [0, 3, 5].forEach(function (d, i) { MS.pluck(MS.degree(d + 2), { pan: 0, gain: 0.05 - i * 0.008, decay: 2.6 }); });
        return;
      }
      var idx = Math.round(((a - 1) / Math.max(1, p - 2)) * 14);
      MS.pluck(MS.degree(idx + 3), { pan: pan, gain: 0.07 });
    }

    function buildChips() {
      chips.innerHTML = "";
      for (var a = 1; a < p; a++) {
        var n = orbit(a, p).length, b = document.createElement("button");
        b.className = "mathfig__chip-ord" + (n === p - 1 ? " is-gen" : "") + (a === g ? " is-sel" : "");
        b.innerHTML = a + "<small>" + n + "</small>";
        b.title = "ord(" + a + ") = " + n;
        b.setAttribute("data-g", a);
        b.addEventListener("click", function () { pick(+this.getAttribute("data-g")); playing = false; });
        chips.appendChild(b);
      }
    }
    var playStarted = false;
    function pick(a) {
      g = a; progress = 0; lastSwitch = performance.now(); playStarted = false;
      chips.querySelectorAll("[data-g]").forEach(function (b) { b.classList.toggle("is-sel", +b.getAttribute("data-g") === g); });
      var n = orbit(g, p).length;
      stats.innerHTML =
        "g = " + g + ": order " + n +
        (n === p - 1 ? " = p − 1, so g <b>generates</b> the group." : ", which divides p − 1 = " + (p - 1) + ".") +
        " Generators mod " + p + ": " + phi(p - 1) + " of " + (p - 1) + " (that's φ(p − 1)).";
    }
    sel.addEventListener("change", function () { p = +sel.value; buildChips(); pick(2); });
    el.querySelector('[data-act="prev"]').addEventListener("click", function () { playing = false; pick(g === 1 ? p - 1 : g - 1); });
    el.querySelector('[data-act="next"]').addEventListener("click", function () { playing = false; pick(g === p - 1 ? 1 : g + 1); });
    playBtn.addEventListener("click", function () { playing = !playing; lastSwitch = performance.now(); });
    cv.addEventListener("click", function (e) {
      if (!geom) return;
      var r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, best = 0, bd = 1e9;
      for (var a = 1; a < p; a++) {
        var d = Math.hypot(geom.pos[a][0] - x, geom.pos[a][1] - y);
        if (d < bd) { bd = d; best = a; }
      }
      if (bd < 24) { playing = false; pick(best); }
    });

    var visible = true;
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(el);
    var last = performance.now();
    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (visible && !document.hidden) {
        var n = orbit(g, p).length, orb = orbit(g, p);
        var speed = soundOn ? Math.min(7, Math.max(3.5, n / 3)) : Math.max(4, n / 1.6);
        var before = Math.floor(progress);
        progress = reduced ? n : Math.min(n, progress + dt * speed);
        if (progress === 0 && before === 0 && soundOn && !playStarted) { play(1, 0, n); playStarted = true; }
        for (var k = before + 1; k <= Math.floor(progress); k++) play(orb[k % n], k, n);
        if (playing && progress >= n && now - lastSwitch > 1000 * (1.6 + n / 8)) pick(g === p - 1 ? 2 : g + 1);
        geom = drawClock(cv, p, g, progress, { labels: true, font: font });
        playBtn.textContent = playing ? "Pause" : "Play";
      }
      requestAnimationFrame(frame);
    }
    buildChips(); pick(2);
    requestAnimationFrame(frame);
  }

  function thumb(cv) {
    var p = 17;
    return function (sec) {
      var cycle = 3.2, idx = Math.floor(sec / cycle), g = 2 + (idx % (p - 2));
      var n = orbit(g, p).length;
      var progress = Math.min(n, ((sec % cycle) / (cycle * 0.7)) * n);
      drawClock(cv, p, g, progress, { labels: false });
    };
  }

  MW.cyclicClock = { thumb: thumb };
  document.querySelectorAll("[data-cyclic-clock]").forEach(mount);
})();
