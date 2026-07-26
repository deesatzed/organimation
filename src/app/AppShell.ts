import { AppConfig, prefersReducedMotion } from '../config';
import { appState } from './AppState';
import { router, type Route } from './Router';
import { p5Host } from '../runtime/P5Host';
import { fpsMonitor } from '../runtime/FpsMonitor';
import { getSketch, listSketches } from '../sketches/registry';
import { num, type ParamsMap } from '../sketches/types';
import {
  buildShareUrl,
  encodeHash,
  parseHash,
} from '../share/urlState';
import { exportPng } from '../share/pngExport';
import { paramController } from '../ui/ParamController';
import { renderGallery } from '../ui/GalleryView';
import { renderCreditBadge } from '../ui/CreditBadge';
import { renderFpsBanner } from '../ui/FpsBanner';

export class AppShell {
  private root: HTMLElement;
  private mainEl!: HTMLElement;
  private canvasHost: HTMLElement | null = null;
  private paneHost: HTMLElement | null = null;
  private creditEl: HTMLElement | null = null;
  private fpsEl: HTMLElement | null = null;
  private statusEl: HTMLElement | null = null;
  private exportBtn: HTMLButtonElement | null = null;
  private pauseBtn: HTMLButtonElement | null = null;
  private urlTimer: number | null = null;
  private lastClampAt = 0;
  private suppressUrl = false;
  private currentStudioId: string | null = null;
  /** User or OS-driven freeze of animation (speed forced to 0). */
  private paused = false;

  constructor(root: HTMLElement) {
    this.root = root;
  }

