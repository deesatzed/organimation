import type p5 from 'p5';
import type { ParamDef, ParamsMap, SketchModule } from '../sketches/types';
import {
  extractNumberSlots,
  injectParamSlots,
  rangeForValue,
  type NumberSlot,
} from './parseNumbers';
import { AppConfig } from '../config';

export const PASTE_SKETCH_ID = 'paste-live';

export interface GolfBuildResult {
  module: SketchModule;
  slots: NumberSlot[];
  transformed: string;
  warnings: string[];
}

const COMMON_VARS =
  't,draw,setup,preload,a,b,c,d,e,f,g,h,i,j,k,n,m,o,q,r,s,u,v,w,W,x,y,z,X,Y,Z,B,C,R,T,N,P,Q,S,U,V,I,J,K,L,M,O,A,E,F,G,H';

/**
 * Build a SketchModule from golfed/global-style p5.js source.
 * Numbers become Tweakpane params n0..nN; code runs via instance-mode bridge.
 */
export function buildGolfSketch(
  source: string,
  title = 'Pasted sketch',
): GolfBuildResult {
  const warnings: string[] = [];
  const trimmed = source.trim();
  if (!trimmed) {
    throw new Error('Paste some p5.js / #つぶやきProcessing code first.');
  }

  const slots = extractNumberSlots(trimmed);
  if (slots.length === 0) {
    warnings.push('No numeric literals found — sketch will run with no auto-sliders.');
  }
  if (slots.length >= 48) {
    warnings.push('Capped at 48 auto-sliders (first 48 numbers).');
  }

  const transformed = injectParamSlots(trimmed, slots);
  const schema = slotsToSchema(slots);
  const densityMeta = pickDensity(slots);

  const module: SketchModule = {
    id: PASTE_SKETCH_ID,
    credit: {
      title,
      authors: [{ name: 'You (pasted)' }],
      sourceNote:
        'User-pasted golfed p5.js. Numbers mapped to sliders. Runs in a sandboxed Function with p5 instance APIs.',
    },
    paramSchema: [
      {
        key: 'speed',
        label: 'Time scale (wrapper)',
        type: 'number',
        default: 1,
        min: 0,
        max: 3,
        step: 0.05,
      },
      ...schema,
    ],
    densityKey: densityMeta?.key ?? null,
    maxDensity: densityMeta?.max ?? null,
    densityClampStep: densityMeta?.step,
    renderPolicy: { clearEachFrame: false },
    create(getParams: () => ParamsMap) {
      return (p: p5) => {
        const slotCount = slots.length;
        const __P = new Float64Array(slotCount);
        let userDraw: ((...args: unknown[]) => unknown) | null = null;
        let userSetup: ((...args: unknown[]) => unknown) | null = null;
        let bootError: string | null = null;
        let frameScale = 1;
        let accum = 0;

        const syncP = () => {
          const params = getParams();
          frameScale =
            typeof params.speed === 'number' && Number.isFinite(params.speed)
              ? (params.speed as number)
              : 1;
          for (let i = 0; i < slotCount; i++) {
            const key = `n${i}`;
            const v = params[key];
            __P[i] =
              typeof v === 'number' && Number.isFinite(v) ? v : slots[i]?.value ?? 0;
          }
        };

        const drawSetup: { draw: unknown; setup: unknown } = {
          get draw() {
            return userDraw;
          },
          set draw(fn: unknown) {
            userDraw =
              typeof fn === 'function' ? (fn as (...a: unknown[]) => unknown) : null;
          },
          get setup() {
            return userSetup;
          },
          set setup(fn: unknown) {
            userSetup =
              typeof fn === 'function' ? (fn as (...a: unknown[]) => unknown) : null;
          },
        };
        const env = buildEnv(p, drawSetup);

        try {
          syncP();
          // new Function is non-strict → bare assignments like t=0 work
          const runner = new Function(
            '__P',
            'env',
            `
            with (env) {
              var ${COMMON_VARS};
              ${transformed}
            }
          `,
          );
          runner(__P, env);
        } catch (err) {
          bootError = err instanceof Error ? err.message : String(err);
          console.error('Paste sketch boot failed', err);
        }

        p.setup = () => {
          syncP();
          try {
            if (userSetup) userSetup();
          } catch (err) {
            bootError = err instanceof Error ? err.message : String(err);
          }
          // Ensure a canvas exists for host export tools
          if (!(p as unknown as { canvas?: HTMLCanvasElement }).canvas) {
            p.createCanvas(AppConfig.canvasSize, AppConfig.canvasSize);
          }
        };

        p.draw = () => {
          syncP();
          if (bootError) {
            p.background(20);
            p.fill(255, 80, 80);
            p.noStroke();
            p.textSize(12);
            p.textAlign(p.LEFT, p.TOP);
            p.text(
              `Paste error:\n${bootError}`,
              12,
              12,
              AppConfig.canvasSize - 24,
              AppConfig.canvasSize - 24,
            );
            return;
          }
          if (frameScale <= 0) return;
          try {
            // Time scale: run draw 1–3 times per host frame when speed > 1
            accum += frameScale;
            const steps = Math.max(1, Math.min(3, Math.floor(accum)));
            accum -= steps;
            if (userDraw) {
              for (let s = 0; s < steps; s++) userDraw();
            }
          } catch (err) {
            bootError = err instanceof Error ? err.message : String(err);
          }
        };
      };
    },
  };

  return { module, slots, transformed, warnings };
}

