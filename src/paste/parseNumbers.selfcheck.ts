/**
 * Run: npx tsx src/paste/parseNumbers.selfcheck.ts
 */
import {
  extractNumberSlots,
  injectParamSlots,
  rangeForValue,
} from './parseNumbers';

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg);
}

const sample = `t=0,draw=$=>{t||createCanvas(w=400,w);background(9).stroke(w,96);for(t+=PI/80,i=1e4;i--;)a(i/235)}`;
const slots = extractNumberSlots(sample);
assert(slots.length >= 5, `expected several slots, got ${slots.length}`);
assert(slots.some((s) => s.value === 400), 'missing 400');
assert(slots.some((s) => s.value === 10000 || s.raw === '1e4'), 'missing 1e4');

// string skip
const withStr = `const s = "400"; x=12`;
const s2 = extractNumberSlots(withStr);
assert(s2.length === 1 && s2[0]!.value === 12, 'should skip string 400');

// comment skip
const withC = `// 999\nx=3`;
const s3 = extractNumberSlots(withC);
assert(s3.length === 1 && s3[0]!.value === 3, 'skip line comment number');

const inj = injectParamSlots('a=1+2', extractNumberSlots('a=1+2'));
assert(inj.includes('__P[0]') && inj.includes('__P[1]'), `inject ${inj}`);

const r = rangeForValue(100);
assert(r.min < 100 && r.max > 100, 'range around 100');

console.log('parseNumbers.selfcheck: PASS', { slots: slots.length });
