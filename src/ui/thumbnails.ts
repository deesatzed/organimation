import type { ParamsMap, SketchModule } from '../sketches/types';
import { defaultsFromSchema } from '../sketches/types';

const cache = new Map<string, string>();

/**
 * Render a real one-shot thumbnail for a sketch module (instance-mode p5).
 * Cached by sketch id for the session.
 */
export async function thumbnailFor(
  module: SketchModule,
  size = 160,
): Promise<string> {
  const hit = cache.get(module.id);
  if (hit) return hit;

  const p5mod = await import('p5');
  const P5 = p5mod.default;

  const params: ParamsMap = defaultsFromSchema(module.paramSchema);
  // Slightly lower density for thumbs when present
  if (typeof params.density === 'number') {
    params.density = Math.min(params.density as number, 2500);
  }

  const host = document.createElement('div');
  host.style.cssText =
    'position:fixed;left:-9999px;top:0;width:0;height:0;overflow:hidden;pointer-events:none;';
  document.body.appendChild(host);

  const dataUrl = await new Promise<string>((resolve) => {
    let frames = 0;
    let inst: { remove: () => void } | null = null;
    let settled = false;

    const finish = (url: string) => {
      if (settled) return;
      settled = true;
      if (inst) inst.remove();
      host.remove();
      resolve(url || emptyPng(size));
    };

    const sketchFn = module.create(() => params);
    inst = new P5((p) => {
      sketchFn(p);
      const userSetup = p.setup;
      const userDraw = p.draw;

      p.setup = () => {
        if (typeof userSetup === 'function') userSetup.call(p);
        p.resizeCanvas(size, size);
      };

      p.draw = () => {
        if (typeof userDraw === 'function') userDraw.call(p);
        frames++;
        if (frames >= 4) {
          const c = host.querySelector('canvas');
          finish(c ? c.toDataURL('image/png') : '');
        }
      };
    }, host);

    // Safety timeout if draw never runs
    window.setTimeout(() => finish(emptyPng(size)), 4000);
  });

  cache.set(module.id, dataUrl);
  return dataUrl;
}

function emptyPng(size: number): string {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#0a0b0d';
    ctx.fillRect(0, 0, size, size);
  }
  return c.toDataURL('image/png');
}
