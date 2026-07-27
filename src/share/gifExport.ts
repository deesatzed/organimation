/**
 * Real GIF loop export from a live canvas using gifenc (quantize + encode).
 */
import { GIFEncoder, quantize, applyPalette } from 'gifenc';

export interface GifExportOptions {
  durationMs?: number;
  fps?: number;
  maxColors?: number;
  /** Max edge length for encoding (scales down for speed/size). */
  maxEdge?: number;
}

export interface GifExportResult {
  ok: boolean;
  error?: string;
  frames?: number;
  bytes?: number;
}

export async function exportGifLoop(
  canvas: HTMLCanvasElement | null,
  sketchId: string,
  opts: GifExportOptions = {},
): Promise<GifExportResult> {
  if (!canvas) return { ok: false, error: 'No canvas' };

  const durationMs = opts.durationMs ?? 3000;
  const fps = opts.fps ?? 12;
  const maxColors = opts.maxColors ?? 128;
  const maxEdge = opts.maxEdge ?? 320;
  const interval = 1000 / fps;

  const srcW = canvas.width;
  const srcH = canvas.height;
  if (srcW < 2 || srcH < 2) return { ok: false, error: 'Canvas too small' };

  const scale = Math.min(1, maxEdge / Math.max(srcW, srcH));
  const w = Math.max(2, Math.round(srcW * scale));
  const h = Math.max(2, Math.round(srcH * scale));

  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  const octx = off.getContext('2d', { willReadFrequently: true });
  if (!octx) return { ok: false, error: '2D context unavailable' };

  const frames: ImageData[] = [];
  const t0 = performance.now();
  let lastCap = 0;

  await new Promise<void>((resolve) => {
    const tick = (now: number) => {
      if (now - lastCap >= interval - 1) {
        lastCap = now;
        octx.clearRect(0, 0, w, h);
        octx.drawImage(canvas, 0, 0, w, h);
        frames.push(octx.getImageData(0, 0, w, h));
      }
      if (now - t0 < durationMs) {
        requestAnimationFrame(tick);
      } else {
        resolve();
      }
    };
    requestAnimationFrame(tick);
  });

  if (frames.length < 2) {
    return { ok: false, error: 'Not enough frames captured' };
  }

  try {
    const gif = GIFEncoder();
    const delay = Math.round(1000 / fps);

    frames.forEach((img, i) => {
      // Copy to Uint8Array (gifenc expects ArrayBuffer-backed views)
      const rgba = new Uint8Array(img.data);
      const palette = quantize(rgba, maxColors);
      const index = applyPalette(rgba, palette);
      gif.writeFrame(index, w, h, {
        palette,
        delay,
        // first frame sets header + loop
        ...(i === 0 ? { repeat: 0 } : {}),
      });
    });

    gif.finish();
    const bytes = gif.bytes();
    const blob = new Blob([new Uint8Array(bytes)], { type: 'image/gif' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    a.href = url;
    a.download = `organimation-${sketchId}-${ts}.gif`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 4000);

    return { ok: true, frames: frames.length, bytes: bytes.byteLength };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
