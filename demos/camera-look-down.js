{
      level: { width: 640, height: 900, spawn: [200, 272], platforms: [[0, 300, 380, 16], [520, 300, 120, 16], [440, 560, 200, 16], [0, 700, 300, 16], [0, 860, 640, 40]], hazards: [[120, 690, 14, 120, 60, 260]] },
      params: { coyoteMs: 100, bufferMs: 100 },
      toggle: "Look down", sliders: [
        { key: "lookPx", label: "Look distance", min: 40, max: 200, step: 10, value: 120, unit: "px" },
        { key: "lookDelayMs", label: "Hold for", min: 0, max: 800, step: 50, value: 300, unit: "ms" }],
      apply: function (p, on, v) { p.lookOn = on; p.lookPx = v.lookPx; p.lookDelayMs = v.lookDelayMs; },
      snapshot: function (d) { return { lookY: d.cam.lookY }; },
      hud: function (d) { return "camera offset: " + Math.round(d.cam.lookY) + " px"; }
    }
