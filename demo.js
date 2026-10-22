/* How It Plays: tiny dependency-free platformer used by every demo.
   Fixed 60 Hz step. Each entry page calls HIP.start(config). */
(function () {
  "use strict";
  var W = 640, H = 360, DT = 1 / 60, STEP_MS = 1000 / 60;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function approach(v, target, delta) { return v < target ? Math.min(v + delta, target) : Math.max(v - delta, target); }
  function overlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

  var BASE = {
    gravity: 1500, jumpVel: 480, maxFall: 720, maxSpeed: 200, accel: 2000, decel: 1600, airMul: 0.7,
    coyoteMs: 0, bufferMs: 0, jumpCut: 1, useAccel: true,
    camLook: 0, camSmooth: 0, camOn: false,
    attackActiveMs: 90, recoveryMs: 220, attackBufferMs: 0,
    iframeMs: 0, flickerMs: 80, iframesOn: false,
    hitstopMs: 0, shakeOn: false, shakeMax: 20, shakeDecay: 1.8, traumaAdd: 0.5,
    knockOn: false, knockForce: 340, knockFriction: 1400
  };

  function Demo(cfg) {
    this.cfg = cfg;
    this.canvas = document.getElementById(cfg.canvasId || "game");
    this.ctx = this.canvas.getContext("2d");
    this.p = Object.assign({}, BASE, cfg.params || {});
    this.keys = {};
    this.events = [];
    this.reset();
  }

  Demo.prototype.reset = function () {
    var L = this.cfg.level;
    this.t = 0;
    this.player = { x: L.spawn[0], y: L.spawn[1], w: 20, h: 28, vx: 0, vy: 0, grounded: false, facing: 1,
      lastGround: -1e9, jumpPress: -1e9, jumpHeld: false, jumping: false, jumpStartY: 0, minY: 0,
      hp: 5, invulnUntil: -1e9, atk: "idle", atkT: 0, atkQueued: false, atkHit: false, trail: [] };
    this.dummy = L.dummy ? { x: L.dummy[0], y: L.dummy[1], w: 26, h: 40, vx: 0, vy: 0, flash: 0, sx: L.dummy[0], sy: L.dummy[1] } : null;
    this.hazards = (L.hazards || []).map(function (h) { return { x: h[0], y: h[1], r: h[2], vx: h[3], minX: h[4], maxX: h[5] }; });
    this.cam = { x: 0, look: 0 };
    this.trauma = 0; this.shakeX = 0; this.shakeY = 0;
    this.hitstop = 0;
    this.stats = { jumps: 0, coyoteJumps: 0, bufferedJumps: 0, lastJumpHeight: 0, falls: 0, attacks: 0, bufferedAttacks: 0,
      dropped: 0, hits: 0, hitsTaken: 0, frozenFrames: 0, maxShake: 0, lastHitstopMs: 0, knockDist: 0 };
    this.events = [];
    this.keys = {};
  };

  // input events are queued and applied at the start of the next step
  Demo.prototype.press = function (k) { this.events.push(["down", k]); };
  Demo.prototype.release = function (k) { this.events.push(["up", k]); };

  Demo.prototype.handleEvents = function () {
    var pl = this.player;
    for (var i = 0; i < this.events.length; i++) {
      var ev = this.events[i], k = ev[1];
      if (ev[0] === "down") {
        if (this.keys[k]) continue;
        this.keys[k] = true;
        if (k === "jump") { pl.jumpPress = this.t; pl.jumpHeld = true; }
        if (k === "attack") this.onAttackPress();
      } else {
        this.keys[k] = false;
        if (k === "jump") {
          pl.jumpHeld = false;
          if (pl.vy < 0 && pl.jumping) { pl.vy *= this.p.jumpCut; pl.jumping = false; }
        }
      }
    }
    this.events.length = 0;
  };

  Demo.prototype.onAttackPress = function () {
    var pl = this.player, p = this.p;
    if (!this.cfg.attack) return;
    if (pl.atk === "idle") { this.startAttack(); return; }
    var remaining = pl.atk === "active" ? (p.attackActiveMs - pl.atkT) + p.recoveryMs : p.recoveryMs - pl.atkT;
    if (p.attackBufferMs > 0 && remaining <= p.attackBufferMs && !pl.atkQueued) pl.atkQueued = true;
    else this.stats.dropped++;
  };

  Demo.prototype.startAttack = function () {
    var pl = this.player;
    pl.atk = "active"; pl.atkT = 0; pl.atkHit = false; pl.atkQueued = false;
    this.stats.attacks++;
  };

  Demo.prototype.solids = function () { return this.cfg.level.platforms; };

  Demo.prototype.moveBody = function (b, dt) {
    var plats = this.solids(), i, s, landed = false;
    b.x += b.vx * dt;
    for (i = 0; i < plats.length; i++) {
      s = { x: plats[i][0], y: plats[i][1], w: plats[i][2], h: plats[i][3] };
      if (overlap(b, s)) { if (b.vx > 0) b.x = s.x - b.w; else if (b.vx < 0) b.x = s.x + s.w; b.vx = 0; }
    }
    b.y += b.vy * dt;
    for (i = 0; i < plats.length; i++) {
      s = { x: plats[i][0], y: plats[i][1], w: plats[i][2], h: plats[i][3] };
      if (overlap(b, s)) {
        if (b.vy > 0) { b.y = s.y - b.h; landed = true; } else if (b.vy < 0) { b.y = s.y + s.h; }
        b.vy = 0;
      }
    }
    var L = this.cfg.level;
    if (b.x < 0) { b.x = 0; b.vx = 0; }
    if (b.x + b.w > L.width) { b.x = L.width - b.w; b.vx = 0; }
    return landed;
  };

  Demo.prototype.step = function () {
    var p = this.p, pl = this.player, dt = DT;
    this.handleEvents();
    // screen shake decays in real time, even during hitstop
    this.trauma = Math.max(0, this.trauma - p.shakeDecay * dt);
    var amt = p.shakeOn ? p.shakeMax * this.trauma * this.trauma : 0;
    this.shakeX = amt * (Math.sin(this.t * 0.061) * 0.6 + Math.sin(this.t * 0.137 + 1.3) * 0.4);
    this.shakeY = amt * (Math.sin(this.t * 0.083 + 2.1) * 0.6 + Math.sin(this.t * 0.151) * 0.4);
    this.stats.maxShake = Math.max(this.stats.maxShake, Math.abs(this.shakeX), Math.abs(this.shakeY));
    if (this.dummy && this.dummy.flash > 0) this.dummy.flash -= STEP_MS;
    if (this.hitstop > 0) { this.hitstop -= STEP_MS; this.stats.frozenFrames++; this.t += STEP_MS; return; }

    // horizontal
    var dir = (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0);
    if (dir) pl.facing = dir;
    var target = dir * p.maxSpeed;
    if (p.useAccel) {
      var mul = pl.grounded ? 1 : p.airMul;
      var speeding = dir !== 0 && (pl.vx === 0 || Math.sign(pl.vx) === dir);
      pl.vx = approach(pl.vx, target, (speeding ? p.accel : p.decel) * mul * dt);
    } else pl.vx = target;

    // jump: buffer window and coyote window
    var sincePress = this.t - pl.jumpPress;
    var wantJump = sincePress <= Math.max(p.bufferMs, 0.5);
    var canJump = pl.grounded || (this.t - pl.lastGround) <= p.coyoteMs;
    if (wantJump && canJump) {
      if (!pl.grounded) this.stats.coyoteJumps++;
      if (sincePress > 0.5) this.stats.bufferedJumps++;
      pl.vy = -p.jumpVel; pl.grounded = false; pl.jumping = true;
      pl.jumpPress = -1e9; pl.lastGround = -1e9;
      pl.jumpStartY = pl.y; pl.minY = pl.y;
      this.stats.jumps++;
      // released already during a buffered press: apply the cut right away
      if (!pl.jumpHeld && p.jumpCut < 1) { pl.vy *= p.jumpCut; pl.jumping = false; }
    }

    pl.vy = Math.min(pl.vy + p.gravity * dt, p.maxFall);
    if (pl.vy >= 0) pl.jumping = false;
    var wasGrounded = pl.grounded;
    pl.grounded = this.moveBody(pl, dt);
    if (pl.grounded) {
      pl.lastGround = this.t;
      if (!wasGrounded && pl.jumpStartY) { this.stats.lastJumpHeight = Math.round(pl.jumpStartY - pl.minY); pl.jumpStartY = 0; }
    } else if (wasGrounded && !pl.jumping) {
      // walked off a ledge: lastGround stays at the last grounded step
    }
    pl.minY = Math.min(pl.minY, pl.y);
    if (this.t % 50 < STEP_MS) { pl.trail.push([pl.x + pl.w / 2, pl.y + pl.h]); if (pl.trail.length > 60) pl.trail.shift(); }
    if (pl.y > H + 80) { this.stats.falls++; this.respawn(); }

    // attack
    if (this.cfg.attack && pl.atk !== "idle") {
      pl.atkT += STEP_MS;
      if (pl.atk === "active") {
        if (this.dummy && !pl.atkHit && overlap(this.hitbox(), this.dummy)) this.onHit();
        if (pl.atkT >= p.attackActiveMs) { pl.atk = "recovery"; pl.atkT = 0; }
      } else if (pl.atkT >= p.recoveryMs) {
        pl.atk = "idle"; pl.atkT = 0;
        if (pl.atkQueued) { this.stats.bufferedAttacks++; this.startAttack(); }
      }
    }

    // dummy
    var d = this.dummy;
    if (d) {
      d.vy = Math.min(d.vy + p.gravity * dt, p.maxFall);
      var dg = this.moveBody(d, dt);
      if (dg) d.vx = approach(d.vx, 0, p.knockFriction * dt);
      this.stats.knockDist = Math.max(this.stats.knockDist, Math.round(Math.abs(d.x - d.sx)));
      if (d.y > H + 80) { d.x = d.sx; d.y = d.sy; d.vx = d.vy = 0; }
    }

    // hazards
    for (var i = 0; i < this.hazards.length; i++) {
      var hz = this.hazards[i];
      hz.x += hz.vx * dt;
      if (hz.x < hz.minX || hz.x > hz.maxX) { hz.vx = -hz.vx; hz.x = Math.max(hz.minX, Math.min(hz.maxX, hz.x)); }
      var cx = Math.max(pl.x, Math.min(hz.x, pl.x + pl.w)), cy = Math.max(pl.y, Math.min(hz.y, pl.y + pl.h));
      if ((cx - hz.x) * (cx - hz.x) + (cy - hz.y) * (cy - hz.y) < hz.r * hz.r) this.onHurt(hz);
    }

    // camera
    var L = this.cfg.level, maxCam = Math.max(0, L.width - W);
    if (p.camOn) {
      this.cam.look += (pl.facing * p.camLook - this.cam.look) * (1 - Math.exp(-3 * dt));
      var tx = pl.x + pl.w / 2 - W / 2 + this.cam.look;
      this.cam.x += (tx - this.cam.x) * (1 - Math.exp(-p.camSmooth * dt));
    } else this.cam.x = pl.x + pl.w / 2 - W / 2;
    this.cam.x = Math.max(0, Math.min(maxCam, this.cam.x));
    this.t += STEP_MS;
  };

  Demo.prototype.hitbox = function () {
    var pl = this.player;
    return { x: pl.facing > 0 ? pl.x + pl.w : pl.x - 36, y: pl.y + 2, w: 36, h: 22 };
  };

  Demo.prototype.onHit = function () {
    var p = this.p, d = this.dummy, pl = this.player;
    pl.atkHit = true; this.stats.hits++; d.flash = 120;
    if (p.hitstopMs > 0) { this.hitstop = Math.max(this.hitstop, p.hitstopMs); this.stats.lastHitstopMs = p.hitstopMs; }
    if (p.shakeOn) this.trauma = Math.min(1, this.trauma + p.traumaAdd);
    if (p.knockOn) { d.vx = pl.facing * p.knockForce; d.vy = -p.knockForce * 0.45; }
  };

  Demo.prototype.onHurt = function (hz) {
    var pl = this.player, p = this.p;
    if (p.iframesOn && this.t < pl.invulnUntil) return;
    pl.hp -= 1; this.stats.hitsTaken++;
    if (p.iframesOn) pl.invulnUntil = this.t + p.iframeMs;
    if (pl.hp <= 0) { this.respawn(); }
  };

  Demo.prototype.respawn = function () {
    var L = this.cfg.level, pl = this.player;
    pl.x = L.spawn[0]; pl.y = L.spawn[1]; pl.vx = pl.vy = 0; pl.hp = 5; pl.invulnUntil = -1e9; pl.trail = [];
    pl.jumping = false; pl.jumpStartY = 0;
  };

  // ---------- drawing ----------
  Demo.prototype.draw = function () {
    var c = this.ctx, pl = this.player, p = this.p, ox = Math.round(-this.cam.x + this.shakeX), oy = Math.round(this.shakeY);
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = "#1a1d23"; c.fillRect(0, 0, W, H);
    c.save(); c.translate(ox, oy);
    // grid every 80 px so camera motion is visible
    c.strokeStyle = "#232731"; c.lineWidth = 1;
    for (var gx = 0; gx <= this.cfg.level.width; gx += 80) { c.beginPath(); c.moveTo(gx + .5, -40); c.lineTo(gx + .5, H + 40); c.stroke(); }
    var plats = this.solids();
    c.fillStyle = "#3b4252";
    plats.forEach(function (s) { c.fillRect(s[0], s[1], s[2], s[3]); });
    c.fillStyle = "#56607a";
    plats.forEach(function (s) { c.fillRect(s[0], s[1], s[2], 3); });
    if (this.cfg.trail) {
      c.fillStyle = "rgba(242,177,52,.45)";
      pl.trail.forEach(function (t) { c.fillRect(t[0] - 1.5, t[1] - 1.5, 3, 3); });
    }
    this.hazards.forEach(function (hz) { c.fillStyle = "#e5534b"; c.beginPath(); c.arc(hz.x, hz.y, hz.r, 0, Math.PI * 2); c.fill(); });
    var d = this.dummy;
    if (d) { c.fillStyle = d.flash > 0 ? "#ffffff" : "#8fa1b3"; c.fillRect(Math.round(d.x), Math.round(d.y), d.w, d.h); c.fillStyle = "#1a1d23"; c.fillRect(Math.round(d.x) + 6, Math.round(d.y) + 10, 4, 4); c.fillRect(Math.round(d.x) + 16, Math.round(d.y) + 10, 4, 4); }
    var invuln = p.iframesOn && this.t < pl.invulnUntil;
    var visible = !invuln || Math.floor(this.t / p.flickerMs) % 2 === 0;
    if (visible) {
      c.fillStyle = invuln ? "#ffd27a" : "#f2b134";
      c.fillRect(Math.round(pl.x), Math.round(pl.y), pl.w, pl.h);
      c.fillStyle = "#1a1d23";
      var ex = pl.facing > 0 ? pl.x + 12 : pl.x + 4;
      c.fillRect(Math.round(ex), Math.round(pl.y) + 7, 4, 5);
    }
    if (this.cfg.attack && pl.atk === "active") { var hb = this.hitbox(); c.fillStyle = "rgba(255,255,255,.75)"; c.fillRect(hb.x, hb.y, hb.w, hb.h); }
    if (this.cfg.attack && pl.atk === "recovery") { var hb2 = this.hitbox(); c.strokeStyle = "rgba(255,255,255,.25)"; c.strokeRect(hb2.x + .5, hb2.y + .5, hb2.w - 1, hb2.h - 1); }
    if (pl.atkQueued) { c.fillStyle = "#7ee2a8"; c.fillRect(Math.round(pl.x) + 6, Math.round(pl.y) - 9, 8, 5); }
    c.restore();
    // HUD (not affected by shake or camera)
    if (this.cfg.camGuide && p.camOn) { c.strokeStyle = "rgba(242,177,52,.35)"; c.beginPath(); c.moveTo(W / 2 + .5, 0); c.lineTo(W / 2 + .5, H); c.stroke(); }
  };

  // ---------- running ----------
  var KEYMAP = { ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right", Space: "jump", ArrowUp: "jump", KeyW: "jump", KeyZ: "jump", KeyX: "attack", KeyJ: "attack" };

  function start(cfg) {
    var demo = new Demo(cfg);
    var canvas = demo.canvas;
    canvas.width = W; canvas.height = H;
    var acc = 0, last = performance.now(), simulating = false;

    function isField(t) { return t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable); }
    window.addEventListener("keydown", function (ev) {
      var k = KEYMAP[ev.code]; if (!k || isField(ev.target)) return;
      if (ev.target && ev.target.tagName === "BUTTON" && (ev.code === "Space" || ev.code === "Enter")) return;
      ev.preventDefault(); if (!ev.repeat) demo.press(k);
    });
    window.addEventListener("keyup", function (ev) { var k = KEYMAP[ev.code]; if (!k) return; demo.release(k); });
    window.addEventListener("blur", function () { ["left", "right", "jump", "attack"].forEach(function (k) { demo.release(k); }); });

    document.querySelectorAll("[data-touch]").forEach(function (b) {
      var k = b.getAttribute("data-touch");
      b.addEventListener("pointerdown", function (e) { e.preventDefault(); b.setPointerCapture && b.setPointerCapture(e.pointerId); demo.press(k); });
      ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (n) { b.addEventListener(n, function () { demo.release(k); }); });
    });

    function frame(now) {
      var delta = Math.min(100, now - last); last = now;
      if (!simulating) {
        acc += delta;
        while (acc >= STEP_MS) { demo.step(); acc -= STEP_MS; }
        demo.draw();
        if (cfg.onFrame) cfg.onFrame(demo);
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    // test hook: run a scripted session off-screen and report stats, then restore a fresh state
    demo.simulate = function (driver, frames) {
      simulating = true; demo.reset();
      var held = {}, snap = [];
      for (var f = 0; f < frames; f++) {
        var want = driver(demo, f) || {};
        ["left", "right", "jump", "attack"].forEach(function (k) {
          if (want[k] && !held[k]) demo.press(k);
          if (!want[k] && held[k]) demo.release(k);
          held[k] = !!want[k];
        });
        demo.step();
      }
      var out = { stats: Object.assign({}, demo.stats), player: { x: demo.player.x, y: demo.player.y, vx: demo.player.vx, hp: demo.player.hp, grounded: demo.player.grounded },
        cam: demo.cam.x, dummy: demo.dummy ? { x: demo.dummy.x, sx: demo.dummy.sx } : null, t: demo.t };
      demo.reset(); acc = 0; last = performance.now(); simulating = false;
      return out;
    };
    window.__demo = demo;
    return demo;
  }

  window.HIP = { start: start, W: W, H: H, reduceMotion: reduceMotion };
})();
