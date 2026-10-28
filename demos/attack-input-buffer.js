{
      attack: true,
      level: { width: 640, spawn: [240, 272], dummy: [290, 260], platforms: [G] },
      params: { coyoteMs: 100, bufferMs: 100 },
      toggle: "Attack buffer", sliders: [
        { key: "attackBufferMs", label: "Buffer window", min: 0, max: 300, step: 10, value: 150, unit: "ms" },
        { key: "recoveryMs", label: "Recovery", min: 100, max: 400, step: 10, value: 220, unit: "ms" }],
      apply: function (p, on, v) { p.attackBufferMs = on ? v.attackBufferMs : 0; p.recoveryMs = v.recoveryMs; },
      hud: function (d) { return "attacks: " + d.stats.attacks + "   chained from buffer: " + d.stats.bufferedAttacks + "   dropped presses: " + d.stats.dropped; }
    }
