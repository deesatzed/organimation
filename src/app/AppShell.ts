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
import { exportWebmLoop } from '../share/webmExport';
import { paramController } from '../ui/ParamController';
import { renderGallery } from '../ui/GalleryView';
import { renderCreditBadge } from '../ui/CreditBadge';
import { renderFpsBanner } from '../ui/FpsBanner';
import { paramHistory } from '../lib/history';
import { addFavorite } from '../lib/favorites';
import { MOODS, applyMood } from '../lib/moods';
import { PALETTES, applyPalette } from '../lib/palettes';
import { runMorph, type MorphCancel } from '../lib/morph';
import { micReactor } from '../lib/micReact';

export class AppShell {
  private root: HTMLElement;
  private mainEl!: HTMLElement;
  private canvasHost: HTMLElement | null = null;
  private pinHost: HTMLElement | null = null;
  private layoutEl: HTMLElement | null = null;
  private paneHost: HTMLElement | null = null;
  private creditEl: HTMLElement | null = null;
  private fpsEl: HTMLElement | null = null;
  private statusEl: HTMLElement | null = null;
  private moodHost: HTMLElement | null = null;
  private paletteHost: HTMLElement | null = null;
  private exportBtn: HTMLButtonElement | null = null;
  private webmBtn: HTMLButtonElement | null = null;
  private pauseBtn: HTMLButtonElement | null = null;
  private undoBtn: HTMLButtonElement | null = null;
  private micBtn: HTMLButtonElement | null = null;
  private pinBtn: HTMLButtonElement | null = null;
  private urlTimer: number | null = null;
  private ambientTimer: number | null = null;
  private lastClampAt = 0;
  private suppressUrl = false;
  private currentStudioId: string | null = null;
  private paused = false;
  private ambientOn = false;
  private moodIndex = 0;
  private paletteIndex = 0;
  private keysBound = false;
  private recording = false;
  private morphing = false;
  private cancelMorph: MorphCancel | null = null;
  private pinned = false;

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
      <p class="shortcuts-hint">Keys: R rand · Z undo · Space pause · F full · S PNG · V loop · L link · M mood · P palette · C pin · B mic · A ambient</p>
    `;

    this.mainEl = document.createElement('main');
    this.mainEl.id = 'main-content';
    this.mainEl.className = 'app-main';
    this.mainEl.tabIndex = -1;

    const footer = document.createElement('footer');
    footer.className = 'app-footer';
    footer.innerHTML = `
      <span>Browser-only · p5.js · favorites · WebM · mic optional</span>
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
      if (router.parse().name !== 'studio') {
        if (e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          this.toggleAmbient();
        }
        return;
      }

