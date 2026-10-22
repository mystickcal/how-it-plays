(function () {
  "use strict";
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var el = document.getElementById(btn.getAttribute("data-copy")); var text = el ? el.textContent : "";
      var done = function () { var o = btn.textContent; btn.textContent = "Copied"; setTimeout(function () { btn.textContent = o; }, 1500); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, function () { sel(el); done(); });
      else { sel(el); done(); }
    });
  });
  function sel(el) { var r = document.createRange(); r.selectNodeContents(el); var s = getSelection(); s.removeAllRanges(); s.addRange(r); try { document.execCommand("copy"); } catch (e) {} }

  var form = document.getElementById("signup");
  if (form) form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    // TODO(Derek): POST to the self-hosted Listmonk gateway once this origin is allowed.
    document.getElementById("signup-note").textContent = "Thanks. Signup isn't connected yet, so nothing was sent or saved.";
  });

  var q = document.getElementById("q"); if (!q) return;
  var list = document.getElementById("results"), count = document.getElementById("count"), none = document.getElementById("none");
  var STOP = "a an the to of for in on my i me is it and or how do does what when with feels feel like too so".split(" ");
  var data = null, chipIds = null;
  function norm(s) { return (s || "").toLowerCase().replace(/[^a-z0-9 ]+/g, " "); }
  function toks(s) { return norm(s).split(/\s+/).filter(function (t) { return t && STOP.indexOf(t) < 0; }); }
  function stem(t) { return t.length > 4 ? t.replace(/(ing|ed|es|s)$/, "") : t; }
  function score(x, qt) {
    var fields = [[toks(x.name), 6], [toks(x.aliases.join(" ")), 5], [toks(x.feels.join(" ")), 5], [toks(x.summary), 2], [toks(x.what_it_does), 1]];
    var s = 0;
    qt.forEach(function (t) {
      var st = stem(t), best = 0;
      fields.forEach(function (f) { f[0].forEach(function (w) {
        if (w === t || stem(w) === st) best = Math.max(best, f[1]);
        else if (t.length >= 3 && stem(w).indexOf(st) === 0) best = Math.max(best, f[1] * 0.6);
      }); });
      s += best;
    });
    return s;
  }
  function render(items, label) {
    list.innerHTML = "";
    items.forEach(function (x) {
      var li = document.createElement("li"), a = document.createElement("a"); a.href = x.page;
      var n = document.createElement("span"); n.className = "r-name"; n.textContent = x.name;
      var d = document.createElement("span"); d.className = "r-need"; d.textContent = x.summary;
      a.appendChild(n); a.appendChild(d); li.appendChild(a); list.appendChild(li);
    });
    count.textContent = label; none.hidden = items.length > 0;
  }
  function run() {
    var qt = toks(q.value);
    document.querySelectorAll(".feel").forEach(function (c) { c.setAttribute("aria-pressed", chipIds && c.getAttribute("data-ids") === chipIds.join(" ") ? "true" : "false"); });
    if (chipIds) { render(chipIds.map(function (id) { return data.entries.filter(function (x) { return x.id === id; })[0]; }), chipIds.length + " techniques for that feel"); return; }
    if (!qt.length) { render(data.entries, data.entries.length + " techniques"); return; }
    var out = data.entries.map(function (x) { return [x, score(x, qt)]; }).filter(function (r) { return r[1] >= 2; }).sort(function (a, b) { return b[1] - a[1]; }).map(function (r) { return r[0]; });
    render(out, out.length + (out.length === 1 ? " match" : " matches"));
  }
  fetch("entries.json").then(function (r) { return r.json(); }).then(function (d) {
    data = d;
    q.addEventListener("input", function () { chipIds = null; run(); });
    document.querySelectorAll(".feel").forEach(function (c) {
      c.addEventListener("click", function () {
        var ids = c.getAttribute("data-ids").split(" ");
        chipIds = (chipIds && chipIds.join(" ") === ids.join(" ")) ? null : ids;
        q.value = ""; run();
      });
    });
    run();
    document.documentElement.setAttribute("data-search-ready", "1");
  });
})();
