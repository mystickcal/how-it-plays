/* Demo configs for each How It Plays entry. Text lives in the HTML; this file only drives the canvas. */
(function () {
  "use strict";
  var G = [0, 300, 640, 60]; // ground
  var STEP = 1000 / 60, DT = 1 / 60;
  function circleHitsRect(cx, cy, r, b) {
    var nx = Math.max(b.x, Math.min(cx, b.x + b.w)), ny = Math.max(b.y, Math.min(cy, b.y + b.h));
    return (nx - cx) * (nx - cx) + (ny - cy) * (ny - cy) < r * r;
  }
  function moveShots(d, list) {
    for (var i = list.length - 1; i >= 0; i--) {
      var b = list[i]; b.x += b.vx * DT; b.y += b.vy * DT;
      if (b.x < -20 || b.x > d.cfg.level.width + 20 || b.y < -20 || b.y > 400) list.splice(i, 1);
    }
  }
  function dot(c, list, color, r) { c.fillStyle = color; list.forEach(function (b) { c.beginPath(); c.arc(b.x, b.y, r, 0, Math.PI * 2); c.fill(); }); }
  function bar(c, x, y, w, frac, color) { c.fillStyle = "#2c313a"; c.fillRect(x, y, w, 6); c.fillStyle = color; c.fillRect(x, y, Math.round(w * Math.max(0, Math.min(1, frac))), 6); }
  function spikes(c, x, w, y) { c.fillStyle = "#e5534b"; for (var i = x; i < x + w; i += 12) { c.beginPath(); c.moveTo(i, y + 16); c.lineTo(i + 6, y); c.lineTo(i + 12, y + 16); c.fill(); } }
  // seeded pseudo-random so the attack rhythm can't be learned but tests stay repeatable
  function rng(d) { d.seed = (d.seed * 16807) % 2147483647; return d.seed / 2147483647; }

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
    },
    "apex-hang": {
      trail: true,
      level: { width: 640, spawn: [60, 272], platforms: [G, [250, 236, 70, 14], [420, 200, 120, 14]] },
      params: { coyoteMs: 100, bufferMs: 100, jumpCut: 0.45 },
      toggle: "Apex hang", sliders: [
        { key: "apexThresh", label: "Near the top below", min: 20, max: 200, step: 10, value: 80, unit: "px/s" },
        { key: "apexMul", label: "Gravity there", min: 0.1, max: 1, step: 0.05, value: 0.5, unit: "x" }],
      apply: function (p, on, v) { p.apexOn = on; p.apexThresh = v.apexThresh; p.apexMul = v.apexMul; },
      hud: function (d) { return "last air time: " + Math.round(d.stats.lastAirTime * STEP) + " ms   last jump height: " + d.stats.lastJumpHeight + " px"; }
    },
    "fall-gravity": {
      trail: true,
      level: { width: 640, spawn: [60, 272], platforms: [G, [300, 220, 90, 14], [480, 160, 110, 14]] },
      params: { coyoteMs: 100, bufferMs: 100, jumpCut: 0.45, maxFall: 900 },
      toggle: "Heavier fall", sliders: [{ key: "fallMul", label: "Gravity when falling", min: 1, max: 3, step: 0.1, value: 1.8, unit: "x" }],
      apply: function (p, on, v) { p.fallMul = on ? v.fallMul : 1; },
      hud: function (d) { return "last air time: " + Math.round(d.stats.lastAirTime * STEP) + " ms   last jump height: " + d.stats.lastJumpHeight + " px"; }
    },
    "terminal-velocity": {
      wrapY: true,
      level: { width: 640, spawn: [140, 72], platforms: [[0, 100, 180, 260], [460, 0, 180, 360]], hazards: [[250, 200, 14, 0, 0, 999], [390, 60, 14, 0, 0, 999], [320, 300, 14, 0, 0, 999]] },
      params: { iframesOn: true, iframeMs: 600 },
      toggle: "Fall speed cap", sliders: [{ key: "maxFall", label: "Max fall speed", min: 200, max: 900, step: 20, value: 320, unit: "px/s" }],
      apply: function (p, on, v) { p.maxFall = on ? v.maxFall : 6000; },
      hud: function (d) { return "fall speed: " + Math.round(Math.max(0, d.player.vy)) + " px/s   bumps: " + d.stats.hitsTaken; }
    },
    "corner-correction": {
      level: { width: 640, spawn: [150, 272], platforms: [G, [0, 250, 300, 12], [328, 250, 152, 12], [520, 250, 120, 12]] },
      params: { coyoteMs: 100, bufferMs: 100 },
      toggle: "Corner correction", sliders: [{ key: "cornerPx", label: "Nudge up to", min: 1, max: 12, step: 1, value: 8, unit: "px" }],
      apply: function (p, on, v) { p.cornerPx = on ? v.cornerPx : 0; },
      hud: function (d) { return "nudges: " + d.stats.corrections + "   jumps: " + d.stats.jumps; }
    },
    "double-jump": {
      trail: true,
      level: { width: 640, spawn: [60, 272], platforms: [G, [260, 180, 120, 14], [470, 120, 120, 14]] },
      params: { coyoteMs: 100, bufferMs: 100, jumpCut: 0.45 },
      toggle: "Double jump", sliders: [{ key: "airJumpMul", label: "Second jump strength", min: 0.5, max: 1.2, step: 0.05, value: 0.85, unit: "x" }],
      apply: function (p, on, v) { p.airJumps = on ? 1 : 0; p.airJumpMul = v.airJumpMul; },
      hud: function (d) { return "air jumps: " + d.stats.airJumps + "   last jump height: " + d.stats.lastJumpHeight + " px"; }
    },
    "landing-recovery": {
      level: { width: 640, spawn: [60, 92], platforms: [G, [40, 120, 140, 16], [420, 200, 120, 16]] },
      params: { coyoteMs: 100, bufferMs: 100, squashOn: true, squashAmt: 0.3 },
      toggle: "Landing recovery", sliders: [
        { key: "landLagMs", label: "Recovery", min: 30, max: 400, step: 10, value: 100, unit: "ms" },
        { key: "landLagVy", label: "Only above", min: 300, max: 720, step: 20, value: 600, unit: "px/s" }],
      apply: function (p, on, v) { p.landLagMs = on ? v.landLagMs : 0; p.landLagVy = v.landLagVy; },
      hud: function (d) { return "frames stuck after landing: " + d.stats.lagFrames + "   last impact: " + Math.round(d.stats.maxVy) + " px/s"; }
    },
    "one-way-platforms": {
      level: { width: 640, spawn: [60, 272], platforms: [G], oneway: [[200, 230, 160, 10], [380, 166, 150, 10], [120, 140, 120, 10]] },
      params: { coyoteMs: 100, bufferMs: 100 },
      toggle: "One-way platforms", sliders: [{ key: "dropMs", label: "Drop-through time", min: 50, max: 500, step: 10, value: 200, unit: "ms" }],
      apply: function (p, on, v) { p.oneWayOn = on; p.dropMs = v.dropMs; },
      hud: function (d) { return "drops: " + d.stats.drops + "   jumps: " + d.stats.jumps + "   height: " + Math.round(300 - d.player.y - 28) + " px"; }
    },
    "air-control": {
      trail: true,
      level: { width: 640, spawn: [60, 272], platforms: [G, [260, 210, 70, 14], [420, 160, 70, 14]] },
      params: { coyoteMs: 100, bufferMs: 100, jumpCut: 0.45 },
      toggle: "Air control", sliders: [{ key: "airMul", label: "Air acceleration", min: 0.1, max: 1, step: 0.05, value: 0.65, unit: "x" }],
      apply: function (p, on, v) { p.airMul = on ? v.airMul : 0; },
      hud: function (d) { return (d.player.grounded ? "on the ground" : "in the air") + "   speed: " + Math.round(d.player.vx) + " px/s"; }
    },
    "turn-around-speed": {
      level: { width: 640, spawn: [300, 272], platforms: [G, [120, 230, 60, 14], [460, 230, 60, 14]] },
      params: { coyoteMs: 100, bufferMs: 100, decel: 700 },
      toggle: "Quick turn", sliders: [{ key: "turnAccel", label: "Turn acceleration", min: 1000, max: 8000, step: 250, value: 4000, unit: "px/s\u00b2" }],
      apply: function (p, on, v) { p.turnAccel = on ? v.turnAccel : 0; },
      reset: function (d) { d.turnFrames = 0; d.lastTurn = 0; },
      snapshot: function (d) { return { lastTurn: d.lastTurn, turning: d.turnFrames }; },
      update: function (d) { var pl = d.player, dir = (d.keys.right ? 1 : 0) - (d.keys.left ? 1 : 0); if (dir && pl.vx && Math.sign(pl.vx) !== dir) d.turnFrames++; else if (d.turnFrames) { d.lastTurn = d.turnFrames; d.turnFrames = 0; } },
      draw: function (d, c) { var pl = d.player; if (d.turnFrames) { c.fillStyle = "rgba(232,230,225,.5)"; for (var i = 0; i < 3; i++) c.fillRect(pl.x + (pl.vx > 0 ? pl.w : -6) + i * 3 * Math.sign(pl.vx), pl.y + pl.h - 4 - i * 3, 4, 4); } },
      hud: function (d) { return "last turn took: " + Math.round(d.lastTurn * STEP) + " ms   speed: " + Math.round(d.player.vx) + " px/s"; }
    },
    "wall-slide": {
      level: { width: 640, spawn: [60, 272], platforms: [G, [440, 40, 40, 260], [160, 110, 40, 190]] },
      params: { coyoteMs: 100, bufferMs: 100, wallJump: true, wallLockMs: 160 },
      toggle: "Wall slide", sliders: [
        { key: "wallSlideMax", label: "Slide speed at first", min: 10, max: 300, step: 10, value: 40, unit: "px/s" },
        { key: "wallSlideMs", label: "Grip lasts", min: 200, max: 3000, step: 100, value: 1200, unit: "ms" }],
      apply: function (p, on, v) { p.wallSlideMax = on ? v.wallSlideMax : 0; p.wallSlideMs = v.wallSlideMs; },
      hud: function (d) { return (d.player.walled ? "sliding" : "not on a wall") + "   fall speed: " + Math.round(Math.max(0, d.player.vy)) + " px/s"; }
    },
    "wall-jump-lockout": {
      level: { width: 640, spawn: [60, 272], platforms: [G, [180, 60, 40, 240], [340, 60, 40, 240], [560, 30, 40, 270]] },
      params: { coyoteMs: 100, bufferMs: 100, wallJump: true, wallSlideMax: 60 },
      toggle: "Input lockout", sliders: [
        { key: "wallLockMs", label: "Lockout", min: 50, max: 400, step: 10, value: 160, unit: "ms" },
        { key: "wallJumpH", label: "Push away", min: 100, max: 450, step: 10, value: 260, unit: "px/s" }],
      apply: function (p, on, v) { p.wallLockMs = on ? v.wallLockMs : 0; p.wallJumpH = v.wallJumpH; },
      hud: function (d) { return "wall jumps: " + d.stats.wallJumps + "   height: " + Math.max(0, Math.round(272 - d.player.y)) + " px"; }
    },
    "dash-cooldown": {
      level: { width: 640, spawn: [60, 272], platforms: [G, [250, 200, 80, 14], [470, 150, 100, 14]] },
      params: { coyoteMs: 100, bufferMs: 100, dashOn: true },
      toggle: "Dash cooldown", sliders: [
        { key: "dashCooldownMs", label: "Cooldown", min: 50, max: 1000, step: 25, value: 200, unit: "ms" },
        { key: "dashSpeed", label: "Dash speed", min: 300, max: 900, step: 20, value: 480, unit: "px/s" }],
      apply: function (p, on, v) { p.dashCooldownMs = on ? v.dashCooldownMs : 0; p.dashSpeed = v.dashSpeed; },
      hudDraw: function (d, c) { var left = Math.max(0, d.player.dashReady - d.t), span = d.p.dashMs + d.p.dashCooldownMs; bar(c, 12, 12, 80, 1 - left / Math.max(1, span), left > 0 ? "#5a6170" : "#7ee2a8"); },
      hud: function (d) { return "dashes: " + d.stats.dashes + "   dash presses: " + d.stats.dashPresses; }
    },
    "ledge-grab": {
      level: { width: 640, spawn: [60, 272], platforms: [G, [300, 196, 340, 104], [120, 210, 60, 14]] },
      params: { coyoteMs: 100, bufferMs: 100 },
      toggle: "Ledge grab", sliders: [{ key: "ledgeReach", label: "Grab reach above head", min: 0, max: 30, step: 1, value: 10, unit: "px" }],
      apply: function (p, on, v) { p.ledgeOn = on; p.ledgeReach = v.ledgeReach; },
      hud: function (d) { return (d.player.hang ? "hanging: jump to climb, down to let go" : "grabs: " + d.stats.ledgeGrabs) + "   climbs: " + d.stats.ledgeClimbs; }
    },
    "slope-snapping": {
      level: { width: 640, spawn: [60, 152], stepUp: true, platforms: [[0, 180, 200, 180], [380, 300, 260, 60]], ramps: [[200, 180, 380, 300]] },
      params: { bufferMs: 100 },
      toggle: "Slope snapping", sliders: [{ key: "slopeSnap", label: "Snap distance", min: 2, max: 24, step: 1, value: 12, unit: "px" }],
      apply: function (p, on, v) { p.slopeSnap = on ? v.slopeSnap : 0; },
      reset: function (d) { d.slopeAir = 0; },
      snapshot: function (d) { return { slopeAir: d.slopeAir }; },
      update: function (d) { var cx = d.player.x + 10; if (!d.player.grounded && cx > 200 && cx < 380 && d.player.vy >= 0) d.slopeAir++; },
      hud: function (d) { return "airborne frames on the slope: " + d.slopeAir + "   jumps: " + d.stats.jumps; }
    },
    "moving-platforms": {
      level: { width: 640, spawn: [180, 212], platforms: [[0, 300, 140, 60], [500, 300, 140, 60]], movers: [[150, 240, 90, 14, 250, 4]] },
      params: { coyoteMs: 100, bufferMs: 100 },
      toggle: "Carry the rider", sliders: [{ key: "moverSpeed", label: "Platform trip", min: 2, max: 8, step: 0.5, value: 4, unit: "s" }],
      apply: function (p, on, v) { p.carryOn = on; p.inheritOn = on; window.__demo && window.__demo.movers.forEach(function (m) { m.period = v.moverSpeed; }); },
      reset: function (d) { var v = window.__hip && window.__hip.vals; if (v) d.movers.forEach(function (m) { m.period = v.moverSpeed; }); },
      hud: function (d) { return (d.player.ride ? "riding" : d.player.grounded ? "on the ground" : "in the air") + "   falls: " + d.stats.falls; }
    },
    "analog-deadzone": {
      level: { width: 640, spawn: [310, 272], platforms: [G, [120, 220, 80, 14], [440, 220, 80, 14]] },
      params: { coyoteMs: 100, bufferMs: 100, stickOn: true, stickDrift: 0.12 },
      toggle: "Dead zone", sliders: [{ key: "deadzone", label: "Dead zone", min: 0.05, max: 0.4, step: 0.01, value: 0.2, unit: "" }],
      apply: function (p, on, v) { p.deadzone = on ? v.deadzone : 0; },
      hudDraw: function (d, c) {
        var cx = 50, cy = 50, r = 34, pl = d.player;
        c.strokeStyle = "#4a515d"; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke();
        if (d.p.deadzone > 0) { c.fillStyle = "rgba(242,177,52,.18)"; c.beginPath(); c.arc(cx, cy, r * d.p.deadzone, 0, Math.PI * 2); c.fill(); }
        c.fillStyle = "#e8e6e1"; c.beginPath(); c.arc(cx + pl.stickRaw * r, cy, 5, 0, Math.PI * 2); c.fill(); c.lineWidth = 1;
      },
      hud: function (d) { return "stick: " + d.player.stickRaw.toFixed(2) + "   used: " + d.player.stickVal.toFixed(2) + "   speed: " + Math.round(d.player.vx) + " px/s"; }
    },
    "attack-frames": {
      attack: true,
      level: { width: 640, spawn: [240, 272], dummy: [290, 260], platforms: [G] },
      params: { coyoteMs: 100, bufferMs: 100, attackActiveMs: 50 },
      toggle: "Startup and recovery", sliders: [
        { key: "startupMs", label: "Startup", min: 20, max: 300, step: 10, value: 100, unit: "ms" },
        { key: "recoveryMs", label: "Recovery", min: 50, max: 500, step: 10, value: 250, unit: "ms" }],
      apply: function (p, on, v) { p.startupMs = on ? v.startupMs : 0; p.recoveryMs = on ? v.recoveryMs : 0; p.attackActiveMs = on ? 50 : 90; },
      hud: function (d) { var a = d.player.atk; return "phase: " + (a === "idle" ? "ready" : a) + "   attacks: " + d.stats.attacks + "   hits: " + d.stats.hits; }
    },
    "cancel-windows": {
      attack: true,
      level: { width: 640, spawn: [240, 272], dummy: [290, 260], platforms: [G] },
      params: { coyoteMs: 100, bufferMs: 100, recoveryMs: 300, hitstopMs: 30 },
      toggle: "Cancel window", sliders: [{ key: "cancelMs", label: "Window", min: 30, max: 300, step: 10, value: 150, unit: "ms" }],
      apply: function (p, on, v) { p.cancelMs = on ? v.cancelMs : 0; },
      reset: function (d) { d.combo = 0; d.best = 0; d.lastHitT = -1e9; },
      onHit: function (d) { d.combo = d.t - d.lastHitT < 600 ? d.combo + 1 : 1; d.lastHitT = d.t; d.best = Math.max(d.best, d.combo); },
      hud: function (d) { return "combo: " + (d.t - d.lastHitT < 600 ? d.combo : 0) + "   best: " + d.best + "   cancels: " + d.stats.cancels; }
    },
    "dodge-roll": {
      level: { width: 640, spawn: [80, 272], platforms: [G], hazards: [[420, 282, 18, -260, 40, 600]] },
      params: { coyoteMs: 100, bufferMs: 100, dashOn: true, dashSpeed: 380, dashMs: 300, dashCooldownMs: 250, iframesOn: true, iframeMs: 700 },
      toggle: "Roll invincibility", sliders: [
        { key: "dashMs", label: "Roll length", min: 150, max: 600, step: 10, value: 300, unit: "ms" },
        { key: "dashCooldownMs", label: "Cooldown", min: 0, max: 800, step: 25, value: 250, unit: "ms" }],
      apply: function (p, on, v) { p.dashInvuln = on; p.dashMs = v.dashMs; p.dashCooldownMs = v.dashCooldownMs; },
      hud: function (d) { return "health: " + d.player.hp + "/5   rolled through: " + Math.min(d.stats.dodged, 999) + " frames   hits: " + d.stats.hitsTaken; }
    },
    "aim-assist": {
      level: { width: 640, spawn: [60, 272], platforms: [G, [150, 220, 70, 14]] },
      params: { coyoteMs: 100, bufferMs: 100 },
      toggle: "Aim assist", sliders: [
        { key: "assistDeg", label: "Cone", min: 2, max: 30, step: 1, value: 10, unit: "\u00b0" },
        { key: "assistRange", label: "Range", min: 100, max: 600, step: 20, value: 420, unit: "px" }],
      apply: function (p, on, v) { p.assistOn = on; p.assistDeg = v.assistDeg; p.assistRange = v.assistRange; },
      reset: function (d) {
        d.shots = []; d.tHits = 0; d.fired = 0;
        d.targets = [[360, 190, 40, 0], [470, 250, 30, 1.7], [580, 160, 50, 3.1]].map(function (a) { return { x: a[0], by: a[1], amp: a[2], ph: a[3], y: a[1], dead: 0 }; });
      },
      onAttack: function (d) {
        var pl = d.player, p = d.p, x = pl.x + pl.w / 2, y = pl.y + 10, ang = pl.facing > 0 ? 0 : Math.PI, best = null;
        if (p.assistOn) d.targets.forEach(function (t) {
          if (t.dead > 0) return;
          var dx = t.x - x, dy = t.y - y, dist = Math.sqrt(dx * dx + dy * dy), a = Math.atan2(dy, dx), off = Math.abs(Math.atan2(Math.sin(a - ang), Math.cos(a - ang)));
          if (dist <= p.assistRange && off <= p.assistDeg * Math.PI / 180 && (!best || off < best.off)) best = { a: a, off: off };
        });
        if (best) ang = best.a;
        d.shots.push({ x: x, y: y, vx: Math.cos(ang) * 1000, vy: Math.sin(ang) * 1000 }); d.fired++;
      },
      update: function (d) {
        var t = d.t / 1000;
        d.targets.forEach(function (g) { g.y = g.by + g.amp * Math.sin(t * 1.1 + g.ph); if (g.dead > 0) g.dead -= STEP; });
        moveShots(d, d.shots);
        for (var i = d.shots.length - 1; i >= 0; i--) {
          var b = d.shots[i];
          for (var j = 0; j < d.targets.length; j++) { var g = d.targets[j]; if (g.dead <= 0 && (b.x - g.x) * (b.x - g.x) + (b.y - g.y) * (b.y - g.y) < 14 * 14) { g.dead = 500; d.tHits++; d.shots.splice(i, 1); break; } }
        }
      },
      draw: function (d, c) {
        var pl = d.player;
        if (d.p.assistOn) { var x = pl.x + pl.w / 2, y = pl.y + 10, a = d.p.assistDeg * Math.PI / 180, f = pl.facing, R = d.p.assistRange; c.fillStyle = "rgba(242,177,52,.08)"; c.beginPath(); c.moveTo(x, y); c.lineTo(x + f * R * Math.cos(a), y - R * Math.sin(a)); c.lineTo(x + f * R * Math.cos(a), y + R * Math.sin(a)); c.fill(); }
        d.targets.forEach(function (g) { if (g.dead > 0) return; c.fillStyle = "#8fa1b3"; c.beginPath(); c.arc(g.x, g.y, 10, 0, Math.PI * 2); c.fill(); });
        dot(c, d.shots, "#ffffff", 3);
      },
      snapshot: function (d) { return { hits: d.tHits, fired: d.fired }; },
      hud: function (d) { return "shots: " + d.fired + "   hits: " + d.tHits; }
    },
    "projectile-leading": {
      level: { width: 640, spawn: [40, 272], platforms: [G, [180, 220, 90, 14], [400, 220, 90, 14]] },
      params: { coyoteMs: 100, bufferMs: 100, iframesOn: true, iframeMs: 500 },
      toggle: "Leading", sliders: [
        { key: "shotSpeed", label: "Shot speed", min: 150, max: 700, step: 10, value: 320, unit: "px/s" },
        { key: "leadAmt", label: "Lead amount", min: 0.25, max: 1, step: 0.05, value: 1, unit: "x" }],
      apply: function (p, on, v) { p.leadOn = on; p.shotSpeed = v.shotSpeed; p.leadAmt = v.leadAmt; },
      reset: function (d) { d.shots = []; d.next = 500; d.fired = 0; d.tur = { x: 600, y: 60 }; },
      update: function (d) {
        var pl = d.player, p = d.p, T = d.tur;
        if (d.t >= d.next) {
          d.next = d.t + 1000;
          var tx = pl.x + pl.w / 2, ty = pl.y + pl.h / 2, t = 0;
          if (p.leadOn) for (var k = 0; k < 4; k++) { t = Math.hypot(tx + pl.vx * t * p.leadAmt - T.x, ty - T.y) / p.shotSpeed; }
          var ax = tx + (p.leadOn ? pl.vx * t * p.leadAmt : 0) - T.x, ay = ty - T.y, n = Math.hypot(ax, ay) || 1;
          d.shots.push({ x: T.x, y: T.y, vx: ax / n * p.shotSpeed, vy: ay / n * p.shotSpeed }); d.fired++;
        }
        moveShots(d, d.shots);
        for (var i = d.shots.length - 1; i >= 0; i--) if (circleHitsRect(d.shots[i].x, d.shots[i].y, 6, pl)) { d.shots.splice(i, 1); d.onHurt(); }
      },
      draw: function (d, c) { c.fillStyle = "#e5534b"; c.fillRect(d.tur.x - 12, d.tur.y - 12, 24, 24); dot(c, d.shots, "#e5534b", 6); },
      hud: function (d) { return "health: " + d.player.hp + "/5   shots: " + d.fired + "   hits taken: " + d.stats.hitsTaken; }
    },
    "attack-telegraph": {
      level: { width: 640, spawn: [120, 272], platforms: [G] },
      params: { coyoteMs: 100, bufferMs: 100, iframesOn: true, iframeMs: 400 },
      toggle: "Telegraph", sliders: [{ key: "teleMs", label: "Wind-up", min: 150, max: 1000, step: 50, value: 450, unit: "ms" }],
      apply: function (p, on, v) { p.teleOn = on; p.teleMs = v.teleMs; },
      reset: function (d) { d.seed = 12345; d.phase = "idle"; d.until = 900; d.waves = 0; },
      update: function (d) {
        if (d.t >= d.until) {
          if (d.phase === "idle") { if (d.p.teleOn) { d.phase = "windup"; d.until = d.t + d.p.teleMs; d.teleStart = d.t; } else { d.phase = "slam"; d.until = d.t + 220; d.waves++; } }
          else if (d.phase === "windup") { d.phase = "slam"; d.until = d.t + 220; d.waves++; }
          else { d.phase = "idle"; d.until = d.t + 700 + rng(d) * 1100; }
        }
        if (d.phase === "slam" && d.player.y + d.player.h > 288) d.onHurt();
      },
      draw: function (d, c) {
        var wind = d.phase === "windup", k = wind ? (d.t - d.teleStart) / d.p.teleMs : 0;
        c.fillStyle = wind ? "#e5534b" : "#8fa1b3"; c.fillRect(540, wind ? 250 + k * 10 : 250, 40, wind ? 50 - k * 10 : 50);
        if (wind) { c.fillStyle = "rgba(229,83,75," + (0.12 + 0.3 * k) + ")"; c.fillRect(0, 292, 640, 8); }
        if (d.phase === "slam") spikes(c, 0, 540, 284);
      },
      snapshot: function (d) { return { waves: d.waves }; },
      hud: function (d) { return "health: " + d.player.hp + "/5   slams: " + d.waves + "   hits taken: " + d.stats.hitsTaken; }
    },
    "forgiving-hitboxes": {
      level: { width: 640, spawn: [40, 272], platforms: [G] },
      params: { coyoteMs: 100, bufferMs: 100, iframesOn: true, iframeMs: 600 },
      toggle: "Forgiving hitboxes", sliders: [{ key: "forgivePx", label: "Shrink hazards by", min: 1, max: 10, step: 1, value: 5, unit: "px" }],
      apply: function (p, on, v) { p.forgive = on ? v.forgivePx : 0; },
      reset: function (d) { d.rows = [[200, 48], [380, 60], [540, 36]]; },
      update: function (d) {
        var pl = d.player, f = d.p.forgive, me = { x: pl.x + (f ? 2 : 0), y: pl.y + (f ? 2 : 0), w: pl.w - (f ? 4 : 0), h: pl.h - (f ? 2 : 0) };
        var top = Math.min(f * 2, 12); d.rows.forEach(function (r) { if (HIP.overlap(me, { x: r[0] + f, y: 284 + top, w: r[1] - 2 * f, h: 16 - top })) d.onHurt(); });
      },
      draw: function (d, c) {
        var f = d.p.forgive, top = Math.min(f * 2, 12); c.strokeStyle = "rgba(255,255,255,.35)";
        d.rows.forEach(function (r) { spikes(c, r[0], r[1], 284); c.strokeRect(r[0] + f + .5, 284 + top + .5, r[1] - 2 * f - 1, 16 - top - 1); });
      },
      hud: function (d) { return "health: " + d.player.hp + "/5   hits taken: " + d.stats.hitsTaken; }
    },
    "camera-deadzone": {
      level: { width: 1600, spawn: [780, 272], platforms: [[0, 300, 1600, 60], [500, 230, 80, 14], [760, 200, 80, 14], [1040, 230, 80, 14]] },
      params: { coyoteMs: 100, bufferMs: 100 },
      toggle: "Camera deadzone", sliders: [{ key: "camWin", label: "Window half-width", min: 20, max: 200, step: 10, value: 80, unit: "px" }],
      apply: function (p, on, v) { p.camDead = on; p.camWin = v.camWin; },
      hudDraw: function (d, c) { if (!d.p.camDead) return; c.strokeStyle = "rgba(242,177,52,.4)"; [320 - d.p.camWin, 320 + d.p.camWin].forEach(function (x) { c.beginPath(); c.moveTo(x + .5, 0); c.lineTo(x + .5, 360); c.stroke(); }); },
      hud: function (d) { return "camera moved: " + Math.round(d.stats.camTravelX) + " px"; }
    },
    "camera-platform-snap": {
      level: { width: 1280, height: 720, spawn: [100, 632], platforms: [[0, 660, 1280, 60], [260, 590, 120, 14], [440, 520, 120, 14], [620, 450, 120, 14], [800, 380, 120, 14], [980, 310, 120, 14], [1120, 240, 160, 14]] },
      params: { coyoteMs: 100, bufferMs: 100 },
      toggle: "Platform snapping", sliders: [{ key: "camSnapSpeed", label: "Snap speed", min: 1, max: 15, step: 1, value: 6, unit: "" }],
      apply: function (p, on, v) { p.vcam = on ? "snap" : "lock"; p.camSnapSpeed = v.camSnapSpeed; },
      hud: function (d) { return "camera moved up/down: " + Math.round(d.stats.camTravelY) + " px"; }
    },
    "camera-look-down": {
      level: { width: 640, height: 900, spawn: [200, 272], platforms: [[0, 300, 380, 16], [520, 300, 120, 16], [440, 560, 200, 16], [0, 700, 300, 16], [0, 860, 640, 40]], hazards: [[120, 690, 14, 120, 60, 260]] },
      params: { coyoteMs: 100, bufferMs: 100 },
      toggle: "Look down", sliders: [
        { key: "lookPx", label: "Look distance", min: 40, max: 200, step: 10, value: 120, unit: "px" },
        { key: "lookDelayMs", label: "Hold for", min: 0, max: 800, step: 50, value: 300, unit: "ms" }],
      apply: function (p, on, v) { p.lookOn = on; p.lookPx = v.lookPx; p.lookDelayMs = v.lookDelayMs; },
      snapshot: function (d) { return { lookY: d.cam.lookY }; },
      hud: function (d) { return "camera offset: " + Math.round(d.cam.lookY) + " px"; }
    },
    "hit-flash": {
      attack: true,
      level: { width: 640, spawn: [240, 272], dummy: [290, 260], platforms: [G] },
      params: { coyoteMs: 100, bufferMs: 100, attackBufferMs: 120 },
      toggle: "Hit flash", sliders: [{ key: "flashMs", label: "Flash for", min: 10, max: 250, step: 10, value: 70, unit: "ms" }],
      apply: function (p, on, v) { p.flashMs = on ? v.flashMs : 0; },
      hud: function (d) { return "hits: " + d.stats.hits + "   flashed frames: " + d.stats.flashFrames; }
    },
    "damage-numbers": {
      attack: true,
      level: { width: 640, spawn: [240, 272], dummy: [290, 260], platforms: [G] },
      params: { coyoteMs: 100, bufferMs: 100, attackBufferMs: 120 },
      toggle: "Damage numbers", sliders: [
        { key: "popLife", label: "Stay for", min: 200, max: 1500, step: 50, value: 700, unit: "ms" },
        { key: "popRise", label: "Rise speed", min: 20, max: 200, step: 10, value: 90, unit: "px/s" }],
      apply: function (p, on, v) { p.popOn = on; p.popLife = v.popLife; p.popRise = v.popRise; },
      reset: function (d) { d.pops = []; d.spawned = 0; d.total = 0; },
      onHit: function (d, t) {
        var crit = !d.player.grounded, n = crit ? 25 : 12; d.total += n;
        if (d.p.popOn) { d.pops.push({ x: t.x + t.w / 2 + (d.spawned % 3 - 1) * 8, y: t.y - 6, life: d.p.popLife, n: n, crit: crit }); d.spawned++; }
      },
      update: function (d) { for (var i = d.pops.length - 1; i >= 0; i--) { var q = d.pops[i]; q.y -= d.p.popRise * DT * (q.life / d.p.popLife + 0.2); q.life -= STEP; if (q.life <= 0) d.pops.splice(i, 1); } },
      draw: function (d, c) {
        c.textAlign = "center";
        d.pops.forEach(function (q) { c.globalAlpha = Math.min(1, q.life / 200); c.font = "700 " + (q.crit ? 20 : 15) + "px system-ui,sans-serif"; c.fillStyle = "#1a1d23"; c.fillText(q.n, q.x + 1, q.y + 1); c.fillStyle = q.crit ? "#f2b134" : "#ffffff"; c.fillText(q.n, q.x, q.y); });
        c.globalAlpha = 1; c.textAlign = "start";
      },
      snapshot: function (d) { return { spawned: d.spawned }; },
      hud: function (d) { return "hits: " + d.stats.hits + "   damage dealt: " + d.total + " (jump attacks deal more)"; }
    },
    "squash-stretch": {
      level: { width: 640, spawn: [60, 272], platforms: [G, [260, 190, 100, 14], [440, 120, 100, 14]] },
      params: { coyoteMs: 100, bufferMs: 100, jumpCut: 0.45 },
      toggle: "Squash and stretch", sliders: [
        { key: "squashAmt", label: "Amount", min: 0.1, max: 0.6, step: 0.05, value: 0.4, unit: "" },
        { key: "squashBack", label: "Recover speed", min: 0.5, max: 6, step: 0.25, value: 1.75, unit: "/s" }],
      apply: function (p, on, v) { p.squashOn = on; p.squashAmt = v.squashAmt; p.squashBack = v.squashBack; },
      hud: function (d) { return "scale: " + d.player.sx.toFixed(2) + " x " + d.player.sy.toFixed(2); }
    },
    "delayed-health-bar": {
      level: { width: 640, spawn: [40, 272], platforms: [G, [250, 210, 140, 16]], hazards: [[320, 285, 14, 110, 180, 470]] },
      params: { coyoteMs: 100, bufferMs: 100, iframesOn: true, iframeMs: 900 },
      toggle: "Delayed damage bar", sliders: [
        { key: "ghostDelayMs", label: "Hold for", min: 100, max: 1500, step: 50, value: 500, unit: "ms" },
        { key: "ghostRate", label: "Drain speed", min: 0.5, max: 6, step: 0.25, value: 2, unit: "hp/s" }],
      apply: function (p, on, v) { p.ghostOn = on; p.ghostDelayMs = v.ghostDelayMs; p.ghostRate = v.ghostRate; },
      reset: function (d) { d.ghost = 5; d.hurtT = -1e9; d.maxGap = 0; },
      onHurt: function (d) { d.hurtT = d.t; },
      update: function (d) {
        var hp = Math.max(0, d.player.hp);
        if (!d.p.ghostOn || hp > d.ghost) d.ghost = hp;
        else if (d.t - d.hurtT > d.p.ghostDelayMs) d.ghost = HIP.approach(d.ghost, hp, d.p.ghostRate * DT);
        d.maxGap = Math.max(d.maxGap, d.ghost - hp);
      },
      hudDraw: function (d, c) {
        var x = 12, y = 12, w = 160;
        c.fillStyle = "#2c313a"; c.fillRect(x, y, w, 12);
        c.fillStyle = "#f4f1ea"; c.fillRect(x, y, Math.round(w * d.ghost / 5), 12);
        c.fillStyle = "#e5534b"; c.fillRect(x, y, Math.round(w * Math.max(0, d.player.hp) / 5), 12);
      },
      snapshot: function (d) { return { maxGap: d.maxGap }; },
      hud: function (d) { return "health: " + d.player.hp + "/5   hits taken: " + d.stats.hitsTaken; }
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
    window.__hip = { cfg: cfg, vals: vals, isOn: function () { return on; } };

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
    function fmt(v, s) { var n = s.step < 1 ? v.toFixed(2).replace(/\.?0+$/, "") : String(Math.round(v)); return n + (s.unit ? " " + s.unit : ""); }
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
          if (mode === "frames") return String(Math.round(v * 60 / 1000));
          return s && s.step < 1 ? v.toFixed(2).replace(/\.?0+$/, "") : String(Math.round(v));
        });
        promptEl.textContent = text;
      }
    }
    tbtn.addEventListener("click", function (e) { on = !on; apply(); if (e.detail > 0) demo.canvas.focus(); });
    document.getElementById("reset").addEventListener("click", function (e) { demo.reset(); if (e.detail > 0) demo.canvas.focus(); });
    apply();
    var lastTxt = "";
    setInterval(function () { var t = cfg.hud(demo); if (t !== lastTxt) { statsEl.textContent = t; lastTxt = t; } }, 250);
    document.documentElement.setAttribute("data-demo-ready", "1");
  }
  window.HIP_MOUNT = mount;
})();
