{
      attack: true,
      level: { width: 640, spawn: [240, 272], dummy: [290, 260], platforms: [G] },
      params: { coyoteMs: 100, bufferMs: 100, attackBufferMs: 120 },
      toggle: "Damage numbers", sliders: [
        { key: "popLife", label: "Stay for", min: 200, max: 1500, step: 50, value: 700, unit: "ms" },
        { key: "popRise", label: "Rise speed", min: 20, max: 200, step: 10, value: 90, unit: "px/s" }],
      apply: function (p, on, v) { p.popOn = on; p.popLife = v.popLife; p.popRise = v.popRise; },
      reset: function (d) { d.pops = []; d.spawned = 0; d.total = 0; },
      onHit: function (d, t) {
        var crit = !d.player.grounded, n = crit ? 25 : 12; d.total += n;
        if (d.p.popOn) { d.pops.push({ x: t.x + t.w / 2 + (d.spawned % 3 - 1) * 8, y: t.y - 6, life: d.p.popLife, n: n, crit: crit }); d.spawned++; }
      },
      update: function (d) { for (var i = d.pops.length - 1; i >= 0; i--) { var q = d.pops[i]; q.y -= d.p.popRise * DT * (q.life / d.p.popLife + 0.2); q.life -= STEP; if (q.life <= 0) d.pops.splice(i, 1); } },
      draw: function (d, c) {
        c.textAlign = "center";
        d.pops.forEach(function (q) { c.globalAlpha = Math.min(1, q.life / 200); c.font = "700 " + (q.crit ? 20 : 15) + "px system-ui,sans-serif"; c.fillStyle = "#1a1d23"; c.fillText(q.n, q.x + 1, q.y + 1); c.fillStyle = q.crit ? "#f2b134" : "#ffffff"; c.fillText(q.n, q.x, q.y); });
        c.globalAlpha = 1; c.textAlign = "start";
      },
      snapshot: function (d) { return { spawned: d.spawned }; },
      hud: function (d) { return "hits: " + d.stats.hits + "   damage dealt: " + d.total + " (jump attacks deal more)"; }
    }
