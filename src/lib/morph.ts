import type { ParamDef, ParamsMap, ParamValue } from '../sketches/types';
import { clampParams } from '../runtime/clamps';

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpColor(a: string, b: string, t: number): string {
  const pa = parseHex(a);
  const pb = parseHex(b);
  if (!pa || !pb) return t < 0.5 ? a : b;
  const r = Math.round(lerp(pa.r, pb.r, t));
  const g = Math.round(lerp(pa.g, pb.g, t));
  const bl = Math.round(lerp(pa.b, pb.b, t));
  return `#${hex2(r)}${hex2(g)}${hex2(bl)}`;
}

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.replace('#', '');
  if (h.length !== 6) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function hex2(n: number): string {
  return Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
}

function mixValue(def: ParamDef, a: ParamValue, b: ParamValue, t: number): ParamValue {
  if (def.type === 'number') {
    const na = typeof a === 'number' ? a : Number(a);
    const nb = typeof b === 'number' ? b : Number(b);
    if (!Number.isFinite(na) || !Number.isFinite(nb)) return b;
    return lerp(na, nb, t);
  }
  if (def.type === 'color') {
    const sa = typeof a === 'string' ? a : String(def.default);
    const sb = typeof b === 'string' ? b : String(def.default);
    return lerpColor(sa, sb, t);
  }
  // boolean: switch at midpoint
  return t < 0.5 ? a : b;
}

/** Interpolate params from `from` toward `to` at t∈[0,1], clamped to schema. */
export function morphParams(
  schema: ParamDef[],
  from: ParamsMap,
  to: ParamsMap,
  t: number,
): ParamsMap {
  const u = Math.max(0, Math.min(1, t));
  const out: ParamsMap = {};
  for (const def of schema) {
    const a = from[def.key] !== undefined ? from[def.key]! : def.default;
    const b = to[def.key] !== undefined ? to[def.key]! : def.default;
    out[def.key] = mixValue(def, a, b, u);
  }
  return clampParams(schema, out);
}

export type MorphCancel = () => void;

/**
 * Animate morph over durationMs using requestAnimationFrame.
 * Calls onFrame with intermediate params; onDone at end.
 */
export function runMorph(
  schema: ParamDef[],
  from: ParamsMap,
  to: ParamsMap,
  durationMs: number,
  onFrame: (params: ParamsMap, t: number) => void,
  onDone?: () => void,
): MorphCancel {
  let raf = 0;
  let cancelled = false;
  const start = performance.now();

  const tick = (now: number) => {
    if (cancelled) return;
    const t = Math.min(1, (now - start) / durationMs);
    onFrame(morphParams(schema, from, to, t), t);
    if (t < 1) {
      raf = requestAnimationFrame(tick);
    } else {
      onDone?.();
    }
  };

  raf = requestAnimationFrame(tick);
  return () => {
    cancelled = true;
    cancelAnimationFrame(raf);
  };
}
