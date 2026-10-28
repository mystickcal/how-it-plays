{
      level: { width: 640, spawn: [60, 272], platforms: [G, [180, 60, 40, 240], [340, 60, 40, 240], [560, 30, 40, 270]] },
      params: { coyoteMs: 100, bufferMs: 100, wallJump: true, wallSlideMax: 60 },
      toggle: "Input lockout", sliders: [
        { key: "wallLockMs", label: "Lockout", min: 50, max: 400, step: 10, value: 160, unit: "ms" },
        { key: "wallJumpH", label: "Push away", min: 100, max: 450, step: 10, value: 260, unit: "px/s" }],
      apply: function (p, on, v) { p.wallLockMs = on ? v.wallLockMs : 0; p.wallJumpH = v.wallJumpH; },
      hud: function (d) { return "wall jumps: " + d.stats.wallJumps + "   height: " + Math.max(0, Math.round(272 - d.player.y)) + " px"; }
    }
