{
      level: { width: 640, spawn: [40, 272], platforms: [G, [250, 210, 140, 16]], hazards: [[320, 285, 14, 110, 180, 470]] },
      params: { coyoteMs: 100, bufferMs: 100, iframesOn: true, iframeMs: 900 },
      toggle: "Delayed damage bar", sliders: [
        { key: "ghostDelayMs", label: "Hold for", min: 100, max: 1500, step: 50, value: 500, unit: "ms" },
        { key: "ghostRate", label: "Drain speed", min: 0.5, max: 6, step: 0.25, value: 2, unit: "hp/s" }],
      apply: function (p, on, v) { p.ghostOn = on; p.ghostDelayMs = v.ghostDelayMs; p.ghostRate = v.ghostRate; },
      reset: function (d) { d.ghost = 5; d.hurtT = -1e9; d.maxGap = 0; },
      onHurt: function (d) { d.hurtT = d.t; },
      update: function (d) {
        var hp = Math.max(0, d.player.hp);
        if (!d.p.ghostOn || hp > d.ghost) d.ghost = hp;
        else if (d.t - d.hurtT > d.p.ghostDelayMs) d.ghost = HIP.approach(d.ghost, hp, d.p.ghostRate * DT);
        d.maxGap = Math.max(d.maxGap, d.ghost - hp);
      },
      hudDraw: function (d, c) {
        var x = 12, y = 12, w = 160;
        c.fillStyle = "#2c313a"; c.fillRect(x, y, w, 12);
        c.fillStyle = "#f4f1ea"; c.fillRect(x, y, Math.round(w * d.ghost / 5), 12);
        c.fillStyle = "#e5534b"; c.fillRect(x, y, Math.round(w * Math.max(0, d.player.hp) / 5), 12);
      },
      snapshot: function (d) { return { maxGap: d.maxGap }; },
      hud: function (d) { return "health: " + d.player.hp + "/5   hits taken: " + d.stats.hitsTaken; }
    }
