{
      trail: true,
      level: { width: 640, spawn: [60, 132], platforms: [G, [0, 160, 140, 14], [260, 220, 90, 14], [480, 120, 120, 14]] },
      params: { coyoteMs: 100, bufferMs: 100, maxFall: 420 },
      toggle: "Fast fall", sliders: [{ key: "ffMul", label: "Fast fall speed", min: 1.2, max: 2.5, step: 0.1, value: 1.6, unit: "x" }],
      apply: function (p, on, v) { p.ffOn = on; p.ffMul = v.ffMul; },
      reset: function (d) { d.ff = false; d.ffCount = 0; d.p.maxFall = 420; },
      update: function (d) {
        var pl = d.player, p = d.p;
        // starts when Down is held while falling; ends on landing or a new jump
        if (pl.grounded || pl.vy < 0) d.ff = false;
        else if (p.ffOn && !d.ff && d.keys.down && pl.vy > 0) { d.ff = true; d.ffCount++; }
        p.maxFall = d.ff ? 420 * p.ffMul : 420;
        if (d.ff) pl.vy = p.maxFall;
      },
      draw: function (d, c) { if (!d.ff) return; var pl = d.player; c.fillStyle = "#f2b134"; c.beginPath(); c.arc(pl.x + pl.w + 6, pl.y + 8, 3, 0, Math.PI * 2); c.fill(); },
      snapshot: function (d) { return { fastFalls: d.ffCount }; },
      hud: function (d) { return "fast falls: " + d.ffCount + "   last air time: " + Math.round(d.stats.lastAirTime * STEP) + " ms   fall speed: " + Math.round(Math.max(0, d.player.vy)) + " px/s"; }
    }
