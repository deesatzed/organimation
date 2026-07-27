import { auroraVeil } from './auroraVeil';
import { creatureFlow } from './creatureFlow';
import { inkTendrils } from './inkTendrils';
import { loziFlow } from './loziFlow';
import { orbitalRects } from './orbitalRects';
import { pulseRings } from './pulseRings';
import { rippleField } from './rippleField';
import { spiralBloom } from './spiralBloom';
import { waveLattice } from './waveLattice';
import type { SketchModule } from './types';

const sketches: SketchModule[] = [
  creatureFlow,
  loziFlow,
  rippleField,
  orbitalRects,
  waveLattice,
  spiralBloom,
  inkTendrils,
  pulseRings,
  auroraVeil,
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
