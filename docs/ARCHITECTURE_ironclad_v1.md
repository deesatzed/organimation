# organimation — Ironclad Architecture Packet (v1)

**Command:** `architecture --mode=ironclad`  
**Inputs:** `docs/REQUIREMENTS_v1.md` (user-confirmed)  
**Role:** SWE · Stage 1 · `/build` chain step 2/3  
**Artifacts:** Pass A design packet + Pass B audit/rewrite

---

# PASS A — Design Packet Construction

## 0. Input Integration Summary

| Input ID | Source snippet | Constraint extracted |
|----------|----------------|----------------------|
| I1 | Multi-sketch gallery + tweak | Primary product surface is gallery → detail/tweak |
| I2 | Vite + TypeScript + p5.js + Tweakpane | Fixed stack; browser SPA; static hostable |
| I3 | 3–5 hand-ported organic sketches | Curated modules; not dynamic paste |
| I4 | English-named sliders; randomize; reset | Param schema + friendly labels required |
| I5 | PNG + share URL params | Client-side export; state ↔ query string |
| I6 | No accounts, no server, no auto-paste | Pure static app; no backend contracts |
| I7 | Cap density + FPS warning | Runtime telemetry + param clamps |
| I8 | Artist credit UI + README | Per-sketch attribution fields mandatory |
| I9 | Desktop-first, mobile usable | Responsive layout; touch-friendly controls |
| I10 | Done: gallery→tweak→PNG+URL; ≥3 sketches; build passes | Hard acceptance gate |

**Assumptions (explicit):**

- A1: Users will open a static site (local `vite` or static host); no SSR required.
- A2: Hand-ported sketches are original authors’ public tweet-code *formulas* rewritten with attribution; legal/credit policy is UI+README credit, not license transfer.
- A3: Share URLs stay within practical browser length for ~10–20 scalar params.
- A4: p5 instance mode is preferred over global mode to avoid multi-sketch collisions.

---

## 1. Problem Frame & Success Criteria

**Problem:** Non-math users want to *play* with organic generative sketches without reading golfed math. The system must make variation immediate, reversible, shareable as stills/links, and honest about origins.

**Success is true when all hold:**

| ID | Criterion | Falsification test |
|----|-----------|-------------------|
| S1 | ≥3 sketches appear in gallery with title + credit + open action | Count gallery items; each opens live canvas |
| S2 | Tweakpane (or equivalent) binds only named params; live redraw | Move each slider; visual change within 1 frame budget |
| S3 | Randomize mutates params within declared ranges | Click randomize ≥5×; all values stay in range |
| S4 | Reset restores ported defaults | After randomize, reset equals default snapshot |
| S5 | PNG download is the current canvas frame | File opens; matches on-screen image |
| S6 | Share URL reloads same sketch id + params | Copy URL → new tab → params match within float tolerance |
| S7 | Density above cap is clamped; low FPS shows warning | Force high density; clamp + banner appear |
| S8 | `npm run build` (Vite) succeeds with zero type errors | CI-equivalent local command exit 0 |

---

## 2. Constraints, Non-Goals & Invariants

**Constraints**

- Stack: Vite, TypeScript, p5.js, Tweakpane only for core UI/runtime (CSS may be plain or minimal utility; no React/Vue required).
- No mock gallery: every gallery entry is a real runnable sketch module.
- No server APIs, auth, analytics backends, or remote sketch fetch in v1.

**Non-goals (quarantine backlog)**

- Auto-parameterize pasted golfed code
- GIF/video export
- User accounts / cloud save
- Community feed / remix of the day
- Live scraping of X/#つぶやきProcessing

**Invariants**

- INV1: One active p5 sketch instance at a time (dispose previous on navigate).
- INV2: Param state is the single source of truth for canvas + URL + controls.
- INV3: Every sketch exports a uniform contract (see §5).
- INV4: Attribution fields are non-empty for ported works.

