# organimation — Acceptance v1

**Plan:** `docs/PLAN_v1.md`  
**Dates:** 2026-07-26 (initial) · residual close-out same day  
**Build:** `npm run build` (tsc + vite)  
**Self-check:** `npm run selfcheck` (AppState + urlState + FpsMonitor)  
**Browser smoke:** `npm run smoke` against `npm run preview` @ `http://127.0.0.1:4173/`

## Outcomes

| ID | Outcome | Result | Evidence |
|----|---------|--------|----------|
| O1 | Vite+TS project builds | **PASS** | `npm run build` exit 0; `dist/` emitted |
| O2 | Dev/preview serves app shell | **PASS** | Preview HTTP 200; smoke loads gallery without page errors |
| O3 | ≥3 sketches openable | **PASS** | Registry: 5 sketches (`creature-flow`, `lozi-flow`, `ripple-field`, `orbital-rects`, `wave-lattice`); smoke opens each; A→B→A single canvas |
| O4 | Named params live-update | **PASS** | Tweakpane in `ParamController`; sketches read `getParams()` each frame |
| O5 | Randomize in ranges | **PASS** | `AppState.selfcheck` 20×; smoke Randomize updates hash `p=` |
| O6 | Reset restores defaults | **PASS** | Selfcheck defaults; smoke Reset |
| O7 | PNG export | **PASS** | Smoke `download` event; file `organimation-*.png` size >500 bytes |
| O8 | Share URL round-trip | **PASS** | `urlState.selfcheck`; smoke reload with hash keeps studio + `p=` |
| O9 | FPS warn + density clamp | **PASS** | `FpsMonitor.selfcheck` (25→warn, 15→clamp, recovery); AppShell density step-down; smoke high density 12000 survives with 1 canvas |
| O10 | Credits visible | **PASS** | Studio `.credit-badge` in smoke; README table |
| O11 | Mobile usable layout | **PASS** | Smoke 390×844; Randomize height ≥40px; stacked CSS |

## Integration cases (PLAN Phase 6)

| Case | Result | Evidence |
|------|--------|----------|
| Switch A→B→A | **PASS** | Smoke: one canvas each step; titles differ A/B |
| Randomize then share | **PASS** | Smoke hash `p=` + reload |
| Export after tweak | **PASS** | Smoke PNG download after randomize/reset path |
| Density stress | **PASS** | FpsMonitor selfcheck + smoke max density render |

## Fidelity gates

| Gate | Result |
|------|--------|
| Gallery+tweak product | PASS |
| Share+PNG+FPS present | PASS |
| ≥3 sketches | PASS |
| No paste/server/GIF in tree | PASS |

## Residual close-out (post Step 14)

| Item | Result |
|------|--------|
| PLAN checklist marked complete | Done |
| Dynamic `import('p5')` code-split | Done (`P5Host`) |
| FpsMonitor selfcheck | Done |
| Hardened smoke (A↔B, PNG bytes) | Done |
| Stage-2 handoff / truth map / error log | `docs/HANDOFF.md`, `TRUTH_MAP.md`, `ERROR_LOG.md` |

## Commands

```bash
npm install
npm run selfcheck
npm run build
npm run preview   # separate terminal
npm run smoke
```

## Post-acceptance residual (2026-07-26 later)

| Item | Result |
|------|--------|
| Sketches 4–5 (`orbital-rects`, `wave-lattice`) | Done |
| Pause/Play + `prefers-reduced-motion` | Done |
| Mobile sticky toolbar / safe-area / skip-link | Done |
| PR CI workflow (`.github/workflows/ci.yml`) | Done |
| GIF / paste auto-sliders | Still deferred (needs new scope) |

## Verdict

**All O1–O11 PASS** with integration cases PASS.  
PLAN_v1 Steps 1–14 complete. Residual content/a11y/CI complete.  
Not claiming broader production readiness beyond this acceptance bar.
