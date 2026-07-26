# organimation — Session Handoff

**Updated:** 2026-07-26  
**Stage:** v1 plan executed; residual verification + Stage-2 orientation artifacts  
**Do not claim:** production-ready beyond O1–O11 acceptance evidence

## What this is

Static browser playground: gallery of organic generative sketches → English-named Tweakpane controls → PNG export + shareable hash URL. No server, accounts, or paste-auto-sliders.

## Run

```bash
npm install
npm run dev
# verify:
npm run selfcheck
npm run build
npm run preview   # other terminal
npm run smoke
```

## Truth map (demo vs real)

| Surface | Status | Evidence |
|---------|--------|----------|
| Gallery cards | **Live** | Real `SketchModule` registry entries |
| Canvas animation | **Live** | p5 instance mode per sketch |
| Sliders | **Live** | Tweakpane bound to `AppState` |
| Randomize / Reset | **Live** | Schema clamps |
| Share URL | **Live** | `urlState` encode/decode + smoke reload |
| PNG export | **Live** | Canvas `toDataURL` + smoke download bytes |
| FPS warn / density clamp | **Live** | `FpsMonitor` + AppShell; unit selfcheck; banner hardware-dependent |
| Accounts / server / paste | **Absent (out of scope)** | Not in tree |
| GIF export | **Absent (deferred)** | Not in tree |

## Architecture (short)

- Hash routes: `#/` gallery, `#/s/:id?v=1&p=k:v,...` studio  
- `AppState` = single truth for id + params  
- `P5Host` dynamic-imports p5; dispose on navigate  
- Sketches: `creature-flow`, `lozi-flow`, `ripple-field`

## Docs

| File | Role |
|------|------|
| `docs/REQUIREMENTS_v1.md` | Confirmed requirements |
| `docs/ARCHITECTURE_ironclad_v1.md` | Design + audit |
| `docs/PLAN_v1.md` | Steps 1–14 (all checked) |
| `docs/ACCEPTANCE_v1.md` | O1–O11 evidence |
| `docs/ERROR_LOG.md` | Errors + mitigations |
| `docs/HANDOFF.md` | This file |

## Suggested next work (not started)

1. **Optional content:** sketches 4–5 (still within original 3–5 range preference)  
2. **Stage 3 polish:** a11y (reduced-motion), keyboard pane, better mobile Tweakpane  
3. **Deferred backlog:** GIF export, paste-auto-sliders, share analytics — requires new requirements approval  
4. **Deploy:** static host (`dist/`) — GitHub Pages / Netlify / any static CDN  

## Continuity checklist

- [x] Requirements confirmed  
- [x] Architecture packet  
- [x] Plan executed  
- [x] Acceptance O1–O11  
- [x] Selfcheck + build + smoke green after residual pass  
- [ ] Git remote / first commit (user decision)  
- [ ] Public deploy (user decision)  
