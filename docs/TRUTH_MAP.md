# organimation — Truth Map (Stage 2 orientation)

Evidence-linked classification of UI surfaces. No mock gallery data.

## Classification key

- **Live** — real code path, real sketch math, real browser APIs  
- **Absent** — not implemented; correctly out of scope or deferred  
- **Orphan** — code without UI or UI without code (none found)

## Surfaces

| UI / capability | Class | Proof |
|-----------------|-------|-------|
| Gallery list | Live | `listSketches()` → three modules in `src/sketches/registry.ts` |
| Open sketch | Live | Router `#/s/:id` → `AppShell.showStudio` → `P5Host.mount` |
| Named sliders | Live | `ParamController` + `paramSchema` |
| Randomize | Live | `randomizeParams` + clamps |
| Reset | Live | `defaultsFromSchema` |
| Copy link | Live | `encodeHash` + clipboard / prompt fallback |
| URL restore | Live | `parseHash` on load; smoke reload |
| Export PNG | Live | `pngExport.ts`; smoke download >500 bytes |
| FPS banner | Live | `FpsBanner` + `FpsMonitor` |
| Density auto-clamp | Live | `AppShell.onFrame` when `shouldClampDensity` |
| Artist credits | Live | `CreditBadge` + README table |
| Login / cloud save | Absent | Requirements out of scope |
| Paste tweet code | Absent | Requirements out of scope |
| GIF export | Absent | Deferred backlog |

## Double-canvas risk

**Mitigation:** instance-mode p5 + `dispose()` before remount; smoke asserts `canvas count === 1` on A→B→A.

## Synth / demo claim scan

No simulated FPS numbers in UI. No placeholder sketch cards. Gallery is empty only if registry is empty (boot asserts `length >= 3`).
