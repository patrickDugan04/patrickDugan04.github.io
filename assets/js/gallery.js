/*
 * Playground gallery: each tile's canvas is drawn by a widget's thumb().
 * Tiles hold a still frame and animate on hover; on touch screens (no hover)
 * they animate gently while on screen.
 */
(function () {
  "use strict";
  var MW = window.MathWidgets || {};
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var noHover = window.matchMedia("(hover: none)").matches;
  var tiles = [];

  document.querySelectorAll("[data-thumb]").forEach(function (cv) {
    var w = MW[cv.getAttribute("data-thumb")];
    if (!w || !w.thumb) return;
    var tile = { cv: cv, frame: w.thumb(cv), t: 2.5, active: false, visible: true };
    try { tile.frame(tile.t); } catch (e) { return; }
    var link = cv.closest("a") || cv;
    link.addEventListener("pointerenter", function (e) { if (e.pointerType !== "touch") tile.active = true; });
    link.addEventListener("pointerleave", function () { tile.active = false; });
    link.addEventListener("focus", function () { tile.active = true; });
    link.addEventListener("blur", function () { tile.active = false; });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { tile.visible = es[0].isIntersecting; }).observe(cv);
    }
    tiles.push(tile);
  });
  if (!tiles.length || reduced) return;

  var last = performance.now();
  function loop(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!document.hidden) {
      tiles.forEach(function (tile) {
        var run = tile.active || (noHover && tile.visible);
        if (!run) return;
        tile.t += noHover ? dt * 0.6 : dt;
        tile.frame(tile.t);
      });
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  window.addEventListener("resize", function () { tiles.forEach(function (t) { t.frame(t.t); }); });
})();
