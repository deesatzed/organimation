# GOAL — Pendoleum × Organimation Visual Music Instrument

**Created:** 2026-07-30
**Integration repository:** `organimation`
**Musical reference repository:** sibling `../pendoleum` (read-only unless separately authorized)
**Working title:** Pendoleum × Organimation; naming is not a completion gate.

/goal

## OUTCOME

Transform Organimation into a real browser-based visual music instrument that combines Pendoleum's generative musical causality with Organimation's organic visual systems.

The finished instrument must let a musician:

1. **Conduct an organism** by shaping harmony, rhythm, density, energy, motion, and evolution.
2. **Play directly** by using pointer, keyboard, touch, or MIDI gestures to articulate notes and chords.
3. **Perform in hybrid mode** so direct gestures can accent or solo over the continuing generative system without resetting it.
4. **See music expressed as novel imagery** whose motion and form are causally driven by musical structure, not merely by microphone loudness or decorative randomness.
5. **Hear and keep the result** through immediate built-in sound, optional MIDI output, reproducible shared state, and a real audiovisual performance export where the browser supports it.

The default experience is an instrument, not a passive visualizer. A first-time user should be able to produce an intentional audiovisual phrase quickly, while a musician should be able to understand and deliberately shape what the system is doing.

## LOCKED PRODUCT DECISIONS

- The product is **instrument-first**.
- Conducting, direct note play, and hybrid performance are all required.
- Built-in Web Audio is the zero-setup default.
- MIDI/DAW output is an optional first-class path, not a prerequisite for sound.
- Visuals must carry musically meaningful information and must also be playable.
- The existing Organimation sketch registry, parameter model, attribution, sharing, export, undo, morph, palette, reduced-motion, and performance-safety features are assets to preserve or deliberately extend.
- Pendoleum supplies reference behavior for modal layers, equal temperament / Just Intonation, pendulum timing, peak events, MIDI, hard stop, recording, and scale evolution.
- The implementation must be modular TypeScript inside Organimation. Do not paste Pendoleum's monolithic HTML wholesale into the application or combine the projects with an iframe.

## PROOF OF DONE

### A. Design and architecture proof

1. Create and approve a design document under `docs/plans/` before implementation. It must compare at least three integration approaches and record why the selected approach best serves an instrument.
2. The design must define one canonical performance state/event model shared by sound, imagery, MIDI, controls, sharing, and recording.
3. The design must include a mapping table that explains, for every shipped visual-instrument family:
   - which musical events or properties drive which visual properties;
   - which visual gestures generate or transform which musical events;
   - how randomness is seeded, captured, or constrained;
   - how the mapping remains legible enough for intentional performance.
4. Record material architecture and scope decisions in `DECISIONS.md`. Maintain implementation evidence and safe assumptions in `PROGRESS.md`.

### B. Playability proof

1. From a fresh load, the built-in instrument can make audible sound after no more than one explicit audio-unlock gesture plus one performance gesture.
2. **Conduct mode:** at least four musician-facing macro controls produce distinct, audible, and visible changes. They must include harmonic and temporal control, not only volume, color, or animation speed.
3. **Direct-play mode:** pointer/touch and computer keyboard input trigger pitched notes or chords with visible attack, sustain, and release responses.
4. **Hybrid mode:** the generative transport continues while direct notes are played; the direct notes neither restart nor corrupt the generative sequence.
5. A hard **Stop** silences all internal voices, releases scheduled notes, sends MIDI note-offs where applicable, stops transport motion, and leaves no stuck notes or orphaned audio nodes.
6. At least three named starting scenes/presets make substantially different musical and visual results. Each is reversible through Undo or Reset.
7. Surprise/randomize never produces invalid parameter values, unrecoverable silence, unsafe output gain, or an irreversible state.

### C. Musical utility proof

1. The built-in audio engine supports polyphony, explicit attack/release envelopes, master gain protection, and visible audio status.
2. Modal layer selection, root/key, octave/register, tempo/rate, note density, and ET/JI tuning produce verifiably different musical event data.
3. Generative evolution is auditionable and reversible. Evolved material is identified honestly as algorithmically generated; it is not described as objectively better.
4. Optional Web MIDI output:
   - lists real available outputs when permission succeeds;
   - sends matching note-on/note-off data from the canonical performance events;
   - fails with useful status when unsupported, denied, or device-free;
   - is never required for the built-in instrument to work.
5. Share state restores the selected scene, musical controls, visual family, visual controls, and deterministic seed closely enough to reproduce the same setup.

### D. Visual-expression proof

1. Ship at least three visually distinct **visual-instrument families**, not three palette variations of one formula.
2. Across the shipped set, imagery must visibly encode at least:
   - pitch or register;
   - onset and release;
   - velocity/energy;
   - rhythm or phase;
   - harmonic consonance/tension or layer interaction.
