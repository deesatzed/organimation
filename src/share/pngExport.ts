export function exportPng(canvas: HTMLCanvasElement | null, sketchId: string): boolean {
  if (!canvas) return false;
  try {
    const url = canvas.toDataURL('image/png');
    if (!url || url === 'data:,') return false;
    const a = document.createElement('a');
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    a.href = url;
    a.download = `organimation-${sketchId}-${ts}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return true;
  } catch (err) {
    console.error('PNG export failed', err);
    return false;
  }
}
