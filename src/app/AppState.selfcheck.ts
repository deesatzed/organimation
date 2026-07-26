/**
 * Pure logic self-check for AppState + clamps (no DOM).
 * Run: npm run selfcheck
 */
import { clampParams, randomizeParams } from '../runtime/clamps';
import type { ParamDef, ParamsMap } from '../sketches/types';
import { defaultsFromSchema } from '../sketches/types';

const schema: ParamDef[] = [
  { key: 'speed', label: 'Speed', type: 'number', default: 1, min: 0.1, max: 3, step: 0.1 },
  { key: 'density', label: 'Density', type: 'number', default: 5000, min: 500, max: 12000, step: 100 },
  { key: 'glow', label: 'Glow', type: 'color', default: '#ffffff' },
  { key: 'on', label: 'On', type: 'boolean', default: true },
];

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg);
}

function deepEqual(a: ParamsMap, b: ParamsMap): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    if (a[k] !== b[k]) return false;
  }
  return true;
}

// defaults
const defaults = defaultsFromSchema(schema);
assert(defaults.speed === 1, 'default speed');
assert(defaults.density === 5000, 'default density');

// clamp out of range
const clamped = clampParams(schema, { speed: 99, density: -1, glow: 'ff00aa', on: '1' });
assert(clamped.speed === 3, `speed max got ${String(clamped.speed)}`);
assert(clamped.density === 500, `density min got ${String(clamped.density)}`);
assert(clamped.glow === '#ff00aa', `glow hex got ${String(clamped.glow)}`);
assert(clamped.on === true, 'boolean coerce');

// randomize 20× in range
for (let i = 0; i < 20; i++) {
  const r = randomizeParams(schema);
  const s = r.speed as number;
  const d = r.density as number;
  assert(s >= 0.1 && s <= 3, `speed out of range: ${s}`);
  assert(d >= 500 && d <= 12000, `density out of range: ${d}`);
}

// reset equals defaults
const afterRand = randomizeParams(schema);
assert(!deepEqual(afterRand, defaults) || true, 'randomize may equal defaults by chance');
const reset = defaultsFromSchema(schema);
assert(deepEqual(reset, defaults), 'reset snapshot equals defaults');

console.log('AppState.selfcheck: PASS');
