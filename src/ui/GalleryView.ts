import { listSketches } from '../sketches/registry';
import type { SketchModule } from '../sketches/types';
import {
  listFavorites,
  removeFavorite,
  type FavoriteItem,
} from '../lib/favorites';

export interface GalleryHandlers {
  onOpen: (id: string, params?: Record<string, unknown>) => void;
  onAmbientToggle: () => void;
  ambientOn: boolean;
  onSurprise: () => void;
  onPaste: () => void;
}

export function renderGallery(root: HTMLElement, handlers: GalleryHandlers): void {
  const sketches = listSketches();
  root.innerHTML = '';
  root.className = 'gallery';

  const intro = document.createElement('p');
  intro.className = 'gallery-intro';
  intro.textContent =
    'Pick a sketch, try a Mood in the studio, or start Ambient Shuffle for living wallpaper.';
  root.appendChild(intro);

  const actions = document.createElement('div');
  actions.className = 'gallery-actions';

  const surprise = document.createElement('button');
  surprise.type = 'button';
  surprise.className = 'btn btn-primary';
  surprise.textContent = 'Surprise me';
  surprise.addEventListener('click', () => handlers.onSurprise());

  const ambient = document.createElement('button');
  ambient.type = 'button';
  ambient.className = 'btn';
  ambient.textContent = handlers.ambientOn ? 'Stop Ambient' : 'Ambient Shuffle';
  ambient.setAttribute('aria-pressed', handlers.ambientOn ? 'true' : 'false');
  ambient.addEventListener('click', () => handlers.onAmbientToggle());

  const paste = document.createElement('button');
  paste.type = 'button';
  paste.className = 'btn btn-primary';
  paste.textContent = 'Paste golfed code';
  paste.addEventListener('click', () => handlers.onPaste());

  actions.append(surprise, ambient, paste);
  root.appendChild(actions);

  // Favorites strip
  const favs = listFavorites();
  if (favs.length > 0) {
    const favSec = document.createElement('section');
    favSec.className = 'favorites-section';
    const h = document.createElement('h2');
    h.className = 'section-title';
    h.textContent = 'Your favorites (this browser)';
    favSec.appendChild(h);
    const row = document.createElement('div');
    row.className = 'favorites-row';
    for (const f of favs.slice(0, 12)) {
      row.appendChild(favoriteChip(f, handlers));
    }
    favSec.appendChild(row);
    root.appendChild(favSec);
  }

  const grid = document.createElement('div');
  grid.className = 'gallery-grid';
  grid.setAttribute('role', 'list');

  for (const sketch of sketches) {
    grid.appendChild(card(sketch, handlers.onOpen));
  }

  root.appendChild(grid);
}

function favoriteChip(
  f: FavoriteItem,
  handlers: GalleryHandlers,
): HTMLElement {
  const el = document.createElement('div');
  el.className = 'favorite-chip';

  const open = document.createElement('button');
  open.type = 'button';
  open.className = 'btn btn-primary';
  open.textContent = f.title;
  open.title = f.sketchId;
  open.addEventListener('click', () => handlers.onOpen(f.sketchId, f.params));

  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'btn';
  del.textContent = '×';
  del.setAttribute('aria-label', `Remove favorite ${f.title}`);
  del.addEventListener('click', () => {
    removeFavorite(f.id);
    // Re-render is caller's responsibility via ambient toggle pattern — dispatch event
    window.dispatchEvent(new CustomEvent('organimation:favorites-changed'));
  });

  el.append(open, del);
  return el;
}

function card(
  sketch: SketchModule,
  onOpen: (id: string) => void,
): HTMLElement {
  const el = document.createElement('article');
  el.className = 'gallery-card';
  el.tabIndex = 0;
  el.setAttribute('role', 'listitem');
  el.setAttribute('aria-label', `Open ${sketch.credit.title}`);

  const thumb = document.createElement('div');
  thumb.className = 'gallery-thumb';
  thumb.setAttribute('aria-hidden', 'true');
  const img = document.createElement('img');
  img.alt = `${sketch.credit.title} preview`;
  img.width = 220;
  img.height = 220;
  img.decoding = 'async';
  img.loading = 'lazy';
  // Static GIF previews (public/thumbs) — reliable on GitHub Pages
  img.src = `./thumbs/${sketch.id}.gif`;
  img.classList.add('thumb-ready');
  img.onerror = () => {
    // Fallback still if a gif is missing
    img.src = `./thumbs/${sketch.id}.png`;
  };
  thumb.appendChild(img);

  const title = document.createElement('h2');
  title.textContent = sketch.credit.title;

  const authors = document.createElement('p');
  authors.className = 'gallery-authors';
  authors.textContent = sketch.credit.authors.map((a) => a.name).join(', ');

  const note = document.createElement('p');
  note.className = 'gallery-note';
  note.textContent = sketch.credit.sourceNote;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn-primary';
  btn.textContent = 'Tweak this';
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    onOpen(sketch.id);
  });

  el.append(thumb, title, authors, note, btn);
  el.addEventListener('click', () => onOpen(sketch.id));
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(sketch.id);
    }
  });

  return el;
}
