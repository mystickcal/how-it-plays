
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
