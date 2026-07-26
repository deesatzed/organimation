import { clampParams, clampValue, randomizeParams } from '../runtime/clamps';
import type { ParamDef, ParamValue, ParamsMap, SketchModule } from '../sketches/types';
import { defaultsFromSchema } from '../sketches/types';
import { getSketch, listSketches } from '../sketches/registry';

export interface AppSnapshot {
  sketchId: string | null;
  params: ParamsMap;
}

type Listener = (snap: AppSnapshot) => void;

export class AppState {
  private sketchId: string | null = null;
  private params: ParamsMap = {};
  private schema: ParamDef[] = [];
  private listeners = new Set<Listener>();

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(): void {
    const snap = this.getSnapshot();
    for (const fn of this.listeners) fn(snap);
  }

  getSnapshot(): AppSnapshot {
    return {
      sketchId: this.sketchId,
      params: { ...this.params },
    };
  }

  getSketchId(): string | null {
    return this.sketchId;
  }

  getParams(): ParamsMap {
    return this.params;
  }

  getSchema(): ParamDef[] {
    return this.schema;
  }

  getModule(): SketchModule | undefined {
    return this.sketchId ? getSketch(this.sketchId) : undefined;
  }

  getDefaultsFor(id: string): ParamsMap {
    const mod = getSketch(id);
    if (!mod) return {};
    return defaultsFromSchema(mod.paramSchema);
  }

  setSketch(id: string, params?: ParamsMap): boolean {
    const mod = getSketch(id);
    if (!mod) return false;
    this.sketchId = id;
    this.schema = mod.paramSchema;
    const base = defaultsFromSchema(mod.paramSchema);
    this.params = clampParams(this.schema, params ? { ...base, ...params } : base);
    this.emit();
    return true;
  }

  setParam(key: string, value: ParamValue): void {
    const def = this.schema.find((d) => d.key === key);
    if (!def) return;
    this.params = { ...this.params, [key]: clampValue(def, value) };
    this.emit();
  }

  setParams(partial: ParamsMap): void {
    this.params = clampParams(this.schema, { ...this.params, ...partial });
    this.emit();
  }

  randomize(): void {
    if (!this.schema.length) return;
    this.params = randomizeParams(this.schema);
    this.emit();
  }

  reset(): void {
    if (!this.schema.length) return;
    this.params = defaultsFromSchema(this.schema);
    this.emit();
  }

  /** First registered sketch id, if any. */
  firstSketchId(): string | null {
    const list = listSketches();
    return list[0]?.id ?? null;
  }
}

export const appState = new AppState();
