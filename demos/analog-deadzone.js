{
      level: { width: 640, spawn: [310, 272], platforms: [G, [120, 220, 80, 14], [440, 220, 80, 14]] },
      params: { coyoteMs: 100, bufferMs: 100, stickOn: true, stickDrift: 0.12 },
      toggle: "Dead zone", sliders: [{ key: "deadzone", label: "Dead zone", min: 0.05, max: 0.4, step: 0.01, value: 0.2, unit: "" }],
      apply: function (p, on, v) { p.deadzone = on ? v.deadzone : 0; },
      hudDraw: function (d, c) {
        var cx = 50, cy = 50, r = 34, pl = d.player;
        c.strokeStyle = "#4a515d"; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke();
        if (d.p.deadzone > 0) { c.fillStyle = "rgba(242,177,52,.18)"; c.beginPath(); c.arc(cx, cy, r * d.p.deadzone, 0, Math.PI * 2); c.fill(); }
        c.fillStyle = "#e8e6e1"; c.beginPath(); c.arc(cx + pl.stickRaw * r, cy, 5, 0, Math.PI * 2); c.fill(); c.lineWidth = 1;
      },
      hud: function (d) { return "stick: " + d.player.stickRaw.toFixed(2) + "   used: " + d.player.stickVal.toFixed(2) + "   speed: " + Math.round(d.player.vx) + " px/s"; }
    }
