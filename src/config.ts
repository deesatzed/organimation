/** Runtime performance and URL policy (architecture B4). */
export const AppConfig = {
  fpsWarnThreshold: 30,
  fpsClampThreshold: 20,
  fpsSampleWindowMs: 1000,
  urlDebounceMs: 200,
  canvasSize: 400,
  densityClampStep: 500,
} as const;