---

## 3. Candidate Architectures (≥3)

### C1 — Monolithic single HTML + inline modules (no Vite)

- **Pros:** Zero tooling; open file works.
- **Cons:** Violates confirmed stack (I2); weak types; hard multi-sketch scale.
- **Fit:** Reject for v1 given stack lock.

### C2 — Vite SPA + sketch registry + p5 instance mode + Tweakpane (selected candidate)

- **Pros:** Matches stack; hot reload; typed contracts; static deploy.
- **Cons:** Build step; must manage p5 lifecycle carefully.
- **Fit:** High.

### C3 — Vite + React/UI kit wrapping p5

- **Pros:** Rich UI components.
- **Cons:** Extra framework cost for gallery + sliders already covered by Tweakpane; not required by inputs.
- **Fit:** Low for v1 complexity budget.

### C4 — iframe-per-sketch sandbox

- **Pros:** Isolation of global-mode sketches; crash containment.
- **Cons:** Harder shared URL state; heavier; complicates Tweakpane parent control.
- **Fit:** Optional later if untrusted paste lands; not needed for curated ports.

**Selection:** **C2**. ADR below.

---

## 4. Selected Architecture (ADR)

### ADR-001: Vite SPA with Sketch Registry and Unified Param State

- **Status:** Accepted (design)
- **Context:** Need multi-sketch gallery, live tweak, PNG, share URL, no server.
- **Decision:** Single-page app; route by hash or path (`#/sketch/:id`); central `AppState` holds `activeSketchId` + `params`; sketches register via `SketchModule` interface; p5 in instance mode attached to a host `<div>`; Tweakpane built from sketch’s `paramSchema`; URL sync via encode/decode of `{id, params}`; FPS sampled from p5 `draw`.
- **Consequences:** All sketches must be ported to the contract; golfed originals live only as reference comments/credits. Dispose lifecycle mandatory.
- **Rejected alternatives:** C1 (stack), C3 (weight), C4 (premature isolation).

### ADR-002: Hash routing for static hosts

- **Decision:** Use hash routes (`#/`, `#/s/:id`) so any static host works without rewrite rules.
- **Falsify:** Deep link fails on GitHub Pages without 404 fallback → hash avoids that class of failure.

### ADR-003: Param schema drives UI and clamps

- **Decision:** Each param: `key`, `label`, `type` (number|color|boolean), `min/max/step` (numbers), `default`. Clamps applied on set, randomize, and URL decode.
- **Falsify:** Out-of-range URL value appears unbound in UI → fail.

---

## 5. Component Breakdown

```
organimation/
  index.html
  package.json
  vite.config.ts
  src/
    main.ts                 # boot, mount shell
    app/
      AppShell.ts           # layout: header, gallery, studio
      Router.ts             # hash parse/navigate
      AppState.ts           # sketch id + params + listeners
    sketches/
      types.ts              # SketchModule, ParamSchema, Credit
      registry.ts           # id → module map
      creatureFlow.ts       # port #1 (notes1 creature)
      sketchB.ts            # port #2
      sketchC.ts            # port #3
      (+ optional D, E)
    runtime/
      P5Host.ts             # create/destroy p5 instance
      ParamController.ts    # Tweakpane bind + randomize/reset
      FpsMonitor.ts         # rolling FPS + warning flag
      clamps.ts             # apply schema bounds
    share/
      urlState.ts           # encode/decode query or hash params
      pngExport.ts          # canvas.toDataURL download
    ui/
      GalleryView.ts
      StudioView.ts         # canvas host + pane + actions
      CreditBadge.ts
      FpsBanner.ts
    styles/
      main.css
  docs/
    REQUIREMENTS_v1.md
    ARCHITECTURE_ironclad_v1.md
  README.md                 # credits + how to run
```

### SketchModule contract

