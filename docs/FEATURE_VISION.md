# What would make organimation more fun, useful, interesting?

Thinking from the actual product: non-math people who want hypnotic organic motion they can *own* (tweak, share, keep) without code.

## Jobs to be done

1. **Wow me in 5 seconds** — open link, see motion, want to touch something.  
2. **Make it mine** — change look until it feels personal.  
3. **Keep it / show it** — save, share, post a still, ambient display.  
4. **Explore without fear** — randomize is safe if undo exists.  
5. **Discover more looks** — gallery must feel like a playground, not a menu of three identical cards.

## Feature ideas ranked

### Ship now (browser-only, high leverage) — *this pass*

| Feature | Why it wins |
|---------|-------------|
| **More designs (distinct visual families)** | Variety is the product; same creature 5× is boring |
| **Mood presets** (Calm / Wild / Neon / Night) | Instant “direction” without understanding sliders |
| **Undo** | Makes Randomize playful instead of scary |
| **Local favorites** | Keep “that one perfect version” without accounts |
| **Gallery thumbnails** (real rendered frames) | See before you click — discovery |
| **Fullscreen** | Ambient / party / focus mode |
| **Keyboard shortcuts** | Power users and accessibility of action |
| **Ambient shuffle** | Auto-cycle sketches + randomize for living wallpaper |

### Shipped (enhancement pass)

| Feature | Status |
|---------|--------|
| **WebM 3s loop export** | Done (`Loop 3s` / key V) — real MediaRecorder |
| **Param morph → mood** | Done (`Morph →` / key M) |
| **Pin compare** | Done (freeze left still vs live right) |
| **Mic reactivity** | Done (optional; multiplies speed by audio energy) |
| **Palette kits** | Done (Ice / Mint / Violet / Sunset / Gold / Mono) |

### Still later (optional)

| Feature | Why | Cost / risk |
|---------|-----|-------------|
| **True dual live canvases** | Both sides animate | 2× CPU |
| **GIF export** | Broader sharing than WebM | Encoder size |
| **Seed control** | Reproducible chaos | Only if sketches use seeded RNG |
| **Param morph A↔B custom pins** | User-defined endpoints | UX |

### Needs new product scope

| Feature | Why wait |
|---------|----------|
| Paste golfed tweet → auto-sliders | Big parser + security surface |
| Cloud accounts / multi-device sync | Server, auth |
| Community feed / remix of the day | Moderation + backend |
| Scrape X for new #つぶやきProcessing | ToS, brittle |

## Design principle for new sketches

Each new sketch should be **visually distinct at a glance** (not a recolor of creature-flow):

- Point-field organism  
- Chaotic attractor trail  
- Orbital geometry  
- Wave lattice  
- **Spiral bloom** (new)  
- **Ink tendrils** (new)  
- **Pulse rings** (new)  
- **Aurora veil** (new)

## Success signals (qualitative)

- Someone leaves Ambient Shuffle running on a second monitor  
- Someone favorites 3+ remixes  
- Someone uses Mood before touching a single slider  
- Share links circulate with non-default params  
