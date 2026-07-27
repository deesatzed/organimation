/**
 * Extract numeric literals from golfed JS, string/comment aware.
 * Real scanner — no fake placeholders.
 */

export interface NumberSlot {
  index: number;
  start: number;
  end: number;
  value: number;
  raw: string;
}

const MAX_SLOTS = 48;

/**
 * Scan source and collect number slots (left-to-right).
 * Skips content inside ' " ` strings and // /* comments.
 */
export function extractNumberSlots(source: string, max = MAX_SLOTS): NumberSlot[] {
  const slots: NumberSlot[] = [];
  let i = 0;
  const n = source.length;
  let state: 'code' | 'sq' | 'dq' | 'tpl' | 'line' | 'block' = 'code';

  while (i < n && slots.length < max) {
    const c = source[i]!;
    const next = source[i + 1];

    if (state === 'line') {
      if (c === '\n') state = 'code';
      i++;
      continue;
    }
    if (state === 'block') {
      if (c === '*' && next === '/') {
        state = 'code';
        i += 2;
        continue;
      }
      i++;
      continue;
    }
    if (state === 'sq') {
      if (c === '\\') {
        i += 2;
        continue;
      }
      if (c === "'") state = 'code';
      i++;
      continue;
    }
    if (state === 'dq') {
      if (c === '\\') {
        i += 2;
        continue;
      }
      if (c === '"') state = 'code';
      i++;
      continue;
    }
    if (state === 'tpl') {
      if (c === '\\') {
        i += 2;
        continue;
      }
      if (c === '`') state = 'code';
      i++;
      continue;
    }

    // code
    if (c === '/' && next === '/') {
      state = 'line';
      i += 2;
      continue;
    }
    if (c === '/' && next === '*') {
      state = 'block';
      i += 2;
      continue;
    }
    if (c === "'") {
      state = 'sq';
      i++;
      continue;
    }
    if (c === '"') {
      state = 'dq';
      i++;
      continue;
    }
    if (c === '`') {
      state = 'tpl';
      i++;
      continue;
    }

    // number: optional leading . or digits
    if (isDigit(c) || (c === '.' && next !== undefined && isDigit(next))) {
      // avoid matching the "2" in "x2" identifiers — require non-identifier before
      if (i > 0 && isIdentPart(source[i - 1]!)) {
        i++;
        continue;
      }
      const start = i;
      if (c === '.') {
        i++;
        while (i < n && isDigit(source[i]!)) i++;
      } else {
        while (i < n && isDigit(source[i]!)) i++;
        if (i < n && source[i] === '.') {
          i++;
          while (i < n && isDigit(source[i]!)) i++;
        }
      }
      // exponent
      if (i < n && (source[i] === 'e' || source[i] === 'E')) {
        let j = i + 1;
        if (j < n && (source[j] === '+' || source[j] === '-')) j++;
        if (j < n && isDigit(source[j]!)) {
          i = j;
          while (i < n && isDigit(source[i]!)) i++;
        }
      }
      // trailing identifier? e.g. 10px — skip as non-number for JS (invalid anyway)
      if (i < n && isIdentStart(source[i]!)) {
        continue;
      }
      const raw = source.slice(start, i);
      const value = Number(raw);
      if (Number.isFinite(value)) {
        slots.push({
          index: slots.length,
          start,
          end: i,
          value,
          raw,
        });
      }
      continue;
    }

    i++;
  }

  return slots;
}

/** Replace slots with __P[i] from the end so indices stay valid. */
export function injectParamSlots(source: string, slots: NumberSlot[]): string {
  const ordered = [...slots].sort((a, b) => b.start - a.start);
  let out = source;
  for (const s of ordered) {
    out = out.slice(0, s.start) + `__P[${s.index}]` + out.slice(s.end);
  }
  return out;
}

export function rangeForValue(v: number): { min: number; max: number; step: number } {
  if (!Number.isFinite(v)) return { min: 0, max: 1, step: 0.01 };
  if (v === 0) return { min: -10, max: 10, step: 0.1 };

  const a = Math.abs(v);
  if (Number.isInteger(v) && a <= 32) {
    return { min: v - 32, max: v + 32, step: 1 };
  }
  if (a >= 1000) {
    return {
      min: Math.max(0, Math.floor(v - a)),
      max: Math.ceil(v + a),
      step: Math.max(1, Math.round(a / 50)),
    };
  }
  if (a >= 10) {
    return {
      min: v - a * 2,
      max: v + a * 2,
      step: a >= 50 ? 1 : 0.1,
    };
  }
  return {
    min: v - a * 3,
    max: v + a * 3,
    step: 0.01,
  };
}

function isDigit(c: string): boolean {
  return c >= '0' && c <= '9';
}

function isIdentStart(c: string): boolean {
  return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_' || c === '$';
}

function isIdentPart(c: string): boolean {
  return isIdentStart(c) || isDigit(c);
}
