{
      level: { width: 640, spawn: [60, 272], platforms: [G, [260, 190, 100, 14], [440, 120, 100, 14]] },
      params: { coyoteMs: 100, bufferMs: 100, jumpCut: 0.45 },
      toggle: "Squash and stretch", sliders: [
        { key: "squashAmt", label: "Amount", min: 0.1, max: 0.6, step: 0.05, value: 0.4, unit: "" },
        { key: "squashBack", label: "Recover speed", min: 0.5, max: 6, step: 0.25, value: 1.75, unit: "/s" }],
      apply: function (p, on, v) { p.squashOn = on; p.squashAmt = v.squashAmt; p.squashBack = v.squashBack; },
      hud: function (d) { return "scale: " + d.player.sx.toFixed(2) + " x " + d.player.sy.toFixed(2); }
    }
