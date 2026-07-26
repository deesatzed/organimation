import type p5 from 'p5';
import { AppConfig } from '../config';
import type { ParamsMap, SketchModule } from './types';
import { num, str } from './types';

/**
 * Original organimation organic particle/wave field (plan default sketch #3).
 * Deterministic given params + time only.
 */
export const rippleField: SketchModule = {
  id: 'ripple-field',
  credit: {
    title: 'Ripple Field',
    authors: [{ name: 'organimation' }],
    sourceNote: 'Original organimation template in the organic #つぶやきProcessing aesthetic.',
  },
  densityKey: 'density',
  maxDensity: 10000,
  renderPolicy: { clearEachFrame: true },
  paramSchema: [
    { key: 'speed', label: 'Pulse speed', type: 'number', default: 1, min: 0.1, max: 3, step: 0.05 },
    { key: 'density', label: 'Particle count', type: 'number', default: 5000, min: 800, max: 10000, step: 200 },
    { key: 'rings', label: 'Ring count', type: 'number', default: 6, min: 2, max: 14, step: 1 },
    { key: 'warp', label: 'Warp', type: 'number', default: 1.2, min: 0.2, max: 3, step: 0.05 },
    { key: 'spread', label: 'Spread', type: 'number', default: 140, min: 40, max: 220, step: 5 },
    { key: 'twist', label: 'Twist', type: 'number', default: 0.8, min: 0, max: 2.5, step: 0.05 },
    { key: 'strokeAlpha', label: 'Glow strength', type: 'number', default: 120, min: 20, max: 255, step: 1 },
    { key: 'color', label: 'Glow color', type: 'color', default: '#7ef0ff' },
    { key: 'bg', label: 'Background darkness', type: 'number', default: 8, min: 0, max: 40, step: 1 },
  ],
  create(getParams: () => ParamsMap) {
    return (p: p5) => {
      let t = 0;

      p.setup = () => {
        p.createCanvas(AppConfig.canvasSize, AppConfig.canvasSize);
        p.strokeWeight(1.25);
      };

      p.draw = () => {
        const params = getParams();
        const speed = num(params, 'speed', 1);
        const density = Math.floor(num(params, 'density', 5000));
        const rings = Math.floor(num(params, 'rings', 6));
        const warp = num(params, 'warp', 1.2);
        const spread = num(params, 'spread', 140);
        const twist = num(params, 'twist', 0.8);
        const strokeAlpha = num(params, 'strokeAlpha', 120);
        const color = str(params, 'color', '#7ef0ff');
        const bg = num(params, 'bg', 8);

        p.background(bg);
        const rgb = hexToRgb(color);
        p.stroke(rgb.r, rgb.g, rgb.b, strokeAlpha);

        t += 0.02 * speed;
        const cx = AppConfig.canvasSize / 2;
        const cy = AppConfig.canvasSize / 2;

        for (let i = 0; i < density; i++) {
          const u = i / density;
          const ring = (i % rings) + 1;
          const a = u * Math.PI * 2 * rings + t * twist + ring * 0.4;
          const r =
            spread *
            (0.35 + 0.65 * ring / rings) *
            (1 + 0.15 * Math.sin(a * 3 + t * warp));
          const x = cx + Math.cos(a) * r + Math.sin(t + u * 9) * warp * 6;
          const y = cy + Math.sin(a) * r + Math.cos(t * 0.7 + u * 7) * warp * 6;
          p.point(x, y);
        }
      };
    };
  },
};

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  if (h.length !== 6) return { r: 126, g: 240, b: 255 };
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}
