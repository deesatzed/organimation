export function renderFpsBanner(
  el: HTMLElement,
  fps: number,
  warn: boolean,
): void {
  el.className = warn ? 'fps-banner fps-banner-warn' : 'fps-banner';
  el.hidden = !warn;
  if (warn) {
    el.textContent = `Running slow (~${fps.toFixed(0)} FPS). Density may be reduced automatically.`;
  } else {
    el.textContent = '';
  }
}
