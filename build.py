#!/usr/bin/env python3
"""How It Plays static site generator (rebuilt 2026-10-28 from the live output).

Usage:
  python3 build.py --out ../how-it-plays      # write the site into a checkout of main
Source of truth: data/site.json, data/entries.json, demos/*.js (one sim config per
entry, plus _prelude.js and _mount.js), static/ (copied as-is: demo.js engine,
site.js, style.css, og.png).
Generated: index.html, 404.html, e/<id>/index.html, api/<id>.json, entries.json,
entries.js, llms.txt, sitemap.xml (only when site.json has "sitemap": true).
"""
import argparse, json, pathlib, shutil, html as H

ROOT = pathlib.Path(__file__).resolve().parent
BASE = "https://mystickcal.github.io/how-it-plays/"
SITE = "How It Plays"
UMAMI = '<script defer src="https://newsletter.clickconsultants.com/u/script.js" data-website-id="6ec24210-90f9-4e61-8b5c-74d3c45555bc" data-domains="mystickcal.github.io"></script>'
OG_ALT = "How It Plays: game feel you can play. Learn the name, feel it on and off, copy the prompt. By @omgitsderek."
HOME_TITLE = "How It Plays: a playable game feel dictionary"
HOME_DESC = "Playable demos of game feel techniques with on/off switches, sliders and copy-paste prompts for AI coding agents."
MOVE = "<kbd>&larr;</kbd><kbd>&rarr;</kbd> or <kbd>A</kbd><kbd>D</kbd> move &middot; <kbd>Space</kbd> <kbd>W</kbd> <kbd>&uarr;</kbd> or <kbd>Z</kbd> jump"
LR = '<button type="button" data-touch="left">&larr;</button><button type="button" data-touch="right">&rarr;</button>'
# input kind -> (canvas label suffix, keys line suffix, touch row: extra left buttons, right buttons)
INPUTS = {
    "jump": ("", "", LR, '<button type="button" data-touch="jump">Jump</button>'),
    "attack": (", X or J to attack", " &middot; <kbd>X</kbd> or <kbd>J</kbd> attack", LR, '<button type="button" data-touch="attack">X</button><button type="button" data-touch="jump">Jump</button>'),
    "shoot": (", X or J to shoot", " &middot; <kbd>X</kbd> or <kbd>J</kbd> shoot", LR, '<button type="button" data-touch="attack">X</button><button type="button" data-touch="jump">Jump</button>'),
    "dash": (", C, K or Shift to dash", " &middot; <kbd>C</kbd> <kbd>K</kbd> or <kbd>Shift</kbd> dash", LR, '<button type="button" data-touch="dash">Dash</button><button type="button" data-touch="jump">Jump</button>'),
    "roll": (", C, K or Shift to roll", " &middot; <kbd>C</kbd> <kbd>K</kbd> or <kbd>Shift</kbd> roll", LR, '<button type="button" data-touch="dash">Roll</button><button type="button" data-touch="jump">Jump</button>'),
    "down": (", Down or S for down", " &middot; <kbd>&darr;</kbd> or <kbd>S</kbd> down", LR + '<button type="button" data-touch="down">&darr;</button>', '<button type="button" data-touch="jump">Jump</button>'),
    "drop": (", Down or S for down", " &middot; <kbd>&darr;</kbd> or <kbd>S</kbd> down (with jump: drop through)", LR + '<button type="button" data-touch="down">&darr;</button>', '<button type="button" data-touch="jump">Jump</button>'),
}
TOUCH_GRID = {"jump": "64px 64px 1fr 84px", "down": "64px 64px 64px 1fr 84px", "drop": "64px 64px 64px 1fr 84px"}  # default for others: 64px 64px 1fr 64px 84px


def e(s):
    return H.escape(s, quote=True)


