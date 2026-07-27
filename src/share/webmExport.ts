/**
 * Record a short WebM (or browser-supported) loop from a live canvas via MediaRecorder.
 * Real capture only — no synthetic frames.
 */

export interface WebmExportOptions {
  durationMs?: number;
  /** Prefer fps for requestData cadence (MediaRecorder uses timeslice). */
  timesliceMs?: number;
}

export interface WebmExportResult {
  ok: boolean;
  mimeType?: string;
  error?: string;
}

function pickMimeType(): string | null {
  if (typeof MediaRecorder === 'undefined') return null;
  const candidates = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4',
  ];
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported(c)) return c;
  }
  return '';
}

export async function exportWebmLoop(
  canvas: HTMLCanvasElement | null,
  sketchId: string,
  opts: WebmExportOptions = {},
): Promise<WebmExportResult> {
  if (!canvas) return { ok: false, error: 'No canvas' };
  if (typeof MediaRecorder === 'undefined') {
    return { ok: false, error: 'MediaRecorder not supported in this browser' };
  }

  const durationMs = opts.durationMs ?? 3000;
  const timesliceMs = opts.timesliceMs ?? 100;
  const mimeType = pickMimeType();
  if (mimeType === null) {
    return { ok: false, error: 'MediaRecorder unavailable' };
  }

  let stream: MediaStream;
  try {
    stream = canvas.captureStream(30);
  } catch (err) {
    return { ok: false, error: `captureStream failed: ${String(err)}` };
  }

  const chunks: BlobPart[] = [];
  let recorder: MediaRecorder;
  try {
    recorder =
      mimeType === ''
        ? new MediaRecorder(stream)
        : new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4_000_000 });
  } catch (err) {
    stream.getTracks().forEach((t) => t.stop());
    return { ok: false, error: `MediaRecorder init failed: ${String(err)}` };
  }

  const usedType = recorder.mimeType || mimeType || 'video/webm';

  return new Promise((resolve) => {
    recorder.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) chunks.push(ev.data);
    };

    recorder.onerror = () => {
      stream.getTracks().forEach((t) => t.stop());
      resolve({ ok: false, error: 'Recording error' });
    };

    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      if (chunks.length === 0) {
        resolve({ ok: false, error: 'Empty recording' });
        return;
      }
      const blob = new Blob(chunks, { type: usedType });
      const ext = usedType.includes('mp4') ? 'mp4' : 'webm';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      a.href = url;
      a.download = `organimation-${sketchId}-${ts}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
      resolve({ ok: true, mimeType: usedType });
    };

    try {
      recorder.start(timesliceMs);
    } catch (err) {
      stream.getTracks().forEach((t) => t.stop());
      resolve({ ok: false, error: `start failed: ${String(err)}` });
      return;
    }

    window.setTimeout(() => {
      if (recorder.state === 'recording') recorder.stop();
    }, durationMs);
  });
}
