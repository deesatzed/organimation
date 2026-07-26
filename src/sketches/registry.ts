import { creatureFlow } from './creatureFlow';
import { loziFlow } from './loziFlow';
import { orbitalRects } from './orbitalRects';
import { rippleField } from './rippleField';
import { waveLattice } from './waveLattice';
import type { SketchModule } from './types';

const sketches: SketchModule[] = [
  creatureFlow,
  loziFlow,
  rippleField,
  orbitalRects,
  waveLattice,
];

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
