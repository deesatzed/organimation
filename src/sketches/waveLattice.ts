import type p5 from 'p5';
import { AppConfig } from '../config';
import type { ParamsMap, SketchModule } from './types';
import { num, str } from './types';

/**
 * Wave lattice points — inspired by @ntsutae #つぶやきProcessing grid sketches (notes2.md).
 * Scaled to square canvas; deterministic from params + time.
 */
export const waveLattice: SketchModule = {
  id: 'wave-lattice',
  credit: {
    title: 'Wave Lattice',
    authors: [{ name: 'ntsutae @ntsutae', url: 'https://x.com/ntsutae' }],
    sourceNote:
      'Inspired by public #つぶやきProcessing point-lattice sketches (notes2.md). Reimplemented for organimation with English controls.',
  },
  densityKey: 'density',
  maxDensity: 220,
  densityClampStep: 10,
  renderPolicy: { clearEachFrame: true },
  paramSchema: [
    { key: 'speed', label: 'Wave speed', type: 'number', default: 1, min: 0.1, max: 3, step: 0.05 },
    { key: 'density', label: 'Grid density', type: 'number', default: 120, min: 40, max: 220, step: 5 },
    { key: 'waveX', label: 'Horizontal wave', type: 'number', default: 19, min: 5, max: 40, step: 1 },
    { key: 'waveY', label: 'Vertical wave', type: 'number', default: 17, min: 5, max: 40, step: 1 },
    { key: 'ampX', label: 'X warp', type: 'number', default: 2, min: 0, max: 6, step: 0.1 },
    { key: 'ampY', label: 'Y warp', type: 'number', default: 3, min: 0, max: 6, step: 0.1 },
    { key: 'mod', label: 'Pattern modulus', type: 'number', default: 5, min: 2, max: 12, step: 1 },
    { key: 'strokeAlpha', label: 'Glow strength', type: 'number', default: 220, min: 40, max: 255, step: 1 },
    { key: 'color', label: 'Point color', type: 'color', default: '#ffffff' },
    { key: 'bg', label: 'Background darkness', type: 'number', default: 0, min: 0, max: 40, step: 1 },
  ],
  create(getParams: () => ParamsMap) {
    return (p: p5) => {
      let t = 0;

      p.setup = () => {
        p.createCanvas(AppConfig.canvasSize, AppConfig.canvasSize);
        p.strokeWeight(1.5);
      };

      p.draw = () => {
        const params = getParams();
        const speed = num(params, 'speed', 1);
        const density = Math.max(10, Math.floor(num(params, 'density', 120)));
        const waveX = num(params, 'waveX', 19);
        const waveY = num(params, 'waveY', 17);
        const ampX = num(params, 'ampX', 2);
        const ampY = num(params, 'ampY', 3);
        const mod = Math.max(2, Math.floor(num(params, 'mod', 5)));
        const strokeAlpha = num(params, 'strokeAlpha', 220);
        const color = str(params, 'color', '#ffffff');
        const bg = num(params, 'bg', 0);

        p.background(bg);
        const rgb = hexToRgb(color);
        p.stroke(rgb.r, rgb.g, rgb.b, strokeAlpha);

        t += 0.5 * speed;

        const step = AppConfig.canvasSize / density;
        const cols = density;
        const rows = density;

        for (let gy = 0; gy < rows; gy++) {
          for (let gx = 0; gx < cols; gx++) {
            const x = gx;
            const y = gy;
            const warp =
              x -
              (Math.sin((t + x) / waveX) * ampX - Math.cos((t - y) / waveY) * ampY);
            const mask = (Math.floor(warp) ^ x | y) % mod;
            if (mask === 0) {
              p.point(gx * step, gy * step);
            }
          }
        }
      };
    };
  },
};

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  if (h.length !== 6) return { r: 255, g: 255, b: 255 };
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}