```ts
type ParamType = 'number' | 'color' | 'boolean';

interface ParamDef {
  key: string;
  label: string;          // English UX name
  type: ParamType;
  default: number | string | boolean;
  min?: number;
  max?: number;
  step?: number;
}

interface SketchCredit {
  title: string;
  authors: { name: string; url?: string }[];
  sourceNote: string;     // e.g. "#つぶやきProcessing inspired / ported"
  licenseNote?: string;
}

interface SketchModule {
  id: string;
  credit: SketchCredit;
  paramSchema: ParamDef[];
  /** Instance-mode p5 sketch factory; reads params via getter */
  create(getParams: () => Record<string, unknown>): (p: p5) => void;
  /** Optional density key for clamp policy */
  densityKey?: string;
  maxDensity?: number;
}
```

### Component contracts

| Component | Responsibility | Inputs | Outputs |
|-----------|----------------|--------|---------|
| Registry | List/get sketches | id | SketchModule |
| AppState | Truth for id+params | events set/randomize/reset/loadURL | subscribe snapshots |
| P5Host | Lifecycle | module, getParams, host el | running canvas; dispose |
| ParamController | Tweakpane + actions | schema, state | UI events → state |
| urlState | Shareability | id+params | string; parse → state |
| pngExport | Still capture | canvas | file download |
| FpsMonitor | Perf signal | p5 frame timing | fps number; warn bool |

---

## 6. Data Flow & State Model

```
[URL hash/query]
      │ load
      ▼
  AppState  ◄──── ParamController (Tweakpane, Randomize, Reset)
      │ subscribe
      ├────────► P5Host.draw reads getParams() each frame
      ├────────► FpsMonitor / FpsBanner
      ├────────► CreditBadge
      └────────► urlState.encode on change (debounced) → history.replaceState/hash
```

**Truth location:** `AppState.params` + `AppState.sketchId` only.  
Canvas pixels are ephemeral. URL is a *projection*, not authority after first load (except explicit navigation).

**Param update path:** UI → clamp(schema) → AppState → (debounced) URL write → next draw uses new params.

**Sketch switch path:** dispose p5 → load defaults (or URL params if same id) → new p5 → rebuild Tweakpane.

---

## 7. Failure Modes & Mitigations

| Failure | Detection | Containment | Recovery |
|---------|-----------|-------------|----------|
| p5 sketch throws in draw | try/catch around draw body; console + UI error strip | dispose instance | “Reload sketch” resets defaults |
| URL too long / parse fail | try decode; length guard | ignore bad keys | defaults for missing; toast “Link incomplete” |
| Unknown sketch id | registry miss | redirect gallery | gallery list |
| FPS collapse | FpsMonitor < threshold for N frames | clamp density param | banner; user reduces density |
| Double p5 globals leak | instance mode + dispose | single host el cleared | assert no second canvas |
| Tweakpane/schema mismatch | build-time type checks + runtime key validation | skip unknown keys | dev assert |
| PNG empty canvas | guard if no canvas | disable export button | re-init sketch |

---

## 8. Clarifying Questions + Risk Exposures

**Questions (non-blocking for design; fix before/during plan execution):**

1. Exact 3–5 sketch sources beyond notes1 creature (artists, code, permission notes)?
2. Preferred public name: “organimation” vs “Tsubuyaki Creature Lab” (notes1)?
3. Float precision in URL (3 decimals vs base64 JSON)?
4. Reduced-motion: pause animation vs keep motion (a11y)?

**Risk exposures**

- R1: Porting golfed code introduces visual drift from originals → keep side-by-side reference in comments + credit honesty.
- R2: WEBGL sketches (notes2 samples) need different host setup → prefer 2D organic set for first 3; WEBGL only if time in plan after 2D solid.
- R3: Tweakpane mobile UX cramped → stack pane under canvas on narrow viewports.
- R4: Share URL param explosion if schema grows → group version byte + short keys.

