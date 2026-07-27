import type p5 from 'p5';
import { AppConfig } from '../config';
import type { ParamsMap, SketchModule } from './types';
import { num, str } from './types';

/** Concentric pulse rings with angular jitter — original organimation design. */
export const pulseRings: SketchModule = {
  id: 'pulse-rings',
  credit: {
    title: 'Pulse Rings',
    authors: [{ name: 'organimation' }],
    sourceNote: 'Original organimation design — concentric pulsing rings.',
  },
  densityKey: 'density',
  maxDensity: 7000,
  densityClampStep: 200,
  renderPolicy: { clearEachFrame: true },
  paramSchema: [
    { key: 'speed', label: 'Pulse speed', type: 'number', default: 1, min: 0.1, max: 3, step: 0.05 },
    { key: 'density', label: 'Points per ring', type: 'number', default: 3600, min: 600, max: 7000, step: 100 },
    { key: 'rings', label: 'Ring count', type: 'number', default: 8, min: 3, max: 18, step: 1 },
    { key: 'jitter', label: 'Jitter', type: 'number', default: 0.08, min: 0, max: 0.35, step: 0.01 },
    { key: 'gap', label: 'Ring spacing', type: 'number', default: 18, min: 8, max: 36, step: 1 },
    { key: 'strokeAlpha', label: 'Glow strength', type: 'number', default: 150, min: 30, max: 255, step: 1 },
    { key: 'color', label: 'Glow color', type: 'color', default: '#55efc4' },
    { key: 'bg', label: 'Background darkness', type: 'number', default: 6, min: 0, max: 40, step: 1 },
  ],
  create(getParams: () => ParamsMap) {
    return (p: p5) => {
      let t = 0;

      p.setup = () => {
        p.createCanvas(AppConfig.canvasSize, AppConfig.canvasSize);
        p.strokeWeight(1.3);
      };

      p.draw = () => {
        const params = getParams();
        const speed = num(params, 'speed', 1);
        const density = Math.floor(num(params, 'density', 3600));
        const rings = Math.floor(num(params, 'rings', 8));
        const jitter = num(params, 'jitter', 0.08);
        const gap = num(params, 'gap', 18);
        const strokeAlpha = num(params, 'strokeAlpha', 150);
        const color = str(params, 'color', '#55efc4');
        const bg = num(params, 'bg', 6);

        p.background(bg);
        const rgb = hexToRgb(color);
        p.stroke(rgb.r, rgb.g, rgb.b, strokeAlpha);

        t += 0.03 * speed;
        const cx = AppConfig.canvasSize / 2;
        const cy = AppConfig.canvasSize / 2;
        const perRing = Math.max(20, Math.floor(density / rings));

        for (let r = 1; r <= rings; r++) {
          const baseR = r * gap + 20 * Math.sin(t + r * 0.4);
          for (let i = 0; i < perRing; i++) {
            const a = (i / perRing) * Math.PI * 2 + t * 0.2 * (r % 2 === 0 ? 1 : -1);
            const jr = baseR * (1 + jitter * Math.sin(a * 5 + t * 2 + r));
            p.point(cx + Math.cos(a) * jr, cy + Math.sin(a) * jr);
          }
        }
      };
    };
  },
};

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  if (h.length !== 6) return { r: 85, g: 239, b: 196 };
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}
