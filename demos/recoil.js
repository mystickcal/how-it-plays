{
      level: { width: 640, spawn: [200, 272], platforms: [G, [380, 220, 80, 14]] },
      params: { coyoteMs: 100, bufferMs: 100 },
      toggle: "Recoil", sliders: [
        { key: "kick", label: "Kick per shot", min: 20, max: 400, step: 10, value: 120, unit: "px/s" },
        { key: "kickFriction", label: "Recovery", min: 300, max: 3000, step: 100, value: 1500, unit: "px/s\u00b2" }],
      apply: function (p, on, v) { p.recoilOn = on; p.kick = v.kick; p.kickFriction = v.kickFriction; },
      reset: function (d) {
        d.shots = []; d.kickV = 0; d.pushed = 0; d.fired = 0; d.tHits = 0; d.flash = 0;
        d.targets = [[520, 284], [600, 284], [560, 190]].map(function (a) { return { x: a[0], y: a[1], dead: 0 }; });
      },
      onAttack: function (d) {
        var pl = d.player, f = pl.facing;
        d.shots.push({ x: pl.x + pl.w / 2 + f * 12, y: pl.y + 12, vx: f * 900, vy: 0 }); d.fired++; d.flash = 3;
        if (d.p.recoilOn) d.kickV = Math.max(-600, Math.min(600, d.kickV - f * d.p.kick));
      },
      update: function (d) {
        var pl = d.player, Wd = d.cfg.level.width;
        if (d.kickV) {
          var ox = pl.x, s = d.kickV > 0 ? 1 : -1;
          pl.x = Math.max(0, Math.min(Wd - pl.w, pl.x + d.kickV * DT)); d.pushed += Math.abs(pl.x - ox);
          d.kickV -= s * d.p.kickFriction * DT; if (d.kickV * s <= 0) d.kickV = 0;
        }
        if (d.flash > 0) d.flash--;
        d.targets.forEach(function (g) { if (g.dead > 0) g.dead -= STEP; });
        moveShots(d, d.shots);
        for (var i = d.shots.length - 1; i >= 0; i--) {
          var b = d.shots[i];
          for (var j = 0; j < d.targets.length; j++) { var g = d.targets[j]; if (g.dead <= 0 && (b.x - g.x) * (b.x - g.x) + (b.y - g.y) * (b.y - g.y) < 14 * 14) { g.dead = 500; d.tHits++; d.shots.splice(i, 1); break; } }
        }
      },
      draw: function (d, c) {
        var pl = d.player;
        d.targets.forEach(function (g) { if (g.dead > 0) return; c.fillStyle = "#8fa1b3"; c.beginPath(); c.arc(g.x, g.y, 10, 0, Math.PI * 2); c.fill(); });
        dot(c, d.shots, "#ffffff", 3);
        if (d.flash > 0) { c.fillStyle = "#f2b134"; c.beginPath(); c.arc(pl.x + pl.w / 2 + pl.facing * 14, pl.y + 12, 6, 0, Math.PI * 2); c.fill(); }
      },
      snapshot: function (d) { return { pushed: Math.round(d.pushed), fired: d.fired, hits: d.tHits }; },
      hud: function (d) { return "shots: " + d.fired + "   hits: " + d.tHits + "   pushed back: " + Math.round(d.pushed) + " px"; }
    }
