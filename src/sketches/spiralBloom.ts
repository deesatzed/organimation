import type p5 from 'p5';
import { AppConfig } from '../config';
import type { ParamsMap, SketchModule } from './types';
import { num, str } from './types';

/** Golden-angle spiral particle bloom — original organimation design. */
export const spiralBloom: SketchModule = {
  id: 'spiral-bloom',
  credit: {
    title: 'Spiral Bloom',
    authors: [{ name: 'organimation' }],
    sourceNote: 'Original organimation design — phyllotaxis-style spiral bloom.',
  },
  densityKey: 'density',
  maxDensity: 9000,
  renderPolicy: { clearEachFrame: true },
  paramSchema: [
    { key: 'speed', label: 'Bloom speed', type: 'number', default: 1, min: 0.1, max: 3, step: 0.05 },
    { key: 'density', label: 'Petal count', type: 'number', default: 4500, min: 800, max: 9000, step: 100 },
    { key: 'spread', label: 'Spread', type: 'number', default: 0.55, min: 0.15, max: 1.2, step: 0.01 },
    { key: 'twist', label: 'Twist', type: 'number', default: 1, min: 0.2, max: 3, step: 0.05 },
    { key: 'pulse', label: 'Pulse', type: 'number', default: 0.12, min: 0, max: 0.5, step: 0.01 },
    { key: 'strokeAlpha', label: 'Glow strength', type: 'number', default: 140, min: 20, max: 255, step: 1 },
    { key: 'color', label: 'Glow color', type: 'color', default: '#ffeaa7' },
    { key: 'bg', label: 'Background darkness', type: 'number', default: 7, min: 0, max: 40, step: 1 },
  ],
  create(getParams: () => ParamsMap) {
    return (p: p5) => {
      let t = 0;
      const golden = Math.PI * (3 - Math.sqrt(5));

      p.setup = () => {
        p.createCanvas(AppConfig.canvasSize, AppConfig.canvasSize);
        p.strokeWeight(1.2);
      };

      p.draw = () => {
        const params = getParams();
        const speed = num(params, 'speed', 1);
        const density = Math.floor(num(params, 'density', 4500));
        const spread = num(params, 'spread', 0.55);
        const twist = num(params, 'twist', 1);
        const pulse = num(params, 'pulse', 0.12);
        const strokeAlpha = num(params, 'strokeAlpha', 140);
        const color = str(params, 'color', '#ffeaa7');
        const bg = num(params, 'bg', 7);

        p.background(bg);
        const rgb = hexToRgb(color);
        p.stroke(rgb.r, rgb.g, rgb.b, strokeAlpha);

        t += 0.02 * speed;
        const cx = AppConfig.canvasSize / 2;
        const cy = AppConfig.canvasSize / 2;
        const maxR = AppConfig.canvasSize * 0.48;

        for (let i = 0; i < density; i++) {
          const a = i * golden * twist + t;
          const r = spread * Math.sqrt(i) * (1 + pulse * Math.sin(t * 2 + i * 0.01));
          const x = cx + Math.cos(a) * Math.min(maxR, r);
          const y = cy + Math.sin(a) * Math.min(maxR, r);
          p.point(x, y);
        }
      };
    };
  },
};

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  if (h.length !== 6) return { r: 255, g: 234, b: 167 };
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}
