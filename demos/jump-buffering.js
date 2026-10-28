{
      level: { width: 640, spawn: [40, 272], platforms: [G, [170, 236, 110, 16], [360, 176, 110, 16], [520, 236, 120, 16]] },
      toggle: "Jump buffer", sliders: [{ key: "bufferMs", label: "Buffer window", min: 0, max: 250, step: 10, value: 120, unit: "ms" }],
      apply: function (p, on, v) { p.bufferMs = on ? v.bufferMs : 0; },
      hud: function (d) { return "jumps: " + d.stats.jumps + "   from early presses: " + d.stats.bufferedJumps; }
    }
