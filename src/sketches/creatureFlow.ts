import type p5 from 'p5';
import { AppConfig } from '../config';
import type { ParamsMap, SketchModule } from './types';
import { num, str } from './types';

/**
 * Port of the organic creature sketch from notes1.md (expanded #つぶやきProcessing style).
 * Original golfed formula public on X / #つぶやきProcessing community.
 */
export const creatureFlow: SketchModule = {
  id: 'creature-flow',
  credit: {
    title: 'Creature Flow',
    authors: [{ name: 'Community (#つぶやきProcessing)', url: 'https://x.com/search?q=%23%E3%81%A4%E3%81%B6%E3%82%84%E3%81%8DProcessing' }],
    sourceNote:
      'Ported/inspired by public #つぶやきProcessing organic creature sketches (see notes1.md). Formula expanded with named parameters for organimation.',
    licenseNote: 'Port for educational remix UI; original author credit belongs to sketch originators.',
  },
  densityKey: 'density',
  maxDensity: 12000,
  renderPolicy: { clearEachFrame: true },
  paramSchema: [
    { key: 'speed', label: 'Wave speed', type: 'number', default: 1, min: 0.1, max: 3, step: 0.05 },
    { key: 'density', label: 'How many particles', type: 'number', default: 8000, min: 1000, max: 12000, step: 250 },
    { key: 'body', label: 'Body thickness', type: 'number', default: 4, min: 1, max: 8, step: 0.1 },
    { key: 'curl', label: 'Curl amount', type: 'number', default: 35, min: 10, max: 60, step: 1 },
    { key: 'wave', label: 'Wave detail', type: 'number', default: 9, min: 3, max: 20, step: 0.5 },
    { key: 'tendril', label: 'Tendril length', type: 'number', default: 40, min: 10, max: 80, step: 1 },
    { key: 'spread', label: 'Vertical spread', type: 'number', default: 235, min: 100, max: 400, step: 5 },
    { key: 'strokeAlpha', label: 'Glow strength', type: 'number', default: 96, min: 20, max: 255, step: 1 },
    { key: 'color', label: 'Glow color', type: 'color', default: '#ffffff' },
    { key: 'bg', label: 'Background darkness', type: 'number', default: 9, min: 0, max: 40, step: 1 },
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
        const density = Math.floor(num(params, 'density', 8000));
        const body = num(params, 'body', 4);
        const curl = num(params, 'curl', 35);
        const wave = num(params, 'wave', 9);
        const tendril = num(params, 'tendril', 40);
        const spread = num(params, 'spread', 235);
        const strokeAlpha = num(params, 'strokeAlpha', 96);
        const color = str(params, 'color', '#ffffff');
        const bg = num(params, 'bg', 9);

        p.background(bg);
        const rgb = hexToRgb(color);
        p.stroke(rgb.r, rgb.g, rgb.b, strokeAlpha);

        // Base rate PI/80 scaled by speed
        t += (Math.PI / 80) * speed;

        for (let i = density; i--; ) {
          const y = i / spread;
          const k = (body + p.cos(i / wave - t * 2)) * p.cos(i / curl);
          const e = y / 7 - 13;
          const d = p.mag(k, e) + p.sin(e / 9 + t / 2) - 4;
          const q =
            2 * p.sin(k * 3) -
            (y / 35) * k * (9 + k * p.sin(p.cos(e) * 9 - d * 2 + t));
          const c = d - t;
          p.point(q + tendril * p.cos(c) + 200, q * p.sin(c) + d * 35);
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
