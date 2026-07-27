import type { ParamDef, ParamsMap } from '../sketches/types';
import { clampParams } from '../runtime/clamps';

export interface Mood {
  id: string;
  label: string;
  /** Partial overrides applied only when keys exist on the sketch schema. */
  patch: ParamsMap;
}

/** Cross-sketch moods — only matching keys apply. */
export const MOODS: Mood[] = [
  {
    id: 'calm',
    label: 'Calm',
    patch: {
      speed: 0.35,
      density: 3500,
      strokeAlpha: 70,
      bg: 6,
      color: '#c8d6e5',
      sat: 40,
    },
  },
  {
    id: 'wild',
    label: 'Wild',
    patch: {
      speed: 2.4,
      density: 10000,
      strokeAlpha: 180,
      curl: 22,
      warp: 2.4,
      twist: 2,
      body: 6,
    },
  },
  {
    id: 'neon',
    label: 'Neon',
    patch: {
      color: '#7ef0ff',
      strokeAlpha: 200,
      bg: 4,
      hueBoost: 180,
      hueShift: 200,
      sat: 100,
    },
  },
  {
    id: 'night',
    label: 'Night',
    patch: {
      bg: 2,
      color: '#a29bfe',
      strokeAlpha: 90,
      speed: 0.7,
      sat: 70,
    },
  },
  {
    id: 'ember',
    label: 'Ember',
    patch: {
      color: '#ff7675',
      bg: 8,
      strokeAlpha: 160,
      speed: 1.2,
      hueBoost: 20,
      hueShift: 15,
    },
  },
];

export function applyMood(schema: ParamDef[], current: ParamsMap, mood: Mood): ParamsMap {
  const keys = new Set(schema.map((d) => d.key));
  const partial: ParamsMap = {};
  for (const [k, v] of Object.entries(mood.patch)) {
    if (keys.has(k)) partial[k] = v;
  }
  return clampParams(schema, { ...current, ...partial });
}
