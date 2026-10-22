/* Demo configs for each How It Plays entry. Text lives in the HTML; this file only drives the canvas. */
(function () {
  "use strict";
  var G = [0, 300, 640, 60]; // ground
  var D = {
    "coyote-time": {
      level: { width: 640, spawn: [40, 262], platforms: [[0, 290, 200, 70], [290, 290, 150, 70], [530, 290, 110, 70], [120, 200, 60, 14]] },
      toggle: "Coyote time", sliders: [{ key: "coyoteMs", label: "Grace window", min: 0, max: 250, step: 10, value: 100, unit: "ms" }],
      apply: function (p, on, v) { p.coyoteMs = on ? v.coyoteMs : 0; },
      hud: function (d) { return "late jumps saved: " + d.stats.coyoteJumps + "   falls: " + d.stats.falls; }
    },
    "jump-buffering": {
      level: { width: 640, spawn: [40, 272], platforms: [G, [170, 236, 110, 16], [360, 176, 110, 16], [520, 236, 120, 16]] },
      toggle: "Jump buffer", sliders: [{ key: "bufferMs", label: "Buffer window", min: 0, max: 250, step: 10, value: 120, unit: "ms" }],
      apply: function (p, on, v) { p.bufferMs = on ? v.bufferMs : 0; },
      hud: function (d) { return "jumps: " + d.stats.jumps + "   from early presses: " + d.stats.bufferedJumps; }
    },
    "variable-jump-height": {
      trail: true,
      level: { width: 640, spawn: [60, 272], platforms: [G, [380, 210, 120, 16]] },
      toggle: "Variable jump", sliders: [
        { key: "jumpCut", label: "Cut on release", min: 0.1, max: 0.9, step: 0.05, value: 0.45, unit: "x" },
        { key: "jumpVel", label: "Jump speed", min: 300, max: 650, step: 10, value: 480, unit: "px/s" }],
      apply: function (p, on, v) { p.jumpCut = on ? v.jumpCut : 1; p.jumpVel = v.jumpVel; },
      hud: function (d) { return "last jump height: " + d.stats.lastJumpHeight + " px"; }
    },
    "camera-lookahead": {
      camGuide: true,
      level: { width: 2400, spawn: [80, 272], platforms: [[0, 300, 2400, 60], [300, 240, 80, 16], [620, 200, 80, 16], [900, 250, 120, 16], [1250, 220, 80, 16], [1500, 250, 60, 50], [1800, 210, 100, 16], [2100, 240, 80, 16]] },
      toggle: "Lookahead and smoothing", sliders: [
        { key: "camLook", label: "Lookahead", min: 0, max: 200, step: 10, value: 90, unit: "px" },
        { key: "camSmooth", label: "Smoothing speed", min: 1, max: 20, step: 1, value: 6, unit: "" }],
      apply: function (p, on, v) { p.camOn = on; p.camLook = v.camLook; p.camSmooth = v.camSmooth; },
      hud: function (d) { return "player x: " + Math.round(d.player.x) + "   camera x: " + Math.round(d.cam.x); }
    },
    "attack-input-buffer": {
      attack: true,
      level: { width: 640, spawn: [240, 272], dummy: [290, 260], platforms: [G] },
      params: { coyoteMs: 100, bufferMs: 100 },
      toggle: "Attack buffer", sliders: [
        { key: "attackBufferMs", label: "Buffer window", min: 0, max: 300, step: 10, value: 150, unit: "ms" },
        { key: "recoveryMs", label: "Recovery", min: 100, max: 400, step: 10, value: 220, unit: "ms" }],
      apply: function (p, on, v) { p.attackBufferMs = on ? v.attackBufferMs : 0; p.recoveryMs = v.recoveryMs; },
      hud: function (d) { return "attacks: " + d.stats.attacks + "   chained from buffer: " + d.stats.bufferedAttacks + "   dropped presses: " + d.stats.dropped; }
    },
    "i-frames": {
      level: { width: 640, spawn: [40, 272], platforms: [G, [250, 210, 140, 16]], hazards: [[320, 285, 14, 110, 180, 470]] },
      params: { coyoteMs: 100, bufferMs: 100 },
      toggle: "I-frames", sliders: [
        { key: "iframeMs", label: "Invincible for", min: 100, max: 2000, step: 50, value: 1000, unit: "ms" },
        { key: "flickerMs", label: "Flicker every", min: 30, max: 200, step: 10, value: 80, unit: "ms" }],
      apply: function (p, on, v) { p.iframesOn = on; p.iframeMs = v.iframeMs; p.flickerMs = v.flickerMs; },
      hud: function (d) { return "health: " + d.player.hp + "/5   hits taken: " + d.stats.hitsTaken; }
    },
    "hitstop": {
      attack: true,
      level: { width: 640, spawn: [240, 272], dummy: [290, 260], platforms: [G] },
      params: { coyoteMs: 100, bufferMs: 100, attackBufferMs: 120 },
      toggle: "Hitstop", sliders: [{ key: "hitstopMs", label: "Freeze", min: 0, max: 250, step: 10, value: 80, unit: "ms" }],
      apply: function (p, on, v) { p.hitstopMs = on ? v.hitstopMs : 0; },
      hud: function (d) { return "hits: " + d.stats.hits + "   frozen frames: " + d.stats.frozenFrames; }
    },
    "screen-shake": {
      attack: true, startOff: "reduced-motion",
      level: { width: 640, spawn: [240, 272], dummy: [290, 260], platforms: [G] },
      params: { coyoteMs: 100, bufferMs: 100, attackBufferMs: 120, hitstopMs: 50 },
      toggle: "Screen shake", sliders: [
        { key: "shakeMax", label: "Max offset", min: 0, max: 40, step: 1, value: 20, unit: "px" },
        { key: "shakeDecay", label: "Falloff", min: 0.5, max: 5, step: 0.1, value: 1.8, unit: "/s" }],
      apply: function (p, on, v) { p.shakeOn = on; p.shakeMax = v.shakeMax; p.shakeDecay = v.shakeDecay; },
      hud: function (d) { return "hits: " + d.stats.hits + "   trauma: " + d.trauma.toFixed(2); }
    },
    "acceleration-curves": {
      level: { width: 640, spawn: [300, 272], platforms: [G, [120, 230, 90, 16], [430, 230, 90, 16]] },
      params: { coyoteMs: 100, bufferMs: 100 },
      toggle: "Acceleration curves", sliders: [
        { key: "accel", label: "Acceleration", min: 200, max: 5000, step: 100, value: 2000, unit: "px/s\u00b2" },
        { key: "decel", label: "Deceleration", min: 200, max: 5000, step: 100, value: 1600, unit: "px/s\u00b2" }],
      apply: function (p, on, v) { p.useAccel = on; p.accel = v.accel; p.decel = v.decel; },
      hud: function (d) { return "speed: " + Math.round(Math.abs(d.player.vx)) + " / " + d.p.maxSpeed + " px/s"; }
    },
    "knockback": {
      attack: true,
      level: { width: 640, spawn: [240, 272], dummy: [290, 260], platforms: [G] },
      params: { coyoteMs: 100, bufferMs: 100, attackBufferMs: 120, hitstopMs: 50 },
      toggle: "Knockback", sliders: [
        { key: "knockForce", label: "Force", min: 0, max: 800, step: 20, value: 340, unit: "px/s" },
        { key: "knockFriction", label: "Friction", min: 200, max: 3000, step: 100, value: 1400, unit: "px/s\u00b2" }],
      apply: function (p, on, v) { p.knockOn = on; p.knockForce = v.knockForce; p.knockFriction = v.knockFriction; },
      hud: function (d) { return "hits: " + d.stats.hits + "   farthest push: " + d.stats.knockDist + " px"; }
    }
  };

  function mount(id) {
    var cfg = D[id]; if (!cfg) return;
    var demo = HIP.start(cfg);
    var on = !(cfg.startOff === "reduced-motion" && HIP.reduceMotion);
    var vals = {};
    var tbtn = document.getElementById("toggle");
    var tpl = document.getElementById("prompt-template");
    var promptEl = document.getElementById("prompt");
    var statsEl = document.getElementById("stats");
    var wrap = document.getElementById("sliders");

    cfg.sliders.forEach(function (s) {
      vals[s.key] = s.value;
      var row = document.createElement("div"); row.className = "slider";
      var id2 = "s-" + s.key;
      row.innerHTML = '<label for="' + id2 + '">' + s.label + '</label><input type="range" id="' + id2 + '" min="' + s.min + '" max="' + s.max + '" step="' + s.step + '" value="' + s.value + '"><output for="' + id2 + '"></output>';
      wrap.appendChild(row);
      var input = row.querySelector("input"), out = row.querySelector("output");
      function show() { out.textContent = fmt(vals[s.key], s) ; }
      input.addEventListener("input", function () { vals[s.key] = parseFloat(input.value); show(); apply(); });
      show();
    });
    function fmt(v, s) { var n = s.step < 1 ? v.toFixed(2).replace(/0$/, "") : String(Math.round(v)); return n + (s.unit ? " " + s.unit : ""); }
    function apply() {
      cfg.apply(demo.p, on, vals);
      tbtn.setAttribute("aria-pressed", on ? "true" : "false");
      tbtn.textContent = cfg.toggle + ": " + (on ? "on" : "off");
      if (tpl && promptEl) {
        var text = tpl.textContent.replace(/\{(\w+)(?::([a-z]+))?\}/g, function (m, k, mode) {
          var s = cfg.sliders.filter(function (x) { return x.key === k; })[0];
          var v = vals[k]; if (v === undefined) return m;
          if (mode === "half") return String(Math.round(v / 2));
          if (mode === "plus") return String(Math.round(v + 50));
          if (mode === "inv") return (0.5 / v).toFixed(1);
          if (mode === "ramp") return String(Math.round(200 / v * 1000));
          return s && s.step < 1 ? v.toFixed(2).replace(/0$/, "") : String(Math.round(v));
        });
        promptEl.textContent = text;
      }
    }
    tbtn.addEventListener("click", function (e) { on = !on; apply(); if (e.detail > 0) demo.canvas.focus(); });
    document.getElementById("reset").addEventListener("click", function (e) { demo.reset(); if (e.detail > 0) demo.canvas.focus(); });
    apply();
    var lastTxt = "";
    setInterval(function () { var t = cfg.hud(demo); if (t !== lastTxt) { statsEl.textContent = t; lastTxt = t; } }, 250);
    window.__hip = { cfg: cfg, vals: vals, isOn: function () { return on; } };
    document.documentElement.setAttribute("data-demo-ready", "1");
  }
  window.HIP_MOUNT = mount;
})();