# Signup form: copied verbatim from the live site. Do not edit (gateway contract).
def footer(p, scripts):
    return f'''<footer class="foot">
  <form class="signup" id="signup" method="post" action="https://newsletter.clickconsultants.com/v1/subscriptions" data-brand="how-it-plays" data-source="how-it-plays-web" novalidate>
    <label for="signup-email">One technique a week, by email</label>
    <label class="hp" aria-hidden="true">Leave this blank <input name="company" type="text" tabindex="-1" autocomplete="off" maxlength="200"></label>
    <div class="signup-row">
      <input id="signup-email" type="email" name="email" maxlength="254" placeholder="you@example.com" autocomplete="email" required>
      <button type="submit">Sign up</button>
    </div>
    <label class="signup-check"><input name="consent" type="checkbox" value="true" required> <span>Weekly email about one new game-feel technique. Unsubscribe any time.</span></label>
    <p class="signup-note" id="signup-note" role="status" aria-live="polite"></p>
    <noscript><p class="signup-note">JavaScript is required to sign up on this page. <a href="https://newsletter.clickconsultants.com/subscription/form">Open the hosted form</a> and choose How It Plays.</p></noscript>
  </form>
  <p class="made">Built by Derek Salyers &middot; <a href="https://x.com/omgitsderek">@omgitsderek on X</a> &middot; <a href="{p}llms.txt">llms.txt</a> &middot; <a href="{p}entries.json">entries.json</a></p>
</footer>
{"".join(f'<script src="{p}{s}" defer></script>' + chr(10) for s in scripts) if scripts else chr(10)}</body>
</html>
'''


def og(title, desc, url, typ):
    t, d = e(title), e(desc)
    return f'''<meta property="og:site_name" content="{SITE}">
<meta property="og:title" content="{t}">
<meta property="og:description" content="{d}">
<meta property="og:url" content="{url}">
<meta property="og:type" content="{typ}">
<meta property="og:image" content="{BASE}og.png">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{e(OG_ALT)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{t}">
<meta name="twitter:description" content="{d}">
<meta name="twitter:image" content="{BASE}og.png">
<meta name="twitter:image:alt" content="{e(OG_ALT)}">
'''


def page(p, title, desc, body, ogtags, scripts):
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
{ogtags}<link rel="stylesheet" href="{p}style.css">
<link rel="alternate" type="text/plain" href="{p}llms.txt" title="llms.txt">
{UMAMI}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="top"><a class="brand" href="{p}index.html">{SITE}</a></header>
<main id="main">
{body}
</main>
''' + footer(p, scripts)


def entry_body(x, cat, prev, nxt):
    dm = x["demo"]
    lab_sfx, keys_sfx, left, right = INPUTS[dm["input"]]
    grid = dm["touch_grid"]
    style = f' style="grid-template-columns:{grid}"' if grid else ""
    links = "".join(f'<li><a href="{e(s["url"])}">{e(s["title"])}</a></li>' for s in x["sources"])
    sources = f'<section><h2>Sources</h2><ul class="links">{links}</ul></section>' if x["sources"] else ""
    return f'''
<article class="entry">
  <p class="crumb"><a href="../../index.html">All techniques</a> &middot; <a href="../../index.html#cat-{cat["id"]}">{e(cat["name"])}</a></p>
  <h1>{e(x["name"])}</h1>
  <p class="aka">Also called: {e(", ".join(x["aliases"]))}</p>
  <p class="lead">{e(x["summary"])}</p>
  <section class="demo" aria-label="Playable demo">
    <canvas id="game" width="640" height="360" tabindex="0" aria-label="{e("Playable demo of " + dm["label"] + ". Arrow keys or A and D to move, Space, W, Up or Z to jump" + lab_sfx + ".")}"></canvas>
    <p class="stats" id="stats" aria-live="off"></p>
    <div class="controls">
      <button type="button" id="toggle" class="toggle" aria-pressed="true">{e(dm["toggle"])}: on</button>
      <button type="button" id="reset" class="ghost">Reset</button>
      <div id="sliders" class="sliders"></div>
    </div>
    <div class="touch" aria-hidden="true"{style}>
      {left}
      <span></span>
      {right}
    </div>
    <p class="keys">{MOVE}{keys_sfx}</p>
    <p class="try"><strong>Try this:</strong> {e(dm["try"])}</p>
  </section>
  <section><h2>What it does</h2><p>{e(x["what_it_does"])}</p></section>
  <div class="when">
    <section><h2>Use it when</h2><p>{e(x["use_when"])}</p></section>
    <section><h2>Watch out</h2><p>{e(x["watch_out"])}</p></section>
  </div>
  <section><h2>Starting values</h2><p>{e(x["starting_values"])}</p></section>
  <section class="prompt-box">
    <div class="prompt-head"><h2 id="prompt-h">Prompt for your coding agent</h2><button type="button" class="copy" data-copy="prompt">Copy prompt</button></div>
    <p class="hint">The numbers follow the sliders above. Works with plain canvas, Phaser, Three.js or Godot.</p>
    <script type="text/plain" id="prompt-template">{dm["prompt_template"]}</script>
    <pre id="prompt" tabindex="0" aria-labelledby="prompt-h">{e(x["prompt"])}</pre>
  </section>
  {sources}
  <p class="meta">Updated {x["updated"]}. JSON: <a href="../../api/{x["id"]}.json">api/{x["id"]}.json</a></p>
  <nav class="pn" aria-label="More techniques"><a href="../{prev["id"]}/index.html">&larr; {e(prev["name"])}</a><a href="../{nxt["id"]}/index.html">{e(nxt["name"])} &rarr;</a></nav>
