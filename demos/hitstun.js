{
      attack: true,
      level: { width: 640, spawn: [290, 272], dummy: [326, 260], platforms: [G] },
      params: { coyoteMs: 100, bufferMs: 100, attackBufferMs: 120 },
      toggle: "Hitstun", sliders: [{ key: "stunMs", label: "Stunned for", min: 100, max: 800, step: 50, value: 400, unit: "ms" }],
      apply: function (p, on, v) { p.stunOn = on; p.stunMs = v.stunMs; },
      reset: function (d) { d.phase = "idle"; d.until = 600; d.stun = 0; d.swings = 0; d.interrupts = 0; },
      onHit: function (d) {
        if (!d.p.stunOn) return;
        // a hit stops whatever the enemy was doing and holds it for stunMs
        if (d.phase === "windup" || d.phase === "strike") d.interrupts++;
        d.stun = d.p.stunMs; d.phase = "idle"; d.until = d.t + d.p.stunMs;
      },
      update: function (d) {
        var pl = d.player, e = d.dummy;
        if (d.stun > 0) { d.stun -= STEP; return; }
        if (d.t < d.until) return;
        if (d.phase === "idle") { d.phase = "windup"; d.until = d.t + 450; }
        else if (d.phase === "windup") {
          d.phase = "strike"; d.until = d.t + 120; d.swings++;
          var dx = Math.abs((pl.x + pl.w / 2) - (e.x + e.w / 2));
          if (dx < 70 && pl.y + pl.h > e.y) d.onHurt(e);
        } else if (d.phase === "strike") { d.phase = "rest"; d.until = d.t + 500; }
        else { d.phase = "idle"; d.until = d.t + 300; }
      },
      draw: function (d, c) {
        var e = d.dummy;
        if (d.phase === "windup") { c.fillStyle = "rgba(229,83,75,.35)"; c.fillRect(e.x - 44, e.y - 6, e.w + 88, 6); }
        if (d.phase === "strike") { c.fillStyle = "#e5534b"; c.fillRect(e.x - 44, e.y + 12, 44, 14); }
        if (d.stun > 0) { c.fillStyle = "#f2b134"; for (var i = 0; i < 3; i++) { var a = d.t / 150 + i * 2.1; c.beginPath(); c.arc(e.x + e.w / 2 + Math.cos(a) * 14, e.y - 10 + Math.sin(a) * 4, 3, 0, Math.PI * 2); c.fill(); } }
      },
      snapshot: function (d) { return { swings: d.swings, interrupts: d.interrupts }; },
      hud: function (d) { return "health: " + d.player.hp + "/5   enemy swings: " + d.swings + "   interrupted: " + d.interrupts + "   hits taken: " + d.stats.hitsTaken; }
    }
