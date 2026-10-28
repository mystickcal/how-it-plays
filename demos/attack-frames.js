{
      attack: true,
      level: { width: 640, spawn: [240, 272], dummy: [290, 260], platforms: [G] },
      params: { coyoteMs: 100, bufferMs: 100, attackActiveMs: 50 },
      toggle: "Startup and recovery", sliders: [
        { key: "startupMs", label: "Startup", min: 20, max: 300, step: 10, value: 100, unit: "ms" },
        { key: "recoveryMs", label: "Recovery", min: 50, max: 500, step: 10, value: 250, unit: "ms" }],
      apply: function (p, on, v) { p.startupMs = on ? v.startupMs : 0; p.recoveryMs = on ? v.recoveryMs : 0; p.attackActiveMs = on ? 50 : 90; },
      hud: function (d) { var a = d.player.atk; return "phase: " + (a === "idle" ? "ready" : a) + "   attacks: " + d.stats.attacks + "   hits: " + d.stats.hits; }
    }
