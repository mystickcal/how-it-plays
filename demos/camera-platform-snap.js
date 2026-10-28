{
      level: { width: 1280, height: 720, spawn: [100, 632], platforms: [[0, 660, 1280, 60], [260, 590, 120, 14], [440, 520, 120, 14], [620, 450, 120, 14], [800, 380, 120, 14], [980, 310, 120, 14], [1120, 240, 160, 14]] },
      params: { coyoteMs: 100, bufferMs: 100 },
      toggle: "Platform snapping", sliders: [{ key: "camSnapSpeed", label: "Snap speed", min: 1, max: 15, step: 1, value: 6, unit: "" }],
      apply: function (p, on, v) { p.vcam = on ? "snap" : "lock"; p.camSnapSpeed = v.camSnapSpeed; },
      hud: function (d) { return "camera moved up/down: " + Math.round(d.stats.camTravelY) + " px"; }
    }
