import type p5 from 'p5';
import { AppConfig } from '../config';
import type { ParamsMap, SketchModule } from './types';
import { num, str } from './types';

/** Flowing ink tendrils via multi-arm polar noise — original organimation design. */
export const inkTendrils: SketchModule = {
  id: 'ink-tendrils',
  credit: {
    title: 'Ink Tendrils',
    authors: [{ name: 'organimation' }],
    sourceNote: 'Original organimation design — multi-arm ink tendrils in polar space.',
  },
  densityKey: 'density',
  maxDensity: 8000,
  renderPolicy: { clearEachFrame: true },
  paramSchema: [
    { key: 'speed', label: 'Flow speed', type: 'number', default: 1, min: 0.1, max: 3, step: 0.05 },
    { key: 'density', label: 'Ink density', type: 'number', default: 5000, min: 1000, max: 8000, step: 100 },
    { key: 'arms', label: 'Tendril arms', type: 'number', default: 5, min: 2, max: 12, step: 1 },
    { key: 'curl', label: 'Curl', type: 'number', default: 1.4, min: 0.2, max: 3.5, step: 0.05 },
    { key: 'length', label: 'Reach', type: 'number', default: 160, min: 60, max: 220, step: 5 },
    { key: 'strokeAlpha', label: 'Ink strength', type: 'number', default: 90, min: 20, max: 220, step: 1 },
    { key: 'color', label: 'Ink color', type: 'color', default: '#dfe6e9' },
    { key: 'bg', label: 'Background darkness', type: 'number', default: 5, min: 0, max: 40, step: 1 },
  ],
  create(getParams: () => ParamsMap) {
    return (p: p5) => {
      let t = 0;

      p.setup = () => {
        p.createCanvas(AppConfig.canvasSize, AppConfig.canvasSize);
        p.strokeWeight(1);
      };

      p.draw = () => {
        const params = getParams();
        const speed = num(params, 'speed', 1);
        const density = Math.floor(num(params, 'density', 5000));
        const arms = Math.floor(num(params, 'arms', 5));
        const curl = num(params, 'curl', 1.4);
        const length = num(params, 'length', 160);
        const strokeAlpha = num(params, 'strokeAlpha', 90);
        const color = str(params, 'color', '#dfe6e9');
        const bg = num(params, 'bg', 5);

        p.background(bg);
        const rgb = hexToRgb(color);
        p.stroke(rgb.r, rgb.g, rgb.b, strokeAlpha);

        t += 0.015 * speed;
        const cx = AppConfig.canvasSize / 2;
        const cy = AppConfig.canvasSize / 2;

        for (let i = 0; i < density; i++) {
          const arm = i % arms;
          const u = i / density;
          const base = (arm / arms) * Math.PI * 2 + t * 0.4;
          const r = u * length * (0.7 + 0.3 * Math.sin(u * 9 + t + arm));
          const a =
            base +
            curl * Math.sin(u * 6 + t * 1.3 + arm * 0.7) +
            0.35 * Math.sin(u * 14 - t + arm);
          p.point(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        }
      };
    };
  },
};

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  if (h.length !== 6) return { r: 223, g: 230, b: 233 };
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}
