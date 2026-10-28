{
      level: { width: 640, spawn: [40, 262], platforms: [[0, 290, 200, 70], [290, 290, 150, 70], [530, 290, 110, 70], [120, 200, 60, 14]] },
      toggle: "Coyote time", sliders: [{ key: "coyoteMs", label: "Grace window", min: 0, max: 250, step: 10, value: 100, unit: "ms" }],
      apply: function (p, on, v) { p.coyoteMs = on ? v.coyoteMs : 0; },
      hud: function (d) { return "late jumps saved: " + d.stats.coyoteJumps + "   falls: " + d.stats.falls; }
    }
