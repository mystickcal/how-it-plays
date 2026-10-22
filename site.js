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

  // Signup: posts to the self-hosted newsletter gateway (double opt-in), same as SkillCheck.
  var form = document.getElementById("signup");
  if (form) {
    var note = document.getElementById("signup-note");
    var btn = form.querySelector("button[type='submit']");
    var OK = "Check your inbox to confirm";
    var ERR = "We could not send that signup. Try again in a moment.";
    var EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
    var busy = false;
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (busy) return;
      var f = form.elements, email = f.email.value.trim();
      if (!EMAIL.test(email) || email.length > 254) { note.textContent = "Enter a valid email address."; f.email.focus(); return; }
      if (!f.consent.checked) { note.textContent = "Tick the box to agree to the weekly email."; f.consent.focus(); return; }
      busy = true; btn.disabled = true; note.textContent = "Sending";
      fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, brand: form.getAttribute("data-brand"), source: form.getAttribute("data-source"), consent: true, company: f.company.value }),
        credentials: "omit", cache: "no-store", redirect: "error"
      }).then(function (r) {
        if (!r.ok) throw new Error("request_failed");
        var type = (r.headers.get("content-type") || "").toLowerCase();
        if (type.indexOf("json") >= 0) return r.json().then(function (p) { if (p && p.error) throw new Error("request_failed"); });
      }).then(function () { form.reset(); note.textContent = OK; }, function () { note.textContent = ERR; })
        .then(function () { busy = false; btn.disabled = false; });
    });
  }

  var q = document.getElementById("q"); if (!q) return;
  var list = document.getElementById("results"), count = document.getElementById("count"), none = document.getElementById("none"), cats = document.getElementById("cats");
  var grouped = list.innerHTML; // server-rendered category view, shown when there is no query
  var STOP = "a an the to of for in on my i me is it and or how do does what when with feels feel like too so".split(" ");
  var data = null, chipIds = null, catName = {};
  function norm(s) { return (s || "").toLowerCase().replace(/[^a-z0-9 ]+/g, " "); }
  function toks(s) { return norm(s).split(/\s+/).filter(function (t) { return t && STOP.indexOf(t) < 0; }); }
  function stem(t) { return t.length > 4 ? t.replace(/(ing|ed|es|s)$/, "") : t; }
  // tokens are computed once per entry, so each keystroke only compares strings
  function prep(x) {
    x._f = [[toks(x.name), 6], [toks(x.aliases.join(" ")), 5], [toks(x.feels.join(" ")), 5], [toks(x.summary), 2], [toks(x.what_it_does), 1]].map(function (f) {
      return [f[0].map(function (w) { return [w, stem(w)]; }), f[1]];
    });
  }
  function score(x, qt) {
    var s = 0;
    qt.forEach(function (t) {
      var st = stem(t), best = 0;
      x._f.forEach(function (f) { f[0].forEach(function (w) {
        if (w[0] === t || w[1] === st) best = Math.max(best, f[1]);
        else if (t.length >= 3 && w[1].indexOf(st) === 0) best = Math.max(best, f[1] * 0.6);
      }); });
      s += best;
    });
    return s;
  }
  function render(items, label) {
    var ol = document.createElement("ol"); ol.className = "results";
    items.forEach(function (x) {
      var li = document.createElement("li"), a = document.createElement("a"); a.href = x.page;
      var n = document.createElement("span"); n.className = "r-name"; n.textContent = x.name;
      var c = document.createElement("span"); c.className = "r-cat"; c.textContent = catName[x.category] || "";
      n.appendChild(c);
      var d = document.createElement("span"); d.className = "r-need"; d.textContent = x.summary;
      a.appendChild(n); a.appendChild(d); li.appendChild(a); ol.appendChild(li);
    });
    list.innerHTML = ""; list.appendChild(ol);
    if (cats) cats.hidden = true;
    count.textContent = label; none.hidden = items.length > 0;
  }
  function run() {
    var qt = toks(q.value);
    document.querySelectorAll(".feel").forEach(function (c) { c.setAttribute("aria-pressed", chipIds && c.getAttribute("data-ids") === chipIds.join(" ") ? "true" : "false"); });
    if (chipIds) { render(chipIds.map(function (id) { return data.entries.filter(function (x) { return x.id === id; })[0]; }), chipIds.length + " techniques for that feel"); return; }
    if (!qt.length) { list.innerHTML = grouped; if (cats) cats.hidden = false; count.textContent = data.entries.length + " techniques"; none.hidden = true; return; }
    var out = data.entries.map(function (x) { return [x, score(x, qt)]; }).filter(function (r) { return r[1] >= 2; }).sort(function (a, b) { return b[1] - a[1]; }).map(function (r) { return r[0]; });
    render(out, out.length + (out.length === 1 ? " match" : " matches"));
  }
  fetch("entries.json").then(function (r) { return r.json(); }).then(function (d) {
    data = d;
    (d.categories || []).forEach(function (c) { catName[c.id] = c.name; });
    d.entries.forEach(prep);
    q.addEventListener("input", function () { chipIds = null; run(); });
    document.querySelectorAll(".feel").forEach(function (c) {
      c.addEventListener("click", function () {
        var ids = c.getAttribute("data-ids").split(" ");
        chipIds = (chipIds && chipIds.join(" ") === ids.join(" ")) ? null : ids;
        q.value = ""; run();
      });
    });
    var qs = new URLSearchParams(location.search).get("q");
    if (qs) q.value = qs;
    run();
    document.documentElement.setAttribute("data-search-ready", "1");
  });
})();