### Pass A Artifact Bundle

| Artifact | Purpose | Where |
|----------|---------|-------|
| A-SourceMap | Traceability | §0, §4 |
| A-Roadmap | Dependency build order | §1 success + implementation via C2 |
| A-AssumptionList | A1–A4, R1–R4 | §0, §8 |
| A-DriftGate | See § Scope Firewall below | Trace table |

### Scope Firewall (Pass A)

| Element | Source | Direct/Derived | Keep/Remove/Confirm |
|---------|--------|----------------|---------------------|
| Gallery multi-sketch | I1, I3 | Direct | Keep |
| Tweakpane named params | I2, I4 | Direct | Keep |
| PNG export | I5 | Direct | Keep |
| URL state | I5 | Direct | Keep |
| FPS clamp/warn | I7 | Direct | Keep |
| Credits | I8 | Direct | Keep |
| Hash routing | static host need | Derived | Keep |
| Instance-mode p5 | multi-sketch safety | Derived | Keep |
| GIF export | notes1 wishlist | Out of scope I | Remove from v1 |
| Auto-paste | I6 out | — | Remove |
| iframe sandbox | isolation idea | Derived | Confirm later only if paste returns |
| React | rejected C3 | — | Remove |

| Section | Alignment (0–1) | Drift | Action |
|---------|------------------|-------|--------|
| Stack | 1.0 | none | — |
| Features | 0.95 | naming “Creature Lab” optional | Confirm product title |
| Non-goals | 1.0 | GIF explicitly out | — |

---

# PASS B — First-Principles + Alien Goggles Audit & Rewrite

## B1. Faults, Assumptions, Ambiguities Found

1. **Ambiguity:** “3–5 sketches” without fixed list blocks registry completion.
2. **Assumption A3 weak:** long color strings + many floats can blow URL limits on older browsers.
3. **Pass A under-specified render loop contract:** who owns `background()` clear each frame? sketch vs host.
4. **FPS threshold numbers missing:** “warn” without numeric gate is untestable.
5. **Randomize distribution unspecified:** uniform vs log-scale for “organic” params.
6. **Credit URLs may 404** over time — UI must not depend on remote fetch.
7. **Density key optional** creates inconsistent clamp behavior across sketches.
8. **Debounced URL updates** can lose last state if user copies link mid-debounce.
9. **No explicit seed control** — randomize is non-reproducible unless params fully capture state (OK if no hidden RNG in draw; bad if sketch uses `random()` without seed in params).
10. **Mobile “usable”** without min touch target sizes is hand-wavy.

## B2. First-Principles Reconstruction

> Users perceive a changing picture and want to change controls → system must map **named controls → numbers → pixels** each frame.  
> Users want to show a friend the same picture settings → system must serialize **(sketch identity + numbers)** into a URL and invert that map.  
> Users want a frozen image → system must copy **pixel buffer → file**.  
> Multiple formulas must not fight over globals → **one isolated draw function** active.  
> Too many points starve the frame budget → **bound work per frame** and **signal** when bound is hit.  
> Trust requires **who made the formula** visible without network.

Therefore architecture requires:

1. Closed param vector per sketch (no hidden free `random()` affecting structure unless exposed).
2. Deterministic draw given `(params, t)` where `t` is time (time may advance; structure params fixed).
3. Synchronous URL flush on “Copy link” even if live URL is debounced.
4. Every sketch declares `densityKey` + `maxDensity` **required** (not optional) when point-count style load exists; else `maxDensity: null` explicit.
5. Numeric FPS gate: warn if rolling 1s FPS `< 30` for ≥ 1s; clamp density if `< 20` for ≥ 1s (tunable constants in one config module).

## B3. Alien-Goggles Reframe

A non-human designer might not use “gallery of artworks.” Alternatives:

