# organimation — Elicited Requirements (v1)

**Source:** `/build` Stage 1 · `planning --mode=interview`  
**Role:** SWE  
**User confirmation:** confirmed  
**Date:** 2026-07-26

## Elicited Requirements

- **Goal:** Browser playground for organic #つぶやきProcessing-style animations: multi-sketch gallery + friendly tweak mode for non-math users.
- **Scope (in):**
  - Vite + TypeScript + p5.js + Tweakpane
  - Curated gallery of 3–5 hand-ported organic sketches (readable TS modules with named params)
  - English-named sliders, color pickers as needed
  - Randomize + reset to original
  - PNG still export
  - Shareable URL encoding slider/state params (no server)
  - Density/point-count caps + FPS warning when slow
  - Artist attribution in UI + README for ported sketches
  - Desktop-first layout; mobile usable
- **Scope (out):**
  - User accounts / auth
  - Backend / server
  - Auto-paste golfed tweet code → auto-sliders (Skepara-style deferred)
- **Constraints:**
  - Real implementation only (no mock, placeholders, or simulated gallery data beyond curated real sketch modules)
  - Static-hostable (Vite build → static assets)
  - No time/cost/revenue estimates in plans
- **Edge Cases:**
  - High density / low FPS → clamp + warn, keep running
  - Invalid or partial share URL → fall back to sketch defaults safely
  - Missing/unknown sketch id in URL → gallery home or first sketch
- **Acceptance Criteria (done bar):**
  - Gallery → open sketch → tweak → PNG download works
  - Share URL restores the same sketch + param state
  - ≥3 sketches fully parameterized and runnable
  - TypeScript / Vite production build succeeds
  - Credits visible per sketch (UI) and in README
- **Open Questions:**
  - Exact set of 3–5 source sketches / artists (to be fixed in architecture/plan)
  - GIF/video export deferred unless re-scoped later
- **User Confirmation:** confirmed