</article>
<script>document.addEventListener("DOMContentLoaded",function(){{HIP_MOUNT("{x["id"]}");}});</script>
'''


def home_body(site, by_id, cats):
    n = len(by_id)
    feels = " ".join(f'<button type="button" class="feel" data-q="{e(f["feel"])}" data-ids="{" ".join(f["ids"])}" aria-pressed="false">{e(f["feel"])}</button>' for f in site["feels"])
    nav = " ".join(f'<a href="#cat-{c["id"]}">{e(c["name"])}</a>' for c in cats)
    groups = []
    for c in cats:
        rows = "\n".join(f'<li><a href="e/{i}/index.html"><span class="r-name">{e(by_id[i]["name"])}</span><span class="r-need">{e(by_id[i]["summary"])}</span></a></li>' for i in c["ids"])
        groups.append(f'<section class="group" id="cat-{c["id"]}" aria-labelledby="h-{c["id"]}"><h3 id="h-{c["id"]}">{e(c["name"])} <span>{len(c["ids"])}</span></h3>\n<ol class="results">\n{rows}\n</ol></section>')
    groups = "\n".join(groups)
    return f'''
<section class="hero">
  <h1>Game feel you can play. Learn the name, feel it on and off, copy the prompt.</h1>
  <p class="lead">For people building browser games with AI. Each entry has a small playable demo with an on/off switch and sliders, starting values, and a prompt for your coding agent.</p>
  <form class="search" role="search" onsubmit="return false">
    <label for="q" class="vh">Search techniques</label>
    <input id="q" type="search" placeholder="Search, or describe how it feels: floaty, unfair, weak hits" autocomplete="off" spellcheck="false">
  </form>
  <div class="feels" role="group" aria-label="It feels..."><span>It feels:</span> {feels}</div>
</section>
<section aria-labelledby="results-h">
  <h2 id="results-h" class="vh">Techniques</h2>
  <div class="count-row"><p class="count" id="count" aria-live="polite">{n} techniques</p><nav class="cats" id="cats" aria-label="Categories">{nav}</nav></div>
  <div id="results">
{groups}
  </div>
  <p class="none" id="none" hidden>No match. Try a feel word like &ldquo;floaty&rdquo; or &ldquo;unfair&rdquo;.</p>
