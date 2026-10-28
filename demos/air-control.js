{
      trail: true,
      level: { width: 640, spawn: [60, 272], platforms: [G, [260, 210, 70, 14], [420, 160, 70, 14]] },
      params: { coyoteMs: 100, bufferMs: 100, jumpCut: 0.45 },
      toggle: "Air control", sliders: [{ key: "airMul", label: "Air acceleration", min: 0.1, max: 1, step: 0.05, value: 0.65, unit: "x" }],
      apply: function (p, on, v) { p.airMul = on ? v.airMul : 0; },
      hud: function (d) { return (d.player.grounded ? "on the ground" : "in the air") + "   speed: " + Math.round(d.player.vx) + " px/s"; }
    }
