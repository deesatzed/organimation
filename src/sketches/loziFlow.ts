import type p5 from 'p5';
import { AppConfig } from '../config';
import type { ParamsMap, SketchModule } from './types';
import { num, str } from './types';

/**
 * 2D Lozi-map style point flow inspired by notes2.md / TakagiHitoshi #つぶやきProcessing samples.
 * Ported to named params; no unseeded structural random in the draw loop.
 */
export const loziFlow: SketchModule = {
  id: 'lozi-flow',
  credit: {
    title: 'Lozi Flow',
    authors: [
      { name: 'きんぞ @TakagiHitoshi', url: 'https://x.com/TakagiHitoshi' },
      { name: 'Lozi map references', url: 'http://padyn.wikidot.com/lozi-maps' },
    ],
    sourceNote:
      'Inspired by public #つぶやきProcessing / Lozi map point sketches (notes2.md). Reimplemented with stable seeds and English-named controls for organimation.',
  },
  densityKey: 'density',
  maxDensity: 16000,
  renderPolicy: { clearEachFrame: true },
  paramSchema: [
    { key: 'speed', label: 'Flow speed', type: 'number', default: 1, min: 0.1, max: 3, step: 0.05 },
    { key: 'density', label: 'Trail points', type: 'number', default: 6000, min: 1000, max: 16000, step: 250 },
    { key: 'b', label: 'Map fold (B)', type: 'number', default: -1, min: -1.5, max: -0.3, step: 0.01 },
    { key: 'c', label: 'Map stretch (C)', type: 'number', default: 0.5, min: 0.2, max: 1.2, step: 0.01 },
    { key: 'scale', label: 'Zoom', type: 'number', default: 200, min: 80, max: 320, step: 5 },
    { key: 'offsetX', label: 'Center X', type: 'number', default: 150, min: 50, max: 350, step: 5 },
    { key: 'offsetY', label: 'Center Y', type: 'number', default: 300, min: 100, max: 400, step: 5 },
    { key: 'hueShift', label: 'Hue drift', type: 'number', default: 0, min: 0, max: 360, step: 1 },
    { key: 'bg', label: 'Background', type: 'number', default: 0, min: 0, max: 40, step: 1 },
    { key: 'color', label: 'Tint (mix)', type: 'color', default: '#ffffff' },
  ],
  create(getParams: () => ParamsMap) {
    return (p: p5) => {
      let t = 0;
      // Fixed seeds — deterministic given params (no Math.random in draw)
      const seeds: number[] = [];
      for (let i = 0; i < 100; i++) {
        // Deterministic pseudo-scatter in [-1, 1]
        seeds.push(Math.sin(i * 12.9898) * 43758.5453 % 1);
        seeds[i] = seeds[i]! * 2 - 1;
      }

      p.setup = () => {
        p.createCanvas(AppConfig.canvasSize, AppConfig.canvasSize);
        p.colorMode(p.HSB, 360, 100, 100, 100);
        p.strokeWeight(1);
      };

      p.draw = () => {
        const params = getParams();
        const speed = num(params, 'speed', 1);
        const density = Math.floor(num(params, 'density', 6000));
        const B = num(params, 'b', -1);
        const C = num(params, 'c', 0.5);
        const scale = num(params, 'scale', 200);
        const offsetX = num(params, 'offsetX', 150);
        const offsetY = num(params, 'offsetY', 300);
        const hueShift = num(params, 'hueShift', 0);
        const bg = num(params, 'bg', 0);
        const tint = str(params, 'color', '#ffffff');
        const tintBoost = hexLuma(tint);

        p.background(0, 0, bg);
        t += 0.5 * speed;

        const seedIndex = Math.floor(Math.abs(t)) % seeds.length;
        let x = seeds[seedIndex] ?? 0;
        let y = B * x;

        for (let i = 0; i < density; i++) {
          const x1 = x;
          x = 1 + y - C * Math.abs(x);
          y = B * x1;
          const hue = (i / 360 + t + hueShift) % 360;
          p.stroke(hue, 80 + tintBoost * 20, 100, 70);
          p.point(x * scale * 0.5 + offsetX, y * scale * 0.5 + offsetY * 0.5);
        }
      };
    };
  },
};

function hexLuma(hex: string): number {
  const h = hex.replace('#', '');
  if (h.length !== 6) return 0.5;
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
