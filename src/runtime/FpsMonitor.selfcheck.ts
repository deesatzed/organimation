/**
 * FpsMonitor threshold self-check (no DOM).
 * Run: npx tsx src/runtime/FpsMonitor.selfcheck.ts
 */
import { AppConfig } from '../config';
import { FpsMonitor } from './FpsMonitor';

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg);
}

const mon = new FpsMonitor();
let t = 0;

// Healthy FPS — no warn/clamp
for (let i = 0; i < 30; i++) {
  t += 50;
  mon.push(60, t);
}
let s = mon.getStatus();
assert(!s.warn, 'healthy should not warn');
assert(!s.shouldClampDensity, 'healthy should not clamp');
assert(s.fps > 50, `fps ${s.fps}`);

// Warn band: 20–30 for >1s window
mon.reset();
t = 0;
for (let i = 0; i < 25; i++) {
  t += 50; // 1.25s span
  mon.push(25, t);
}
s = mon.getStatus();
assert(s.warn, '25 FPS sustained should warn');
assert(!s.shouldClampDensity, '25 FPS should not clamp density');

// Clamp band: <20 for >1s
mon.reset();
t = 0;
for (let i = 0; i < 25; i++) {
  t += 50;
  mon.push(15, t);
}
s = mon.getStatus();
assert(s.warn, '15 FPS should warn');
assert(s.shouldClampDensity, '15 FPS sustained should clamp');

// Recovery clears flags after healthy samples
for (let i = 0; i < 25; i++) {
  t += 50;
  mon.push(60, t);
}
s = mon.getStatus();
assert(!s.warn, 'recovered should not warn');
assert(!s.shouldClampDensity, 'recovered should not clamp');

// Invalid samples ignored
mon.reset();
mon.push(NaN, 1);
mon.push(-1, 2);
mon.push(0, 3);
s = mon.getStatus();
assert(s.fps === 60, 'default until valid sample');

assert(AppConfig.fpsWarnThreshold === 30, 'config warn');
assert(AppConfig.fpsClampThreshold === 20, 'config clamp');

console.log('FpsMonitor.selfcheck: PASS');
