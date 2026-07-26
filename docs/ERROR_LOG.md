# organimation — Error Log

Paired errors with mitigations. Append-only style entries.

| When | Error / signal | Source hypothesis | Mitigation / code | Status |
|------|----------------|-------------------|-------------------|--------|
| Scaffold | `npm create vite` cancelled (non-empty dir with notes/docs) | create-vite refuses non-empty root | Manual scaffold of `package.json`, vite, tsconfig, `index.html` | Solved |
| Build | `Property 'addBinding' does not exist on type 'Pane'` | `@tweakpane/core` types not installed; Pane extends FolderApi from core | `npm install @tweakpane/core` as dependency | Solved |
| Selfcheck | URL speed round-trip expected 1.235 got 1.25 | Step clamping on 0.05 grid before encode | Use on-grid values; re-clamp after decode in selfcheck | Solved |
| Runtime residual | Vite chunk >500 kB (p5) | Static import of full p5 | Dynamic `import('p5')` in `P5Host.mount` | Solved (split; main chunk smaller) |
| Smoke (hardening) | PNG not proven as file | Only button enabled check | `waitForEvent('download')` + file size assert | Solved |
| Acceptance note | O9 live FPS banner hardware-dependent | High-end machines stay above 30 FPS | `FpsMonitor.selfcheck` for thresholds; smoke high-density survival | Mitigated |

## Recurring-error protocol

If the same failure appears **more than twice**, stop and list 5–7 causes, pick 1–2, add logs to validate, then fix (project rule). No entry currently meets that threshold.
