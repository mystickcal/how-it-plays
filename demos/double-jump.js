{
      trail: true,
      level: { width: 640, spawn: [60, 272], platforms: [G, [260, 180, 120, 14], [470, 120, 120, 14]] },
      params: { coyoteMs: 100, bufferMs: 100, jumpCut: 0.45 },
      toggle: "Double jump", sliders: [{ key: "airJumpMul", label: "Second jump strength", min: 0.5, max: 1.2, step: 0.05, value: 0.85, unit: "x" }],
      apply: function (p, on, v) { p.airJumps = on ? 1 : 0; p.airJumpMul = v.airJumpMul; },
      hud: function (d) { return "air jumps: " + d.stats.airJumps + "   last jump height: " + d.stats.lastJumpHeight + " px"; }
    }
