import type { ParamDef, ParamValue, ParamsMap } from '../sketches/types';

export function clampValue(def: ParamDef, value: ParamValue): ParamValue {
  if (def.type === 'number') {
    let n = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(n)) {
      n = typeof def.default === 'number' ? def.default : 0;
    }
    if (def.min !== undefined) n = Math.max(def.min, n);
    if (def.max !== undefined) n = Math.min(def.max, n);
    if (def.step !== undefined && def.step > 0 && def.min !== undefined) {
      const steps = Math.round((n - def.min) / def.step);
      n = def.min + steps * def.step;
      // Avoid float dust
      n = Number(n.toFixed(6));
      if (def.max !== undefined) n = Math.min(def.max, n);
      if (def.min !== undefined) n = Math.max(def.min, n);
    }
    return n;
  }

  if (def.type === 'boolean') {
    if (typeof value === 'boolean') return value;
    if (value === 'true' || value === 1 || value === '1') return true;
    if (value === 'false' || value === 0 || value === '0') return false;
    return Boolean(def.default);
  }

  // color
  if (typeof value === 'string') {
    const hex = value.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) return hex.toLowerCase();
    if (/^[0-9a-fA-F]{6}$/.test(hex)) return `#${hex.toLowerCase()}`;
  }
  return typeof def.default === 'string' ? def.default : '#ffffff';
}

export function clampParams(schema: ParamDef[], params: ParamsMap): ParamsMap {
  const out: ParamsMap = {};
  for (const def of schema) {
    const raw = params[def.key] !== undefined ? params[def.key] : def.default;
    out[def.key] = clampValue(def, raw);
  }
  return out;
}

export function randomizeParams(schema: ParamDef[]): ParamsMap {
  const out: ParamsMap = {};
  for (const def of schema) {
    if (def.type === 'number') {
      const min = def.min ?? 0;
      const max = def.max ?? (typeof def.default === 'number' ? def.default : 1);
      const u = min + Math.random() * (max - min);
      out[def.key] = clampValue(def, u);
    } else if (def.type === 'boolean') {
      out[def.key] = Math.random() < 0.5;
    } else {
      const r = () => Math.floor(Math.random() * 256);
      const hex = (n: number) => n.toString(16).padStart(2, '0');
      out[def.key] = `#${hex(r())}${hex(r())}${hex(r())}`;
    }
  }
  return out;
}