function slotsToSchema(slots: NumberSlot[]): ParamDef[] {
  return slots.map((s) => {
    const { min, max, step } = rangeForValue(s.value);
    return {
      key: `n${s.index}`,
      label: `n${s.index} (= ${formatNum(s.value)})`,
      type: 'number' as const,
      default: s.value,
      min,
      max,
      step,
    };
  });
}

function formatNum(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return String(Number(v.toPrecision(6)));
}

function pickDensity(
  slots: NumberSlot[],
): { key: string; max: number; step: number } | null {
  // Prefer large integer loop counts (e.g. 1e4, 10000)
  let best: NumberSlot | null = null;
  for (const s of slots) {
    if (!Number.isFinite(s.value)) continue;
    if (s.value < 500) continue;
    if (!best || s.value > best.value) best = s;
  }
  if (!best) return null;
  const max = Math.ceil(best.value * 2);
  return {
    key: `n${best.index}`,
    max,
    step: Math.max(50, Math.round(best.value / 20)),
  };
}

function buildEnv(
  p: p5,
  drawSetup: {
    draw: unknown;
    setup: unknown;
  },
): Record<string, unknown> {
  const env: Record<string, unknown> = Object.create(null) as Record<string, unknown>;

  Object.defineProperty(env, 'draw', {
    get: () => drawSetup.draw,
    set: (fn: unknown) => {
      drawSetup.draw = fn;
    },
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(env, 'setup', {
    get: () => drawSetup.setup,
    set: (fn: unknown) => {
      drawSetup.setup = fn;
    },
    enumerable: true,
    configurable: true,
  });

  const proto = Object.getPrototypeOf(p) as object;
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key === 'constructor') continue;
    const desc = Object.getOwnPropertyDescriptor(proto, key);
    if (!desc) continue;
    if (typeof desc.value === 'function') {
      env[key] = (desc.value as (...a: unknown[]) => unknown).bind(p);
    }
  }

  // Own enumerable props (sometimes constants live here)
  for (const key of Object.keys(p as unknown as object)) {
    if (key in env) continue;
    const v = (p as unknown as Record<string, unknown>)[key];
    if (typeof v === 'function') {
      env[key] = (v as (...a: unknown[]) => unknown).bind(p);
    }
  }

  const liveKeys = [
    'width',
    'height',
    'mouseX',
    'mouseY',
    'pmouseX',
    'pmouseY',
    'winMouseX',
    'winMouseY',
    'pwinMouseX',
    'pwinMouseY',
    'frameCount',
    'deltaTime',
    'focused',
    'keyIsPressed',
    'key',
    'keyCode',
    'mouseIsPressed',
    'mouseButton',
    'pixels',
    'displayWidth',
    'displayHeight',
    'windowWidth',
    'windowHeight',
    'pixelDensity',
    'drawingContext',
  ];
  for (const key of liveKeys) {
    Object.defineProperty(env, key, {
      get: () => (p as unknown as Record<string, unknown>)[key],
      set: (v: unknown) => {
        (p as unknown as Record<string, unknown>)[key] = v;
      },
      enumerable: true,
      configurable: true,
    });
  }

  const constants = [
    'PI',
    'TWO_PI',
    'HALF_PI',
    'TAU',
    'QUARTER_PI',
    'RGB',
    'HSB',
    'HSL',
    'CENTER',
    'CORNER',
    'CORNERS',
    'RADIUS',
    'LEFT',
    'RIGHT',
    'TOP',
    'BOTTOM',
    'BASELINE',
    'CLOSE',
    'POINTS',
    'LINES',
    'TRIANGLES',
    'WEBGL',
    'P2D',
    'ARROW',
    'CROSS',
    'HAND',
    'MOVE',
    'TEXT',
    'WAIT',
    'DEGREES',
    'RADIANS',
    'ADD',
    'BLEND',
    'DARKEST',
    'LIGHTEST',
    'DIFFERENCE',
    'EXCLUSION',
    'MULTIPLY',
    'SCREEN',
    'REPLACE',
    'OVERLAY',
    'HARD_LIGHT',
    'SOFT_LIGHT',
    'DODGE',
    'BURN',
  ];
  for (const key of constants) {
    const v = (p as unknown as Record<string, unknown>)[key];
    if (v !== undefined) env[key] = v;
  }

  // Math helpers often used bare in golf (also on p5)
  env.Math = Math;
  env.PI = Math.PI;
  env.abs = Math.abs;
  env.sin = (p as unknown as { sin: typeof Math.sin }).sin?.bind(p) ?? Math.sin;
  env.cos = (p as unknown as { cos: typeof Math.cos }).cos?.bind(p) ?? Math.cos;
  env.tan = Math.tan;
  env.min = Math.min;
  env.max = Math.max;
  env.floor = Math.floor;
  env.ceil = Math.ceil;
  env.round = Math.round;
  env.sqrt = Math.sqrt;
  env.pow = Math.pow;
  env.exp = Math.exp;
  env.log = Math.log;
  env.atan2 = Math.atan2;
  env.random = (p as unknown as { random: (...a: number[]) => number }).random?.bind(p);

  return env;
}