3. At least one family must grow persistent imagery from a phrase over time, so a performance leaves a recognizable visual memory rather than only an instantaneous oscilloscope-like response.
4. At least one family must make Pendoleum's pendular/modal relationships newly expressive rather than merely reproducing the existing pendulum canvas.
5. Microphone input may remain an optional modulation source, but it cannot be the primary music-to-image bridge.

### E. Capture, sharing, and evidence proof

1. Export a real audiovisual WebM containing the instrument canvas and built-in audio where supported by the browser.
2. If combined recording is unsupported, the UI must explain the limitation and preserve the existing honest export paths; it must not download a silent file labeled as audiovisual.
3. Preserve PNG, GIF, visual WebM, and share-link behavior unless the approved design explicitly supersedes a control with an equivalent or stronger path.
4. Save a proof packet under `artifacts/instrument-proof/` containing:
   - at least three screenshots showing distinct visual-instrument families;
   - one short audiovisual performance capture;
   - a machine-readable performance-event receipt for a deterministic test phrase;
   - a browser smoke-test result;
   - an acceptance log distinguishing automated, manually observed, hardware-dependent, and unsupported evidence.
5. Do not claim audible quality, expressive value, MIDI hardware success, or recording success from source inspection alone.

### F. Verification commands

The final implementation must make all of these pass from `organimation/`:

```bash
npm run selfcheck
npm run build
npm run smoke
npm run test:instrument
git diff --check
```

`npm run test:instrument` does not exist yet. Add it as a deterministic automated suite covering at minimum:

- performance-event generation;
- ET/JI and modal mapping;
- note lifecycle and all-notes-off behavior;
- conduct, direct-play, and hybrid state transitions;
- music-to-image mapping outputs;
- share-state round trip including seed and musical state;
- browser interaction for audio unlock, gesture play, hard Stop, and export capability/error status.

Automated tests may inspect events, state, nodes, tracks, files, and browser behavior. They must not pretend to have listened to audio or judged fun.

### G. Human experience gate

Before completion, run and record a short structured playtest with at least two sessions:

1. **First-touch session:** reach an intentional audiovisual phrase without reading implementation documentation.
2. **Musician session:** shape a phrase in conduct mode, add a direct-play accent, switch tuning or harmonic material, hard-stop safely, restore the setup from a share link, and capture the result.

Record friction, surprises, failures, and changes made in response. “Fun” is supported only if the playtest records voluntary exploration beyond the minimum instructed path or an explicit positive observation; otherwise report it as unproven and continue improving within scope.

## SCOPE

### May modify

- `organimation/src/**`
- `organimation/scripts/**`
- `organimation/public/**`
- `organimation/docs/**`
- `organimation/artifacts/instrument-proof/**`
- `organimation/package.json`
- `organimation/package-lock.json`
- `organimation/README.md`
- `organimation/GOAL.md`
- `organimation/PROGRESS.md`
- `organimation/DECISIONS.md`
- relevant Organimation test and CI configuration

### May read/reference

- all existing Organimation code and documentation;
- sibling `../pendoleum/index.html`, README, architecture, plans, and assets;
- browser API and dependency primary documentation as needed.

### Do not modify without separate authorization

- sibling `../pendoleum/**`;
- Git history outside new task commits;
- repository remotes, branch protections, Pages settings, secrets, or credentials;
- unrelated projects outside this workspace.

## CONSTRAINTS

- Preserve attribution for every retained or adapted visual formula. New borrowed code or formulas require clear provenance and compatible terms.
- Do not add a backend, accounts, cloud sync, telemetry, scraping, or social feed.
- Do not require a microphone, MIDI device, account, network connection, or paid service for the core instrument.
- Do not add an ML model merely to call the product “smart.” Intelligence must come from understandable musical structure, responsive mappings, safe constraints, useful adaptation, or an evidence-backed need.
- Do not add dependencies unless the approved design identifies a concrete need and records why existing browser APIs and dependencies are insufficient.
- Do not weaken or delete existing tests to make the new system pass.
- Do not silently break old share URLs; migrate them or preserve a compatibility path.
- Do not allow hidden unbounded randomness in musical or structural visual state that prevents sharing, replay, or testing.
- Protect hearing and equipment: conservative default gain, bounded polyphony, bounded MIDI rate, envelopes without clicks, and reliable all-notes-off behavior.
- Respect browser permission boundaries and reduced-motion preferences.
- Keep controls musician-readable. Expose musical intent such as tension, pulse, density, register, and articulation rather than raw implementation constants wherever practical.
- Avoid broad rewrites unrelated to the instrument. Prefer adapters and extraction from proven code.
- Do not call a visual audio-reactive unless real musical/audio data drives it.
- Do not call an export audiovisual unless the saved artifact contains both real visual and audio tracks.

