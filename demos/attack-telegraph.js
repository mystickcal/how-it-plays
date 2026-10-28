{
      level: { width: 640, spawn: [120, 272], platforms: [G] },
      params: { coyoteMs: 100, bufferMs: 100, iframesOn: true, iframeMs: 400 },
      toggle: "Telegraph", sliders: [{ key: "teleMs", label: "Wind-up", min: 150, max: 1000, step: 50, value: 450, unit: "ms" }],
      apply: function (p, on, v) { p.teleOn = on; p.teleMs = v.teleMs; },
      reset: function (d) { d.seed = 12345; d.phase = "idle"; d.until = 900; d.waves = 0; },
      update: function (d) {
        if (d.t >= d.until) {
          if (d.phase === "idle") { if (d.p.teleOn) { d.phase = "windup"; d.until = d.t + d.p.teleMs; d.teleStart = d.t; } else { d.phase = "slam"; d.until = d.t + 220; d.waves++; } }
          else if (d.phase === "windup") { d.phase = "slam"; d.until = d.t + 220; d.waves++; }
          else { d.phase = "idle"; d.until = d.t + 700 + rng(d) * 1100; }
        }
        if (d.phase === "slam" && d.player.y + d.player.h > 288) d.onHurt();
      },
      draw: function (d, c) {
        var wind = d.phase === "windup", k = wind ? (d.t - d.teleStart) / d.p.teleMs : 0;
        c.fillStyle = wind ? "#e5534b" : "#8fa1b3"; c.fillRect(540, wind ? 250 + k * 10 : 250, 40, wind ? 50 - k * 10 : 50);
        if (wind) { c.fillStyle = "rgba(229,83,75," + (0.12 + 0.3 * k) + ")"; c.fillRect(0, 292, 640, 8); }
        if (d.phase === "slam") spikes(c, 0, 540, 284);
      },
      snapshot: function (d) { return { waves: d.waves }; },
      hud: function (d) { return "health: " + d.player.hp + "/5   slams: " + d.waves + "   hits taken: " + d.stats.hitsTaken; }
    }
