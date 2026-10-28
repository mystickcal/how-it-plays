{
      level: { width: 640, spawn: [60, 272], platforms: [G, [250, 210, 100, 14], [450, 160, 100, 14]], hazards: [[420, 285, 12, 120, 300, 600]] },
      params: { coyoteMs: 100, bufferMs: 100, iframesOn: true, iframeMs: 600 },
      toggle: "Fixed timestep", sliders: [{ key: "hz", label: "Screen refresh rate", min: 60, max: 240, step: 1, value: 144, unit: "Hz" }],
      apply: function (p, on, v) { p.fixedOn = on; p.hz = v.hz; },
      reset: function (d) { d.extraAcc = 0; d.frames = 0; d.nested = false; },
      update: function (d) {
        if (d.nested) return;
        d.frames++;
        if (d.p.fixedOn) return;
        // off: the game moves a fixed amount every screen frame, so on a faster screen it runs hz / 60 times as fast
        d.extraAcc += d.p.hz / 60 - 1;
        while (d.extraAcc >= 1) { d.extraAcc -= 1; d.nested = true; d.step(); d.nested = false; }
      },
      snapshot: function (d) { return { speed: d.frames ? d.t / (d.frames * STEP) : 1, frames: d.frames }; },
      hud: function (d) { var s = d.frames ? d.t / (d.frames * STEP) : 1; return "game speed: " + s.toFixed(2) + "x   bumps: " + d.stats.hitsTaken; }
    }
