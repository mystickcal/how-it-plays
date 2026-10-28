{
      attack: true,
      level: { width: 640, spawn: [240, 272], dummy: [290, 260], platforms: [G] },
      params: { coyoteMs: 100, bufferMs: 100, attackBufferMs: 120, hitstopMs: 50 },
      toggle: "Knockback", sliders: [
        { key: "knockForce", label: "Force", min: 0, max: 800, step: 20, value: 340, unit: "px/s" },
        { key: "knockFriction", label: "Friction", min: 200, max: 3000, step: 100, value: 1400, unit: "px/s\u00b2" }],
      apply: function (p, on, v) { p.knockOn = on; p.knockForce = v.knockForce; p.knockFriction = v.knockFriction; },
      hud: function (d) { return "hits: " + d.stats.hits + "   farthest push: " + d.stats.knockDist + " px"; }
    }
