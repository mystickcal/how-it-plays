{
      trail: true,
      level: { width: 640, spawn: [60, 272], platforms: [G, [250, 236, 70, 14], [420, 200, 120, 14]] },
      params: { coyoteMs: 100, bufferMs: 100, jumpCut: 0.45 },
      toggle: "Apex hang", sliders: [
        { key: "apexThresh", label: "Near the top below", min: 20, max: 200, step: 10, value: 80, unit: "px/s" },
        { key: "apexMul", label: "Gravity there", min: 0.1, max: 1, step: 0.05, value: 0.5, unit: "x" }],
      apply: function (p, on, v) { p.apexOn = on; p.apexThresh = v.apexThresh; p.apexMul = v.apexMul; },
      hud: function (d) { return "last air time: " + Math.round(d.stats.lastAirTime * STEP) + " ms   last jump height: " + d.stats.lastJumpHeight + " px"; }
    }
