{
      level: { width: 640, spawn: [290, 272], dummy: [326, 260], platforms: [G] },
      params: { coyoteMs: 100, bufferMs: 100 },
      toggle: "Parry", sliders: [{ key: "parryMs", label: "Parry window", min: 50, max: 300, step: 10, value: 150, unit: "ms" }],
      apply: function (p, on, v) { p.parryOn = on; p.parryMs = v.parryMs; },
      reset: function (d) { d.seed = 7; d.phase = "idle"; d.until = 600; d.openUntil = -1e9; d.lastPress = -1e9; d.parries = 0; d.swings = 0; d.presses = 0; d.spark = 0; },
      onAttack: function (d) {
        // a press opens the window only if there was no other press just before it, so mashing doesn't work
        d.presses++;
        if (d.p.parryOn && d.t - d.lastPress > 250) d.openUntil = d.t + d.p.parryMs;
        d.lastPress = d.t;
      },
      update: function (d) {
        var pl = d.player, e = d.dummy;
        if (d.spark > 0) d.spark -= STEP;
        if (d.t < d.until) return;
        if (d.phase === "idle") { d.phase = "windup"; d.until = d.t + 400 + Math.round(rng(d) * 300); }
        else if (d.phase === "windup") {
          d.phase = "strike"; d.until = d.t + 120; d.swings++;
          var dx = Math.abs((pl.x + pl.w / 2) - (e.x + e.w / 2));
          if (dx < 70 && pl.y + pl.h > e.y) {
            if (d.p.parryOn && d.t <= d.openUntil) { d.parries++; d.spark = 250; d.phase = "staggered"; d.until = d.t + 600; d.openUntil = -1e9; }
            else d.onHurt(e);
          }
        } else if (d.phase === "strike") { d.phase = "rest"; d.until = d.t + 500; }
        else { d.phase = "idle"; d.until = d.t + 300; }
      },
      draw: function (d, c) {
        var e = d.dummy, pl = d.player;
        if (d.phase === "windup") { c.fillStyle = "rgba(229,83,75,.35)"; c.fillRect(e.x - 44, e.y - 6, e.w + 88, 6); }
        if (d.phase === "strike") { c.fillStyle = "#e5534b"; c.fillRect(e.x - 44, e.y + 12, 44, 14); }
        if (d.p.parryOn && d.t <= d.openUntil) { c.strokeStyle = "#7ee2a8"; c.lineWidth = 2; c.strokeRect(pl.x - 4.5, pl.y - 4.5, pl.w + 9, pl.h + 9); c.lineWidth = 1; }
        if (d.spark > 0) { c.fillStyle = "#ffffff"; for (var i = 0; i < 6; i++) { var a = i * 1.047 + d.t / 90; c.fillRect(pl.x + pl.w + 8 + Math.cos(a) * 10, pl.y + 10 + Math.sin(a) * 10, 3, 3); } }
        if (d.phase === "staggered") { c.fillStyle = "#f2b134"; for (var j = 0; j < 3; j++) { var b = d.t / 150 + j * 2.1; c.beginPath(); c.arc(e.x + e.w / 2 + Math.cos(b) * 14, e.y - 10 + Math.sin(b) * 4, 3, 0, Math.PI * 2); c.fill(); } }
      },
      snapshot: function (d) { return { parries: d.parries, swings: d.swings, presses: d.presses }; },
      hud: function (d) { return "health: " + d.player.hp + "/5   enemy swings: " + d.swings + "   parried: " + d.parries + "   hits taken: " + d.stats.hitsTaken; }
    }
