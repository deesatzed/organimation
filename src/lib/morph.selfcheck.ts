/**
 * Morph lerp self-check (no DOM).
 * Run: npx tsx src/lib/morph.selfcheck.ts
 */
import type { ParamDef, ParamsMap } from '../sketches/types';
import { morphParams } from './morph';

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg);
}

const schema: ParamDef[] = [
  { key: 'speed', label: 'Speed', type: 'number', default: 1, min: 0, max: 3, step: 0.01 },
  { key: 'color', label: 'Color', type: 'color', default: '#000000' },
  { key: 'on', label: 'On', type: 'boolean', default: false },
];

const from: ParamsMap = { speed: 0, color: '#000000', on: false };
const to: ParamsMap = { speed: 2, color: '#ffffff', on: true };

const mid = morphParams(schema, from, to, 0.5);
assert(Math.abs((mid.speed as number) - 1) < 0.001, `speed mid ${String(mid.speed)}`);
assert(mid.color === '#808080', `color mid ${String(mid.color)}`);
assert(mid.on === true, 'bool switches at 0.5');

const start = morphParams(schema, from, to, 0);
assert((start.speed as number) === 0, 't0 speed');
assert(start.color === '#000000', 't0 color');

const end = morphParams(schema, from, to, 1);
assert((end.speed as number) === 2, 't1 speed');
assert(end.color === '#ffffff', 't1 color');

console.log('morph.selfcheck: PASS');
