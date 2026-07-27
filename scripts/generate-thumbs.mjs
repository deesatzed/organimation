/**
 * Generate static gallery GIFs from live sketches (real p5 canvas capture + gifenc).
 *
 * Usage:
 *   npm run build && npm run preview -- --host 127.0.0.1 --port 4173
 *   # other terminal:
 *   npm run thumbs
 *
 * Writes public/thumbs/<sketch-id>.gif
 */
import { chromium } from 'playwright';
import gifenc from 'gifenc';
const { GIFEncoder, quantize, applyPalette } = gifenc;
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'thumbs');
const BASE = process.env.THUMB_URL || 'http://127.0.0.1:4173/';

const SKETCH_IDS = [
  'creature-flow',
  'lozi-flow',
  'ripple-field',
  'orbital-rects',
  'wave-lattice',
  'spiral-bloom',
  'ink-tendrils',
  'pulse-rings',
  'aurora-veil',
];

const FRAME_COUNT = 28;
const FRAME_DELAY_MS = 70;
const SIZE = 220;
const MAX_COLORS = 96;

fs.mkdirSync(OUT, { recursive: true });

async function captureFrames(page, sketchId) {
  await page.goto(`${BASE}#/s/${encodeURIComponent(sketchId)}`, {
    waitUntil: 'networkidle',
    timeout: 60000,
  });
  await page.waitForSelector('.canvas-host canvas', { timeout: 30000 });
  // Let first frames paint
  await page.waitForTimeout(400);

  const frames = [];
  for (let i = 0; i < FRAME_COUNT; i++) {
    const frame = await page.evaluate((size) => {
      const c = document.querySelector('.canvas-host canvas');
      if (!c) return null;
      const off = document.createElement('canvas');
      off.width = size;
      off.height = size;
      const o = off.getContext('2d');
      if (!o) return null;
      o.fillStyle = '#050608';
      o.fillRect(0, 0, size, size);
      o.drawImage(c, 0, 0, size, size);
      const img = o.getImageData(0, 0, size, size);
      return { w: size, h: size, data: Array.from(img.data) };
    }, SIZE);

    if (!frame) throw new Error(`No canvas frame for ${sketchId} @${i}`);
    frames.push(frame);
    await page.waitForTimeout(FRAME_DELAY_MS);
  }
  return frames;
}

function encodeGif(frames) {
  const gif = GIFEncoder();
  frames.forEach((frame, i) => {
    const rgba = new Uint8Array(frame.data);
    const palette = quantize(rgba, MAX_COLORS);
    const index = applyPalette(rgba, palette);
    gif.writeFrame(index, frame.w, frame.h, {
      palette,
      delay: FRAME_DELAY_MS,
      ...(i === 0 ? { repeat: 0 } : {}),
    });
  });
  gif.finish();
  return Buffer.from(gif.bytes());
}

function litRatio(frame) {
  const d = frame.data;
  let lit = 0;
  let s = 0;
  for (let i = 0; i < d.length; i += 4 * 20) {
    s++;
    if (d[i] + d[i + 1] + d[i + 2] > 35) lit++;
  }
  return s ? lit / s : 0;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
page.on('pageerror', (e) => console.error('pageerror', e.message));

let failures = 0;
for (const id of SKETCH_IDS) {
  process.stdout.write(`thumb ${id}… `);
  try {
    const frames = await captureFrames(page, id);
    const best = Math.max(...frames.map(litRatio));
    if (best < 0.008) {
      console.warn(`WARN low content ratio=${best.toFixed(4)}`);
    }
    const buf = encodeGif(frames);
    const outPath = path.join(OUT, `${id}.gif`);
    fs.writeFileSync(outPath, buf);
    console.log(`ok ${buf.length} bytes  lit~${best.toFixed(3)}`);
  } catch (err) {
    failures++;
    console.error('FAIL', err.message || err);
  }
}

await browser.close();

if (failures) {
  console.error(`generate-thumbs: ${failures} failed`);
  process.exit(1);
}
console.log(`generate-thumbs: wrote ${SKETCH_IDS.length} gifs → public/thumbs/`);
