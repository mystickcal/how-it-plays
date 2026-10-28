{
      attack: true,
      level: { width: 640, spawn: [240, 272], dummy: [290, 260], platforms: [G] },
      params: { coyoteMs: 100, bufferMs: 100, attackBufferMs: 120 },
      toggle: "Hitstop", sliders: [{ key: "hitstopMs", label: "Freeze", min: 0, max: 250, step: 10, value: 80, unit: "ms" }],
      apply: function (p, on, v) { p.hitstopMs = on ? v.hitstopMs : 0; },
      hud: function (d) { return "hits: " + d.stats.hits + "   frozen frames: " + d.stats.frozenFrames; }
    }
