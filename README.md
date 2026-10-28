# How It Plays: build tooling

This branch (`tooling`) holds the generator, source data, demo configs and checks for
https://mystickcal.github.io/how-it-plays/. The live site is the `main` branch
(GitHub Pages, deploy from branch, no Actions). Commits here never change the live site.

Rebuilt on 2026-10-28 from the published output after the original build folder was lost.
`python3 build.py` reproduced main at 5edbea9 byte-for-byte (all 90 files), and the
live site matched that build byte-for-byte.

## Layout
- `data/site.json`: name, updated date, categories (display order and member ids), feel chips, `sitemap` flag.
- `data/entries.json`: one record per technique, in publish order (also the order of configs in entries.js).
  `demo` holds the page-only fields: canvas label, input kind (jump, attack, shoot, dash, roll, down, drop),
  touch grid, toggle label, "Try this" text and the prompt template (`{key}`, `{key:half|plus|inv|ramp|frames}`
  placeholders are filled from the sliders by entries.js). `prompt` is the template filled with default values.
- `demos/<id>.js`: the sim config for each demo (level, toggle, sliders, apply, hud, optional hooks).
  `demos/_prelude.js` (shared helpers) and `demos/_mount.js` (slider/toggle/prompt wiring) wrap them into entries.js.
- `static/`: copied as-is: demo.js (the engine), site.js (signup + search), style.css, og.png.
- `build.py`, `extract_from_site.py`, `checks/` as in the What To Ask For tooling.
- `checks/browsercheck.py` runs every demo through `demo.simulate` with scripted inputs, toggle on and off,
  and fails if a toggle makes no measurable difference or a run is not deterministic.

## Release
```
git clone -b main https://github.com/mystickcal/how-it-plays.git site
python3 build.py --out site
python3 checks/sitecheck.py how-it-plays --local site --expect N
python3 checks/browsercheck.py how-it-plays --local site
git -C site add -A && git -C site commit -m "..." && git -C site push
python3 checks/sitecheck.py how-it-plays --live --expect N --compare-dir site
python3 checks/browsercheck.py how-it-plays --live
```
