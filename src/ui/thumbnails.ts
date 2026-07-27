import type { ParamsMap, SketchModule } from '../sketches/types';
import { defaultsFromSchema } from '../sketches/types';
import { AppConfig } from '../config';

const cache = new Map<string, string>();

/** Serialize thumb renders so multiple p5 instances don't stomp each other. */
let chain: Promise<unknown> = Promise.resolve();

/**
 * Render a real thumbnail for a sketch module.
 * Steps draw() manually (browsers throttle rAF for off-screen nodes, which
 * previously produced all-black gallery cards).
 */
export async function thumbnailFor(
  module: SketchModule,
  size = 200,
): Promise<string> {
  const hit = cache.get(module.id);
  if (hit) return hit;

  const job = chain.then(() => renderOne(module, size));
  chain = job.then(
    () => undefined,
    () => undefined,
  );

  const dataUrl = await job;
  cache.set(module.id, dataUrl);
  return dataUrl;
}

export function clearThumbnailCache(): void {
  cache.clear();
}

async function renderOne(module: SketchModule, size: number): Promise<string> {
  const p5mod = await import('p5');
  const P5 = p5mod.default;
  const full = AppConfig.canvasSize;

  const params: ParamsMap = defaultsFromSchema(module.paramSchema);
  // Thumb-friendly visibility
  if (typeof params.density === 'number') {
    const d = params.density as number;
    params.density = Math.min(Math.max(d, 2500), 5000);
  }
  if (typeof params.strokeAlpha === 'number') {
    params.strokeAlpha = Math.max(params.strokeAlpha as number, 160);
  }
  if (typeof params.speed === 'number') {
    // Faster time so the form develops within stepped frames
    params.speed = Math.max(params.speed as number, 1.5);
  }

  // Non-zero off-screen host (still in the document for WebGL/2d context)
  const host = document.createElement('div');
  host.setAttribute('data-thumb', module.id);
  host.style.cssText = [
    'position:fixed',
    'left:0',
    'top:0',
    `width:${full}px`,
    `height:${full}px`,
    'overflow:hidden',
    // Keep in layout so rAF is not aggressively frozen, but invisible
    'opacity:0.01',
    'pointer-events:none',
    'z-index:-1',
  ].join(';');
  document.body.appendChild(host);

  try {
    const dataUrl = await new Promise<string>((resolve) => {
      let inst: { remove: () => void; redraw?: (n?: number) => void } | null =
        null;
      let settled = false;

      const finish = (url: string) => {
        if (settled) return;
        settled = true;
        try {
          if (inst) inst.remove();
        } catch {
          /* ignore */
        }
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
          if (p.width !== full || p.height !== full) {
            if ((p as unknown as { canvas?: HTMLCanvasElement }).canvas) {
              p.resizeCanvas(full, full);
            } else {
              p.createCanvas(full, full);
            }
          }

          // Stop automatic loop — we step frames ourselves
          p.noLoop();

          // Advance animation far enough that the form is visible
          const steps = 48;
          if (typeof userDraw === 'function') {
            for (let i = 0; i < steps; i++) {
              try {
                userDraw.call(p);
              } catch (err) {
                console.error('thumb draw', module.id, err);
                break;
              }
            }
          }

          // Capture after stepped frames
          // Use rAF once so the GPU/canvas presents the last draw
          requestAnimationFrame(() => {
            const c =
              host.querySelector('canvas') ||
              (p as unknown as { canvas?: HTMLCanvasElement }).canvas ||
              null;
            if (!c) {
              finish(emptyPng(size));
              return;
            }
            finish(scaleCanvasToDataUrl(c, size));
          });
        };

        // Keep draw defined for p5, but noLoop means it won't auto-run
        p.draw = () => {
          if (typeof userDraw === 'function') userDraw.call(p);
        };
      }, host);

      window.setTimeout(() => {
        const c = host.querySelector('canvas');
        finish(c ? scaleCanvasToDataUrl(c, size) : emptyPng(size));
      }, 8000);
    });

    return dataUrl;
  } catch (err) {
    console.error('thumbnail failed', module.id, err);
    host.remove();
    return emptyPng(size);
  }
}

function scaleCanvasToDataUrl(
  source: HTMLCanvasElement,
  size: number,
): string {
  try {
    const out = document.createElement('canvas');
    out.width = size;
    out.height = size;
    const ctx = out.getContext('2d');
    if (!ctx) return source.toDataURL('image/png');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = '#050608';
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(source, 0, 0, size, size);
    return out.toDataURL('image/png');
  } catch {
    try {
      return source.toDataURL('image/png');
    } catch {
      return emptyPng(size);
    }
  }
}

function emptyPng(size: number): string {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#0a0b0d';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#3a4550';
    ctx.font = '12px system-ui,sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('preview', size / 2, size / 2);
  }
  return c.toDataURL('image/png');
}
