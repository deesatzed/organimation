import type p5 from 'p5';
import { AppConfig } from '../config';
import type { ParamsMap, SketchModule } from './types';
import { num } from './types';

/** Vertical aurora curtains in HSB — original organimation design. */
export const auroraVeil: SketchModule = {
  id: 'aurora-veil',
  credit: {
    title: 'Aurora Veil',
    authors: [{ name: 'organimation' }],
    sourceNote: 'Original organimation design — soft aurora curtains.',
  },
  densityKey: 'density',
  maxDensity: 5000,
  densityClampStep: 150,
  renderPolicy: { clearEachFrame: true },
  paramSchema: [
    { key: 'speed', label: 'Drift speed', type: 'number', default: 1, min: 0.1, max: 3, step: 0.05 },
    { key: 'density', label: 'Curtain density', type: 'number', default: 2800, min: 600, max: 5000, step: 100 },
    { key: 'waves', label: 'Wave layers', type: 'number', default: 4, min: 1, max: 8, step: 1 },
    { key: 'warp', label: 'Warp', type: 'number', default: 40, min: 5, max: 90, step: 1 },
    { key: 'hueShift', label: 'Hue drift', type: 'number', default: 140, min: 0, max: 360, step: 1 },
    { key: 'sat', label: 'Color intensity', type: 'number', default: 70, min: 20, max: 100, step: 1 },
    { key: 'strokeAlpha', label: 'Glow strength', type: 'number', default: 50, min: 15, max: 120, step: 1 },
    { key: 'bg', label: 'Background darkness', type: 'number', default: 3, min: 0, max: 30, step: 1 },
  ],
  create(getParams: () => ParamsMap) {
    return (p: p5) => {
      let t = 0;

      p.setup = () => {
        p.createCanvas(AppConfig.canvasSize, AppConfig.canvasSize);
        p.colorMode(p.HSB, 360, 100, 100, 100);
        p.strokeWeight(1.5);
      };

      p.draw = () => {
        const params = getParams();
        const speed = num(params, 'speed', 1);
        const density = Math.floor(num(params, 'density', 2800));
        const waves = Math.floor(num(params, 'waves', 4));
        const warp = num(params, 'warp', 40);
        const hueShift = num(params, 'hueShift', 140);
        const sat = num(params, 'sat', 70);
        const strokeAlpha = num(params, 'strokeAlpha', 50);
        const bg = num(params, 'bg', 3);

        p.background(230, 30, bg);
        t += 0.012 * speed;

        const w = AppConfig.canvasSize;
        const h = AppConfig.canvasSize;

        for (let i = 0; i < density; i++) {
          const u = i / density;
          const layer = i % waves;
          const xBase = u * w;
          const y =
            h * 0.15 +
            (h * 0.7 * (layer + 1)) / (waves + 1) +
            Math.sin(u * 8 + t * 2 + layer) * warp +
            Math.sin(u * 3 - t + layer * 0.5) * (warp * 0.4);
          const x = xBase + Math.sin(y * 0.02 + t + layer) * 12;
          const hue = (hueShift + u * 80 + layer * 25 + t * 10) % 360;
          p.stroke(hue, sat, 100, strokeAlpha);
          p.point(x, y);
        }
      };
    };
  },
};
