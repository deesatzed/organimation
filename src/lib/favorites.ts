import type { ParamsMap } from '../sketches/types';

const KEY = 'organimation.favorites.v1';

export interface FavoriteItem {
  id: string;
  sketchId: string;
  title: string;
  params: ParamsMap;
  savedAt: string;
}

interface Store {
  v: 1;
  items: FavoriteItem[];
}

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { v: 1, items: [] };
    const parsed = JSON.parse(raw) as Store;
    if (parsed?.v !== 1 || !Array.isArray(parsed.items)) return { v: 1, items: [] };
    return parsed;
  } catch {
    return { v: 1, items: [] };
  }
}

function write(store: Store): void {
  localStorage.setItem(KEY, JSON.stringify(store));
}

export function listFavorites(): FavoriteItem[] {
  return read().items.slice().sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export function listFavoritesForSketch(sketchId: string): FavoriteItem[] {
  return listFavorites().filter((f) => f.sketchId === sketchId);
}

export function addFavorite(
  sketchId: string,
  title: string,
  params: ParamsMap,
): FavoriteItem {
  const store = read();
  const item: FavoriteItem = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    sketchId,
    title,
    params: { ...params },
    savedAt: new Date().toISOString(),
  };
  store.items.unshift(item);
  // Cap total favorites
  store.items = store.items.slice(0, 80);
  write(store);
  return item;
}

export function removeFavorite(id: string): void {
  const store = read();
  store.items = store.items.filter((i) => i.id !== id);
  write(store);
}
