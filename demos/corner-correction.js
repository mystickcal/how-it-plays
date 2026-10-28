{
      level: { width: 640, spawn: [150, 272], platforms: [G, [0, 250, 300, 12], [328, 250, 152, 12], [520, 250, 120, 12]] },
      params: { coyoteMs: 100, bufferMs: 100 },
      toggle: "Corner correction", sliders: [{ key: "cornerPx", label: "Nudge up to", min: 1, max: 12, step: 1, value: 8, unit: "px" }],
      apply: function (p, on, v) { p.cornerPx = on ? v.cornerPx : 0; },
      hud: function (d) { return "nudges: " + d.stats.corrections + "   jumps: " + d.stats.jumps; }
    }
