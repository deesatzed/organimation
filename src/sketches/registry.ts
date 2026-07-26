import { creatureFlow } from './creatureFlow';
import { loziFlow } from './loziFlow';
import { rippleField } from './rippleField';
import type { SketchModule } from './types';

const sketches: SketchModule[] = [creatureFlow, loziFlow, rippleField];

const byId = new Map<string, SketchModule>(sketches.map((s) => [s.id, s]));

export function listSketches(): SketchModule[] {
  return sketches.slice();
}

export function getSketch(id: string): SketchModule | undefined {
  return byId.get(id);
}

export function sketchCount(): number {
  return sketches.length;
}
