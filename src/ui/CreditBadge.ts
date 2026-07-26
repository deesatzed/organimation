import type { SketchCredit } from '../sketches/types';

export function renderCreditBadge(el: HTMLElement, credit: SketchCredit): void {
  el.innerHTML = '';
  el.className = 'credit-badge';

  const title = document.createElement('strong');
  title.textContent = credit.title;

  const authors = document.createElement('div');
  authors.className = 'credit-authors';
  for (const a of credit.authors) {
    if (a.url) {
      const link = document.createElement('a');
      link.href = a.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = a.name;
      authors.appendChild(link);
      authors.appendChild(document.createTextNode(' '));
    } else {
      const span = document.createElement('span');
      span.textContent = a.name;
      authors.appendChild(span);
      authors.appendChild(document.createTextNode(' '));
    }
  }

  const note = document.createElement('p');
  note.className = 'credit-note';
  note.textContent = credit.sourceNote;

  el.append(title, authors, note);
}
