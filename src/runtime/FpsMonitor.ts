import { AppConfig } from '../config';

export interface FpsStatus {
  fps: number;
  warn: boolean;
  shouldClampDensity: boolean;
}

/**
 * Rolling FPS over AppConfig.fpsSampleWindowMs.
 * Warn when average < 30 for a full window; clamp signal when < 20 for a full window.
 */
export class FpsMonitor {
  private samples: { t: number; fps: number }[] = [];
  private lowWarnSince: number | null = null;
  private lowClampSince: number | null = null;
  private lastStatus: FpsStatus = { fps: 60, warn: false, shouldClampDensity: false };

  reset(): void {
    this.samples = [];
    this.lowWarnSince = null;
    this.lowClampSince = null;
    this.lastStatus = { fps: 60, warn: false, shouldClampDensity: false };
  }

  push(instantFps: number, now = performance.now()): FpsStatus {
    if (!Number.isFinite(instantFps) || instantFps <= 0) {
      return this.lastStatus;
    }

    this.samples.push({ t: now, fps: instantFps });
    const cutoff = now - AppConfig.fpsSampleWindowMs;
    this.samples = this.samples.filter((s) => s.t >= cutoff);

    if (this.samples.length === 0) {
      return this.lastStatus;
    }

    const avg =
      this.samples.reduce((sum, s) => sum + s.fps, 0) / this.samples.length;

    if (avg < AppConfig.fpsWarnThreshold) {
      if (this.lowWarnSince === null) this.lowWarnSince = now;
    } else {
      this.lowWarnSince = null;
    }

    if (avg < AppConfig.fpsClampThreshold) {
      if (this.lowClampSince === null) this.lowClampSince = now;
    } else {
      this.lowClampSince = null;
    }

    const warn =
      this.lowWarnSince !== null && now - this.lowWarnSince >= AppConfig.fpsSampleWindowMs;
    const shouldClampDensity =
      this.lowClampSince !== null &&
      now - this.lowClampSince >= AppConfig.fpsSampleWindowMs;

    this.lastStatus = { fps: avg, warn, shouldClampDensity };
    return this.lastStatus;
  }

  getStatus(): FpsStatus {
    return this.lastStatus;
  }
}

export const fpsMonitor = new FpsMonitor();