      const map: Record<string, () => void> = {
        r: () => this.doRandomize(),
        R: () => this.doRandomize(),
        z: () => this.doUndo(),
        Z: () => this.doUndo(),
        ' ': () => this.togglePause(),
        f: () => void this.toggleFullscreen(),
        F: () => void this.toggleFullscreen(),
        s: () => this.doExport(),
        S: () => this.doExport(),
        v: () => void this.doWebm(),
        V: () => void this.doWebm(),
        l: () => void this.copyLink(),
        L: () => void this.copyLink(),
        m: () => this.morphToNextMood(),
        M: () => this.morphToNextMood(),
        p: () => this.applyNextPalette(),
        P: () => this.applyNextPalette(),
        c: () => this.togglePin(),
        C: () => this.togglePin(),
        b: () => void this.toggleMic(),
        B: () => void this.toggleMic(),
        a: () => this.toggleAmbient(),
        A: () => this.toggleAmbient(),
      };
      const fn = map[e.key];
      if (fn) {
        e.preventDefault();
        fn();
      }
    });
  }

  private liveParams(): ParamsMap {
    const base = { ...appState.getParams() };
    if (this.paused) {
      base.speed = 0;
      return base;
    }
    if (micReactor.isActive && typeof base.speed === 'number') {
      const e = micReactor.energy();
      // Map energy → speed multiplier 0.35..2.2 around current base
      const mult = 0.35 + e * 1.85;
      base.speed = Math.max(0.05, (base.speed as number) * mult);
    }
    return base;
  }

  private syncPauseUi(): void {
    if (this.pauseBtn) {
      this.pauseBtn.textContent = this.paused ? 'Play' : 'Pause';
      this.pauseBtn.setAttribute('aria-pressed', this.paused ? 'true' : 'false');
    }
  }

  private syncUndoUi(): void {
    if (this.undoBtn) this.undoBtn.disabled = paramHistory.size === 0;
  }

  private syncMicUi(): void {
    if (this.micBtn) {
      this.micBtn.textContent = micReactor.isActive ? 'Mic On' : 'Mic';
      this.micBtn.setAttribute('aria-pressed', micReactor.isActive ? 'true' : 'false');
    }
  }

  private syncPinUi(): void {
    if (this.pinBtn) {
      this.pinBtn.textContent = this.pinned ? 'Unpin' : 'Pin compare';
      this.pinBtn.setAttribute('aria-pressed', this.pinned ? 'true' : 'false');
    }
    if (this.layoutEl) {
      this.layoutEl.classList.toggle('compare-on', this.pinned);
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

  private stopMorph(): void {
    if (this.cancelMorph) {
      this.cancelMorph();
      this.cancelMorph = null;
    }
    this.morphing = false;
  }

  private doRandomize(): void {
    if (!appState.getSketchId() || this.morphing) return;
    this.pushHistory();
    appState.randomize();
    this.refreshPane();
    this.flashStatus('Randomized. Z to undo.');
  }

  private doUndo(): void {
    if (this.morphing) this.stopMorph();
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
    if (this.morphing) this.stopMorph();
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

  /** Instant mood (used by mood buttons). */
  private applyMoodAt(index: number): void {
    const mod = appState.getModule();
    if (!mod || this.morphing) return;
    const mood = MOODS[index];
    if (!mood) return;
    this.pushHistory();
    this.moodIndex = index + 1;
    appState.setParams(applyMood(mod.paramSchema, appState.getParams(), mood));
    this.refreshPane();
    this.flashStatus(`Mood: ${mood.label}`);
  }

  /** Animated morph current → next mood (M key / Morph button). */
  private morphToNextMood(): void {
    const mod = appState.getModule();
    if (!mod || this.morphing || this.recording) return;

    const mood = MOODS[this.moodIndex % MOODS.length]!;
    this.moodIndex++;
    const from = { ...appState.getParams() };
    const to = applyMood(mod.paramSchema, from, mood);

    this.pushHistory();
    this.morphing = true;
    this.suppressUrl = true;
    this.flashStatus(`Morphing → ${mood.label}…`);

    this.cancelMorph = runMorph(
      mod.paramSchema,
      from,
      to,
      prefersReducedMotion() ? 200 : 1800,
      (params) => {
        appState.setParams(params);
        // Avoid rebuilding pane every frame — only final
      },
      () => {
        this.morphing = false;
        this.cancelMorph = null;
        this.suppressUrl = false;
        this.refreshPane();
        this.flashStatus(`Mood: ${mood.label}`);
        // Flush URL once
        const snap = appState.getSnapshot();
        if (snap.sketchId) {
          router.replaceHash(encodeHash(snap.sketchId, snap.params, mod.paramSchema));
        }
      },
    );
  }

  private applyPaletteAt(index: number): void {
    const mod = appState.getModule();
    if (!mod || this.morphing) return;
    const pal = PALETTES[index];
    if (!pal) return;
    this.pushHistory();
    this.paletteIndex = index + 1;
    appState.setParams(applyPalette(mod.paramSchema, appState.getParams(), pal));
    this.refreshPane();
    this.flashStatus(`Palette: ${pal.label}`);
  }

  private applyNextPalette(): void {
    this.applyPaletteAt(this.paletteIndex % PALETTES.length);
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

  private togglePin(): void {
    if (!this.pinHost || !this.canvasHost) return;
    if (this.pinned) {
      this.pinned = false;
      this.pinHost.innerHTML = '';
      this.pinHost.hidden = true;
      this.syncPinUi();
      this.flashStatus('Compare cleared.');
      return;
    }
    const canvas = p5Host.getCanvas();
    if (!canvas) {
      this.flashStatus('Nothing to pin yet.');
      return;
    }
    try {
      const url = canvas.toDataURL('image/png');
      this.pinHost.innerHTML = '';
      const img = document.createElement('img');
      img.src = url;
      img.alt = 'Pinned comparison snapshot';
      this.pinHost.appendChild(img);
      const cap = document.createElement('p');
      cap.className = 'pin-caption';
      cap.textContent = 'Pinned (left) vs live (right)';
      this.pinHost.appendChild(cap);
      this.pinHost.hidden = false;
      this.pinned = true;
      this.syncPinUi();
      this.flashStatus('Pinned left for compare. Tweak right, then Unpin.');
    } catch {
      this.flashStatus('Pin failed.');
    }
  }

  private async toggleMic(): Promise<void> {
    if (micReactor.isActive) {
      micReactor.stop();
      this.syncMicUi();
      this.flashStatus('Mic off.');
      return;
    }
    const res = await micReactor.start();
    this.syncMicUi();
    if (!res.ok) {
      this.flashStatus(`Mic unavailable: ${res.error ?? 'denied'}`);
      return;
    }
    if (this.paused) {
      this.paused = false;
      this.syncPauseUi();
    }
    this.flashStatus('Mic on — speed reacts to sound.');
  }

  private toggleAmbient(): void {
    this.ambientOn = !this.ambientOn;
    if (this.ambientTimer !== null) {
      window.clearInterval(this.ambientTimer);
      this.ambientTimer = null;
    }
    if (this.ambientOn) {
      this.ambientTimer = window.setInterval(() => this.ambientTick(), 9000);
      this.flashStatus('Ambient Shuffle on — changes every ~9s.');
      if (router.parse().name === 'gallery') this.ambientTick();
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
    this.stopMorph();
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
    this.stopMorph();
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
        this.stopMorph();
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
    this.renderPaletteBar();

    fpsMonitor.reset();
    p5Host.setFrameCallback((instant) => this.onFrame(instant));
    p5Host.setErrorCallback((err) => {
      console.error(err);
      this.flashStatus('Sketch error — try Reset.');
    });

    if (this.exportBtn) this.exportBtn.disabled = true;
    if (this.webmBtn) this.webmBtn.disabled = true;

    await p5Host.mount(module, this.canvasHost, () => this.liveParams());

    if (this.currentStudioId === sketchId) {
      if (this.exportBtn) this.exportBtn.disabled = false;
      if (this.webmBtn) this.webmBtn.disabled = this.recording;
    }
    this.syncPauseUi();
    this.syncUndoUi();
    this.syncMicUi();
    this.syncPinUi();
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
    const morphBtn = document.createElement('button');
    morphBtn.type = 'button';
    morphBtn.className = 'btn btn-primary mood-btn';
    morphBtn.textContent = 'Morph →';
    morphBtn.title = 'Animate into the next mood (M)';
    morphBtn.addEventListener('click', () => this.morphToNextMood());
    this.moodHost.appendChild(morphBtn);
  }

  private renderPaletteBar(): void {
    if (!this.paletteHost) return;
    this.paletteHost.innerHTML = '';
    const label = document.createElement('span');
    label.className = 'mood-label';
    label.textContent = 'Palettes:';
    this.paletteHost.appendChild(label);
    PALETTES.forEach((pal, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn mood-btn palette-swatch';
      b.textContent = pal.label;
      const col = typeof pal.patch.color === 'string' ? pal.patch.color : '#888';
      b.style.setProperty('--swatch', col);
      b.addEventListener('click', () => this.applyPaletteAt(i));
      this.paletteHost!.appendChild(b);
    });
  }

  private buildStudioDom(): void {
    this.mainEl.innerHTML = '';
    this.mainEl.className = 'app-main studio';

    const toolbar = document.createElement('div');
    toolbar.className = 'studio-toolbar';

    const mk = (label: string, cls = 'btn', onClick: () => void) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = cls;
      b.textContent = label;
      b.addEventListener('click', onClick);
      return b;
    };

    toolbar.append(
      mk('← Gallery', 'btn', () => router.goGallery()),
      mk('Randomize', 'btn', () => this.doRandomize()),
    );

    this.undoBtn = mk('Undo', 'btn', () => this.doUndo());
    this.undoBtn.disabled = true;
    toolbar.append(this.undoBtn);

    toolbar.append(
      mk('Reset', 'btn', () => this.doReset()),
    );

    this.pauseBtn = mk(this.paused ? 'Play' : 'Pause', 'btn', () => this.togglePause());
    this.pauseBtn.setAttribute('aria-pressed', this.paused ? 'true' : 'false');
    toolbar.append(this.pauseBtn);

    toolbar.append(mk('Fullscreen', 'btn', () => void this.toggleFullscreen()));

    this.pinBtn = mk('Pin compare', 'btn', () => this.togglePin());
    toolbar.append(this.pinBtn);

    this.micBtn = mk('Mic', 'btn', () => void this.toggleMic());
    toolbar.append(this.micBtn);

    toolbar.append(mk('★ Favorite', 'btn', () => this.saveFavorite()));

    const copy = mk('Copy link', 'btn btn-primary', () => void this.copyLink());
    toolbar.append(copy);

    this.exportBtn = mk('Export PNG', 'btn btn-primary', () => this.doExport());
    toolbar.append(this.exportBtn);

    this.webmBtn = mk('Loop 3s', 'btn btn-primary', () => void this.doWebm());
    toolbar.append(this.webmBtn);

    this.moodHost = document.createElement('div');
    this.moodHost.className = 'mood-bar';

    this.paletteHost = document.createElement('div');
    this.paletteHost.className = 'mood-bar palette-bar';

    this.fpsEl = document.createElement('div');
    this.fpsEl.className = 'fps-banner';
    this.fpsEl.hidden = true;

    this.creditEl = document.createElement('div');

    this.layoutEl = document.createElement('div');
    this.layoutEl.className = 'studio-layout';

    this.pinHost = document.createElement('div');
    this.pinHost.className = 'pin-host';
    this.pinHost.hidden = true;

    this.canvasHost = document.createElement('div');
    this.canvasHost.className = 'canvas-host';
    this.canvasHost.setAttribute('aria-label', 'Sketch canvas');

    const stage = document.createElement('div');
    stage.className = 'studio-stage';
    stage.append(this.pinHost, this.canvasHost);

    const side = document.createElement('div');
    side.className = 'studio-side';

    this.paneHost = document.createElement('div');
    this.paneHost.className = 'pane-host';
    side.append(this.paneHost);

    this.layoutEl.append(stage, side);

    this.statusEl = document.createElement('div');
    this.statusEl.className = 'status-line';
    this.statusEl.setAttribute('role', 'status');
    this.statusEl.setAttribute('aria-live', 'polite');

    this.mainEl.append(
      toolbar,
      this.moodHost,
      this.paletteHost,
      this.fpsEl,
      this.creditEl,
      this.layoutEl,
      this.statusEl,
    );
  }

  private teardownStudio(): void {
    this.stopMorph();
    if (micReactor.isActive) micReactor.stop();
    p5Host.dispose();
    paramController.dispose();
    this.canvasHost = null;
    this.pinHost = null;
    this.layoutEl = null;
    this.paneHost = null;
    this.creditEl = null;
    this.fpsEl = null;
    this.statusEl = null;
    this.moodHost = null;
    this.paletteHost = null;
    this.exportBtn = null;
    this.webmBtn = null;
    this.pauseBtn = null;
    this.undoBtn = null;
    this.micBtn = null;
    this.pinBtn = null;
    this.pinned = false;
    this.recording = false;
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

    if (!status.shouldClampDensity || this.morphing) return;

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

  private async doWebm(): Promise<void> {
    if (this.recording) return;
    const id = appState.getSketchId() ?? 'sketch';
    const canvas = p5Host.getCanvas();
    if (!canvas) {
      this.flashStatus('Canvas not ready.');
      return;
    }
    // Ensure motion for recording
    if (this.paused) {
      this.paused = false;
      this.syncPauseUi();
    }
    this.recording = true;
    if (this.webmBtn) {
      this.webmBtn.disabled = true;
      this.webmBtn.textContent = 'Recording…';
    }
    this.flashStatus('Recording 3s loop…');
    const result = await exportWebmLoop(canvas, id, { durationMs: 3000 });
    this.recording = false;
    if (this.webmBtn) {
      this.webmBtn.disabled = false;
      this.webmBtn.textContent = 'Loop 3s';
    }
    if (result.ok) {
      this.flashStatus(`Loop saved (${result.mimeType ?? 'video'}).`);
    } else {
      this.flashStatus(`Loop failed: ${result.error ?? 'unknown'}`);
    }
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
