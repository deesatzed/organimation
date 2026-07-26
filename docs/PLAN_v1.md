# organimation — Deterministic Execution Plan (v1)

**Command:** `planning --mode=plan`  
**Inputs:** `docs/REQUIREMENTS_v1.md` (confirmed) · `docs/ARCHITECTURE_ironclad_v1.md`  
**Role:** SWE · Stage 1 · `/build` chain step 3/3  
**User confirmation of requirements:** confirmed  

**Defaults applied for open architecture questions (explicit):**

| Question | Default used in this plan |
|----------|---------------------------|
| Sketch list (first 3) | (1) creatureFlow from notes1.md; (2) HSB point-flow / Lozi-style 2D from notes2 Takagi samples ported to named params; (3) organic particle/wave 2D template original-to-organimation with credit “organimation” |
| FPS thresholds | warn &lt; 30 for ≥1s; auto-clamp density if &lt; 20 for ≥1s |
| URL format | `#/s/<id>?v=1&p=k:v,k:v` compact; 3-decimal numbers; colors `#RRGGBB` |
| Global speed | Every sketch includes `speed` number param |

If any default is wrong, stop before Step 10 (additional sketches) and amend this plan.

---

## Phase 1 — Outcome Framing

### Testable Outcomes

| ID | Outcome | Test |
|----|---------|------|
| O1 | Vite+TS project builds | `npm install && npm run build` exits 0 |
| O2 | Dev server serves app shell | `npm run dev` loads without console errors on home |
| O3 | ≥3 sketches registered and openable | Gallery shows ≥3; each `#/s/<id>` draws canvas |
| O4 | Named params live-update drawing | Change each slider; visual change within 2 frames |
| O5 | Randomize stays in schema ranges | 20× randomize; all values ∈ [min,max] |
| O6 | Reset restores defaults | After randomize, reset equals default snapshot (deep equal) |
| O7 | PNG downloads current frame | Export file non-empty; image matches canvas size |
| O8 | Share URL round-trips state | Set params → Copy link → new load → params within 0.001 abs for numbers |
| O9 | FPS warn + density clamp | Force density max; observe banner and/or clamp when FPS low |
| O10 | Credits visible | Studio shows artist credit; README lists all ported sources |
| O11 | Mobile usable layout | Viewport 390px wide: gallery usable; studio canvas + pane stacked; primary buttons ≥44px |

### Success Criteria (Non-Negotiable)

- Functional: O1–O10  
- Quality: TypeScript strict; no `any` in sketch contracts; no mock sketches  
- Constraints: No server, auth, or paste-auto-slider code paths in v1 tree  
- Stack: vite, typescript, p5, tweakpane only as runtime deps (plus their types)

### Failure Modes (Pre-Mortem)

| Failure Mode | Detection Signal | Mitigation |
|--------------|------------------|------------|
| Global p5 pollution across sketches | Second canvas or wrong sketch draws | Instance mode only; dispose before switch |
| URL state desync | Copy link mid-drag wrong values | Immediate flush on Copy link; debounce only live replace |
| Unseeded random() in ports | Round-trip share not visual-stable | Ban structural random; time-only animation |
| Scope creep (GIF/paste) | New files for gif.js / paste parser | Reject; quarantine backlog only |
| Visual drift from golfed original | Side-by-side mismatch complaints | Credit as “ported/inspired”; document param mapping |
| Type errors late | Build fails at end | Build after each major step |
| Hidden mock data | Fake gallery cards | Registry only real modules |

---

## Phase 2 — System Decomposition

**Must exist:**

1. **Tooling** — package.json, vite, tsconfig, index.html entry  
2. **Sketch contract** — types + registry  
3. **State** — AppState (id + params + listeners)  
4. **Runtime host** — P5Host create/dispose  
5. **Controls** — ParamController (Tweakpane, randomize, reset)  
6. **Navigation** — hash Router + GalleryView + StudioView  
7. **Share** — urlState encode/decode + copy  
8. **Export** — pngExport  
9. **Perf** — FpsMonitor + config thresholds + banner  
10. **Content** — ≥3 SketchModules with credits  
11. **Docs** — README run/credit instructions  
12. **Acceptance** — checklist executed against O1–O11  

**Dependencies:** 1→2→3→4→5→6; 7–8 after 3–4; 9 after 4; 10 after 2–4; 11 anytime after 10; 12 last.

---

## Phase 3 — Deterministic Execution Plan

### Step 1: Scaffold Vite + TypeScript project

- **Action:** Initialize project at repo root with Vite vanilla-ts template (or equivalent manual files). Add dependencies: `p5`, `tweakpane`, `@types/p5`. Enable `strict` TypeScript.  
- **Input:** Empty app tree (notes remain).  
- **Output:** `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.ts` mounts empty `#app`.  
- **Validation:** `npm install` OK; `npm run build` OK; `npm run dev` shows blank shell.  
- **Failure Handling:** If Vite init conflicts with notes, keep notes; do not delete `notes1.md`/`notes2.md`.

