{
      attack: true, startOff: "reduced-motion",
      level: { width: 640, spawn: [240, 272], dummy: [290, 260], platforms: [G] },
      params: { coyoteMs: 100, bufferMs: 100, attackBufferMs: 120, hitstopMs: 50 },
      toggle: "Screen shake", sliders: [
        { key: "shakeMax", label: "Max offset", min: 0, max: 40, step: 1, value: 20, unit: "px" },
        { key: "shakeDecay", label: "Falloff", min: 0.5, max: 5, step: 0.1, value: 1.8, unit: "/s" }],
      apply: function (p, on, v) { p.shakeOn = on; p.shakeMax = v.shakeMax; p.shakeDecay = v.shakeDecay; },
      hud: function (d) { return "hits: " + d.stats.hits + "   trauma: " + d.trauma.toFixed(2); }
    }
