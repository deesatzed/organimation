import type { SketchModule } from '../sketches/types';
import { PASTE_SKETCH_ID } from './buildGolfSketch';

let active: SketchModule | null = null;
let sourceText = '';

export function setPasteSession(module: SketchModule | null, source = ''): void {
  active = module;
  sourceText = source;
}

export function getPasteModule(): SketchModule | undefined {
  return active ?? undefined;
}

export function getPasteSource(): string {
  return sourceText;
}

export function isPasteSketchId(id: string): boolean {
  return id === PASTE_SKETCH_ID;
}

export { PASTE_SKETCH_ID };
