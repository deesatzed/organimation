import type p5 from 'p5';
import { AppConfig } from '../config';
import type { ParamsMap, SketchModule } from './types';
import { num, str } from './types';

/**
 * Orbital rectangles — inspired by @TakagiHitoshi #つぶやきProcessing rect/orbit sketches (notes2.md).
 * 2D only; deterministic from params + time.
 */
export const orbitalRects: SketchModule = {
  id: 'orbital-rects',
  credit: {
    title: 'Orbital Rects',
    authors: [{ name: 'きんぞ @TakagiHitoshi', url: 'https://x.com/TakagiHitoshi' }],
    sourceNote:
      'Inspired by public #つぶやきProcessing rect-orbit sketches (notes2.md). Ported with named parameters for organimation.',
  },
  densityKey: 'density',
  maxDensity: 400,
  densityClampStep: 20,
  renderPolicy: { clearEachFrame: true },
  paramSchema: [
    { key: 'speed', label: 'Spin speed', type: 'number', default: 1, min: 0.1, max: 3, step: 0.05 },
    { key: 'density', label: 'How many shapes', type: 'number', default: 200, min: 40, max: 400, step: 5 },
    { key: 'radius', label: 'Orbit radius', type: 'number', default: 150, min: 40, max: 180, step: 2 },
    { key: 'power', label: 'Orbit pinch', type: 'number', default: 5, min: 1, max: 9, step: 0.5 },
    { key: 'sizeScale', label: 'Shape size', type: 'number', default: 2, min: 0.5, max: 5, step: 0.1 },
    { key: 'hueBoost', label: 'Hue shift', type: 'number', default: 0, min: 0, max: 360, step: 1 },
    { key: 'sat', label: 'Color intensity', type: 'number', default: 80, min: 20, max: 100, step: 1 },
    { key: 'bg', label: 'Background darkness', type: 'number', default: 0, min: 0, max: 40, step: 1 },
    { key: 'color', label: 'Tint mix', type: 'color', default: '#ffffff' },
  ],
  create(getParams: () => ParamsMap) {
    return (p: p5) => {
      let t = 0;

      p.setup = () => {
        p.createCanvas(AppConfig.canvasSize, AppConfig.canvasSize);
        p.colorMode(p.HSB, 360, 100, 100, 100);
        p.rectMode(p.CENTER);
        p.noStroke();
      };

      p.draw = () => {
        const params = getParams();
        const speed = num(params, 'speed', 1);
        const density = Math.floor(num(params, 'density', 200));
        const radius = num(params, 'radius', 150);
        const power = num(params, 'power', 5);
        const sizeScale = num(params, 'sizeScale', 2);
        const hueBoost = num(params, 'hueBoost', 0);
        const sat = num(params, 'sat', 80);
        const bg = num(params, 'bg', 0);
        const tint = str(params, 'color', '#ffffff');
        const luma = hexLuma(tint);

        p.background(0, 0, bg);
        t += speed;

        const w = AppConfig.canvasSize / 2;
        const n = Math.min(density, AppConfig.canvasSize);

        for (let i = 0; i < n; i++) {
          const T = ((i + t) / AppConfig.canvasSize) * p.TWO_PI;
          const X = radius * Math.pow(Math.cos(T), power) + w;
          const Y = radius * Math.sin(T) + w;
          p.push();
          p.translate(X, Y);
          const I = (T * i) / w;
          const fillV = Math.abs(AppConfig.canvasSize * Math.sin(X + Y + hueBoost * 0.01));
          p.fill((fillV + hueBoost) % 360, sat * (0.5 + 0.5 * luma), 100, 90);
          p.rotate(I);
          const sz = (Math.abs(I) % 11) * sizeScale;
          p.rect(0, 0, Math.max(2, sz), Math.max(2, sz * 0.6));
          p.pop();
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