  start(): void {
    this.root.innerHTML = '';
    this.root.className = 'app-shell';

    const skip = document.createElement('a');
    skip.href = '#main-content';
    skip.className = 'skip-link';
    skip.textContent = 'Skip to content';

    const header = document.createElement('header');
    header.className = 'app-header';
    header.innerHTML = `
      <a href="#/" class="brand">organimation</a>
      <p class="tagline">Organic sketches you can tweak — no math required</p>
    `;

    this.mainEl = document.createElement('main');
    this.mainEl.id = 'main-content';
    this.mainEl.className = 'app-main';
    this.mainEl.tabIndex = -1;

    const footer = document.createElement('footer');
    footer.className = 'app-footer';
    footer.innerHTML = `
      <span>Browser-only · p5.js · Vite</span>
      <a href="#/">Gallery</a>
    `;

    this.root.append(skip, header, this.mainEl, footer);

    // Respect OS reduced-motion as initial pause
    if (prefersReducedMotion()) {
      this.paused = true;
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotion = () => {
      if (mq.matches) {
        this.paused = true;
        this.syncPauseUi();
        this.flashStatus('Reduced motion on — animation paused. Press Play to animate.');
      }
    };
    mq.addEventListener('change', onMotion);

    router.subscribe((route) => this.onRoute(route));
    appState.subscribe(() => this.onStateChange());
    router.start();

    // Initial route from current hash (may include share params)
    this.onRoute(router.parse());
  }

  private liveParams(): ParamsMap {
    const base = appState.getParams();
    if (!this.paused) return base;
    // Freeze time-based motion without mutating stored state / share URL
    return { ...base, speed: 0 };
  }

  private syncPauseUi(): void {
    if (this.pauseBtn) {
      this.pauseBtn.textContent = this.paused ? 'Play' : 'Pause';
      this.pauseBtn.setAttribute('aria-pressed', this.paused ? 'true' : 'false');
    }
  }

  private onRoute(route: Route): void {
    if (route.name === 'gallery') {
      this.showGallery();
      return;
    }
    void this.showStudio(route.sketchId);
  }

  private showGallery(): void {
    this.teardownStudio();
    this.currentStudioId = null;
    renderGallery(this.mainEl, (id) => {
      appState.setSketch(id);
      router.goStudio(id);
    });
  }

  private async showStudio(sketchId: string): Promise<void> {
    const parsed = parseHash(window.location.hash);
    const mod = getSketch(sketchId);
    if (!mod) {
      this.flashStatus('Unknown sketch — back to gallery.');
      router.goGallery();
      return;
    }

    const sameSketch = this.currentStudioId === sketchId && this.canvasHost;
    if (!sameSketch) {
      this.teardownStudio();
      this.currentStudioId = sketchId;
      this.buildStudioDom();
    }

    // Load state from URL when present; else defaults
    this.suppressUrl = true;
    if (parsed.sketchId === sketchId && Object.keys(parsed.params).length > 0) {
      appState.setSketch(sketchId, parsed.params);
      if (parsed.malformed) {
        this.flashStatus('Link incomplete — some settings used defaults.');
      }
    } else if (appState.getSketchId() !== sketchId) {
      appState.setSketch(sketchId);
    }
    this.suppressUrl = false;

    const module = appState.getModule();
    if (!module || !this.canvasHost || !this.paneHost || !this.creditEl) return;

    renderCreditBadge(this.creditEl, module.credit);
    paramController.mount(this.paneHost, appState, module);

    fpsMonitor.reset();
    p5Host.setFrameCallback((instant) => this.onFrame(instant));
    p5Host.setErrorCallback((err) => {
      console.error(err);
      this.flashStatus('Sketch error — try Reset.');
    });

    if (this.exportBtn) {
      this.exportBtn.disabled = true;
    }

    await p5Host.mount(module, this.canvasHost, () => this.liveParams());

    // Only enable export if this studio is still active
    if (this.currentStudioId === sketchId && this.exportBtn) {
      this.exportBtn.disabled = false;
    }
    this.syncPauseUi();
    if (this.paused) {
      this.flashStatus('Animation paused. Press Play to animate.');
    }
  }

  private buildStudioDom(): void {
    this.mainEl.innerHTML = '';
    this.mainEl.className = 'app-main studio';

    const toolbar = document.createElement('div');
    toolbar.className = 'studio-toolbar';

    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'btn';
    back.textContent = '← Gallery';
    back.addEventListener('click', () => router.goGallery());

    const randomize = document.createElement('button');
    randomize.type = 'button';
    randomize.className = 'btn';
    randomize.textContent = 'Randomize';
    randomize.addEventListener('click', () => {
      appState.randomize();
      const mod = appState.getModule();
      if (mod && this.paneHost) paramController.refreshFromState(appState, mod);
    });

    const reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'btn';
    reset.textContent = 'Reset';
    reset.addEventListener('click', () => {
      appState.reset();
      const mod = appState.getModule();
      if (mod && this.paneHost) paramController.refreshFromState(appState, mod);
    });

    this.pauseBtn = document.createElement('button');
    this.pauseBtn.type = 'button';
    this.pauseBtn.className = 'btn';
    this.pauseBtn.textContent = this.paused ? 'Play' : 'Pause';
    this.pauseBtn.setAttribute('aria-pressed', this.paused ? 'true' : 'false');
    this.pauseBtn.addEventListener('click', () => {
      this.paused = !this.paused;
      this.syncPauseUi();
      this.flashStatus(this.paused ? 'Animation paused.' : 'Animation playing.');
    });

    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'btn btn-primary';
    copy.textContent = 'Copy link';
    copy.addEventListener('click', () => void this.copyLink());

    this.exportBtn = document.createElement('button');
    this.exportBtn.type = 'button';
    this.exportBtn.className = 'btn btn-primary';
    this.exportBtn.textContent = 'Export PNG';
    this.exportBtn.addEventListener('click', () => this.doExport());

    toolbar.append(back, randomize, reset, this.pauseBtn, copy, this.exportBtn);

    this.fpsEl = document.createElement('div');
    this.fpsEl.className = 'fps-banner';
    this.fpsEl.hidden = true;

    this.creditEl = document.createElement('div');

    const layout = document.createElement('div');
    layout.className = 'studio-layout';

    this.canvasHost = document.createElement('div');
    this.canvasHost.className = 'canvas-host';
    this.canvasHost.setAttribute('aria-label', 'Sketch canvas');

    const side = document.createElement('div');
    side.className = 'studio-side';

    this.paneHost = document.createElement('div');
    this.paneHost.className = 'pane-host';

    this.statusEl = document.createElement('div');
    this.statusEl.className = 'status-line';
    this.statusEl.setAttribute('role', 'status');
    this.statusEl.setAttribute('aria-live', 'polite');

    side.append(this.paneHost);
    layout.append(this.canvasHost, side);
    this.mainEl.append(toolbar, this.fpsEl, this.creditEl, layout, this.statusEl);
  }

  private teardownStudio(): void {
    p5Host.dispose();
    paramController.dispose();
    this.canvasHost = null;
    this.paneHost = null;
    this.creditEl = null;
    this.fpsEl = null;
    this.statusEl = null;
    this.exportBtn = null;
    this.pauseBtn = null;
    if (this.urlTimer !== null) {
      window.clearTimeout(this.urlTimer);
      this.urlTimer = null;
    }
  }

  private onStateChange(): void {
    if (this.suppressUrl) return;
    if (router.parse().name !== 'studio') return;
    const snap = appState.getSnapshot();
    if (!snap.sketchId) return;
    const mod = getSketch(snap.sketchId);
    if (!mod) return;

    if (this.urlTimer !== null) window.clearTimeout(this.urlTimer);
    this.urlTimer = window.setTimeout(() => {
      const hash = encodeHash(snap.sketchId!, snap.params, mod.paramSchema);
      router.replaceHash(hash);
    }, AppConfig.urlDebounceMs);
  }

  private onFrame(instantFps: number): void {
    const status = fpsMonitor.push(instantFps);
    if (this.fpsEl) {
      renderFpsBanner(this.fpsEl, status.fps, status.warn);
    }

    if (!status.shouldClampDensity) return;

    const now = performance.now();
    if (now - this.lastClampAt < AppConfig.fpsSampleWindowMs) return;

    const mod = appState.getModule();
    if (!mod || !mod.densityKey) return;

    const key = mod.densityKey;
    const def = mod.paramSchema.find((d) => d.key === key);
    if (!def || def.type !== 'number') return;

    const current = num(appState.getParams(), key, 0);
    const min = def.min ?? 0;
    if (current <= min) return;

    const step = mod.densityClampStep ?? AppConfig.densityClampStep;
    const next = Math.max(min, current - step);
    if (next === current) return;

    this.lastClampAt = now;
    this.suppressUrl = true;
    appState.setParam(key, next);
    this.suppressUrl = false;
    paramController.refreshFromState(appState, mod);
    this.flashStatus(`Density lowered to ${next} to improve FPS.`);
    // Still update URL for the clamp
    const snap = appState.getSnapshot();
    if (snap.sketchId) {
      router.replaceHash(encodeHash(snap.sketchId, snap.params, mod.paramSchema));
    }
  }

  private async copyLink(): Promise<void> {
    const snap = appState.getSnapshot();
    const mod = appState.getModule();
    if (!snap.sketchId || !mod) {
      this.flashStatus('Nothing to share yet.');
      return;
    }
    // Immediate flush (no debounce)
    const hash = encodeHash(snap.sketchId, snap.params, mod.paramSchema);
    router.replaceHash(hash);
    const url = buildShareUrl(snap.sketchId, snap.params, mod.paramSchema);
    try {
      await navigator.clipboard.writeText(url);
      this.flashStatus('Link copied.');
    } catch {
      // Fallback prompt
      window.prompt('Copy this link:', url);
      this.flashStatus('Copy the link from the dialog.');
    }
  }

  private doExport(): void {
    const id = appState.getSketchId() ?? 'sketch';
    const ok = exportPng(p5Host.getCanvas(), id);
    this.flashStatus(ok ? 'PNG downloaded.' : 'Export failed — canvas not ready.');
  }

  private flashStatus(msg: string): void {
    if (!this.statusEl) {
      console.info(msg);
      return;
    }
    this.statusEl.textContent = msg;
  }
}

export function assertRegistryReady(): void {
  if (listSketches().length < 3) {
    throw new Error('Registry must contain ≥3 sketches');
  }
}
