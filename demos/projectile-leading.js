{
      level: { width: 640, spawn: [40, 272], platforms: [G, [180, 220, 90, 14], [400, 220, 90, 14]] },
      params: { coyoteMs: 100, bufferMs: 100, iframesOn: true, iframeMs: 500 },
      toggle: "Leading", sliders: [
        { key: "shotSpeed", label: "Shot speed", min: 150, max: 700, step: 10, value: 320, unit: "px/s" },
        { key: "leadAmt", label: "Lead amount", min: 0.25, max: 1, step: 0.05, value: 1, unit: "x" }],
      apply: function (p, on, v) { p.leadOn = on; p.shotSpeed = v.shotSpeed; p.leadAmt = v.leadAmt; },
      reset: function (d) { d.shots = []; d.next = 500; d.fired = 0; d.tur = { x: 600, y: 60 }; },
      update: function (d) {
        var pl = d.player, p = d.p, T = d.tur;
        if (d.t >= d.next) {
          d.next = d.t + 1000;
          var tx = pl.x + pl.w / 2, ty = pl.y + pl.h / 2, t = 0;
          if (p.leadOn) for (var k = 0; k < 4; k++) { t = Math.hypot(tx + pl.vx * t * p.leadAmt - T.x, ty - T.y) / p.shotSpeed; }
          var ax = tx + (p.leadOn ? pl.vx * t * p.leadAmt : 0) - T.x, ay = ty - T.y, n = Math.hypot(ax, ay) || 1;
          d.shots.push({ x: T.x, y: T.y, vx: ax / n * p.shotSpeed, vy: ay / n * p.shotSpeed }); d.fired++;
        }
        moveShots(d, d.shots);
        for (var i = d.shots.length - 1; i >= 0; i--) if (circleHitsRect(d.shots[i].x, d.shots[i].y, 6, pl)) { d.shots.splice(i, 1); d.onHurt(); }
      },
      draw: function (d, c) { c.fillStyle = "#e5534b"; c.fillRect(d.tur.x - 12, d.tur.y - 12, 24, 24); dot(c, d.shots, "#e5534b", 6); },
      hud: function (d) { return "health: " + d.player.hp + "/5   shots: " + d.fired + "   hits taken: " + d.stats.hitsTaken; }
    }