### Step 2: Define sketch types and empty registry

- **Action:** Create `src/sketches/types.ts` and `src/sketches/registry.ts` per architecture contract (including required `densityKey`/`maxDensity` nullable, `renderPolicy.clearEachFrame`, `speed` in every schema).  
- **Input:** `docs/ARCHITECTURE_ironclad_v1.md` §5 + B4.  
- **Output:** Types compile; `listSketches()` returns `[]`.  
- **Validation:** `npm run build` OK.  
- **Failure Handling:** If p5 types clash, use `import type p5 from 'p5'` and instance typing from docs.

### Step 3: Implement AppState

- **Action:** `src/app/AppState.ts` — `sketchId`, `params`, `setSketch`, `setParam`, `setParams`, `randomize`, `reset`, `subscribe`, `getSnapshot`, `getDefaultsFor`. Clamp on all writes via `src/runtime/clamps.ts`.  
- **Input:** ParamSchema types.  
- **Output:** Unit-testable state module (manual assert script or tiny node/tsx checks optional; at minimum build).  
- **Validation:** Manual: set/get/randomize/reset logic verified in a small `src/app/AppState.selfcheck.ts` run via `npx tsx` OR assert functions exported and called from dev-only button later — prefer pure functions testable without DOM.  
- **Failure Handling:** If randomize unbounded, fix clamps before continuing.

### Step 4: Implement P5Host

- **Action:** `src/runtime/P5Host.ts` — mount instance-mode sketch into element; `dispose()` removes canvas and listeners; draw reads `getParams()` each frame; optional try/catch error callback.  
- **Input:** SketchModule.create, AppState getter.  
- **Output:** Host API `mount(module, el, getParams)`, `dispose()`.  
- **Validation:** With temporary inline sketch (next step) canvas appears; dispose leaves zero canvas children.  
- **Failure Handling:** On throw, show error strip; do not leave half-mounted instance.

### Step 5: Port sketch #1 creatureFlow

- **Action:** Expand notes1 creature into `src/sketches/creatureFlow.ts` with English params: at least `speed`, `density` (or point count), body/wave/curl-related numbers, stroke alpha, background. Map golfed constants to labeled ranges. Credit fields for source inspiration.  
- **Input:** `notes1.md` expanded code.  
- **Output:** Registered module `id: 'creature-flow'`.  
- **Validation:** Mount alone; animation runs; each param changes look.  
- **Failure Handling:** If too slow at default density, lower default and set `maxDensity`.

### Step 6: ParamController + Studio chrome (single sketch)

- **Action:** Wire Tweakpane from schema; buttons Randomize, Reset, Export PNG (stub OK until step 9), Copy link (stub until step 8).  
- **Input:** AppState, active module.  
- **Output:** Live controls update state → canvas.  
- **Validation:** O4, O5, O6 for sketch #1.  
- **Failure Handling:** Rebuild pane on schema change only on sketch switch.

### Step 7: Router + GalleryView + AppShell

- **Action:** Hash router `#/` gallery, `#/s/:id` studio. Gallery cards: title, authors, open. Switching sketches disposes previous p5 and loads defaults.  
- **Input:** registry list.  
- **Output:** Navigable shell.  
- **Validation:** Navigate gallery ↔ sketch; no duplicate canvases (INV1).  
- **Failure Handling:** Unknown id → redirect `#/`.

### Step 8: URL state encode/decode + Copy link

- **Action:** `src/share/urlState.ts` per architecture format; on load parse into AppState; on param change debounced hash update; **Copy link** immediate encode + clipboard.  
- **Input:** AppState snapshots.  
- **Output:** O8 pass.  
- **Validation:** Manual round-trip checklist.  
- **Failure Handling:** Malformed `p` → defaults + non-blocking message.

### Step 9: PNG export

- **Action:** `src/share/pngExport.ts` from p5 canvas or host canvas element; download `organimation-<id>-<timestamp>.png`. Disable if no canvas.  
- **Input:** P5Host canvas ref.  
- **Output:** O7 pass.  
- **Failure Handling:** If p5 wraps canvas, export the actual `<canvas>` DOM node.

### Step 10: FpsMonitor + density clamp + banner

- **Action:** Config constants; rolling FPS; banner when &lt;30; if &lt;20 for ≥1s and densityKey set, clamp density downward by step until FPS recovers or min hit.  
- **Input:** P5Host frame hooks or `p.deltaTime`.  
- **Output:** O9 pass under stress.  
- **Failure Handling:** Never clamp non-density keys.

### Step 11: Sketches #2 and #3

