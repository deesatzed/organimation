/** Runtime performance and URL policy (architecture B4). */
export const AppConfig = {
  fpsWarnThreshold: 30,
  fpsClampThreshold: 20,
  fpsSampleWindowMs: 1000,
  urlDebounceMs: 200,
  canvasSize: 400,
  densityClampStep: 500,
} as const;

/** True when OS/browser asks to minimize motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
