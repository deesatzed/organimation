export type Route =
  | { name: 'gallery' }
  | { name: 'paste' }
  | { name: 'studio'; sketchId: string };

type RouteListener = (route: Route) => void;

export class Router {
  private listeners = new Set<RouteListener>();

  start(): void {
    window.addEventListener('hashchange', this.onHash);
    // Ensure a hash exists
    if (!window.location.hash || window.location.hash === '#') {
      window.location.hash = '#/';
    }
    this.emit();
  }

  stop(): void {
    window.removeEventListener('hashchange', this.onHash);
  }

  private onHash = (): void => {
    this.emit();
  };

  private emit(): void {
    const route = this.parse();
    for (const fn of this.listeners) fn(route);
  }

  subscribe(fn: RouteListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  parse(hash = window.location.hash): Route {
    const raw = hash.startsWith('#') ? hash.slice(1) : hash;
    const path = (raw.split('?')[0] || '/').replace(/\/+$/, '') || '/';
    if (path === '/paste') {
      return { name: 'paste' };
    }
    const studio = path.match(/^\/s\/([^/]+)$/);
    if (studio?.[1]) {
      return { name: 'studio', sketchId: decodeURIComponent(studio[1]) };
    }
    return { name: 'gallery' };
  }

  goGallery(): void {
    window.location.hash = '#/';
  }

  goPaste(): void {
    window.location.hash = '#/paste';
  }

  goStudio(id: string, query = ''): void {
    const q = query.startsWith('?') ? query : query ? `?${query}` : '';
    window.location.hash = `#/s/${encodeURIComponent(id)}${q}`;
  }

  replaceHash(fullHash: string): void {
    const h = fullHash.startsWith('#') ? fullHash : `#${fullHash}`;
    if (window.location.hash === h) return;
    const url = `${window.location.pathname}${window.location.search}${h}`;
    window.history.replaceState(null, '', url);
  }
}

export const router = new Router();
