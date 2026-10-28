{
      level: { width: 640, spawn: [60, 272], platforms: [G, [300, 196, 340, 104], [120, 210, 60, 14]] },
      params: { coyoteMs: 100, bufferMs: 100 },
      toggle: "Ledge grab", sliders: [{ key: "ledgeReach", label: "Grab reach above head", min: 0, max: 30, step: 1, value: 10, unit: "px" }],
      apply: function (p, on, v) { p.ledgeOn = on; p.ledgeReach = v.ledgeReach; },
      hud: function (d) { return (d.player.hang ? "hanging: jump to climb, down to let go" : "grabs: " + d.stats.ledgeGrabs) + "   climbs: " + d.stats.ledgeClimbs; }
    }
