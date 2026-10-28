{
      level: { width: 640, spawn: [300, 272], platforms: [G, [120, 230, 60, 14], [460, 230, 60, 14]] },
      params: { coyoteMs: 100, bufferMs: 100, decel: 700 },
      toggle: "Quick turn", sliders: [{ key: "turnAccel", label: "Turn acceleration", min: 1000, max: 8000, step: 250, value: 4000, unit: "px/s\u00b2" }],
      apply: function (p, on, v) { p.turnAccel = on ? v.turnAccel : 0; },
      reset: function (d) { d.turnFrames = 0; d.lastTurn = 0; },
      snapshot: function (d) { return { lastTurn: d.lastTurn, turning: d.turnFrames }; },
      update: function (d) { var pl = d.player, dir = (d.keys.right ? 1 : 0) - (d.keys.left ? 1 : 0); if (dir && pl.vx && Math.sign(pl.vx) !== dir) d.turnFrames++; else if (d.turnFrames) { d.lastTurn = d.turnFrames; d.turnFrames = 0; } },
      draw: function (d, c) { var pl = d.player; if (d.turnFrames) { c.fillStyle = "rgba(232,230,225,.5)"; for (var i = 0; i < 3; i++) c.fillRect(pl.x + (pl.vx > 0 ? pl.w : -6) + i * 3 * Math.sign(pl.vx), pl.y + pl.h - 4 - i * 3, 4, 4); } },
      hud: function (d) { return "last turn took: " + Math.round(d.lastTurn * STEP) + " ms   speed: " + Math.round(d.player.vx) + " px/s"; }
    }