## NON-GOALS

- A full DAW, piano-roll editor, score editor, plugin format, collaboration platform, or cloud service.
- Automatic claims that generated scales are novel in music history.
- Professional mastering, sample-library emulation, or latency guarantees across all browsers and hardware.
- Shipping every existing Organimation sketch as a visual instrument in the first implementation.
- Production deployment during the implementation run; deployment requires separate authorization.

## ITERATION

1. **Orient before editing**
   - Re-read `GOAL.md`, repository truth files, current Git status, recent commits, and both live architectures.
   - Run baseline `npm run selfcheck`, `npm run build`, and `npm run smoke`.
   - Record baseline results and any safe assumptions in `PROGRESS.md`.

2. **Design before implementation**
   - Compare at least three architectures, including:
     - Organimation host with an extracted Pendoleum music engine;
     - a shared audiovisual event engine with adapter-based visual instruments;
     - a looser synchronization bridge.
   - Recommend one, explicitly rejecting decorative-only audio reactivity.
   - Define the performance event model, state ownership, timing clock, audio lifecycle, visual mapping contract, MIDI adapter, serialization, recording graph, and failure behavior.
   - Present the design for user approval. Do not implement before approval.

3. **Build in vertical slices**
   - First: canonical clock, performance events, safe Web Audio voice lifecycle, hard Stop, and tests.
   - Second: one end-to-end visual instrument proving conduct + direct play + hybrid behavior.
   - Third: share/replay determinism and optional MIDI adapter.
   - Fourth: two additional distinct visual-instrument families.
   - Fifth: combined capture, presets, polish, and proof packet.
   - Keep changes small enough that the nearest checks run after every slice.

4. **Use evidence to tune**
   - Validate musical mappings with deterministic event receipts.
   - Validate visual mappings with browser screenshots and state inspection.
   - Validate sound and fun through honest human observation, not automated claims.
   - Measure performance with real browser frames; use existing density clamps and graceful degradation.

5. **Keep Markdown current**
   - Update `PROGRESS.md` after each verified slice with changed files, command results, evidence, assumptions, and remaining risks.
   - Update `DECISIONS.md` whenever architecture, dependency, mapping, compatibility, or scope decisions change.
   - Update README and acceptance documentation only after the corresponding behavior exists.

6. **Review before expansion**
   - After each major slice, inspect for stuck notes, event-loop drift, audio-node leaks, frame-rate regressions, inaccessible controls, serialization loss, and attribution drift.
   - Fix failed proof before adding the next family or feature.

## STOP

Pause implementation and report the exact blocker if:

- a destructive action, production deployment, credential, secret, external account, or protected setting is required;
- browser audio/MIDI/recording behavior creates a sensitive-data or equipment-safety risk;
- source licensing or attribution is materially uncertain;
- a product decision would materially expand or change the locked scope;
- the selected architecture cannot support all three performance modes without a broad rewrite;
- required verification cannot be executed and no honest alternate proof exists;
- the same blocking failure remains after three distinct, documented mitigation attempts;
- existing user changes overlap the same files in a way that cannot be safely preserved.

Unsupported MIDI hardware or a denied optional permission is not itself a blocker if the fallback behavior is correct and honestly evidenced.

## COMPLETE

Mark this goal complete only when:

1. Every applicable item in **PROOF OF DONE** has current evidence.
2. All five verification commands exit successfully.
3. The proof packet exists and matches the implementation.
4. Conduct, direct-play, and hybrid performance all work with built-in sound.
5. At least three musically causal, visually distinct instrument families work.
6. Hard Stop leaves no audible/stuck internal or MIDI notes.
7. Share/replay and honest audiovisual export behavior are verified.
8. Existing Organimation capabilities have no unexplained regression.
9. `PROGRESS.md`, `DECISIONS.md`, README, and acceptance evidence reflect current truth.
10. The final report separates verified behavior, manual observations, hardware-dependent paths, limitations, and deferred work.

Partial demos, silent visual recordings, source-only inspection, mocked audio/MIDI, or a single reactive sketch do not satisfy this goal.

## WORKING ASSUMPTIONS

- Organimation is the integration target because its modular TypeScript/p5 architecture, state model, sketch registry, exports, and browser test surface are better suited to a multi-family instrument.
- Pendoleum remains a clean sibling reference and is not edited as part of this goal.
- Built-in sound is prioritized for immediate play; MIDI remains optional and meaningful.
- “Smart” means musically informed, responsive, constrained, explainable, and reproducible—not necessarily AI-powered.
- The first release remains a static, local-capable browser application.
