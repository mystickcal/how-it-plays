{
      level: { width: 640, spawn: [60, 272], platforms: [G, [250, 200, 80, 14], [470, 150, 100, 14]] },
      params: { coyoteMs: 100, bufferMs: 100, dashOn: true },
      toggle: "Dash cooldown", sliders: [
        { key: "dashCooldownMs", label: "Cooldown", min: 50, max: 1000, step: 25, value: 200, unit: "ms" },
        { key: "dashSpeed", label: "Dash speed", min: 300, max: 900, step: 20, value: 480, unit: "px/s" }],
      apply: function (p, on, v) { p.dashCooldownMs = on ? v.dashCooldownMs : 0; p.dashSpeed = v.dashSpeed; },
      hudDraw: function (d, c) { var left = Math.max(0, d.player.dashReady - d.t), span = d.p.dashMs + d.p.dashCooldownMs; bar(c, 12, 12, 80, 1 - left / Math.max(1, span), left > 0 ? "#5a6170" : "#7ee2a8"); },
      hud: function (d) { return "dashes: " + d.stats.dashes + "   dash presses: " + d.stats.dashPresses; }
    }
