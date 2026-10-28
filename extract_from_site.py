#!/usr/bin/env python3
"""One-time recovery: rebuild data/ and demos/ from a checkout of the published site.

Usage: python3 extract_from_site.py ../how-it-plays
- entries.json -> data/entries.json (page/json dropped, build.py derives them)
- each e/<id>/index.html -> the demo block fields that are only in HTML
  (canvas label, input kind, touch grid, toggle label, "Try this" text, prompt template)
- entries.js -> demos/_prelude.js, demos/<id>.js (one sim config each), demos/_mount.js
"""
import json, re, sys, pathlib, html

site = pathlib.Path(sys.argv[1])
here = pathlib.Path(__file__).parent
d = json.loads((site / "entries.json").read_text())
KEYS = {
    "": "jump", " &middot; <kbd>X</kbd> or <kbd>J</kbd> attack": "attack", " &middot; <kbd>X</kbd> or <kbd>J</kbd> shoot": "shoot",
    " &middot; <kbd>C</kbd> <kbd>K</kbd> or <kbd>Shift</kbd> dash": "dash", " &middot; <kbd>C</kbd> <kbd>K</kbd> or <kbd>Shift</kbd> roll": "roll",
    " &middot; <kbd>&darr;</kbd> or <kbd>S</kbd> down": "down", " &middot; <kbd>&darr;</kbd> or <kbd>S</kbd> down (with jump: drop through)": "drop",
}
entries = []
for e in d["entries"]:
    s = (site / e["page"]).read_text()
    lab = re.search(r'aria-label="Playable demo of (.*?)\. Arrow keys', s).group(1)
    keys = re.search(r'<p class="keys"><kbd>&larr;</kbd><kbd>&rarr;</kbd> or <kbd>A</kbd><kbd>D</kbd> move &middot; <kbd>Space</kbd> <kbd>W</kbd> <kbd>&uarr;</kbd> or <kbd>Z</kbd> jump(.*?)</p>', s).group(1)
    grid = re.search(r'<div class="touch" aria-hidden="true"(?: style="grid-template-columns:([^"]+)")?>', s).group(1)
    tog = re.search(r'id="toggle" class="toggle" aria-pressed="true">(.*?): on</button>', s).group(1)
    tr = re.search(r'<p class="try"><strong>Try this:</strong> (.*?)</p>', s).group(1)
    tpl = re.search(r'<script type="text/plain" id="prompt-template">(.*?)</script>', s, re.S).group(1)
    e = {k: v for k, v in e.items() if k not in ("page", "json")}
    e["demo"] = {"label": html.unescape(lab), "input": KEYS[keys], "touch_grid": grid, "toggle": html.unescape(tog),
                 "try": html.unescape(tr), "prompt_template": tpl}
    entries.append(e)
cats = [{"id": c["id"], "name": c["name"], "ids": c["ids"]} for c in d["categories"]]
(here / "data/site.json").write_text(json.dumps({"name": d["name"], "updated": d["updated"], "categories": cats, "feels": d["feels"]}, indent=2) + "\n")
(here / "data/entries.json").write_text(json.dumps(entries, indent=2) + "\n")

js = (site / "entries.js").read_text()
head, rest = js.split("  var D = {\n", 1)
body, tail = rest.split("\n  };\n", 1)
(here / "demos/_prelude.js").write_text(head)
(here / "demos/_mount.js").write_text(tail)
blocks = re.split(r",\n(?=    \"[a-z0-9-]+\": \{\n)", body)
ids = []
for b in blocks:
    m = re.match(r'    "([a-z0-9-]+)": (\{\n.*\n    \})$', b, re.S)
    ids.append(m.group(1))
    (here / f"demos/{m.group(1)}.js").write_text(m.group(2) + "\n")
assert ids == [e["id"] for e in entries], "entries.js order differs from entries.json"
print(len(entries), "entries,", len(ids), "demo configs")
