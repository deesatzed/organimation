import type { ParamDef, ParamsMap, ParamValue } from '../sketches/types';
import { clampParams } from '../runtime/clamps';

export interface ParsedUrlState {
  sketchId: string | null;
  params: ParamsMap;
  version: number;
  malformed: boolean;
}

/**
 * Format: #/s/<id>?v=1&p=k:v,k:v
 * Also accepts #/ gallery.
 */
export function parseHash(hash: string): ParsedUrlState {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  const [pathPart, queryPart = ''] = raw.split('?');
  const path = pathPart || '/';

  const studioMatch = path.match(/^\/s\/([^/]+)\/?$/);
  if (!studioMatch) {
    return { sketchId: null, params: {}, version: 1, malformed: false };
  }

  const sketchId = decodeURIComponent(studioMatch[1] ?? '');
  const params: ParamsMap = {};
  let version = 1;
  let malformed = false;

  const search = new URLSearchParams(queryPart);
  const v = search.get('v');
  if (v !== null) {
    const n = Number(v);
    if (Number.isFinite(n)) version = n;
  }

  const p = search.get('p');
  if (p) {
    for (const pair of p.split(',')) {
      if (!pair) continue;
      const colon = pair.indexOf(':');
      if (colon <= 0) {
        malformed = true;
        continue;
      }
      const key = decodeURIComponent(pair.slice(0, colon));
      const valRaw = pair.slice(colon + 1);
      try {
        params[key] = decodeParamValue(valRaw);
      } catch {
        malformed = true;
      }
    }
  }

  // Also accept expanded search params for debugging
  for (const [key, val] of search.entries()) {
    if (key === 'v' || key === 'p') continue;
    params[key] = decodeParamValue(val);
  }

  return { sketchId, params, version, malformed };
}

export function encodeHash(
  sketchId: string,
  params: ParamsMap,
  schema: ParamDef[],
): string {
  const ordered = clampParams(schema, params);
  const parts: string[] = [];
  for (const def of schema) {
    const v = ordered[def.key];
    if (v === undefined) continue;
    parts.push(`${encodeURIComponent(def.key)}:${encodeParamValue(def, v)}`);
  }
  const q = new URLSearchParams();
  q.set('v', '1');
  q.set('p', parts.join(','));
  return `#/s/${encodeURIComponent(sketchId)}?${q.toString()}`;
}

export function encodeGalleryHash(): string {
  return '#/';
}

function encodeParamValue(def: ParamDef, value: ParamValue): string {
  if (def.type === 'number' && typeof value === 'number') {
    return Number(value.toFixed(3)).toString();
  }
  if (def.type === 'boolean') {
    return value ? '1' : '0';
  }
  if (def.type === 'color' && typeof value === 'string') {
    const h = value.startsWith('#') ? value.slice(1) : value;
    return h.toLowerCase();
  }
  return encodeURIComponent(String(value));
}

function decodeParamValue(raw: string): ParamValue {
  if (raw === '1' || raw === 'true') return true;
  if (raw === '0' || raw === 'false') return false;
  if (/^[0-9a-fA-F]{6}$/.test(raw)) return `#${raw.toLowerCase()}`;
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw.toLowerCase();
  const n = Number(raw);
  if (raw !== '' && Number.isFinite(n) && /^-?\d+(\.\d+)?$/.test(raw)) return n;
  return decodeURIComponent(raw);
}

export function buildShareUrl(
  sketchId: string,
  params: ParamsMap,
  schema: ParamDef[],
): string {
  const hash = encodeHash(sketchId, params, schema);
  const base = `${window.location.origin}${window.location.pathname}${window.location.search}`;
  return `${base}${hash}`;
}