</section>
'''


def llms(site, by_id, cats):
    out = [f"# {SITE}", "",
           "> A playable game feel dictionary for people building browser games with AI. Each technique has a demo with an on/off switch and sliders, starting values, and a copy-paste prompt for a coding agent.", "",
           "Agents: fetch /entries.json for all techniques (search the name, aliases and feels fields; each entry has a category), or /api/<id>.json for one. The prompt field uses the demo's default values.", "",
           "## Techniques", ""]
    for c in cats:
        out += [f'### {c["name"]}', ""]
        for i in c["ids"]:
            x = by_id[i]
            out.append(f'- [{x["name"]}](e/{i}/index.html): {x["summary"]} Feels it fixes: {", ".join(x["feels"])}. JSON: api/{i}.json')
        out.append("")
    out += ["", "## Feel lookup", ""] + [f'- {f["feel"]}: {", ".join(f["ids"])}' for f in site["feels"]]
    out += ["", f'Updated {site["updated"]}. Built by Derek Salyers (https://x.com/omgitsderek).']
    return "\n".join(out) + "\n"


KEYS = ["id", "name", "category", "aliases", "feels", "summary", "what_it_does", "use_when", "watch_out", "starting_values",
        "default_slider_values", "prompt", "sources", "page", "json", "updated"]


def build(out):
    site = json.loads((ROOT / "data/site.json").read_text())
    src = json.loads((ROOT / "data/entries.json").read_text())
    cats = site["categories"]
    by_id = {x["id"]: x for x in src}
    assert len(by_id) == len(src), "duplicate ids"
    listed = [i for c in cats for i in c["ids"]]
    assert sorted(listed) == sorted(by_id), "every entry must be in exactly one category list"
    for c in cats:
        for i in c["ids"]:
            assert by_id[i]["category"] == c["id"], i
    for f in site["feels"]:
        for i in f["ids"]:
            assert i in by_id, f"feel {f['feel']} -> unknown id {i}"
    for x in src:
        assert (ROOT / "demos" / f'{x["id"]}.js').exists(), f'missing demos/{x["id"]}.js'
    out = pathlib.Path(out)
    for f in (ROOT / "static").iterdir():
        shutil.copyfile(f, out / f.name)
    published = [{k: dict(x, page=f'e/{x["id"]}/index.html', json=f'api/{x["id"]}.json')[k] for k in KEYS} for x in src]
    pub = {x["id"]: x for x in published}
    (out / "index.html").write_text(page("", HOME_TITLE, HOME_DESC, home_body(site, pub, cats), og(HOME_TITLE, HOME_DESC, BASE, "website"), ["site.js"]))
    (out / "404.html").write_text(page("/how-it-plays/", "Not found: " + SITE, "Page not found",
                                       '<h1>Page not found</h1><p><a href="/how-it-plays/index.html">Back to all techniques</a></p>', "", []))
    (out / "api").mkdir(exist_ok=True)
    catmap = {c["id"]: c for c in cats}
    n = len(listed)
    for k, i in enumerate(listed):
        x = dict(by_id[i], **pub[i])
        d = out / "e" / i
        d.mkdir(parents=True, exist_ok=True)
        title = f'{x["name"]}: {SITE}'
        body = entry_body(x, catmap[x["category"]], pub[listed[k - 1]], pub[listed[(k + 1) % n]])
        (d / "index.html").write_text(page("../../", title, x["summary"], body, og(title, x["summary"], f"{BASE}e/{i}/", "article"),
                                          ["site.js", "demo.js", "entries.js"]))
        (out / "api" / f"{i}.json").write_text(json.dumps(pub[i], indent=2))
    (out / "entries.json").write_text(json.dumps({"name": site["name"], "updated": site["updated"], "count": n, "categories": cats,
                                                  "feels": site["feels"], "entries": published}, indent=2))
    blocks = ",\n".join(f'    "{x["id"]}": ' + (ROOT / "demos" / f'{x["id"]}.js').read_text().rstrip("\n") for x in src)
    (out / "entries.js").write_text((ROOT / "demos/_prelude.js").read_text() + "  var D = {\n" + blocks + "\n  };\n" + (ROOT / "demos/_mount.js").read_text())
    (out / "llms.txt").write_text(llms(site, pub, cats))
    if site.get("sitemap"):
        urls = [(BASE, site["updated"])] + [(f"{BASE}e/{i}/", pub[i]["updated"]) for i in listed]
        body = "".join(f"  <url><loc>{u}</loc><lastmod>{m}</lastmod></url>\n" for u, m in urls)
        (out / "sitemap.xml").write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{body}</urlset>\n')
    print(f"built {n} techniques in {len(cats)} categories -> {out}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    build(ap.parse_args().out)
