# organimation

Browser playground for organic generative sketches: pick from a gallery, tweak with plain-English sliders, export a PNG, and share a link that restores your settings.

No accounts. No server. No paste-to-auto-sliders (yet).

## Live site

**https://deesatzed.github.io/organimation/**

(Deployed from `main` via GitHub Actions → GitHub Pages.)

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173/`).

Production build:

```bash
npm run build
npm run preview
```

Self-checks (params clamps + URL round-trip):

```bash
npm run selfcheck
```

## Stack

- Vite + TypeScript
- [p5.js](https://p5js.org/) (instance mode)
- [Tweakpane](https://tweakpane.github.io/docs/)

## Sketches & attribution

| ID | Title | Credit |
|----|--------|--------|
| `creature-flow` | Creature Flow | Community (#つぶやきProcessing); ported/inspired formula from `notes1.md` |
| `lozi-flow` | Lozi Flow | Inspired by public sketches associated with きんぞ @TakagiHitoshi / Lozi map notes (`notes2.md`) |
| `ripple-field` | Ripple Field | Original organimation template |
| `orbital-rects` | Orbital Rects | Inspired by きんぞ @TakagiHitoshi rect-orbit sketches (`notes2.md`) |
| `wave-lattice` | Wave Lattice | Inspired by ntsutae @ntsutae point-lattice sketches (`notes2.md`) |
| `spiral-bloom` | Spiral Bloom | Original organimation (phyllotaxis bloom) |
| `ink-tendrils` | Ink Tendrils | Original organimation |
| `pulse-rings` | Pulse Rings | Original organimation |
| `aurora-veil` | Aurora Veil | Original organimation |

Credits also appear in the studio UI under each sketch.

**Note:** Hand-ported sketches are reimplementations with named parameters for remix UI. Original visual formulas belong to their authors/community; organimation does not claim authorship of those formulas.

## Features

- Gallery of **9** runnable sketches with **live thumbnails**
- English-named sliders (Tweakpane)
- **Moods** + **Morph →** animated transition
- **Palettes:** Ice / Mint / Violet / Sunset / Gold / Mono
- Randomize / **Undo** / Reset / Pause–Play
- **★ Favorite** (localStorage, this browser)
- **Pin compare** (still left vs live right)
- **WebM 3s** + **GIF 3s** export (real canvas capture + gifenc)
- **Paste golfed code** → auto-sliders (Skepara-style number extract)
- **Mic** optional — speed reacts to sound
- **Surprise me** + **Ambient Shuffle**
- Fullscreen canvas + keyboard shortcuts (see header)
- PNG export + share URL
- Density caps + FPS warning when slow
- `prefers-reduced-motion` starts paused
- CI + GitHub Pages deploy from `main`

See `docs/FEATURE_VISION.md` for product thinking and backlog.

## Out of scope

- User accounts / auth
- Backend / server
- Community feed / cloud sync

## Project docs

- `docs/REQUIREMENTS_v1.md` — confirmed requirements
- `docs/ARCHITECTURE_ironclad_v1.md` — design + audit
- `docs/PLAN_v1.md` — execution plan (Steps 1–14 done)
- `docs/ACCEPTANCE_v1.md` — O1–O11 evidence
- `docs/TRUTH_MAP.md` — live vs absent surfaces
- `docs/HANDOFF.md` — session continuity
- `docs/ERROR_LOG.md` — errors + mitigations
