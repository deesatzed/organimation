import type p5 from 'p5';
import type { ParamsMap, SketchModule } from '../sketches/types';

export type FrameCallback = (fpsInstant: number) => void;
export type ErrorCallback = (err: unknown) => void;

type P5Constructor = new (
  sketch: (p: p5) => void,
  node?: HTMLElement,
) => p5;

export class P5Host {
  private instance: p5 | null = null;
  private hostEl: HTMLElement | null = null;
  private onFrame: FrameCallback | null = null;
  private onError: ErrorCallback | null = null;
  private p5Ctor: P5Constructor | null = null;
  private mountGen = 0;

  setFrameCallback(cb: FrameCallback | null): void {
    this.onFrame = cb;
  }

  setErrorCallback(cb: ErrorCallback | null): void {
    this.onError = cb;
  }

  async mount(
    module: SketchModule,
    el: HTMLElement,
    getParams: () => ParamsMap,
  ): Promise<void> {
    const gen = ++this.mountGen;
    this.disposeKeepingGen(gen);

    this.hostEl = el;
    el.innerHTML = '';

    if (!this.p5Ctor) {
      const mod = await import('p5');
      this.p5Ctor = mod.default as unknown as P5Constructor;
    }
    // Abandoned if a newer mount started while loading
    if (gen !== this.mountGen) return;

    const P5 = this.p5Ctor;
    const userSketch = module.create(getParams);
    const frameCb = this.onFrame;
    const errCb = this.onError;

    const wrapped = (p: p5) => {
      userSketch(p);

      const userDraw = p.draw;
      p.draw = () => {
        try {
          if (typeof userDraw === 'function') {
            userDraw.call(p);
          }
          if (frameCb) {
            const dt = p.deltaTime > 0 ? p.deltaTime : 16.67;
            frameCb(1000 / dt);
          }
        } catch (err) {
          if (errCb) errCb(err);
          else console.error(err);
        }
      };
    };

    this.instance = new P5(wrapped, el);
  }

  dispose(): void {
    this.mountGen++;
    this.disposeKeepingGen(this.mountGen);
  }

  private disposeKeepingGen(_gen: number): void {
    if (this.instance) {
      this.instance.remove();
      this.instance = null;
    }
    if (this.hostEl) {
      this.hostEl.innerHTML = '';
      this.hostEl = null;
    }
  }

  getCanvas(): HTMLCanvasElement | null {
    if (!this.hostEl) return null;
    return this.hostEl.querySelector('canvas');
  }

  canvasCount(): number {
    if (!this.hostEl) return 0;
    return this.hostEl.querySelectorAll('canvas').length;
  }
}

export const p5Host = new P5Host();
