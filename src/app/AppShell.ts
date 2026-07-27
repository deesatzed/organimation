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
import { paramHistory } from '../lib/history';
import { addFavorite } from '../lib/favorites';
import { MOODS, applyMood } from '../lib/moods';

export class AppShell {
  private root: HTMLElement;
  private mainEl!: HTMLElement;
  private canvasHost: HTMLElement | null = null;
  private paneHost: HTMLElement | null = null;
  private creditEl: HTMLElement | null = null;
  private fpsEl: HTMLElement | null = null;
  private statusEl: HTMLElement | null = null;
  private moodHost: HTMLElement | null = null;
  private exportBtn: HTMLButtonElement | null = null;
  private pauseBtn: HTMLButtonElement | null = null;
  private undoBtn: HTMLButtonElement | null = null;
  private urlTimer: number | null = null;
  private ambientTimer: number | null = null;
  private lastClampAt = 0;
  private suppressUrl = false;
  private currentStudioId: string | null = null;
  private paused = false;
  private ambientOn = false;
  private moodIndex = 0;
  private keysBound = false;

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
      <p class="shortcuts-hint">Keys: R randomize · Z undo · Space pause · F full · S PNG · L link · M mood · A ambient</p>
    `;

    this.mainEl = document.createElement('main');
    this.mainEl.id = 'main-content';
    this.mainEl.className = 'app-main';
    this.mainEl.tabIndex = -1;

    const footer = document.createElement('footer');
    footer.className = 'app-footer';
    footer.innerHTML = `
      <span>Browser-only · p5.js · Vite · local favorites</span>
      <a href="#/">Gallery</a>
    `;

    this.root.append(skip, header, this.mainEl, footer);

    if (prefersReducedMotion()) {
      this.paused = true;
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    mq.addEventListener('change', () => {
      if (mq.matches) {
        this.paused = true;
        this.syncPauseUi();
        this.flashStatus('Reduced motion on — animation paused.');
      }
    });

    window.addEventListener('organimation:favorites-changed', () => {
      if (router.parse().name === 'gallery') this.showGallery();
    });

    this.bindKeys();

    router.subscribe((route) => this.onRoute(route));
    appState.subscribe(() => this.onStateChange());
    router.start();
    this.onRoute(router.parse());
  }

  private bindKeys(): void {
    if (this.keysBound) return;
    this.keysBound = true;
    window.addEventListener('keydown', (e) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) {
        return;
      }
      if (router.parse().name !== 'studio' && e.key !== 'a' && e.key !== 'A') {
        // Ambient works on gallery too
        if (e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          this.toggleAmbient();
        }
        return;
      }

      switch (e.key) {
        case 'r':
        case 'R':
          e.preventDefault();
          this.doRandomize();
          break;
        case 'z':
        case 'Z':
          e.preventDefault();
          this.doUndo();
          break;
        case ' ':
          e.preventDefault();
          this.togglePause();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          void this.toggleFullscreen();
          break;
        case 's':
        case 'S':
          e.preventDefault();
          this.doExport();
          break;
        case 'l':
        case 'L':
          e.preventDefault();
          void this.copyLink();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          this.applyNextMood();
          break;
        case 'a':
        case 'A':
          e.preventDefault();
          this.toggleAmbient();
          break;
        default:
          break;
      }
    });
  }

  private liveParams(): ParamsMap {
    const base = appState.getParams();
    if (!this.paused) return base;
    return { ...base, speed: 0 };
  }

  private syncPauseUi(): void {
    if (this.pauseBtn) {
      this.pauseBtn.textContent = this.paused ? 'Play' : 'Pause';
      this.pauseBtn.setAttribute('aria-pressed', this.paused ? 'true' : 'false');
    }
  }

  private syncUndoUi(): void {
    if (this.undoBtn) {
      this.undoBtn.disabled = paramHistory.size === 0;
    }
  }

  private pushHistory(): void {
    if (appState.getSketchId()) {
      paramHistory.push(appState.getParams());
      this.syncUndoUi();
    }
  }

  private refreshPane(): void {
    const mod = appState.getModule();
    if (mod && this.paneHost) paramController.refreshFromState(appState, mod);
  }

  private doRandomize(): void {
    if (!appState.getSketchId()) return;
    this.pushHistory();
    appState.randomize();
    this.refreshPane();
    this.flashStatus('Randomized. Z to undo.');
  }

  private doUndo(): void {
    const prev = paramHistory.pop();
    this.syncUndoUi();
    if (!prev) {
      this.flashStatus('Nothing to undo.');
      return;
    }
    this.suppressUrl = true;
    appState.setParams(prev);
    this.suppressUrl = false;
    this.refreshPane();
    this.flashStatus('Undid last change.');
  }

  private doReset(): void {
    this.pushHistory();
    appState.reset();
    this.refreshPane();
    this.flashStatus('Reset to defaults.');
  }

  private togglePause(): void {
    this.paused = !this.paused;
    this.syncPauseUi();
    this.flashStatus(this.paused ? 'Animation paused.' : 'Animation playing.');
  }

  private applyNextMood(): void {
    const mod = appState.getModule();
    if (!mod) return;
    this.pushHistory();
    const mood = MOODS[this.moodIndex % MOODS.length]!;
    this.moodIndex++;
    const next = applyMood(mod.paramSchema, appState.getParams(), mood);
    appState.setParams(next);
    this.refreshPane();
    this.flashStatus(`Mood: ${mood.label}`);
  }

  private applyMoodAt(index: number): void {
    const mod = appState.getModule();
    if (!mod) return;
    const mood = MOODS[index];
    if (!mood) return;
    this.pushHistory();
    this.moodIndex = index + 1;
    const next = applyMood(mod.paramSchema, appState.getParams(), mood);
    appState.setParams(next);
    this.refreshPane();
    this.flashStatus(`Mood: ${mood.label}`);
  }

  private saveFavorite(): void {
    const id = appState.getSketchId();
    const mod = appState.getModule();
    if (!id || !mod) return;
    const title = `${mod.credit.title} · ${new Date().toLocaleString()}`;
    addFavorite(id, title, appState.getParams());
    this.flashStatus('Saved to favorites (this browser).');
  }

  private async toggleFullscreen(): Promise<void> {
    const el = this.canvasHost;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
        this.flashStatus('Fullscreen — Esc to exit.');
      } else {
        await document.exitFullscreen();
      }
    } catch {
      this.flashStatus('Fullscreen not available.');
    }
  }

  private toggleAmbient(): void {
    this.ambientOn = !this.ambientOn;
    if (this.ambientTimer !== null) {
      window.clearInterval(this.ambientTimer);
      this.ambientTimer = null;
    }
    if (this.ambientOn) {
      // Reduced motion users still get slow changes but stay paused visually
      this.ambientTimer = window.setInterval(() => this.ambientTick(), 9000);
      this.flashStatus('Ambient Shuffle on — changes every ~9s.');
      if (router.parse().name === 'gallery') {
        this.ambientTick();
      }
    } else {
      this.flashStatus('Ambient Shuffle off.');
    }
    if (router.parse().name === 'gallery') this.showGallery();
  }

  private ambientTick(): void {
    const list = listSketches();
    if (list.length === 0) return;
    const pick = list[Math.floor(Math.random() * list.length)]!;
    paramHistory.clear();
    appState.setSketch(pick.id);
    appState.randomize();
    if (this.currentStudioId === pick.id && this.paneHost) {
      this.refreshPane();
      this.flashStatus(`Ambient → ${pick.credit.title}`);
      return;
    }
    router.goStudio(pick.id);
  }

  private surprise(): void {
    const list = listSketches();
    if (list.length === 0) return;
    const pick = list[Math.floor(Math.random() * list.length)]!;
    paramHistory.clear();
    appState.setSketch(pick.id);
    appState.randomize();
    router.goStudio(pick.id);
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
    renderGallery(this.mainEl, {
      onOpen: (id, params) => {
        paramHistory.clear();
        if (params) appState.setSketch(id, params as ParamsMap);
        else appState.setSketch(id);
        router.goStudio(id);
      },
      onAmbientToggle: () => this.toggleAmbient(),
      ambientOn: this.ambientOn,
      onSurprise: () => this.surprise(),
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
      paramHistory.clear();
    }

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
    this.renderMoodBar();

    fpsMonitor.reset();
    p5Host.setFrameCallback((instant) => this.onFrame(instant));
    p5Host.setErrorCallback((err) => {
      console.error(err);
      this.flashStatus('Sketch error — try Reset.');
    });

    if (this.exportBtn) this.exportBtn.disabled = true;

    await p5Host.mount(module, this.canvasHost, () => this.liveParams());

    if (this.currentStudioId === sketchId && this.exportBtn) {
      this.exportBtn.disabled = false;
    }
    this.syncPauseUi();
    this.syncUndoUi();
  }

  private renderMoodBar(): void {
    if (!this.moodHost) return;
    this.moodHost.innerHTML = '';
    const label = document.createElement('span');
    label.className = 'mood-label';
    label.textContent = 'Moods:';
    this.moodHost.appendChild(label);
    MOODS.forEach((mood, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn mood-btn';
      b.textContent = mood.label;
      b.addEventListener('click', () => this.applyMoodAt(i));
      this.moodHost!.appendChild(b);
    });
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
    randomize.addEventListener('click', () => this.doRandomize());

    this.undoBtn = document.createElement('button');
    this.undoBtn.type = 'button';
    this.undoBtn.className = 'btn';
    this.undoBtn.textContent = 'Undo';
    this.undoBtn.disabled = true;
    this.undoBtn.addEventListener('click', () => this.doUndo());

    const reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'btn';
    reset.textContent = 'Reset';
    reset.addEventListener('click', () => this.doReset());

    this.pauseBtn = document.createElement('button');
    this.pauseBtn.type = 'button';
    this.pauseBtn.className = 'btn';
    this.pauseBtn.textContent = this.paused ? 'Play' : 'Pause';
    this.pauseBtn.setAttribute('aria-pressed', this.paused ? 'true' : 'false');
    this.pauseBtn.addEventListener('click', () => this.togglePause());

    const full = document.createElement('button');
    full.type = 'button';
    full.className = 'btn';
    full.textContent = 'Fullscreen';
    full.addEventListener('click', () => void this.toggleFullscreen());

    const fav = document.createElement('button');
    fav.type = 'button';
    fav.className = 'btn';
    fav.textContent = '★ Favorite';
    fav.addEventListener('click', () => this.saveFavorite());

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

    toolbar.append(
      back,
      randomize,
      this.undoBtn,
      reset,
      this.pauseBtn,
      full,
      fav,
      copy,
      this.exportBtn,
    );

    this.moodHost = document.createElement('div');
    this.moodHost.className = 'mood-bar';

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
    this.mainEl.append(
      toolbar,
      this.moodHost,
      this.fpsEl,
      this.creditEl,
      layout,
      this.statusEl,
    );
  }

  private teardownStudio(): void {
    p5Host.dispose();
    paramController.dispose();
    this.canvasHost = null;
    this.paneHost = null;
    this.creditEl = null;
    this.fpsEl = null;
    this.statusEl = null;
    this.moodHost = null;
    this.exportBtn = null;
    this.pauseBtn = null;
    this.undoBtn = null;
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
    this.refreshPane();
    this.flashStatus(`Density lowered to ${next} to improve FPS.`);
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
    const hash = encodeHash(snap.sketchId, snap.params, mod.paramSchema);
    router.replaceHash(hash);
    const url = buildShareUrl(snap.sketchId, snap.params, mod.paramSchema);
    try {
      await navigator.clipboard.writeText(url);
      this.flashStatus('Link copied.');
    } catch {
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
