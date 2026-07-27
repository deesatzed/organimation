import type { ParamsMap } from '../sketches/types';

const MAX = 40;

/** Shallow snapshot stack for undo of param sets. */
export class ParamHistory {
  private stack: ParamsMap[] = [];

  clear(): void {
    this.stack = [];
  }

  push(params: ParamsMap): void {
    this.stack.push({ ...params });
    if (this.stack.length > MAX) this.stack.shift();
  }

  pop(): ParamsMap | null {
    return this.stack.pop() ?? null;
  }

  get size(): number {
    return this.stack.length;
  }
}

export const paramHistory = new ParamHistory();
