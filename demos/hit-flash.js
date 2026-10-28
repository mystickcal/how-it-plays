{
      attack: true,
      level: { width: 640, spawn: [240, 272], dummy: [290, 260], platforms: [G] },
      params: { coyoteMs: 100, bufferMs: 100, attackBufferMs: 120 },
      toggle: "Hit flash", sliders: [{ key: "flashMs", label: "Flash for", min: 10, max: 250, step: 10, value: 70, unit: "ms" }],
      apply: function (p, on, v) { p.flashMs = on ? v.flashMs : 0; },
      hud: function (d) { return "hits: " + d.stats.hits + "   flashed frames: " + d.stats.flashFrames; }
    }
