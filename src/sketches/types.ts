import type p5 from 'p5';

export type ParamType = 'number' | 'color' | 'boolean';

export type ParamValue = number | string | boolean;

export interface ParamDef {
  key: string;
  label: string;
  type: ParamType;
  default: ParamValue;
  min?: number;
  max?: number;
  step?: number;
}

export interface SketchCredit {
  title: string;
  authors: { name: string; url?: string }[];
  sourceNote: string;
  licenseNote?: string;
}

export interface RenderPolicy {
  /** When true, host expects sketch to clear background each frame. */
  clearEachFrame: boolean;
}

export type ParamsMap = Record<string, ParamValue>;

export interface SketchModule {
  id: string;
  credit: SketchCredit;
  paramSchema: ParamDef[];
  /**
   * Instance-mode p5 factory. Draw must be deterministic given params + time.
   * No unseeded structural random().
   */
  create: (getParams: () => ParamsMap) => (p: p5) => void;
  /** Param key for point/work density, or null if N/A. */
  densityKey: string | null;
  /** Hard max for density param, or null if no density. */
  maxDensity: number | null;
  renderPolicy: RenderPolicy;
}

export function defaultsFromSchema(schema: ParamDef[]): ParamsMap {
  const out: ParamsMap = {};
  for (const def of schema) {
    out[def.key] = def.default;
  }
  return out;
}

export function num(params: ParamsMap, key: string, fallback = 0): number {
  const v = params[key];
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

export function str(params: ParamsMap, key: string, fallback = '#ffffff'): string {
  const v = params[key];
  return typeof v === 'string' ? v : fallback;
}

export function bool(params: ParamsMap, key: string, fallback = false): boolean {
  const v = params[key];
  return typeof v === 'boolean' ? v : fallback;
}