| Alt | Idea | Score vs requirements |
|-----|------|------------------------|
| AG1 | Continuous morph space: one meta-formula, sliders only | Fails multi-sketch (I1/I3) |
| AG2 | Timeline scrubber of params as “music” | Novel; not requested; backlog |
| AG3 | **Selected human shape:** discrete sketch objects + control surface | Matches I1–I10 |

**Divergence kept as insight:** expose **time speed** as a first-class param on every sketch (Derived, high value, still in “tweak” spirit) so “wave speed” is consistent UX across ports.

## B4. Corrective Rewrite (deltas from Pass A)

| Change | Reason |
|--------|--------|
| `densityKey`/`maxDensity` required fields (nullable max) | B1.7 |
| `AppConfig.fpsWarnThreshold=30`, `fpsClampThreshold=20` | B1.4 |
| `copyShareLink()` forces immediate encode (no debounce) | B1.8 |
| Sketch draw must be pure w.r.t. params; forbid unseeded structural `random()` unless param-driven | B1.9 |
| `renderPolicy.clearEachFrame: boolean` on module | B1.3 |
| URL encoding: short keys + 3-decimal numbers; colors as 6-digit hex | B1.2 |
| Product title default **organimation**; subtitle optional | Q2 default |
| Touch targets ≥ 44px for primary actions | B1.10 |
| First three sketches: prioritize 2D ports; WEBGL only as sketch 4–5 if stable | R2 |

**Revised state encode (normative):**

```
#/s/<id>?p=<k1>:<v1>,<k2>:<v2>,...
```

- Unknown keys dropped; missing keys → defaults.
- Version prefix optional: `v=1&p=...` for future schema break.

**Revised sequential build dependency order (for plan mode):**

1. Tooling skeleton (Vite+TS) + empty shell
2. Types + registry + one sketch (creatureFlow)
3. P5Host lifecycle + Studio canvas
4. ParamController + randomize/reset
5. Gallery list + navigation
6. URL encode/decode + copy link
7. PNG export
8. FPS monitor + density clamp + banner
9. Credits UI + README
10. Sketches 2–3 (then 4–5 if capacity)
11. Responsive CSS pass
12. Acceptance test script (manual checklist + build)

## B5. Questions Required Before Further Execution

Non-blocking for writing the deterministic plan; blocking for claiming sketch-complete:

1. **Lock sketch list:** which exact sources for sketches 2–3 (from notes2 / other)?
2. **Confirm FPS numbers:** 30 warn / 20 clamp acceptable?
3. **Confirm URL format:** compact `p=k:v` vs `URLSearchParams` per key?
4. **Time param:** include global `speed` on all sketches? (Recommended Derived: yes)

---

## Drift-Protection Audit (Pass B)

| Rewritten element | Maps to input | Orphan? |
|-------------------|---------------|---------|
| Required density fields | I7 | No |
| copyShareLink sync | I5 | No |
| Pure params draw | I4/S3–S6 reliability | No |
| organimation title | workspace name | No |
| Global speed param | Derived | Flag: confirm in plan interview if needed |
| GIF / paste / accounts | excluded | Correctly absent |

**Pass B Artifact:** `Artifact-Ironclad-PassB-AuditAndRewrite` — this document § PASS B.

---

## Architecture Decision Summary (executable)

| Decision | Choice |
|----------|--------|
| App shape | Vite + TypeScript SPA |
| Drawing | p5.js instance mode, one host |
| Controls | Tweakpane from ParamSchema |
| Routing | Hash `#/` gallery, `#/s/:id` studio |
| State | AppState single truth; URL projection |
| Export | PNG via canvas |
| Share | Compact query on hash route; sync copy |
| Perf | FPS rolling window; warn 30; clamp density 20 |
| Content | ≥3 2D hand-ported modules + credits |
| Forbidden v1 | server, auth, paste-auto-sliders, GIF |

**Ready for:** `planning --mode=plan` using `REQUIREMENTS_v1.md` + this packet.
