{
      level: { width: 640, spawn: [110, 192], platforms: [G] },
      params: { coyoteMs: 100, bufferMs: 100 },
      toggle: "Ground pound", sliders: [{ key: "hangMs", label: "Hang before the drop", min: 0, max: 500, step: 25, value: 200, unit: "ms" }],
      apply: function (p, on, v) { p.gpOn = on; p.hangMs = v.hangMs; },
      reset: function (d) {
        d.crates = [[100, 260, 40, 40], [100, 220, 40, 40], [420, 260, 40, 40]];
        d.solidList = [G].concat(d.crates); d.gp = ""; d.gpT = 0; d.pounds = 0; d.broken = 0; d.ring = 0; d.prevDown = false; d.lastImpact = 0; d.allGone = 0;
        d.p.maxFall = 720;
      },
      update: function (d) {
        var pl = d.player, p = d.p, fresh = d.keys.down && !d.prevDown;
        d.prevDown = !!d.keys.down;
        if (d.ring > 0) d.ring -= STEP;
        if (!d.gp && p.gpOn && fresh && !pl.grounded) { d.gp = "hang"; d.gpT = 0; d.gpX = pl.x; d.gpY = pl.y; d.pounds++; }
        if (d.gp === "hang") {
          // stop dead and hold, then commit to the drop
          pl.x = d.gpX; pl.y = d.gpY; pl.vx = 0; pl.vy = 0; d.gpT += STEP;
          if (d.gpT >= p.hangMs) d.gp = "drop";
        } else if (d.gp === "drop") {
          p.maxFall = 1100; pl.vy = 1100; pl.vx = 0;
          if (pl.grounded) {
            d.gp = ""; p.maxFall = 720; d.ring = 300; d.lastImpact = 1100;
            var foot = pl.y + pl.h;
            for (var i = 0; i < d.crates.length; i++) {
              var k = d.crates[i];
              if (Math.abs(foot - k[1]) < 1 && pl.x < k[0] + k[2] && pl.x + pl.w > k[0]) { d.crates.splice(i, 1); d.broken++; pl.grounded = false; break; }
            }
            d.solidList = [G].concat(d.crates);
          }
        }
        if (!d.gp) p.maxFall = 720;
        // all crates gone: put them back once the player is clear of them
        if (d.crates.length === 0) {
          d.allGone += STEP;
          var clear = pl.x > 150 && (pl.x + pl.w < 410 || pl.x > 470);
          if (d.allGone > 1500 && clear) { d.crates = [[100, 260, 40, 40], [100, 220, 40, 40], [420, 260, 40, 40]]; d.solidList = [G].concat(d.crates); d.allGone = 0; }
        }
      },
      draw: function (d, c) {
        var pl = d.player;
        d.crates.forEach(function (k) { c.fillStyle = "#8a6a3d"; c.fillRect(k[0], k[1], k[2], k[3]); c.strokeStyle = "#5b4426"; c.lineWidth = 2; c.strokeRect(k[0] + 1, k[1] + 1, k[2] - 2, k[3] - 2); c.beginPath(); c.moveTo(k[0] + 4, k[1] + 4); c.lineTo(k[0] + k[2] - 4, k[1] + k[3] - 4); c.stroke(); c.lineWidth = 1; });
        if (d.gp === "hang") { c.strokeStyle = "#f2b134"; c.beginPath(); c.arc(pl.x + pl.w / 2, pl.y + pl.h / 2, 18, 0, Math.PI * 2 * Math.min(1, d.gpT / Math.max(1, d.p.hangMs))); c.stroke(); }
        if (d.gp === "drop") { c.fillStyle = "rgba(242,177,52,.5)"; c.fillRect(pl.x + 4, pl.y - 18, 3, 14); c.fillRect(pl.x + pl.w - 7, pl.y - 18, 3, 14); }
        if (d.ring > 0) { var r = 10 + (300 - d.ring) / 6; c.strokeStyle = "rgba(255,255,255," + (d.ring / 300) + ")"; c.lineWidth = 2; c.beginPath(); c.ellipse(pl.x + pl.w / 2, pl.y + pl.h, r * 1.6, r / 3, 0, 0, Math.PI * 2); c.stroke(); c.lineWidth = 1; }
      },
      snapshot: function (d) { return { pounds: d.pounds, broken: d.broken }; },
      hud: function (d) { return "ground pounds: " + d.pounds + "   crates broken: " + d.broken + "   fall speed: " + Math.round(Math.max(0, d.player.vy)) + " px/s"; }
    }
