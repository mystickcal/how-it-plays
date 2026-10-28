{
      trail: true,
      level: { width: 640, spawn: [60, 272], platforms: [G, [380, 210, 120, 16]] },
      toggle: "Variable jump", sliders: [
        { key: "jumpCut", label: "Cut on release", min: 0.1, max: 0.9, step: 0.05, value: 0.45, unit: "x" },
        { key: "jumpVel", label: "Jump speed", min: 300, max: 650, step: 10, value: 480, unit: "px/s" }],
      apply: function (p, on, v) { p.jumpCut = on ? v.jumpCut : 1; p.jumpVel = v.jumpVel; },
      hud: function (d) { return "last jump height: " + d.stats.lastJumpHeight + " px"; }
    }
