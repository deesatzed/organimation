import type { ParamDef, ParamsMap } from '../sketches/types';
import { clampParams } from '../runtime/clamps';

export interface Palette {
  id: string;
  label: string;
  /** color, bg, strokeAlpha, sat, hue* patches when keys exist */
  patch: ParamsMap;
}

export const PALETTES: Palette[] = [
  {
    id: 'ice',
    label: 'Ice',
    patch: { color: '#74b9ff', bg: 4, strokeAlpha: 160, sat: 75, hueShift: 200, hueBoost: 200 },
  },
  {
    id: 'mint',
    label: 'Mint',
    patch: { color: '#55efc4', bg: 5, strokeAlpha: 150, sat: 70, hueShift: 150, hueBoost: 140 },
  },
  {
    id: 'violet',
    label: 'Violet',
    patch: { color: '#a29bfe', bg: 3, strokeAlpha: 170, sat: 80, hueShift: 270, hueBoost: 280 },
  },
  {
    id: 'sunset',
    label: 'Sunset',
    patch: { color: '#fd79a8', bg: 8, strokeAlpha: 180, sat: 90, hueShift: 330, hueBoost: 20 },
  },
  {
    id: 'gold',
    label: 'Gold',
    patch: { color: '#ffeaa7', bg: 6, strokeAlpha: 200, sat: 85, hueShift: 45, hueBoost: 50 },
  },
  {
    id: 'mono',
    label: 'Mono',
    patch: { color: '#ffffff', bg: 9, strokeAlpha: 96, sat: 0, hueShift: 0, hueBoost: 0 },
  },
];

export function applyPalette(
  schema: ParamDef[],
  current: ParamsMap,
  palette: Palette,
): ParamsMap {
  const keys = new Set(schema.map((d) => d.key));
  const partial: ParamsMap = {};
  for (const [k, v] of Object.entries(palette.patch)) {
    if (keys.has(k)) partial[k] = v;
  }
  return clampParams(schema, { ...current, ...partial });
}
