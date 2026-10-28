{
      level: { width: 640, spawn: [60, 272], platforms: [G, [150, 220, 70, 14]] },
      params: { coyoteMs: 100, bufferMs: 100 },
      toggle: "Aim assist", sliders: [
        { key: "assistDeg", label: "Cone", min: 2, max: 30, step: 1, value: 10, unit: "\u00b0" },
        { key: "assistRange", label: "Range", min: 100, max: 600, step: 20, value: 420, unit: "px" }],
      apply: function (p, on, v) { p.assistOn = on; p.assistDeg = v.assistDeg; p.assistRange = v.assistRange; },
      reset: function (d) {
        d.shots = []; d.tHits = 0; d.fired = 0;
        d.targets = [[360, 190, 40, 0], [470, 250, 30, 1.7], [580, 160, 50, 3.1]].map(function (a) { return { x: a[0], by: a[1], amp: a[2], ph: a[3], y: a[1], dead: 0 }; });
      },
      onAttack: function (d) {
        var pl = d.player, p = d.p, x = pl.x + pl.w / 2, y = pl.y + 10, ang = pl.facing > 0 ? 0 : Math.PI, best = null;
        if (p.assistOn) d.targets.forEach(function (t) {
          if (t.dead > 0) return;
          var dx = t.x - x, dy = t.y - y, dist = Math.sqrt(dx * dx + dy * dy), a = Math.atan2(dy, dx), off = Math.abs(Math.atan2(Math.sin(a - ang), Math.cos(a - ang)));
          if (dist <= p.assistRange && off <= p.assistDeg * Math.PI / 180 && (!best || off < best.off)) best = { a: a, off: off };
        });
        if (best) ang = best.a;
        d.shots.push({ x: x, y: y, vx: Math.cos(ang) * 1000, vy: Math.sin(ang) * 1000 }); d.fired++;
      },
      update: function (d) {
        var t = d.t / 1000;
        d.targets.forEach(function (g) { g.y = g.by + g.amp * Math.sin(t * 1.1 + g.ph); if (g.dead > 0) g.dead -= STEP; });
        moveShots(d, d.shots);
        for (var i = d.shots.length - 1; i >= 0; i--) {
          var b = d.shots[i];
          for (var j = 0; j < d.targets.length; j++) { var g = d.targets[j]; if (g.dead <= 0 && (b.x - g.x) * (b.x - g.x) + (b.y - g.y) * (b.y - g.y) < 14 * 14) { g.dead = 500; d.tHits++; d.shots.splice(i, 1); break; } }
        }
      },
      draw: function (d, c) {
        var pl = d.player;
        if (d.p.assistOn) { var x = pl.x + pl.w / 2, y = pl.y + 10, a = d.p.assistDeg * Math.PI / 180, f = pl.facing, R = d.p.assistRange; c.fillStyle = "rgba(242,177,52,.08)"; c.beginPath(); c.moveTo(x, y); c.lineTo(x + f * R * Math.cos(a), y - R * Math.sin(a)); c.lineTo(x + f * R * Math.cos(a), y + R * Math.sin(a)); c.fill(); }
        d.targets.forEach(function (g) { if (g.dead > 0) return; c.fillStyle = "#8fa1b3"; c.beginPath(); c.arc(g.x, g.y, 10, 0, Math.PI * 2); c.fill(); });
        dot(c, d.shots, "#ffffff", 3);
      },
      snapshot: function (d) { return { hits: d.tHits, fired: d.fired }; },
      hud: function (d) { return "shots: " + d.fired + "   hits: " + d.tHits; }
    }
