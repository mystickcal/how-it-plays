{
      level: { width: 640, spawn: [40, 272], platforms: [G, [250, 210, 140, 16]], hazards: [[320, 285, 14, 110, 180, 470]] },
      params: { coyoteMs: 100, bufferMs: 100 },
      toggle: "I-frames", sliders: [
        { key: "iframeMs", label: "Invincible for", min: 100, max: 2000, step: 50, value: 1000, unit: "ms" },
        { key: "flickerMs", label: "Flicker every", min: 30, max: 200, step: 10, value: 80, unit: "ms" }],
      apply: function (p, on, v) { p.iframesOn = on; p.iframeMs = v.iframeMs; p.flickerMs = v.flickerMs; },
      hud: function (d) { return "health: " + d.player.hp + "/5   hits taken: " + d.stats.hitsTaken; }
    }
