/* How It Plays: tiny dependency-free platformer used by every demo.
   Fixed 60 Hz step. Each entry page calls HIP.start(config).
   Optional config hooks (entries.js): reset, update, draw, hudDraw, onAttack, onHit, onHurt. */
(function () {
  "use strict";
  var W = 640, H = 360, DT = 1 / 60, STEP_MS = 1000 / 60;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var KEYS = ["left", "right", "jump", "attack", "down", "dash"];

  function approach(v, target, delta) { return v < target ? Math.min(v + delta, target) : Math.max(v - delta, target); }
  function overlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
  function R(a) { return { x: a[0], y: a[1], w: a[2], h: a[3] }; }

  var BASE = {
    gravity: 1500, jumpVel: 480, maxFall: 720, maxSpeed: 200, accel: 2000, decel: 1600, airMul: 0.7,
    coyoteMs: 0, bufferMs: 0, jumpCut: 1, useAccel: true,
    camLook: 0, camSmooth: 0, camOn: false,
    attackActiveMs: 90, recoveryMs: 220, attackBufferMs: 0, startupMs: 0, cancelMs: 0,
    iframeMs: 0, flickerMs: 80, iframesOn: false, flashMs: 120,
    hitstopMs: 0, shakeOn: false, shakeMax: 20, shakeDecay: 1.8, traumaAdd: 0.5,
    knockOn: false, knockForce: 340, knockFriction: 1400,
    // jumping extras
    apexOn: false, apexThresh: 80, apexMul: 0.5, fallMul: 1, airJumps: 0, airJumpMul: 0.85,
    cornerPx: 0, oneWayOn: true, landLagMs: 0, landLagVy: 600, squashOn: false, squashAmt: 0.4, squashBack: 1.75,
    // movement extras
    turnAccel: 0, wallSlideMax: 0, wallJump: false, wallJumpH: 260, wallLockMs: 0,
    dashOn: false, dashSpeed: 480, dashMs: 150, dashCooldownMs: 0, dashInvuln: false,
    wallSlideMs: 1200, ledgeOn: false, ledgeReach: 10, dropMs: 200, slopeSnap: 0, carryOn: true, inheritOn: true,
    stickOn: false, stickDrift: 0.12, deadzone: 0,
    // camera extras
    camDead: false, camWin: 0, vcam: "lock", camSnapSpeed: 6, lookOn: false, lookPx: 0, lookDelayMs: 300
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
    L.height = L.height || H;
    this.t = 0;
    this.player = { x: L.spawn[0], y: L.spawn[1], w: 20, h: 28, vx: 0, vy: 0, grounded: false, facing: 1,
      lastGround: -1e9, jumpPress: -1e9, jumpHeld: false, jumping: false, jumpStartY: 0, minY: L.spawn[1],
      hp: 5, invulnUntil: -1e9, atk: "idle", atkT: 0, atkQueued: false, atkHit: false, trail: [],
      airJumpsLeft: 0, forceUntil: -1e9, forceDir: 0, dashPress: -1e9, dashUntil: -1e9, dashReady: 0, dashDir: 1,
      hang: 0, noGrabUntil: 0, lagUntil: -1e9, dropUntil: -1e9, sx: 1, sy: 1, stick: 0, stickVal: 0, lookT: 0, ride: null, walled: 0, wallT: 0, stickRaw: 0 };
    this.dummy = L.dummy ? { x: L.dummy[0], y: L.dummy[1], w: 26, h: 40, vx: 0, vy: 0, flash: 0, sx: L.dummy[0], sy: L.dummy[1] } : null;
    this.hazards = (L.hazards || []).map(function (h) { return { x: h[0], y: h[1], r: h[2], vx: h[3], minX: h[4], maxX: h[5] }; });
    this.movers = (L.movers || []).map(function (m) { return { x0: m[0], x: m[0], y: m[1], w: m[2], h: m[3], range: m[4], period: m[5], dx: 0, vx: 0 }; });
    this.cam = { x: Math.max(0, Math.min(Math.max(0, L.width - W), L.spawn[0] + 10 - W / 2)), look: 0, y: Math.max(0, Math.min(L.height - H, L.spawn[1] + 14 - H / 2)), snapY: null, lookY: 0 };
    this.trauma = 0; this.shakeX = 0; this.shakeY = 0;
    this.hitstop = 0;
    this.stats = { jumps: 0, coyoteJumps: 0, bufferedJumps: 0, lastJumpHeight: 0, falls: 0, attacks: 0, bufferedAttacks: 0,
      dropped: 0, hits: 0, hitsTaken: 0, frozenFrames: 0, maxShake: 0, lastHitstopMs: 0, knockDist: 0,
      presses: 0, airJumps: 0, wallJumps: 0, dashes: 0, dodged: 0, ledgeGrabs: 0, corrections: 0, drops: 0, airFrames: 0,
      lagFrames: 0, maxVy: 0, airTime: 0, lastAirTime: 0, camTravelX: 0, camTravelY: 0, maxSquash: 0, flashFrames: 0,
      cancels: 0, firstHitFrame: -1, wallFrames: 0, minY: 1e9, dashPresses: 0, ledgeClimbs: 0 };
    this.events = [];
    this.keys = {};
    this.solidList = null;
    if (this.cfg.reset) this.cfg.reset(this);
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
        this.keys[k] = true; this.stats.presses++;
        if (k === "jump") { pl.jumpPress = this.t; pl.jumpHeld = true; }
        if (k === "attack") this.onAttackPress();
        if (k === "dash") { pl.dashPress = this.t; this.stats.dashPresses++; }
        if (k === "down" && pl.hang) { pl.hang = 0; pl.noGrabUntil = this.t + 300; }
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
    if (this.cfg.onAttack) { this.stats.attacks++; this.cfg.onAttack(this); return; }
    if (!this.cfg.attack) return;
    if (pl.atk === "idle") { this.startAttack(); return; }
    if (pl.atk === "recovery" && p.cancelMs > 0 && pl.atkHit && pl.atkT <= p.cancelMs) { this.stats.cancels++; this.startAttack(); return; }
    var remaining = pl.atk === "startup" ? (p.startupMs - pl.atkT) + p.attackActiveMs + p.recoveryMs :
      pl.atk === "active" ? (p.attackActiveMs - pl.atkT) + p.recoveryMs : p.recoveryMs - pl.atkT;
    if (p.attackBufferMs > 0 && remaining <= p.attackBufferMs && !pl.atkQueued) pl.atkQueued = true;
    else this.stats.dropped++;
  };

  Demo.prototype.startAttack = function () {
    var pl = this.player;
    pl.atk = this.p.startupMs > 0 ? "startup" : "active"; pl.atkT = 0; pl.atkHit = false; pl.atkQueued = false;
    pl.atkPressT = this.t;
    this.stats.attacks++;
  };

  Demo.prototype.solids = function () { return this.solidList || this.cfg.level.platforms; };

  Demo.prototype.hitsSolid = function (b) {
    var s = this.solids();
    for (var i = 0; i < s.length; i++) if (overlap(b, R(s[i]))) return true;
    return false;
  };

  // is there a solid wall 1..dist px to the side (dir -1 or 1)?
  Demo.prototype.touching = function (dir, dist) {
    var pl = this.player;
    return this.hitsSolid({ x: pl.x + dir * (dist || 1), y: pl.y + 2, w: pl.w, h: pl.h - 4 });
  };

  Demo.prototype.moveBody = function (b, dt, isPlayer, wasGrounded) {
    var plats = this.solids(), i, s, landed = false, L = this.cfg.level, p = this.p, self = this;
    var oneway = L.oneway || [];
    if (!p.oneWayOn) plats = plats.concat(oneway);
    b.x += b.vx * dt;
    for (i = 0; i < plats.length; i++) {
      s = R(plats[i]);
      if (overlap(b, s)) {
        if (isPlayer && L.stepUp && b.vy >= 0 && b.y + b.h - s.y <= 8) { b.y = s.y - b.h; continue; }
        if (b.vx > 0) b.x = s.x - b.w; else if (b.vx < 0) b.x = s.x + s.w; b.vx = 0;
      }
    }
    var prevBottom = b.y + b.h;
    b.y += b.vy * dt;
    for (i = 0; i < plats.length; i++) {
      s = R(plats[i]);
      if (overlap(b, s)) {
        if (isPlayer && b.vy < 0 && p.cornerPx > 0) {
          var moved = false;
          for (var n = 1; n <= p.cornerPx && !moved; n++) {
            [b.vx <= 0 ? -n : 0, b.vx >= 0 ? n : 0].forEach(function (dx) {
              if (moved || !dx) return;
              if (!self.hitsSolid({ x: b.x + dx, y: b.y, w: b.w, h: b.h })) { b.x += dx; moved = true; }
            });
          }
          if (moved) { this.stats.corrections++; continue; }
        }
        if (b.vy > 0) { b.y = s.y - b.h; landed = true; } else if (b.vy < 0) { b.y = s.y + s.h; }
        b.vy = 0;
      }
    }
    if (p.oneWayOn && b.vy >= 0 && !(isPlayer && this.t < this.player.dropUntil)) {
      for (i = 0; i < oneway.length; i++) {
        s = R(oneway[i]);
        if (prevBottom <= s.y + 0.01 && overlap(b, s)) { b.y = s.y - b.h; b.vy = 0; landed = true; }
      }
    }
    if (isPlayer && L.ramps) {
      var cx = b.x + b.w / 2;
      for (i = 0; i < L.ramps.length; i++) {
        var r = L.ramps[i];
        if (cx < r[0] || cx > r[2]) continue;
        var sy = r[1] + (r[3] - r[1]) * (cx - r[0]) / (r[2] - r[0]), foot = b.y + b.h;
        var snap = p.slopeSnap > 0 && wasGrounded && sy - foot > 0 && sy - foot <= p.slopeSnap;
        if (b.vy >= 0 && ((foot >= sy - 0.01 && foot - sy < 24) || snap)) { b.y = sy - b.h; b.vy = 0; landed = true; }
      }
    }
    if (b.x < 0) { b.x = 0; b.vx = 0; }
    if (b.x + b.w > L.width) { b.x = L.width - b.w; b.vx = 0; }
    return landed;
  };

  Demo.prototype.doJump = function (vy) {
    var pl = this.player, p = this.p;
    pl.vy = -vy; pl.grounded = false; pl.jumping = true; pl.wallT = 0;
    pl.jumpPress = -1e9; pl.lastGround = -1e9;
    pl.jumpStartY = pl.y; pl.minY = pl.y;
    this.stats.jumps++;
    if (p.squashOn) { pl.sx = 1 - p.squashAmt * 0.75; pl.sy = 1 + p.squashAmt; }
    if (pl.ride && p.carryOn && p.inheritOn) pl.vx += pl.ride.vx;
    if (!pl.jumpHeld && p.jumpCut < 1) { pl.vy *= p.jumpCut; pl.jumping = false; }
  };

  Demo.prototype.step = function () {
    var p = this.p, pl = this.player, dt = DT, L = this.cfg.level, i;
    this.handleEvents();
    // screen shake decays in real time, even during hitstop
    this.trauma = Math.max(0, this.trauma - p.shakeDecay * dt);
    var amt = p.shakeOn ? p.shakeMax * this.trauma * this.trauma : 0;
    this.shakeX = amt * (Math.sin(this.t * 0.061) * 0.6 + Math.sin(this.t * 0.137 + 1.3) * 0.4);
    this.shakeY = amt * (Math.sin(this.t * 0.083 + 2.1) * 0.6 + Math.sin(this.t * 0.151) * 0.4);
    this.stats.maxShake = Math.max(this.stats.maxShake, Math.abs(this.shakeX), Math.abs(this.shakeY));
    if (this.dummy && this.dummy.flash > 0) { this.dummy.flash -= STEP_MS; this.stats.flashFrames++; }
    if (this.hitstop > 0) { this.hitstop -= STEP_MS; this.stats.frozenFrames++; this.t += STEP_MS; return; }

    // moving platforms step first, then carry their riders
    if (this.movers.length) {
      var ms = this.movers, list = L.platforms.slice();
      pl.ride = null;
      for (i = 0; i < ms.length; i++) {
        var m = ms[i], nx = m.x0 + m.range * (0.5 - 0.5 * Math.cos(2 * Math.PI * this.t / 1000 / m.period));
        m.dx = nx - m.x; m.vx = m.dx / dt;
        if (pl.grounded && Math.abs(pl.y + pl.h - m.y) < 0.5 && pl.x < m.x + m.w && pl.x + pl.w > m.x) pl.ride = m;
        m.x = nx; list.push([m.x, m.y, m.w, m.h]);
      }
      this.solidList = list;
      if (pl.ride && p.carryOn) pl.x += pl.ride.dx;
    }

    // horizontal input: keys, or a simulated analog stick
    var dir = (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0), amount = dir;
    if (p.stickOn) {
      pl.stick = approach(pl.stick, dir, 5 * dt);
      var v = Math.max(-1, Math.min(1, pl.stick + p.stickDrift + 0.03 * Math.sin(this.t * 0.004))); pl.stickRaw = v;
      if (p.deadzone > 0) v = Math.abs(v) < p.deadzone ? 0 : Math.sign(v) * (Math.abs(v) - p.deadzone) / (1 - p.deadzone);
      pl.stickVal = v; amount = v; dir = v > 0 ? 1 : v < 0 ? -1 : 0;
    }
    if (this.t < pl.forceUntil) { dir = pl.forceDir; amount = dir; }
    var lagging = this.t < pl.lagUntil;
    if (lagging) { dir = 0; amount = 0; this.stats.lagFrames++; }
    if (pl.hang) { dir = 0; amount = 0; }
    if (dir) pl.facing = dir;
    var target = amount * p.maxSpeed;

    // dash / roll
    if (p.dashOn && this.t - pl.dashPress <= 0.5 && this.t >= pl.dashReady && !pl.hang) {
      pl.dashDir = dir || pl.facing; pl.dashUntil = this.t + p.dashMs;
      pl.dashReady = this.t + p.dashMs + p.dashCooldownMs; pl.dashPress = -1e9; this.stats.dashes++;
    }
    var dashing = this.t < pl.dashUntil;
    if (dashing) { pl.vx = pl.dashDir * p.dashSpeed; pl.vy = 0; pl.wasDashing = true; }
    else {
      if (pl.wasDashing) { pl.vx = pl.dashDir * p.maxSpeed; pl.wasDashing = false; }
      if (pl.hang) pl.vx = 0;
      else if (p.useAccel) {
        var mul = pl.grounded ? 1 : p.airMul;
        var speeding = dir !== 0 && (pl.vx === 0 || Math.sign(pl.vx) === dir);
        var turning = dir !== 0 && pl.vx !== 0 && Math.sign(pl.vx) !== dir;
        var rate = speeding ? p.accel : (turning && p.turnAccel > 0 ? p.turnAccel : p.decel);
        pl.vx = approach(pl.vx, target, rate * mul * dt);
      } else pl.vx = target;
    }

    // jump: buffer window and coyote window, then ledge climb, drop-through, wall jump, air jump
    var sincePress = this.t - pl.jumpPress, fresh = sincePress <= 0.5;
    var wantJump = sincePress <= Math.max(p.bufferMs, 0.5);
    var canJump = !lagging && (pl.grounded || (this.t - pl.lastGround) <= p.coyoteMs);
    var onOneWay = pl.grounded && (L.oneway || []).some(function (o) { return Math.abs(pl.y + pl.h - o[1]) < 0.5 && pl.x < o[0] + o[2] && pl.x + pl.w > o[0]; });
    if (pl.hang && fresh) { pl.hang = 0; this.doJump(p.jumpVel); this.stats.ledgeClimbs++; }
    else if (fresh && this.keys.down && onOneWay && p.oneWayOn) { pl.dropUntil = this.t + p.dropMs; pl.jumpPress = -1e9; pl.grounded = false; this.stats.drops++; }
    else if (wantJump && canJump && !dashing) {
      if (!pl.grounded) this.stats.coyoteJumps++;
      if (sincePress > 0.5) this.stats.bufferedJumps++;
      this.doJump(p.jumpVel);
    } else if (fresh && !pl.grounded && !dashing) {
      var side = p.wallJump ? (this.touching(1, 3) ? 1 : this.touching(-1, 3) ? -1 : 0) : 0;
      if (side) {
        this.doJump(p.jumpVel); pl.vx = -side * p.wallJumpH; pl.facing = -side;
        pl.forceDir = -side; pl.forceUntil = this.t + p.wallLockMs; this.stats.wallJumps++;
      } else if (pl.airJumpsLeft > 0) { pl.airJumpsLeft--; this.doJump(p.jumpVel * p.airJumpMul); this.stats.airJumps++; }
    }

    // gravity with optional apex hang, fall multiplier and wall slide cap
    pl.walled = 0;
    if (!dashing && !pl.hang) {
      var g = p.gravity, maxF = p.maxFall;
      if (p.apexOn && pl.jumpHeld && Math.abs(pl.vy) < p.apexThresh && !pl.grounded) g *= p.apexMul;
      if (pl.vy > 0) g *= p.fallMul;
      if (p.wallSlideMax > 0 && !pl.grounded && pl.vy >= 0 && dir && this.touching(dir)) {
        maxF = Math.min(maxF, p.wallSlideMax + (p.maxFall - p.wallSlideMax) * Math.min(1, pl.wallT / p.wallSlideMs));
        pl.wallT += STEP_MS; pl.walled = dir; this.stats.wallFrames++;
      }
      pl.vy = Math.min(pl.vy + g * dt, maxF);
    }
    if (pl.vy >= 0) pl.jumping = false;
    var wasGrounded = pl.grounded, impact = pl.vy;
    if (!pl.hang) pl.grounded = this.moveBody(pl, dt, true, wasGrounded);
    if (pl.grounded) {
      pl.lastGround = this.t; pl.airJumpsLeft = p.airJumps; pl.wallT = 0;
      if (!wasGrounded) {
        if (pl.jumpStartY) { this.stats.lastJumpHeight = Math.round(pl.jumpStartY - pl.minY); pl.jumpStartY = 0; }
        this.stats.lastAirTime = this.stats.airTime; this.stats.airTime = 0;
        if (p.squashOn) { var sq = Math.min(impact / p.maxFall, 1) * p.squashAmt * 1.5; pl.sx = 1 + sq; pl.sy = 1 - sq * 0.75; }
        if (p.landLagMs > 0 && impact >= p.landLagVy) pl.lagUntil = this.t + p.landLagMs;
      }
    } else if (!pl.hang) { this.stats.airFrames++; this.stats.airTime++; }
    this.stats.maxVy = Math.max(this.stats.maxVy, pl.vy);

    // ledge grab: falling, pushing into a wall, head level with its top corner
    if (p.ledgeOn && !pl.grounded && !pl.hang && pl.vy > 0 && dir && this.t > pl.noGrabUntil) {
      var sl = this.solids();
      for (i = 0; i < sl.length; i++) {
        var s = sl[i], edgeX = dir > 0 ? s[0] : s[0] + s[2], side2 = dir > 0 ? pl.x + pl.w : pl.x;
        if (Math.abs(side2 - edgeX) < 1.5 && pl.y >= s[1] - p.ledgeReach && pl.y <= s[1] + 8) {
          pl.hang = dir; pl.y = s[1] - 4; pl.vy = 0; pl.vx = 0; this.stats.ledgeGrabs++; break;
        }
      }
    }

    // squash and stretch ease back to 1
    pl.sx = approach(pl.sx, 1, p.squashBack * dt); pl.sy = approach(pl.sy, 1, p.squashBack * dt);
    this.stats.maxSquash = Math.max(this.stats.maxSquash, Math.abs(pl.sx - 1), Math.abs(pl.sy - 1));

    pl.minY = Math.min(pl.minY, pl.y); this.stats.minY = Math.min(this.stats.minY, pl.y);
    if (this.t % 50 < STEP_MS) { pl.trail.push([pl.x + pl.w / 2, pl.y + pl.h]); if (pl.trail.length > 60) pl.trail.shift(); }
    if (this.cfg.wrapY && pl.y > L.height) { pl.y -= L.height; pl.trail = []; }
    if (pl.y > L.height + 80) { this.stats.falls++; this.respawn(); }

    // attack: startup, active, recovery
    if (this.cfg.attack && pl.atk !== "idle") {
      pl.atkT += STEP_MS;
      if (pl.atk === "startup") {
        if (pl.atkT >= p.startupMs) { pl.atk = "active"; pl.atkT = 0; }
      } else if (pl.atk === "active") {
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
      if (d.y > L.height + 80) { d.x = d.sx; d.y = d.sy; d.vx = d.vy = 0; }
    }

    // hazards
    for (i = 0; i < this.hazards.length; i++) {
      var hz = this.hazards[i];
      hz.x += hz.vx * dt;
      if (hz.x < hz.minX || hz.x > hz.maxX) { hz.vx = -hz.vx; hz.x = Math.max(hz.minX, Math.min(hz.maxX, hz.x)); }
      var cx = Math.max(pl.x, Math.min(hz.x, pl.x + pl.w)), cy = Math.max(pl.y, Math.min(hz.y, pl.y + pl.h));
      if ((cx - hz.x) * (cx - hz.x) + (cy - hz.y) * (cy - hz.y) < hz.r * hz.r) this.onHurt(hz);
    }
    if (this.cfg.update) this.cfg.update(this);

    // camera: horizontal follow (lock, lookahead or deadzone window), then vertical
    var maxCam = Math.max(0, L.width - W), ox = this.cam.x, oy = this.cam.y, pc = pl.x + pl.w / 2;
    if (p.camDead) {
      var mid = this.cam.x + W / 2;
      if (pc > mid + p.camWin) this.cam.x += pc - (mid + p.camWin);
      else if (pc < mid - p.camWin) this.cam.x -= (mid - p.camWin) - pc;
    } else if (p.camOn) {
      this.cam.look += (pl.facing * p.camLook - this.cam.look) * (1 - Math.exp(-3 * dt));
      var tx = pc - W / 2 + this.cam.look;
      this.cam.x += (tx - this.cam.x) * (1 - Math.exp(-p.camSmooth * dt));
    } else this.cam.x = pc - W / 2;
    this.cam.x = Math.max(0, Math.min(maxCam, this.cam.x));
    if (L.height > H) {
      var base;
      if (p.vcam === "snap") {
        if (pl.grounded || this.cam.snapY === null) this.cam.snapY = pl.y + pl.h - H * 0.62;
        if (pl.y < this.cam.snapY + 40) this.cam.snapY = pl.y - 40;
        if (pl.y + pl.h > this.cam.snapY + H - 40) this.cam.snapY = pl.y + pl.h - H + 40;
        base = this.cam.y - this.cam.lookY + (this.cam.snapY - (this.cam.y - this.cam.lookY)) * (1 - Math.exp(-p.camSnapSpeed * dt));
      } else base = pl.y + pl.h / 2 - H / 2;
      var looking = p.lookOn && pl.grounded && this.keys.down && Math.abs(pl.vx) < 5;
      pl.lookT = looking ? pl.lookT + STEP_MS : 0;
      this.cam.lookY += ((pl.lookT >= p.lookDelayMs ? p.lookPx : 0) - this.cam.lookY) * (1 - Math.exp(-6 * dt));
      this.cam.y = Math.max(0, Math.min(L.height - H, base + this.cam.lookY));
    }
    this.stats.camTravelX += Math.abs(this.cam.x - ox); this.stats.camTravelY += Math.abs(this.cam.y - oy);
    this.t += STEP_MS;
  };

  Demo.prototype.hitbox = function () {
    var pl = this.player;
    return { x: pl.facing > 0 ? pl.x + pl.w : pl.x - 36, y: pl.y + 2, w: 36, h: 22 };
  };

  Demo.prototype.onHit = function () {
    var p = this.p, d = this.dummy, pl = this.player;
    pl.atkHit = true; this.stats.hits++; d.flash = p.flashMs;
    if (this.stats.firstHitFrame < 0) this.stats.firstHitFrame = Math.round((this.t - pl.atkPressT) / STEP_MS);
    if (p.hitstopMs > 0) { this.hitstop = Math.max(this.hitstop, p.hitstopMs); this.stats.lastHitstopMs = p.hitstopMs; }
    if (p.shakeOn) this.trauma = Math.min(1, this.trauma + p.traumaAdd);
    if (p.knockOn) { d.vx = pl.facing * p.knockForce; d.vy = -p.knockForce * 0.45; }
    if (this.cfg.onHit) this.cfg.onHit(this, d);
  };

  Demo.prototype.onHurt = function (src) {
    var pl = this.player, p = this.p;
    if (p.dashInvuln && this.t < pl.dashUntil) { this.stats.dodged++; return; }
    if (p.iframesOn && this.t < pl.invulnUntil) return;
    pl.hp -= 1; this.stats.hitsTaken++;
    if (p.iframesOn) pl.invulnUntil = this.t + p.iframeMs;
    if (this.cfg.onHurt) this.cfg.onHurt(this, src);
    if (pl.hp <= 0) { this.respawn(); }
  };

  Demo.prototype.respawn = function () {
    var L = this.cfg.level, pl = this.player;
    pl.x = L.spawn[0]; pl.y = L.spawn[1]; pl.vx = pl.vy = 0; pl.hp = 5; pl.invulnUntil = -1e9; pl.trail = [];
    pl.jumping = false; pl.jumpStartY = 0; pl.hang = 0; pl.dashUntil = -1e9;
  };

  // ---------- drawing ----------
  Demo.prototype.draw = function () {
    var c = this.ctx, pl = this.player, p = this.p, L = this.cfg.level;
    var ox = Math.round(-this.cam.x + this.shakeX), oy = Math.round(-this.cam.y + this.shakeY);
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = "#1a1d23"; c.fillRect(0, 0, W, H);
    c.save(); c.translate(ox, oy);
    // grid every 80 px so camera motion is visible
    c.strokeStyle = "#232731"; c.lineWidth = 1;
    for (var gx = 0; gx <= L.width; gx += 80) { c.beginPath(); c.moveTo(gx + .5, -40); c.lineTo(gx + .5, L.height + 40); c.stroke(); }
    if (L.height > H) for (var gy = 0; gy <= L.height; gy += 80) { c.beginPath(); c.moveTo(0, gy + .5); c.lineTo(L.width, gy + .5); c.stroke(); }
    var plats = this.solids();
    c.fillStyle = "#3b4252";
    plats.forEach(function (s) { c.fillRect(s[0], s[1], s[2], s[3]); });
    (L.ramps || []).forEach(function (r) { c.beginPath(); c.moveTo(r[0], r[1]); c.lineTo(r[2], r[3]); c.lineTo(r[2], L.height); c.lineTo(r[0], L.height); c.closePath(); c.fill(); });
    c.fillStyle = "#56607a";
    plats.forEach(function (s) { c.fillRect(s[0], s[1], s[2], 3); });
    (L.ramps || []).forEach(function (r) { c.strokeStyle = "#56607a"; c.lineWidth = 3; c.beginPath(); c.moveTo(r[0], r[1]); c.lineTo(r[2], r[3]); c.stroke(); c.lineWidth = 1; });
    var solidOne = !p.oneWayOn;
    (L.oneway || []).forEach(function (o) {
      c.fillStyle = solidOne ? "#3b4252" : "#2c313a"; c.fillRect(o[0], o[1], o[2], o[3]);
      c.fillStyle = "#7f8aa3"; for (var x = o[0]; x < o[0] + o[2]; x += 12) c.fillRect(x, o[1], 8, 3);
    });
    this.movers.forEach(function (m) { c.fillStyle = "#4d5a73"; c.fillRect(m.x, m.y, m.w, m.h); c.fillStyle = "#7ee2a8"; c.fillRect(m.x, m.y, m.w, 3); });
    if (this.cfg.trail) {
      c.fillStyle = "rgba(242,177,52,.45)";
      pl.trail.forEach(function (t) { c.fillRect(t[0] - 1.5, t[1] - 1.5, 3, 3); });
    }
    this.hazards.forEach(function (hz) { c.fillStyle = "#e5534b"; c.beginPath(); c.arc(hz.x, hz.y, hz.r, 0, Math.PI * 2); c.fill(); });
    if (this.cfg.draw) this.cfg.draw(this, c);
    var d = this.dummy;
    if (d) { c.fillStyle = d.flash > 0 ? "#ffffff" : "#8fa1b3"; c.fillRect(Math.round(d.x), Math.round(d.y), d.w, d.h); c.fillStyle = "#1a1d23"; c.fillRect(Math.round(d.x) + 6, Math.round(d.y) + 10, 4, 4); c.fillRect(Math.round(d.x) + 16, Math.round(d.y) + 10, 4, 4); }
    var invuln = p.iframesOn && this.t < pl.invulnUntil;
    var visible = !invuln || Math.floor(this.t / p.flickerMs) % 2 === 0;
    if (visible) {
      var dw = pl.w * pl.sx, dh = pl.h * pl.sy, dx = pl.x + (pl.w - dw) / 2, dy = pl.y + pl.h - dh;
      var dashing = this.t < pl.dashUntil;
      c.fillStyle = dashing ? (p.dashInvuln ? "#ffffff" : "#f7d58b") : invuln ? "#ffd27a" : this.t < pl.lagUntil ? "#c98f22" : "#f2b134";
      c.fillRect(Math.round(dx), Math.round(dy), Math.round(dw), Math.round(dh));
      c.fillStyle = "#1a1d23";
      var ex = pl.facing > 0 ? dx + dw * 0.6 : dx + dw * 0.2;
      c.fillRect(Math.round(ex), Math.round(dy + 7 * pl.sy), 4, 5);
    }
    if (this.cfg.attack && pl.atk === "startup") { var hb0 = this.hitbox(); c.fillStyle = "rgba(255,255,255,.12)"; c.fillRect(hb0.x, hb0.y, hb0.w, hb0.h); }
    if (this.cfg.attack && pl.atk === "active") { var hb = this.hitbox(); c.fillStyle = "rgba(255,255,255,.75)"; c.fillRect(hb.x, hb.y, hb.w, hb.h); }
    if (this.cfg.attack && pl.atk === "recovery") { var hb2 = this.hitbox(); c.strokeStyle = "rgba(255,255,255,.25)"; c.strokeRect(hb2.x + .5, hb2.y + .5, hb2.w - 1, hb2.h - 1); }
    if (pl.atkQueued) { c.fillStyle = "#7ee2a8"; c.fillRect(Math.round(pl.x) + 6, Math.round(pl.y) - 9, 8, 5); }
    c.restore();
    // HUD (not affected by shake or camera)
    if (this.cfg.camGuide && p.camOn) { c.strokeStyle = "rgba(242,177,52,.35)"; c.beginPath(); c.moveTo(W / 2 + .5, 0); c.lineTo(W / 2 + .5, H); c.stroke(); }
    if (this.cfg.hudDraw) this.cfg.hudDraw(this, c);
  };

  // ---------- running ----------
  var KEYMAP = { ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right", Space: "jump", ArrowUp: "jump", KeyW: "jump", KeyZ: "jump",
    KeyX: "attack", KeyJ: "attack", ArrowDown: "down", KeyS: "down", KeyC: "dash", KeyK: "dash", ShiftLeft: "dash", ShiftRight: "dash" };

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
    window.addEventListener("blur", function () { KEYS.forEach(function (k) { demo.release(k); }); });

    document.querySelectorAll("[data-touch]").forEach(function (b) {
      var k = b.getAttribute("data-touch");
      b.addEventListener("pointerdown", function (e) { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (err) {} demo.press(k); });
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
      var held = {};
      for (var f = 0; f < frames; f++) {
        var want = driver(demo, f) || {};
        KEYS.forEach(function (k) {
          if (want[k] && !held[k]) demo.press(k);
          if (!want[k] && held[k]) demo.release(k);
          held[k] = !!want[k];
        });
        demo.step();
      }
      var pl = demo.player;
      var out = { stats: Object.assign({}, demo.stats), player: { x: pl.x, y: pl.y, vx: pl.vx, vy: pl.vy, hp: pl.hp, grounded: pl.grounded, hang: pl.hang },
        cam: demo.cam.x, camY: demo.cam.y, dummy: demo.dummy ? { x: demo.dummy.x, sx: demo.dummy.sx } : null, t: demo.t,
        extra: cfg.snapshot ? cfg.snapshot(demo) : null };
      demo.reset(); acc = 0; last = performance.now(); simulating = false;
      return out;
    };
    window.__demo = demo;
    return demo;
  }

  window.HIP = { start: start, W: W, H: H, reduceMotion: reduceMotion, overlap: overlap, approach: approach };
})();
