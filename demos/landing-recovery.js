{
      level: { width: 640, spawn: [60, 92], platforms: [G, [40, 120, 140, 16], [420, 200, 120, 16]] },
      params: { coyoteMs: 100, bufferMs: 100, squashOn: true, squashAmt: 0.3 },
      toggle: "Landing recovery", sliders: [
        { key: "landLagMs", label: "Recovery", min: 30, max: 400, step: 10, value: 100, unit: "ms" },
        { key: "landLagVy", label: "Only above", min: 300, max: 720, step: 20, value: 600, unit: "px/s" }],
      apply: function (p, on, v) { p.landLagMs = on ? v.landLagMs : 0; p.landLagVy = v.landLagVy; },
      hud: function (d) { return "frames stuck after landing: " + d.stats.lagFrames + "   last impact: " + Math.round(d.stats.maxVy) + " px/s"; }
    }