- **Action:** Port two additional 2D organic sketches into modules; register; full schemas; credits. Prefer notes2 2D samples over WEBGL.  
- **Input:** notes2 / public #つぶやきProcessing 2D formulas.  
- **Output:** `listSketches().length >= 3`.  
- **Validation:** O3 for all three; O4–O6 each.  
- **Failure Handling:** If WEBGL needed, isolate in separate host path only after 2D trio works — do not block v1 on WEBGL.

### Step 12: Credits UI + README

- **Action:** CreditBadge in studio; README: run instructions, stack, attribution table, out-of-scope list.  
- **Input:** each module.credit.  
- **Output:** O10.  
- **Failure Handling:** Empty authors array fails validation checklist — fill before done.

### Step 13: Responsive CSS + a11y baseline

- **Action:** Desktop two-column studio (canvas | pane); mobile stack; button min 44px; focus styles on buttons; `color-scheme` dark default matching generative aesthetic.  
- **Input:** AppShell structure.  
- **Output:** O11.  
- **Failure Handling:** Tweakpane may overflow — scroll pane container.

### Step 14: Acceptance pass + freeze

- **Action:** Run full checklist O1–O11; fix blockers; no new features.  
- **Input:** Built app.  
- **Output:** `docs/ACCEPTANCE_v1.md` with pass/fail evidence per outcome.  
- **Failure Handling:** Any fail → fix or re-open requirements with user; do not claim complete.

### Fidelity Gates

| After step | Fidelity check (0–1) | Rule |
|------------|----------------------|------|
| 5 | ≥0.90 still gallery+tweak product? | Single sketch OK mid-build |
| 10 | Share+PNG+FPS present? | Must map to I5/I7 |
| 11 | ≥3 sketches? | Hard requirement |
| 14 | No paste/server/GIF leaked in? | Fail if present |

If fidelity &lt; 0.80 → stop, isolate drift, user confirm.

---

## Phase 4 — To-Do Checklist (Operator Mode)

- [x] Step 1: Scaffold Vite + TypeScript; add p5 + tweakpane; build passes
- [x] Step 2: Sketch types + empty registry
- [x] Step 3: AppState + clamps
- [x] Step 4: P5Host mount/dispose
- [x] Step 5: Port creatureFlow sketch #1 + register
- [x] Step 6: ParamController + Studio (randomize/reset)
- [x] Step 7: Router + Gallery + AppShell
- [x] Step 8: URL state + Copy link round-trip
- [x] Step 9: PNG export
- [x] Step 10: FPS monitor + density clamp + banner
- [x] Step 11: Port sketches #2 and #3 + register
- [x] Step 12: Credits UI + README
- [x] Step 13: Responsive CSS + touch targets
- [x] Step 14: Acceptance checklist doc O1–O11 all pass

**Execution status:** Complete (2026-07-26). Residual close-out: FpsMonitor selfcheck, hardened smoke (A↔B, PNG download), dynamic `import('p5')` code-split, Stage-2 handoff docs.

---

## Phase 5 — Anti-Drift Safeguards

- **Checkpoint every 5 steps:** Compare outputs to Requirements I1–I10 and Architecture decisions table.  
- **Forced re-alignment:** On mismatch, return to last green step; do not skip ahead.  
- **DO NOT:**
  - Add accounts, server, paste-auto-sliders, GIF export
  - Use mock gallery entries
  - Switch to React/Next without new ADR + user approval
  - Skip dispose on sketch change
  - Estimate time/cost/revenue in commits or docs
  - Claim production-ready while checklist incomplete

---

## Phase 6 — Verification Harness

### Per-step

- Build must pass after steps 1, 2, 5, 7, 11, 14.

### Integration

| Case | Steps | Expected |
|------|-------|----------|
| Switch A→B→A | 7,11 | Correct sketch; no double canvas |
| Randomize then share | 6,8 | URL loads same numbers |
| Export after tweak | 6,9 | PNG reflects tweak |
| Density stress | 10 | Warn and/or clamp |

### End-to-end (acceptance)

Execute O1–O11 in `docs/ACCEPTANCE_v1.md` with:

- Pass/Fail  
- Evidence (command output or short observation)  
- Date  

**Pass condition:** All O1–O10 Pass; O11 Pass or waived by user in writing.

---

## Phase 7 — Output Format / Execution Contract

This plan is the **playbook**. Execution agents must:

1. Follow steps in order.  
2. Validate each step before the next.  
3. Record failures in an error log with mitigation (project rule).  
4. Not mark complete without Acceptance doc all required Pass.

**Next stage after this plan ships in code:** Stage 2 onboard / Stage 3 enhance as needed — not claimed now.

---

## Plan Confirmation Status

- Requirements: **confirmed** by user  
- Architecture: **accepted for plan** (defaults applied for B5 open items)  
- Plan ready for execution: **yes** (await user go-ahead to implement outside this `/build` Stage 1 chain)

**Suggested next after Stage 1 exit:** implement Steps 1–14 in a coding session, or `/build stage 2` once code exists.
