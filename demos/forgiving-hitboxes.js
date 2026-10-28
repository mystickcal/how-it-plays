{
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
    }
