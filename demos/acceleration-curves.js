{
      level: { width: 640, spawn: [300, 272], platforms: [G, [120, 230, 90, 16], [430, 230, 90, 16]] },
      params: { coyoteMs: 100, bufferMs: 100 },
      toggle: "Acceleration curves", sliders: [
        { key: "accel", label: "Acceleration", min: 200, max: 5000, step: 100, value: 2000, unit: "px/s\u00b2" },
        { key: "decel", label: "Deceleration", min: 200, max: 5000, step: 100, value: 1600, unit: "px/s\u00b2" }],
      apply: function (p, on, v) { p.useAccel = on; p.accel = v.accel; p.decel = v.decel; },
      hud: function (d) { return "speed: " + Math.round(Math.abs(d.player.vx)) + " / " + d.p.maxSpeed + " px/s"; }
    }
