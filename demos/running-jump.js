{
      trail: true,
      level: { width: 960, spawn: [60, 272], platforms: [[0, 300, 960, 60], [600, 196, 180, 14]] },
      params: { coyoteMs: 100, bufferMs: 100, baseJump: 480 },
      toggle: "Run boost", sliders: [{ key: "rjBonus", label: "Extra at full speed", min: 5, max: 50, step: 5, value: 25, unit: "%" }],
      apply: function (p, on, v) { p.rjOn = on; p.rjBonus = v.rjBonus; },
      reset: function (d) { d.rjTake = 0; d.rjNext = 0; d.rjBest = 0; d.p.jumpVel = d.p.baseJump; d.rjJumps = 0; },
      update: function (d) {
        var pl = d.player, p = d.p;
        // a jump that started this step: remember its take-off speed
        if (d.stats.jumps !== d.rjJumps) { d.rjJumps = d.stats.jumps; d.rjTake = d.rjNext || 0; }
        if (!pl.grounded) d.rjBest = Math.max(d.rjBest, Math.round(pl.jumpStartY ? pl.jumpStartY - pl.minY : 0));
        // the next jump's strength comes from the current horizontal speed
        var frac = Math.min(1, Math.abs(pl.vx) / p.maxSpeed);
        d.rjNext = Math.round(Math.abs(pl.vx));
        p.jumpVel = p.baseJump * (p.rjOn ? 1 + p.rjBonus / 100 * frac : 1);
      },
      draw: function (d, c) { c.fillStyle = "#7ee2a8"; c.fillRect(600, 196, 180, 3); },
      snapshot: function (d) { return { best: d.rjBest, lastHeight: d.stats.lastJumpHeight }; },
      hud: function (d) { return "last jump height: " + d.stats.lastJumpHeight + " px   take-off speed: " + d.rjTake + " px/s   highest: " + d.rjBest + " px"; }
    }
