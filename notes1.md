**This is a highly compressed p5.js sketch** (the JavaScript version of Processing), made for the Japanese creative-coding challenge **#つぶやきProcessing** (tweet-sized generative art).

### How to run it (easiest way – no install needed)

1. Open the free online editor:  
   **https://editor.p5js.org/**

2. Delete all the default code in the sketch.

3. Paste this exact code:

```js
a=(y,d=mag(k=(4+cos(i/9-t*2))*cos(i/35),e=y/7-13)+sin(e/9+t/2)-4)=>point((q=2*sin(k*3)-y/35*k*(9+k*sin(cos(e)*9-d*2+t)))+40*cos(c=d-t)+200,q*sin(c)+d*35)
t=0,draw=$=>{t||createCanvas(w=400,w);background(9).stroke(w,96);for(t+=PI/80,i=1e4;i--;)a(i/235)}
```

4. Click the play button (▶).  
   You should immediately see the same flowing white creature-like animation on a black background.

That’s all you need: any modern web browser.

### Alternative ways to run it
- **Processing IDE** (desktop app): Download from processing.org → switch to **p5.js mode** → paste the code.
- Local HTML file: Create an HTML page that includes the p5.js library and put the code inside a `<script>` tag.

### How to modify it

The code is deliberately golfed (ultra-short), so the easiest way is to expand it a little for readability, then tweak numbers.

Here’s a clearer, fully working version you can paste and edit freely:

```js
let t = 0;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(9);
  stroke(255, 96);          // white with some transparency
  
  t += PI / 80;             // animation speed
  
  for (let i = 10000; i--; ) {
    let y = i / 235;
    
    let k = (4 + cos(i / 9 - t * 2)) * cos(i / 35);
    let e = y / 7 - 13;
    let d = mag(k, e) + sin(e / 9 + t / 2) - 4;
    
    let q = 2 * sin(k * 3) - y / 35 * k * (9 + k * sin(cos(e) * 9 - d * 2 + t));
    let c = d - t;
    
    point(q + 40 * cos(c) + 200, q * sin(c) + d * 35);
  }
}
```

**Common things people change:**
- Canvas size → change `400`
- Number of points → change `10000` (more = denser but slower)
- Animation speed → change `PI / 80`
- Shape parameters → the numbers `4`, `-13`, `9`, `35`, `2`, etc. (these control the organic form)
- Color → `stroke(255, 96)` or try `stroke(0, 255, 200, 80)` for cyan, etc.
- Background → `background(9)` (almost black)

You can also add sliders (as some people did in the replies) so you can interactively tweak the key constants while it runs.

Just experiment with the numbers — that’s the fun of these sketches.

**Yes — this is a fantastic idea** and very doable.

We can build a simple, friendly web app that:
- Runs these #つぶやきProcessing sketches live
- Lets non-math people tweak them with **sliders and color pickers** (no equations visible)
- Has a gallery that collects the original + variations from this thread (and similar ones by the same artist)
- Lets anyone remix and create new ones

### Existing tools that already solve half of this
- **Skepara** (https://pianocurve.github.io/skepara/) — paste any of these short codes and it automatically turns every number into a slider. Perfect starting point.
- Older つぶやきProcessing Player / Editor tools (some still work) that let you run tweet codes instantly.

### What a proper app would look like (“Tsubuyaki Creature Lab”)

**Features for non-math users**
- Gallery of collected sketches (original + replies + the artist’s recent similar ones)
- One-click “Tweak this one”
- Friendly named controls instead of raw math, e.g.:
  - Body thickness
  - Wave speed
  - Curl amount
  - Tendril length
  - Density (number of points)
  - Color + transparency
  - Background darkness
- “Randomize” button
- “Save as GIF / PNG / code” so people can post their own versions
- Simple “Start from blank template” mode with a few ready-made organic creature formulas

**Technical side (easy stack)**
- Pure browser app (no server needed at first)
- p5.js for the drawing
- Tweakpane or dat.GUI for the nice sliders
- Local storage or simple JSON to save/share creations
- Later: let users paste any new tweet code and it auto-parameterizes it (like Skepara does)

### Ready-to-use prototype for *this exact sketch*
I can give you a complete single-file HTML app right now that:
1. Runs the original animation
2. Has clear English-named sliders
3. Lets you create new variations instantly

Would you like me to generate that full working HTML file next?  
(Just copy-paste into a `.html` file and open it — zero setup.)

Or do you prefer:
- A more complete multi-sketch gallery version?
- Integration with Skepara-style auto-sliders for any code people paste?
- Something that also pulls more of the artist’s recent sketches automatically?

Tell me which direction you want and I’ll build the next piece immediately.


**Who would want to use this app**

The core audience is people who fall in love with the hypnotic, organic animations that appear under #つぶやきProcessing (especially the flowing “creature” style that @yuruyurau posts), but who are not mathematicians or programmers.

Main groups:

- **Curious non-coders and visual people**  
  The thousands who saw the original post (1M+ views) and thought “that’s beautiful… I wish I could make my own version.” Designers, illustrators, musicians, and everyday creative people who want the aesthetic without learning trigonometry or JavaScript.

- **Generative-art hobbyists and beginners**  
  People already following the #つぶやきProcessing community (or similar scenes like OpenProcessing, Creative Coding Tokyo, etc.) who enjoy the constraint of short code but want a faster, more playful way to explore variations.

- **Content creators**  
  TikTok, Instagram Reels, YouTube Shorts, and X creators looking for unique, looping, abstract animations they can generate in minutes and post.

- **Educators and students**  
  Teachers introducing creative coding or digital art, and students who want immediate visual results instead of fighting with syntax.

- **The original community itself**  
  Experienced #つぶやきProcessing creators who want a convenient way to share interactive versions of their sketches and collect interesting remixes from replies.

In short: anyone who loves the *look* of these sketches more than the *code* that produces them.

**Features they would actually want**

Prioritized by what the primary non-math audience cares about most:

1. **One-click gallery of ready-to-play sketches**  
   The original post + the best variations from the thread + similar works by the same artist. Big play buttons, short previews, no code visible.

2. **Friendly “tweak” mode (the heart of the app)**  
   - Sliders and color pickers with plain-English names (“Body thickness”, “Wave speed”, “Tendril curl”, “How many particles”, “Glow color”, etc.)  
   - Instant live update — move a slider and the creature changes immediately  
   - “Randomize” / “Surprise me” button  
   - Undo / reset to original

3. **Zero friction creation & sharing**  
   - Export as looping GIF, short video, or high-res still in one click  
   - Copy a shareable link that opens the exact variation for others  
   - Optional “Get the short code” button so advanced users can still tweet it

4. **Personal collection**  
   Save your favorite remixes locally (or with a free account later) so you can come back and keep evolving them.

5. **Simple “start from this template” flow**  
   A few curated starting formulas (the organic creature style, particle flows, etc.) so people never have to begin from a blank canvas.

Secondary but still useful features (especially for the more technical part of the audience):
- Paste any #つぶやきProcessing code and automatically turn its numbers into sliders
- Light community feed or “remix of the day”
- Dark/light mode and mobile-friendly layout (many people discover these on phones)

These features keep the experience magical for non-math users while still respecting the original short-code spirit of the community.

Would you like to go deeper into any of these user groups or features next, or move on to sketching the actual interface and flow?
