{
      trail: true,
      level: { width: 640, spawn: [280, 200], platforms: [G, [250, 286, 80, 14]], oneway: [[380, 80, 160, 8]] },
      params: { coyoteMs: 0, bufferMs: 0, springVel: 560 },
      toggle: "Timed boost", sliders: [{ key: "boostMul", label: "Timed launch", min: 1.2, max: 2, step: 0.05, value: 1.5, unit: "x" }],
      apply: function (p, on, v) { p.timedOn = on; p.boostMul = v.boostMul; },
      reset: function (d) { d.sp = null; d.prevJump = false; d.launches = 0; d.boosts = 0; d.best = 0; d.lastH = 0; d.peak = 0; d.ledge = 0; },
      update: function (d) {
        var pl = d.player, p = d.p, top = 286, fresh = d.keys.jump && !d.prevJump;
        d.prevJump = !!d.keys.jump;
        var onSpring = pl.x + pl.w > 250 && pl.x < 330;
        if (!d.sp && pl.grounded && onSpring && Math.abs(pl.y + pl.h - top) < 1) { d.sp = { t: 0, boost: false }; d.peak = 0; }
        if (d.sp) {
          // the spring holds the player for 150 ms; a fresh jump press in the back part of that sets up a bigger launch
          d.sp.t += STEP; pl.y = top - pl.h; pl.vy = 0; pl.grounded = true;
          if (fresh && p.timedOn && d.sp.t >= 40) d.sp.boost = true;
          if (d.sp.t >= 150) {
            pl.vy = -p.springVel * (d.sp.boost ? p.boostMul : 1); pl.grounded = false; pl.jumping = false;
            d.launches++; if (d.sp.boost) d.boosts++; d.sp = null;
          }
        } else if (!pl.grounded) {
          d.peak = Math.max(d.peak, Math.round(top - (pl.y + pl.h)));
          d.best = Math.max(d.best, d.peak);
        } else if (d.peak) { d.lastH = d.peak; d.peak = 0; }
        if (pl.grounded && Math.abs(pl.y + pl.h - 80) < 1) d.ledge++;
      },
      draw: function (d, c) {
        var sq = d.sp ? 6 * Math.sin(Math.PI * Math.min(1, d.sp.t / 150)) : 0;
        c.fillStyle = "#1a1d23"; c.fillRect(250, 286, 80, 14);
        c.strokeStyle = "#7ee2a8"; c.lineWidth = 2; c.beginPath();
        for (var i = 0; i <= 8; i++) { var x = 254 + i * 9, y = 300 - (i % 2 ? 4 : 10 - sq); if (i === 0) c.moveTo(x, y); else c.lineTo(x, y); }
        c.stroke(); c.lineWidth = 1;
        c.fillStyle = d.sp && d.sp.boost ? "#7ee2a8" : "#56607a"; c.fillRect(250, 286 + sq, 80, 4);
      },
      snapshot: function (d) { return { launches: d.launches, boosts: d.boosts, best: d.best }; },
      hud: function (d) { return "bounces: " + d.launches + "   boosted: " + d.boosts + "   last height: " + d.lastH + " px   best: " + d.best + " px"; }
    }
