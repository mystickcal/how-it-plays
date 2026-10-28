{
      level: { width: 640, spawn: [60, 152], stepUp: true, platforms: [[0, 180, 200, 180], [380, 300, 260, 60]], ramps: [[200, 180, 380, 300]] },
      params: { bufferMs: 100 },
      toggle: "Slope snapping", sliders: [{ key: "slopeSnap", label: "Snap distance", min: 2, max: 24, step: 1, value: 12, unit: "px" }],
      apply: function (p, on, v) { p.slopeSnap = on ? v.slopeSnap : 0; },
      reset: function (d) { d.slopeAir = 0; },
      snapshot: function (d) { return { slopeAir: d.slopeAir }; },
      update: function (d) { var cx = d.player.x + 10; if (!d.player.grounded && cx > 200 && cx < 380 && d.player.vy >= 0) d.slopeAir++; },
      hud: function (d) { return "airborne frames on the slope: " + d.slopeAir + "   jumps: " + d.stats.jumps; }
    }
