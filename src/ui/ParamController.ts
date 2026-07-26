import { Pane } from 'tweakpane';
import type { AppState } from '../app/AppState';
import type { ParamDef, SketchModule } from '../sketches/types';

export class ParamController {
  private pane: Pane | null = null;
  private host: HTMLElement | null = null;
  private binding = false;

  mount(host: HTMLElement, state: AppState, module: SketchModule): void {
    this.dispose();
    this.host = host;
    host.innerHTML = '';

    this.pane = new Pane({ container: host, title: 'Tweak' });
    const params = { ...state.getParams() };

    for (const def of module.paramSchema) {
      this.bindParam(def, params, state);
    }
  }

  private bindParam(
    def: ParamDef,
    params: Record<string, unknown>,
    state: AppState,
  ): void {
    if (!this.pane) return;

    if (def.type === 'number') {
      const opts: { min?: number; max?: number; step?: number; label: string } = {
        label: def.label,
      };
      if (def.min !== undefined) opts.min = def.min;
      if (def.max !== undefined) opts.max = def.max;
      if (def.step !== undefined) opts.step = def.step;

      this.pane
        .addBinding(params, def.key, opts)
        .on('change', (ev) => {
          if (this.binding) return;
          state.setParam(def.key, ev.value as number);
        });
      return;
    }

    if (def.type === 'boolean') {
      this.pane
        .addBinding(params, def.key, { label: def.label })
        .on('change', (ev) => {
          if (this.binding) return;
          state.setParam(def.key, ev.value as boolean);
        });
      return;
    }

    // color — Tweakpane expects string hex
    this.pane
      .addBinding(params, def.key, { label: def.label, view: 'color' })
      .on('change', (ev) => {
        if (this.binding) return;
        state.setParam(def.key, String(ev.value));
      });
  }

  /** Refresh bindings from external state (URL load, randomize, reset, density clamp). */
  refreshFromState(state: AppState, module: SketchModule): void {
    if (!this.host) return;
    this.mount(this.host, state, module);
  }

  dispose(): void {
    if (this.pane) {
      this.pane.dispose();
      this.pane = null;
    }
    if (this.host) {
      this.host.innerHTML = '';
    }
  }
}

export const paramController = new ParamController();
