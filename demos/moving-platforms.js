{
      level: { width: 640, spawn: [180, 212], platforms: [[0, 300, 140, 60], [500, 300, 140, 60]], movers: [[150, 240, 90, 14, 250, 4]] },
      params: { coyoteMs: 100, bufferMs: 100 },
      toggle: "Carry the rider", sliders: [{ key: "moverSpeed", label: "Platform trip", min: 2, max: 8, step: 0.5, value: 4, unit: "s" }],
      apply: function (p, on, v) { p.carryOn = on; p.inheritOn = on; window.__demo && window.__demo.movers.forEach(function (m) { m.period = v.moverSpeed; }); },
      reset: function (d) { var v = window.__hip && window.__hip.vals; if (v) d.movers.forEach(function (m) { m.period = v.moverSpeed; }); },
      hud: function (d) { return (d.player.ride ? "riding" : d.player.grounded ? "on the ground" : "in the air") + "   falls: " + d.stats.falls; }
    }
