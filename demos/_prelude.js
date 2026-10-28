/* Demo configs for each How It Plays entry. Text lives in the HTML; this file only drives the canvas. */
(function () {
  "use strict";
  var G = [0, 300, 640, 60]; // ground
  var STEP = 1000 / 60, DT = 1 / 60;
  function circleHitsRect(cx, cy, r, b) {
    var nx = Math.max(b.x, Math.min(cx, b.x + b.w)), ny = Math.max(b.y, Math.min(cy, b.y + b.h));
    return (nx - cx) * (nx - cx) + (ny - cy) * (ny - cy) < r * r;
  }
  function moveShots(d, list) {
    for (var i = list.length - 1; i >= 0; i--) {
      var b = list[i]; b.x += b.vx * DT; b.y += b.vy * DT;
      if (b.x < -20 || b.x > d.cfg.level.width + 20 || b.y < -20 || b.y > 400) list.splice(i, 1);
    }
  }
  function dot(c, list, color, r) { c.fillStyle = color; list.forEach(function (b) { c.beginPath(); c.arc(b.x, b.y, r, 0, Math.PI * 2); c.fill(); }); }
  function bar(c, x, y, w, frac, color) { c.fillStyle = "#2c313a"; c.fillRect(x, y, w, 6); c.fillStyle = color; c.fillRect(x, y, Math.round(w * Math.max(0, Math.min(1, frac))), 6); }
  function spikes(c, x, w, y) { c.fillStyle = "#e5534b"; for (var i = x; i < x + w; i += 12) { c.beginPath(); c.moveTo(i, y + 16); c.lineTo(i + 6, y); c.lineTo(i + 12, y + 16); c.fill(); } }
  // seeded pseudo-random so the attack rhythm can't be learned but tests stay repeatable
  function rng(d) { d.seed = (d.seed * 16807) % 2147483647; return d.seed / 2147483647; }

