{
      camGuide: true,
      level: { width: 2400, spawn: [80, 272], platforms: [[0, 300, 2400, 60], [300, 240, 80, 16], [620, 200, 80, 16], [900, 250, 120, 16], [1250, 220, 80, 16], [1500, 250, 60, 50], [1800, 210, 100, 16], [2100, 240, 80, 16]] },
      toggle: "Lookahead and smoothing", sliders: [
        { key: "camLook", label: "Lookahead", min: 0, max: 200, step: 10, value: 90, unit: "px" },
        { key: "camSmooth", label: "Smoothing speed", min: 1, max: 20, step: 1, value: 6, unit: "" }],
      apply: function (p, on, v) { p.camOn = on; p.camLook = v.camLook; p.camSmooth = v.camSmooth; },
      hud: function (d) { return "player x: " + Math.round(d.player.x) + "   camera x: " + Math.round(d.cam.x); }
    }
