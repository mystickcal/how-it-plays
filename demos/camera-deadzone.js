{
      level: { width: 1600, spawn: [780, 272], platforms: [[0, 300, 1600, 60], [500, 230, 80, 14], [760, 200, 80, 14], [1040, 230, 80, 14]] },
      params: { coyoteMs: 100, bufferMs: 100 },
      toggle: "Camera deadzone", sliders: [{ key: "camWin", label: "Window half-width", min: 20, max: 200, step: 10, value: 80, unit: "px" }],
      apply: function (p, on, v) { p.camDead = on; p.camWin = v.camWin; },
      hudDraw: function (d, c) { if (!d.p.camDead) return; c.strokeStyle = "rgba(242,177,52,.4)"; [320 - d.p.camWin, 320 + d.p.camWin].forEach(function (x) { c.beginPath(); c.moveTo(x + .5, 0); c.lineTo(x + .5, 360); c.stroke(); }); },
      hud: function (d) { return "camera moved: " + Math.round(d.stats.camTravelX) + " px"; }
    }
