{
      level: { width: 640, spawn: [80, 272], platforms: [G], hazards: [[420, 282, 18, -260, 40, 600]] },
      params: { coyoteMs: 100, bufferMs: 100, dashOn: true, dashSpeed: 380, dashMs: 300, dashCooldownMs: 250, iframesOn: true, iframeMs: 700 },
      toggle: "Roll invincibility", sliders: [
        { key: "dashMs", label: "Roll length", min: 150, max: 600, step: 10, value: 300, unit: "ms" },
        { key: "dashCooldownMs", label: "Cooldown", min: 0, max: 800, step: 25, value: 250, unit: "ms" }],
      apply: function (p, on, v) { p.dashInvuln = on; p.dashMs = v.dashMs; p.dashCooldownMs = v.dashCooldownMs; },
      hud: function (d) { return "health: " + d.player.hp + "/5   rolled through: " + Math.min(d.stats.dodged, 999) + " frames   hits: " + d.stats.hitsTaken; }
    }
