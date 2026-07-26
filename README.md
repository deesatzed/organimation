# organimation

Browser playground for organic generative sketches: pick from a gallery, tweak with plain-English sliders, export a PNG, and share a link that restores your settings.

No accounts. No server. No paste-to-auto-sliders (yet).

## Run

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

Credits also appear in the studio UI under each sketch.

**Note:** Hand-ported sketches are reimplementations with named parameters for remix UI. Original visual formulas belong to their authors/community; organimation does not claim authorship of those formulas.

## Features (v1)

- Gallery of ≥3 runnable sketches
- English-named sliders (Tweakpane)
- Randomize / Reset
- PNG export
- Share URL (`#/s/<id>?v=1&p=k:v,...`) with immediate **Copy link**
- Density caps + FPS warning / auto density reduction when slow
- Desktop-first layout; stacked studio on narrow viewports (44px min controls)

## Out of scope (v1)

- User accounts / auth
- Backend / server
- Auto-paste golfed tweet code → sliders
- GIF / video export

## Project docs

- `docs/REQUIREMENTS_v1.md` — confirmed requirements
- `docs/ARCHITECTURE_ironclad_v1.md` — design + audit
- `docs/PLAN_v1.md` — execution plan (Steps 1–14 done)
- `docs/ACCEPTANCE_v1.md` — O1–O11 evidence
- `docs/TRUTH_MAP.md` — live vs absent surfaces
- `docs/HANDOFF.md` — session continuity
- `docs/ERROR_LOG.md` — errors + mitigations
