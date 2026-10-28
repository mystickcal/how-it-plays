{
      trail: true,
      level: { width: 640, spawn: [60, 272], platforms: [G, [300, 220, 90, 14], [480, 160, 110, 14]] },
      params: { coyoteMs: 100, bufferMs: 100, jumpCut: 0.45, maxFall: 900 },
      toggle: "Heavier fall", sliders: [{ key: "fallMul", label: "Gravity when falling", min: 1, max: 3, step: 0.1, value: 1.8, unit: "x" }],
      apply: function (p, on, v) { p.fallMul = on ? v.fallMul : 1; },
      hud: function (d) { return "last air time: " + Math.round(d.stats.lastAirTime * STEP) + " ms   last jump height: " + d.stats.lastJumpHeight + " px"; }
    }
