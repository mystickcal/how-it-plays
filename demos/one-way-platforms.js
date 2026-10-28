{
      level: { width: 640, spawn: [60, 272], platforms: [G], oneway: [[200, 230, 160, 10], [380, 166, 150, 10], [120, 140, 120, 10]] },
      params: { coyoteMs: 100, bufferMs: 100 },
      toggle: "One-way platforms", sliders: [{ key: "dropMs", label: "Drop-through time", min: 50, max: 500, step: 10, value: 200, unit: "ms" }],
      apply: function (p, on, v) { p.oneWayOn = on; p.dropMs = v.dropMs; },
      hud: function (d) { return "drops: " + d.stats.drops + "   jumps: " + d.stats.jumps + "   height: " + Math.round(300 - d.player.y - 28) + " px"; }
    }
