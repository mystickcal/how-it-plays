{
      attack: true,
      level: { width: 640, spawn: [240, 272], dummy: [290, 260], platforms: [G] },
      params: { coyoteMs: 100, bufferMs: 100, recoveryMs: 300, hitstopMs: 30 },
      toggle: "Cancel window", sliders: [{ key: "cancelMs", label: "Window", min: 30, max: 300, step: 10, value: 150, unit: "ms" }],
      apply: function (p, on, v) { p.cancelMs = on ? v.cancelMs : 0; },
      reset: function (d) { d.combo = 0; d.best = 0; d.lastHitT = -1e9; },
      onHit: function (d) { d.combo = d.t - d.lastHitT < 600 ? d.combo + 1 : 1; d.lastHitT = d.t; d.best = Math.max(d.best, d.combo); },
      hud: function (d) { return "combo: " + (d.t - d.lastHitT < 600 ? d.combo : 0) + "   best: " + d.best + "   cancels: " + d.stats.cancels; }
    }
