{
      wrapY: true,
      level: { width: 640, spawn: [140, 72], platforms: [[0, 100, 180, 260], [460, 0, 180, 360]], hazards: [[250, 200, 14, 0, 0, 999], [390, 60, 14, 0, 0, 999], [320, 300, 14, 0, 0, 999]] },
      params: { iframesOn: true, iframeMs: 600 },
      toggle: "Fall speed cap", sliders: [{ key: "maxFall", label: "Max fall speed", min: 200, max: 900, step: 20, value: 320, unit: "px/s" }],
      apply: function (p, on, v) { p.maxFall = on ? v.maxFall : 6000; },
      hud: function (d) { return "fall speed: " + Math.round(Math.max(0, d.player.vy)) + " px/s   bumps: " + d.stats.hitsTaken; }
    }
