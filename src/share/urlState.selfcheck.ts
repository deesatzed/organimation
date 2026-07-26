/**
 * URL encode/decode round-trip self-check (no DOM except optional).
 * Run: npx tsx src/share/urlState.selfcheck.ts
 */
import type { ParamDef, ParamsMap } from '../sketches/types';
import { clampParams } from '../runtime/clamps';
import { encodeHash, parseHash } from './urlState';

const schema: ParamDef[] = [
  { key: 'speed', label: 'Speed', type: 'number', default: 1, min: 0.1, max: 3, step: 0.05 },
  { key: 'density', label: 'Density', type: 'number', default: 5000, min: 500, max: 12000, step: 100 },
  { key: 'color', label: 'Color', type: 'color', default: '#7ef0ff' },
  { key: 'on', label: 'On', type: 'boolean', default: true },
];

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg);
}

const params: ParamsMap = clampParams(schema, {
  speed: 1.25,
  density: 7500,
  color: '#aabbcc',
  on: false,
});

const hash = encodeHash('creature-flow', params, schema);
assert(hash.startsWith('#/s/creature-flow?'), `hash format: ${hash}`);

const parsed = parseHash(hash);
assert(parsed.sketchId === 'creature-flow', 'id');
// Re-clamp after decode the same way AppState does
const roundTripped = clampParams(schema, parsed.params);
assert(Math.abs((roundTripped.speed as number) - 1.25) < 0.001, `speed ${String(roundTripped.speed)}`);
assert(roundTripped.density === 7500, 'density');
assert(roundTripped.color === '#aabbcc', 'color');
assert(roundTripped.on === false, 'bool');

const bad = parseHash('#/s/unknown?v=1&p=:::');
assert(bad.sketchId === 'unknown', 'unknown id still parsed');

const gal = parseHash('#/');
assert(gal.sketchId === null, 'gallery');

console.log('urlState.selfcheck: PASS');
