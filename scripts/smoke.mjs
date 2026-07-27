/**
 * Browser smoke against preview server (http://127.0.0.1:4173).
 * Covers PLAN integration cases + acceptance O2–O11 evidence.
 */
import { chromium } from 'playwright';

const BASE = process.env.SMOKE_URL || 'http://127.0.0.1:4173/';

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function openCard(page, index) {
  await page.locator('.gallery-card').nth(index).click();
  await page.waitForSelector('.canvas-host canvas', { timeout: 15000 });
  await page.waitForTimeout(300);
}

async function canvasCount(page) {
  return page.locator('.canvas-host canvas').count();
}

async function goGallery(page) {
  await page.getByRole('button', { name: '← Gallery' }).click();
  await page.waitForSelector('.gallery-card', { timeout: 10000 });
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text());
});

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForSelector('.gallery-card', { timeout: 10000 });
const cards = await page.locator('.gallery-card').count();
assert(cards >= 9, `gallery cards ${cards} (expected ≥9)`);

// --- Integration: Switch A→B→A, single canvas ---
await openCard(page, 0);
const titleA = (await page.locator('.credit-badge strong').innerText()).trim();
assert((await canvasCount(page)) === 1, 'A: one canvas');
await goGallery(page);
await openCard(page, 1);
const titleB = (await page.locator('.credit-badge strong').innerText()).trim();
assert(titleA !== titleB, `A/B titles should differ: ${titleA} vs ${titleB}`);
assert((await canvasCount(page)) === 1, 'B: one canvas');
await goGallery(page);
await openCard(page, 0);
assert((await page.locator('.credit-badge strong').innerText()).trim() === titleA, 'back to A');
assert((await canvasCount(page)) === 1, 'A again: one canvas');

// Credit + drawn pixels
const credit = await page.locator('.credit-badge').innerText();
assert(credit.length > 5, 'credit empty');
const hasPixels = await page.evaluate(() => {
  const c = document.querySelector('.canvas-host canvas');
  if (!c) return false;
  const ctx = c.getContext('2d');
  if (!ctx) return false;
  const data = ctx.getImageData(0, 0, Math.min(c.width, 50), Math.min(c.height, 50)).data;
  for (let i = 0; i < data.length; i++) if (data[i] !== 0) return true;
  return false;
});
assert(hasPixels, 'canvas appears blank');

// Randomize → share hash
await page.getByRole('button', { name: 'Randomize' }).click();
await page.waitForTimeout(350);
const hashAfterRand = await page.evaluate(() => location.hash);
assert(hashAfterRand.includes('/s/'), `hash after rand ${hashAfterRand}`);
assert(hashAfterRand.includes('p='), `params missing in hash ${hashAfterRand}`);

await page.getByRole('button', { name: 'Copy link' }).click();
await page.waitForTimeout(200);
const hashAfterCopy = await page.evaluate(() => location.hash);

// Round-trip reload
await page.goto(`${BASE}${hashAfterCopy}`, { waitUntil: 'networkidle' });
await page.waitForSelector('.canvas-host canvas', { timeout: 15000 });
const hashReloaded = await page.evaluate(() => location.hash);
assert(hashReloaded.includes('/s/'), 'reload studio');
assert(hashReloaded.includes('p='), 'reload keeps params');

// Reset
await page.getByRole('button', { name: 'Reset' }).click();
await page.waitForTimeout(200);

// Pause / Play control present
const pause = page.getByRole('button', { name: /Pause|Play/ });
await pause.click();
await page.waitForTimeout(100);
const pauseLabel = await pause.innerText();
assert(pauseLabel === 'Play' || pauseLabel === 'Pause', `pause label ${pauseLabel}`);
await pause.click();

// PNG export actually downloads
const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
await page.getByRole('button', { name: 'Export PNG' }).click();
const download = await downloadPromise;
const fname = download.suggestedFilename();
assert(fname.endsWith('.png'), `png name ${fname}`);
assert(fname.startsWith('organimation-'), `png prefix ${fname}`);
const path = await download.path();
assert(path, 'download path missing');
const fs = await import('node:fs');
const size = fs.statSync(path).size;
assert(size > 500, `png too small: ${size} bytes`);

// Density stress: force low FPS path by setting max density via URL then observe UI stays alive
// (Live FPS clamp is hardware-dependent; ensure max density still renders 1 canvas)
const maxDensityHash = '#/s/creature-flow?v=1&p=speed:1,density:12000';
await page.goto(`${BASE}${maxDensityHash}`, { waitUntil: 'networkidle' });
await page.waitForSelector('.canvas-host canvas', { timeout: 15000 });
await page.waitForTimeout(1500);
assert((await canvasCount(page)) === 1, 'high density: one canvas');
// Banner may or may not show; if shown, text is non-empty
const bannerVisible = await page.locator('.fps-banner:not([hidden])').count();
if (bannerVisible > 0) {
  const text = await page.locator('.fps-banner').innerText();
  assert(text.toLowerCase().includes('fps') || text.toLowerCase().includes('slow'), text);
}

// All gallery sketches open
await goGallery(page).catch(async () => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('.gallery-card');
});
// Ensure gallery
if ((await page.locator('.gallery-card').count()) === 0) {
  await page.goto(`${BASE}#/`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.gallery-card');
}
const count = await page.locator('.gallery-card').count();
for (let i = 0; i < count; i++) {
  await openCard(page, i);
  assert((await canvasCount(page)) === 1, `sketch ${i}: one canvas`);
  await goGallery(page);
}

// Mobile layout
await page.setViewportSize({ width: 390, height: 844 });
await openCard(page, 0);
const btnBox = await page.getByRole('button', { name: 'Randomize' }).boundingBox();
assert(btnBox && btnBox.height >= 40, `touch target height ${btnBox?.height}`);

const fatal = errors.filter(
  (e) =>
    !e.includes('Clipboard') &&
    !e.includes('NotAllowedError') &&
    !e.includes('ResizeObserver'),
);
assert(fatal.length === 0, `page errors: ${fatal.join(' | ')}`);

console.log('smoke: PASS', {
  cards,
  switchAB: `${titleA} → ${titleB} → ${titleA}`,
  pngBytes: size,
  pngName: fname,
  hashSample: hashAfterRand.slice(0, 80),
  fpsBannerSeen: bannerVisible > 0,
});

await browser.close();
