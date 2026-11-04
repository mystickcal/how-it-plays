{
      level: { width: 640, spawn: [120, 272], platforms: [G] },
      params: { coyoteMs: 100, bufferMs: 100 },
      toggle: "Charge shot", sliders: [{ key: "chargeMs", label: "Full charge after", min: 300, max: 2000, step: 50, value: 1000, unit: "ms" }],
      apply: function (p, on, v) { p.chargeOn = on; p.chargeMs = v.chargeMs; },
      reset: function (d) {
        d.shots = []; d.chargeT = 0; d.held = false; d.fired = 0; d.charged = 0; d.dmg = 0; d.breaks = 0; d.flash = 0;
        d.target = { x: 560, y: 268, hp: 8, max: 8, down: 0 };
      },
      onAttack: function (d) {
        var pl = d.player, f = pl.facing;
        d.shots.push({ x: pl.x + pl.w / 2 + f * 12, y: pl.y + 12, vx: f * 700, vy: 0, big: false });
        d.fired++; d.flash = 3; d.chargeT = 0;
      },
      update: function (d) {
        var pl = d.player, p = d.p, held = !!d.keys.attack;
        if (held && p.chargeOn) d.chargeT += STEP;
        if (!held && d.held) {
          // release: a full charge fires the big shot
          if (p.chargeOn && d.chargeT >= p.chargeMs) {
            var f = pl.facing;
            d.shots.push({ x: pl.x + pl.w / 2 + f * 14, y: pl.y + 12, vx: f * 700, vy: 0, big: true });
            d.charged++; d.flash = 6;
          }
          d.chargeT = 0;
        }
        d.held = held;
        if (d.flash > 0) d.flash--;
        var g = d.target;
        if (g.down > 0) { g.down -= STEP; if (g.down <= 0) g.hp = g.max; }
        moveShots(d, d.shots);
        for (var i = d.shots.length - 1; i >= 0; i--) {
          var b = d.shots[i];
          if (g.down <= 0 && Math.abs(b.x - g.x) < 22 && Math.abs(b.y - g.y) < 28) {
            var dm = b.big ? 4 : 1; g.hp -= dm; d.dmg += dm; d.shots.splice(i, 1);
            if (g.hp <= 0) { g.hp = 0; g.down = 600; d.breaks++; }
          }
        }
      },
      draw: function (d, c) {
        var pl = d.player, g = d.target;
        if (g.down <= 0) { c.fillStyle = "#8fa1b3"; c.fillRect(g.x - 18, g.y - 28, 36, 60); bar(c, g.x - 18, g.y - 40, 36, g.hp / g.max, "#7ee2a8"); }
        d.shots.forEach(function (b) { c.fillStyle = b.big ? "#7ee2a8" : "#ffffff"; c.beginPath(); c.arc(b.x, b.y, b.big ? 9 : 3, 0, Math.PI * 2); c.fill(); });
        if (d.p.chargeOn && d.chargeT > 0) {
          var k = Math.min(1, d.chargeT / d.p.chargeMs);
          c.strokeStyle = k >= 1 ? "#7ee2a8" : "rgba(242,177,52," + (0.3 + 0.5 * k) + ")"; c.lineWidth = 2;
          c.beginPath(); c.arc(pl.x + pl.w / 2, pl.y + pl.h / 2, 18 + 4 * k, 0, Math.PI * 2 * k); c.stroke(); c.lineWidth = 1;
        }
        if (d.flash > 0) { c.fillStyle = "#f2b134"; c.beginPath(); c.arc(pl.x + pl.w / 2 + pl.facing * 14, pl.y + 12, 6, 0, Math.PI * 2); c.fill(); }
      },
      snapshot: function (d) { return { fired: d.fired, charged: d.charged, damage: d.dmg, breaks: d.breaks }; },
      hud: function (d) { return "shots: " + d.fired + "   charged shots: " + d.charged + "   damage: " + d.dmg + "   targets broken: " + d.breaks; }
    }
