/*
 * Chain polynomials of random posets, and their roots.
 * Shared by the in-page explorer (chain-roots.js) and by node for testing.
 */
(function (root) {
  "use strict";

  // Small seeded PRNG so a given seed always draws the same poset.
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function randInt(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }

  /*
   * Random graded poset: ranks 0..R, each element of rank r > 0 covers at
   * least one element of rank r-1 and each element of rank r < R is covered
   * by at least one of rank r+1. Every maximal chain is then saturated from
   * rank 0 to rank R, so all have length R.
   * Returns { n, rank[], covers: [[lo, hi], ...] }.
   */
  function randomGraded(rng, opts) {
    var R = randInt(rng, opts.minRanks, opts.maxRanks) - 1;
    var rank = [], byRank = [];
    for (var r = 0; r <= R; r++) {
      var w = randInt(rng, 1, opts.maxWidth);
      byRank.push([]);
      for (var i = 0; i < w; i++) { byRank[r].push(rank.length); rank.push(r); }
    }
    var p = opts.density;
    var covers = [], seen = {};
    function add(a, b) {
      var key = a + "," + b;
      if (!seen[key]) { seen[key] = 1; covers.push([a, b]); }
    }
    for (r = 0; r < R; r++) {
      var lo = byRank[r], hi = byRank[r + 1];
      lo.forEach(function (a) { hi.forEach(function (b) { if (rng() < p) add(a, b); }); });
      hi.forEach(function (b) {
        if (!covers.some(function (c) { return c[1] === b && rank[c[0]] === r; }))
          add(lo[Math.floor(rng() * lo.length)], b);
      });
      lo.forEach(function (a) {
        if (!covers.some(function (c) { return c[0] === a && rank[c[1]] === r + 1; }))
          add(a, hi[Math.floor(rng() * hi.length)]);
      });
    }
    return { n: rank.length, rank: rank, covers: covers, graded: true };
  }

  /*
   * Random poset with no gradedness: a random DAG on n elements (edge i -> j
   * for i < j with probability p), read as a partial order by transitivity.
   */
  function randomUngraded(rng, opts) {
    var n = randInt(rng, opts.minElems, opts.maxElems), p = opts.edgeProb;
    var covers = [];
    for (var i = 0; i < n; i++)
      for (var j = i + 1; j < n; j++) if (rng() < p) covers.push([i, j]);
    return { n: n, covers: covers, graded: false };
  }

  /*
   * The extremal family of Prop. 5.7: ranks 0..T, W = k^2 elements per rank
   * (words of length two over k letters), (l, ab) covered by (l+1, bc).
   * Its least real root tends to the negative root of k^2 t^2 + (4k^2-2k)t + 1.
   */
  function deBruijn(k, T) {
    var W = k * k, rank = [], covers = [];
    for (var l = 0; l <= T; l++) for (var w = 0; w < W; w++) rank.push(l);
    for (l = 0; l < T; l++)
      for (var a = 0; a < k; a++) for (var b = 0; b < k; b++) for (var c = 0; c < k; c++)
        covers.push([l * W + a * k + b, (l + 1) * W + b * k + c]);
    return { n: rank.length, rank: rank, covers: covers, graded: true };
  }

  function deBruijnLimit(k) {
    var A = k * k, B = 4 * k * k - 2 * k;
    return (-B - Math.sqrt(B * B - 4 * A)) / (2 * A);
  }

  // Strict order relation as reachability over the cover graph.
  function lessThan(P) {
    var n = P.n, up = [];
    for (var i = 0; i < n; i++) up.push([]);
    P.covers.forEach(function (c) { up[c[0]].push(c[1]); });
    var lt = [];
    for (i = 0; i < n; i++) {
      var row = new Uint8Array(n), stack = up[i].slice();
      while (stack.length) {
        var v = stack.pop();
        if (!row[v]) { row[v] = 1; Array.prototype.push.apply(stack, up[v]); }
      }
      lt.push(row);
    }
    return lt;
  }

  /*
   * Chain polynomial c_P(t) = sum_k c_k t^k, c_0 = 1 for the empty chain.
   * f[v][k] = chains of size k with maximum v; process v in a linear
   * extension so every u < v is done first. Returns coefficients c[0..].
   */
  function chainPolynomial(P) {
    var n = P.n, lt = lessThan(P);
    var order = [];
    for (var i = 0; i < n; i++) order.push(i);
    var below = order.map(function (v) {
      var s = 0; for (var u = 0; u < n; u++) s += lt[u][v]; return s;
    });
    order.sort(function (a, b) { return below[a] - below[b]; });
    var f = [], c = [1];
    order.forEach(function (v) {
      var fv = [0, 1];
      for (var u = 0; u < n; u++) {
        if (!lt[u][v]) continue;
        var fu = f[u];
        for (var k = 1; k < fu.length; k++) fv[k + 1] = (fv[k + 1] || 0) + fu[k];
      }
      f[v] = fv;
      for (var k2 = 1; k2 < fv.length; k2++) c[k2] = (c[k2] || 0) + (fv[k2] || 0);
    });
    for (i = 0; i < c.length; i++) c[i] = c[i] || 0;
    return c;
  }

  /*
   * All complex roots of sum c[k] t^k by Aberth–Ehrlich iteration.
   * Returns [[re, im], ...].
   */
  function polyRoots(c) {
    var d = c.length - 1;
    while (d > 0 && c[d] === 0) d--;
    if (d < 1) return [];
    var a = [];
    for (var i = 0; i <= d; i++) a.push(c[i] / c[d]);
    // Cauchy bound for the starting circle.
    var bound = 0;
    for (i = 0; i < d; i++) bound = Math.max(bound, Math.abs(a[i]));
    bound = 1 + bound;
    var zr = [], zi = [];
    for (i = 0; i < d; i++) {
      var th = (2 * Math.PI * i) / d + 0.4;
      zr.push(0.5 * bound * Math.cos(th)); zi.push(0.5 * bound * Math.sin(th));
    }
    for (var it = 0; it < 500; it++) {
      var maxStep = 0;
      for (i = 0; i < d; i++) {
        // p(z) and p'(z) by Horner.
        var pr = 1, pi = 0, dr = 0, di = 0, x = zr[i], y = zi[i];
        for (var k = d - 1; k >= 0; k--) {
          var ndr = dr * x - di * y + pr, ndi = dr * y + di * x + pi;
          dr = ndr; di = ndi;
          var npr = pr * x - pi * y + a[k], npi = pr * y + pi * x;
          pr = npr; pi = npi;
        }
        // Newton ratio N = p / p'.
        var den = dr * dr + di * di;
        if (den === 0) continue;
        var Nr = (pr * dr + pi * di) / den, Ni = (pi * dr - pr * di) / den;
        // Aberth correction: sum 1 / (z_i - z_j).
        var sr = 0, si = 0;
        for (var j = 0; j < d; j++) {
          if (j === i) continue;
          var ur = x - zr[j], ui = y - zi[j], m = ur * ur + ui * ui;
          if (m === 0) continue;
          sr += ur / m; si -= ui / m;
        }
        // step = N / (1 - N * s)
        var qr = 1 - (Nr * sr - Ni * si), qi = -(Nr * si + Ni * sr);
        var qm = qr * qr + qi * qi;
        var wr = (Nr * qr + Ni * qi) / qm, wi = (Ni * qr - Nr * qi) / qm;
        zr[i] -= wr; zi[i] -= wi;
        maxStep = Math.max(maxStep, Math.hypot(wr, wi) / (1 + Math.hypot(zr[i], zi[i])));
      }
      if (maxStep < 1e-14) break;
    }
    var out = [];
    for (i = 0; i < d; i++) out.push([zr[i], Math.abs(zi[i]) < 1e-7 * (1 + Math.abs(zr[i])) ? 0 : zi[i]]);
    return out;
  }

  /*
   * Hasse diagram data: cover relations (transitive reduction) and a level
   * for each element (length of the longest chain below it).
   */
  function hasse(P) {
    var n = P.n, lt = lessThan(P), level = [], covers = [];
    var order = [];
    for (var i = 0; i < n; i++) order.push(i);
    var below = order.map(function (v) {
      var s = 0; for (var u = 0; u < n; u++) s += lt[u][v]; return s;
    });
    order.sort(function (a, b) { return below[a] - below[b]; });
    order.forEach(function (v) {
      var h = 0;
      for (var u = 0; u < n; u++) if (lt[u][v]) h = Math.max(h, level[u] + 1);
      level[v] = h;
    });
    for (var a = 0; a < n; a++)
      for (var b = 0; b < n; b++) {
        if (!lt[a][b]) continue;
        var isCover = true;
        for (var m = 0; m < n && isCover; m++) if (lt[a][m] && lt[m][b]) isCover = false;
        if (isCover) covers.push([a, b]);
      }
    return { level: level, covers: covers };
  }

  var api = {
    mulberry32: mulberry32,
    randomGraded: randomGraded,
    randomUngraded: randomUngraded,
    deBruijn: deBruijn,
    deBruijnLimit: deBruijnLimit,
    hasse: hasse,
    chainPolynomial: chainPolynomial,
    polyRoots: polyRoots,
  };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.ChainRoots = api;
})(this);
