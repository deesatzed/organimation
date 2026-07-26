import { listSketches } from '../sketches/registry';
import type { SketchModule } from '../sketches/types';

export function renderGallery(
  root: HTMLElement,
  onOpen: (id: string) => void,
): void {
  const sketches = listSketches();
  root.innerHTML = '';
  root.className = 'gallery';

  const intro = document.createElement('p');
  intro.className = 'gallery-intro';
  intro.textContent =
    'Pick a sketch, then tweak it with plain-English sliders. No equations required.';
  root.appendChild(intro);

  const grid = document.createElement('div');
  grid.className = 'gallery-grid';
  grid.setAttribute('role', 'list');

  for (const sketch of sketches) {
    grid.appendChild(card(sketch, onOpen));
  }

  root.appendChild(grid);
}

function card(sketch: SketchModule, onOpen: (id: string) => void): HTMLElement {
  const el = document.createElement('article');
  el.className = 'gallery-card';
  el.tabIndex = 0;
  el.setAttribute('role', 'listitem');
  el.setAttribute('aria-label', `Open ${sketch.credit.title}`);

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

  el.append(title, authors, note, btn);
  el.addEventListener('click', () => onOpen(sketch.id));
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(sketch.id);
    }
  });

  return el;
}
