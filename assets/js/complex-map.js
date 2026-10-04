/*
 * Complex image mapping, live. Each output pixel z is coloured by the source
 * (graph paper, domain colouring, or a photo) at f(z). Pulling back like this
 * leaves no holes, unlike pushing each source pixel forward.
 *
 * Full widget mounts on <div data-complex-map>. Registers a gallery thumbnail
 * as MathWidgets.complexMap.thumb(canvas) -> frame(seconds).
 */
(function () {
  "use strict";
  var MW = (window.MathWidgets = window.MathWidgets || {});

  // ---- complex arithmetic on [re, im] -------------------------------------
  function add(a, b) { return [a[0] + b[0], a[1] + b[1]]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
  function mul(a, b) { return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]; }
  function div(a, b) {
    var m = b[0] * b[0] + b[1] * b[1];
    return [(a[0] * b[0] + a[1] * b[1]) / m, (a[1] * b[0] - a[0] * b[1]) / m];
  }
  function cexp(a) { var r = Math.exp(a[0]); return [r * Math.cos(a[1]), r * Math.sin(a[1])]; }
  function clog(a) { return [Math.log(Math.hypot(a[0], a[1])), Math.atan2(a[1], a[0])]; }
  function cpow(a, b) {
    if (b[1] === 0 && Number.isInteger(b[0]) && Math.abs(b[0]) <= 12) {
      var n = Math.abs(b[0]), r = [1, 0];
      for (var i = 0; i < n; i++) r = mul(r, a);
      return b[0] < 0 ? div([1, 0], r) : r;
    }
    if (a[0] === 0 && a[1] === 0) return [0, 0];
    return cexp(mul(b, clog(a)));
  }
  function csin(a) { return [Math.sin(a[0]) * Math.cosh(a[1]), Math.cos(a[0]) * Math.sinh(a[1])]; }
  function ccos(a) { return [Math.cos(a[0]) * Math.cosh(a[1]), -Math.sin(a[0]) * Math.sinh(a[1])]; }
  var FUNCS = {
    exp: cexp, log: clog, ln: clog,
    sin: csin, cos: ccos,
    tan: function (a) { return div(csin(a), ccos(a)); },
    sinh: function (a) { var s = csin([-a[1], a[0]]); return [s[1], -s[0]]; },
    cosh: function (a) { return ccos([-a[1], a[0]]); },
    sqrt: function (a) { return cpow(a, [0.5, 0]); },
    conj: function (a) { return [a[0], -a[1]]; },
    abs: function (a) { return [Math.hypot(a[0], a[1]), 0]; },
    arg: function (a) { return [Math.atan2(a[1], a[0]), 0]; },
    re: function (a) { return [a[0], 0]; },
    im: function (a) { return [a[1], 0]; },
  };

  /*
   * Parse an expression in z (and t) into a function (z, t) -> [re, im].
   * Supports + - * / ^, implicit multiplication (2z, z(z+1)), i, pi, e,
   * and the functions in FUNCS. Throws on a syntax error.
   */
  function compile(src) {
    var toks = [], re = /\s*(\d+\.?\d*|\.\d+|[A-Za-z_]\w*|\*\*|[-+*/^(),])/y, m;
    src = src.trim();
    re.lastIndex = 0;
    while (re.lastIndex < src.length) {
      m = re.exec(src);
      if (!m) throw new Error("can't read “" + src.slice(re.lastIndex).trim()[0] + "”");
      toks.push(m[1] === "**" ? "^" : m[1]);
    }
    var pos = 0;
    function peek() { return toks[pos]; }
    function eat(t) { if (toks[pos] !== t) throw new Error("expected " + t); pos++; }
    function startsAtom(t) { return t !== undefined && (/^[\w.]/.test(t) || t === "("); }

    function expr() {
      var a = term();
      while (peek() === "+" || peek() === "-") {
        var op = toks[pos++], b = term();
        a = (function (a, b, op) {
          return op === "+" ? function (z, t) { return add(a(z, t), b(z, t)); }
                            : function (z, t) { return sub(a(z, t), b(z, t)); };
        })(a, b, op);
      }
      return a;
    }
    function term() {
      var a = unary();
      for (;;) {
        var op = peek();
        if (op === "*" || op === "/") pos++;
        else if (startsAtom(op)) op = "*";
        else break;
        var b = unary();
        a = (function (a, b, op) {
          return op === "*" ? function (z, t) { return mul(a(z, t), b(z, t)); }
                            : function (z, t) { return div(a(z, t), b(z, t)); };
        })(a, b, op);
      }
      return a;
    }
    function unary() {
      if (peek() === "-") { pos++; var a = unary(); return function (z, t) { var v = a(z, t); return [0 - v[0], 0 - v[1]]; }; }
      if (peek() === "+") { pos++; return unary(); }
      return power();
    }
    function power() {
      var a = atom();
      if (peek() === "^") {
        pos++;
        var b = unary();
        return function (z, t) { return cpow(a(z, t), b(z, t)); };
      }
      return a;
    }
    function atom() {
      var t = toks[pos++];
      if (t === undefined) throw new Error("unexpected end");
      if (t === "(") { var e = expr(); eat(")"); return e; }
      if (/^[-+*/^),]$/.test(t)) throw new Error("unexpected \u201c" + t + "\u201d");
      if (/^[\d.]/.test(t)) { var v = [parseFloat(t), 0]; return function () { return v; }; }
      if (t === "z") return function (z) { return z; };
      if (t === "t") return function (z, tt) { return [tt, 0]; };
      if (t === "i") return function () { return [0, 1]; };
      if (t === "pi") return function () { return [Math.PI, 0]; };
      if (t === "e") return function () { return [Math.E, 0]; };
      var f = FUNCS[t.toLowerCase()];
      if (f) {
        eat("(");
        var arg = expr();
        eat(")");
        return function (z, tt) { return f(arg(z, tt)); };
      }
      throw new Error("unknown name “" + t + "”");
    }
    var fn = expr();
    if (pos < toks.length) throw new Error("unexpected “" + toks[pos] + "”");
    return fn;
  }

  // ---- sources: colour for a point w = (u, v) -------------------------------
  var BLUE = [82, 173, 200], INK = [73, 78, 82];

  function hsl(h, s, l) {
    var a = s * Math.min(l, 1 - l);
    function f(n) { var k = (n + h * 12) % 12; return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); }
    return [255 * f(0), 255 * f(8), 255 * f(4)];
  }

  /*
   * Render f over the view into ImageData. Grid lines are drawn at constant
   * screen width by estimating how fast f moves per pixel (finite differences).
   */
  function renderInto(img, fn, t, view, source, photo) {
    var W = img.width, H = img.height, data = img.data;
    var U = new Float64Array((W + 1) * (H + 1)), V = new Float64Array((W + 1) * (H + 1));
    var sx = (view.x1 - view.x0) / W, sy = (view.y1 - view.y0) / H;
    var x, y, k, w;
    for (y = 0; y <= H; y++) {
      for (x = 0; x <= W; x++) {
        k = y * (W + 1) + x;
        try { w = fn([view.x0 + x * sx, view.y1 - y * sy], t); } catch (e) { w = [NaN, NaN]; }
        U[k] = w[0]; V[k] = w[1];
      }
    }
    for (y = 0; y < H; y++) {
      for (x = 0; x < W; x++) {
        k = y * (W + 1) + x;
        var u = U[k], v = V[k], o = (y * W + x) * 4, c;
        if (!isFinite(u) || !isFinite(v)) { c = [255, 255, 255]; }
        else if (source === "domain") {
          var mod = Math.hypot(u, v), ang = Math.atan2(v, u);
          var band = Math.log2(mod + 1e-12); band -= Math.floor(band);
          c = hsl(((ang / (2 * Math.PI)) + 1) % 1, 0.55, 0.42 + 0.22 * band);
        } else if (source === "photo" && photo) {
          // Mirror-tile the photo over [-1.6, 1.6] so every w lands somewhere.
          var pu = (u / 3.2 + 0.5), pv = (0.5 - v / 3.2);
          pu = pu - 2 * Math.floor(pu / 2); if (pu > 1) pu = 2 - pu;
          pv = pv - 2 * Math.floor(pv / 2); if (pv > 1) pv = 2 - pv;
          var px = Math.min(photo.width - 1, (pu * photo.width) | 0);
          var py = Math.min(photo.height - 1, (pv * photo.height) | 0);
          var po = (py * photo.width + px) * 4;
          c = [photo.data[po], photo.data[po + 1], photo.data[po + 2]];
        } else {
          // Graph paper: checker tint, grid every 1/2, axes and unit circle.
          var du = Math.abs(U[k + 1] - u) + Math.abs(U[k + W + 1] - u);
          var dv = Math.abs(V[k + 1] - v) + Math.abs(V[k + W + 1] - v);
          var pxu = Math.max(du, 1e-9), pxv = Math.max(dv, 1e-9);
          var gu = Math.abs(u * 2 - Math.round(u * 2)) / 2 / pxu;
          var gv = Math.abs(v * 2 - Math.round(v * 2)) / 2 / pxv;
          var checker = (Math.floor(u * 2) + Math.floor(v * 2)) & 1;
          c = checker ? [236, 246, 249] : [255, 255, 255];
          var line = Math.max(0, 1 - Math.min(gu, gv) / 0.9);
          c = mix(c, [189, 193, 196], line);
          var axis = Math.max(0, 1 - Math.min(Math.abs(u) / pxu, Math.abs(v) / pxv) / 1.1);
          c = mix(c, INK, axis * 0.85);
          var r = Math.hypot(u, v), dr = Math.max((du + dv) / 2, 1e-9);
          var circ = Math.max(0, 1 - Math.abs(r - 1) / dr / 1.3);
          c = mix(c, BLUE, circ);
        }
        data[o] = c[0]; data[o + 1] = c[1]; data[o + 2] = c[2]; data[o + 3] = 255;
      }
    }
  }
  function mix(a, b, s) { return [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s]; }

  function sizeCanvas(cv, maxPixels) {
    var w = cv.clientWidth, h = cv.clientHeight;
    var scale = Math.min(window.devicePixelRatio || 1, Math.sqrt(maxPixels / (w * h)));
    var W = Math.max(1, Math.round(w * scale)), H = Math.max(1, Math.round(h * scale));
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    return { W: W, H: H, w: w, h: h };
  }

  function viewFor(w, h, half) {
    var a = h / w;
    return { x0: -half, x1: half, y0: -half * a, y1: half * a };
  }

  // ---- full widget -----------------------------------------------------------
  var PRESETS = [
    { label: "z²", expr: "z^2" },
    { label: "Möbius", expr: "(z - 0.5) / (1 - 0.5z)" },
    { label: "Joukowski", expr: "(z + 1/z) / 2" },
    { label: "exp", expr: "exp(z)" },
    { label: "sin", expr: "sin(z)" },
    { label: "rotating disk map", expr: "(z - 0.6exp(i t)) / (1 - 0.6exp(-i t) z)" },
    { label: "1/z", expr: "1/z" },
  ];

  function mount(el) {
    el.innerHTML =
      '<div class="mathfig__panel">' +
      '<div class="mathfig__controls">' +
      '<label class="mathfig__field">f(z) = <input type="text" spellcheck="false" autocomplete="off" aria-label="Function of z"></label>' +
      '<div class="mathfig__seg" role="group" aria-label="Source">' +
      '<button class="mathfig__btn is-active" data-src="grid">Grid</button>' +
      '<button class="mathfig__btn" data-src="domain">Domain colouring</button>' +
      '<button class="mathfig__btn" data-src="photo">Photo</button>' +
      "</div></div>" +
      '<div class="mathfig__controls mathfig__presets"></div>' +
      '<canvas class="mathfig__tall" aria-label="The plane warped by f"></canvas>' +
      '<div class="mathfig__stats"></div>' +
      '<input type="file" accept="image/*" hidden>' +
      "</div>";
    var input = el.querySelector("input[type=text]");
    var cv = el.querySelector("canvas");
    var stats = el.querySelector(".mathfig__stats");
    var file = el.querySelector("input[type=file]");
    var presets = el.querySelector(".mathfig__presets");
    var ctx = cv.getContext("2d");
    var fn = null, source = "grid", photo = null, usesT = false, dirty = true;
    var srcBtns = el.querySelectorAll("[data-src]");

    PRESETS.forEach(function (p) {
      var b = document.createElement("button");
      b.className = "mathfig__btn mathfig__chip";
      b.textContent = p.label;
      b.addEventListener("click", function () { input.value = p.expr; update(); });
      presets.appendChild(b);
    });

    function update() {
      try {
        fn = compile(input.value);
        usesT = /\bt\b/.test(input.value);
        stats.textContent = "Each pixel z shows the source at f(z)." + (usesT ? " t runs with time." : "");
        stats.classList.remove("is-bad");
        dirty = true;
      } catch (e) {
        stats.textContent = e.message;
        stats.classList.add("is-bad");
      }
    }
    input.addEventListener("input", update);

    function setSource(s) {
      source = s;
      srcBtns.forEach(function (b) { b.classList.toggle("is-active", b.getAttribute("data-src") === s); });
      dirty = true;
    }
    srcBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var s = b.getAttribute("data-src");
        if (s === "photo") {
          if (!photo) loadPhoto("/images/profile.png");
          else file.click();
        }
        setSource(s);
      });
    });
    file.addEventListener("change", function () {
      if (file.files[0]) loadPhoto(URL.createObjectURL(file.files[0]));
    });
    function loadPhoto(url) {
      var im = new Image();
      im.onload = function () {
        var c = document.createElement("canvas"), s = Math.min(1, 480 / Math.max(im.width, im.height));
        c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
        var g = c.getContext("2d");
        g.drawImage(im, 0, 0, c.width, c.height);
        photo = g.getImageData(0, 0, c.width, c.height);
        dirty = true;
        stats.textContent = "Photo loaded. Click Photo again to use your own.";
      };
      im.src = url;
    }

    var visible = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(cv);
    }
    var t0 = performance.now();
    function frame(now) {
      if (fn && visible && !document.hidden && (dirty || usesT)) {
        var s = sizeCanvas(cv, 160000);
        var img = ctx.createImageData(s.W, s.H);
        renderInto(img, fn, (now - t0) / 1000, viewFor(s.w, s.h, 2.6), source, photo);
        ctx.putImageData(img, 0, 0);
        dirty = false;
      }
      requestAnimationFrame(frame);
    }
    window.addEventListener("resize", function () { dirty = true; });
    input.value = el.getAttribute("data-expr") || PRESETS[1].expr;
    update();
    requestAnimationFrame(frame);
  }

  // ---- gallery thumbnail -----------------------------------------------------
  function thumb(cv) {
    var ctx = cv.getContext("2d");
    var fn = compile("(z - 0.6exp(i t)) / (1 - 0.6exp(-i t) z)");
    return function (sec) {
      var s = sizeCanvas(cv, 60000);
      var img = ctx.createImageData(s.W, s.H);
      renderInto(img, fn, 0.6 * sec + 0.8, viewFor(s.w, s.h, 2.2), "grid", null);
      ctx.putImageData(img, 0, 0);
    };
  }

  MW.complexMap = { thumb: thumb, compile: compile };
  document.querySelectorAll("[data-complex-map]").forEach(mount);
})();
