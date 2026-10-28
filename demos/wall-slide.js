{
      level: { width: 640, spawn: [60, 272], platforms: [G, [440, 40, 40, 260], [160, 110, 40, 190]] },
      params: { coyoteMs: 100, bufferMs: 100, wallJump: true, wallLockMs: 160 },
      toggle: "Wall slide", sliders: [
        { key: "wallSlideMax", label: "Slide speed at first", min: 10, max: 300, step: 10, value: 40, unit: "px/s" },
        { key: "wallSlideMs", label: "Grip lasts", min: 200, max: 3000, step: 100, value: 1200, unit: "ms" }],
      apply: function (p, on, v) { p.wallSlideMax = on ? v.wallSlideMax : 0; p.wallSlideMs = v.wallSlideMs; },
      hud: function (d) { return (d.player.walled ? "sliding" : "not on a wall") + "   fall speed: " + Math.round(Math.max(0, d.player.vy)) + " px/s"; }
    }
