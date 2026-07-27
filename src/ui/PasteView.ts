/**
 * Paste editor for golfed p5.js / #つぶやきProcessing code.
 */

export interface PasteViewHandlers {
  onBuild: (source: string, title: string) => void;
  onCancel: () => void;
}

const DEFAULT_SAMPLE = `t=0,draw=$=>{t||createCanvas(w=400,w);background(9).stroke(w,96);for(t+=PI/80,i=1e4;i--;){let y=i/235,k=(4+cos(i/9-t*2))*cos(i/35),e=y/7-13,d=mag(k,e)+sin(e/9+t/2)-4,q=2*sin(k*3)-y/35*k*(9+k*sin(cos(e)*9-d*2+t)),c=d-t;point(q+40*cos(c)+200,q*sin(c)+d*35)}}`;

export function renderPasteView(root: HTMLElement, handlers: PasteViewHandlers): void {
  root.innerHTML = '';
  root.className = 'paste-view';

  const h = document.createElement('h1');
  h.className = 'paste-title';
  h.textContent = 'Paste golfed p5.js';

  const p = document.createElement('p');
  p.className = 'gallery-intro';
  p.innerHTML =
    'Paste a <strong>#つぶやきProcessing</strong> / p5.js one-liner or short sketch. ' +
    'Every number becomes a live slider (Skepara-style). Code runs in your browser only.';

  const titleLabel = document.createElement('label');
  titleLabel.className = 'paste-label';
  titleLabel.textContent = 'Title';
  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.className = 'paste-input';
  titleInput.value = 'My paste';
  titleInput.maxLength = 80;
  titleLabel.appendChild(titleInput);

  const areaLabel = document.createElement('label');
  areaLabel.className = 'paste-label';
  areaLabel.textContent = 'Code';
  const area = document.createElement('textarea');
  area.className = 'paste-area';
  area.spellcheck = false;
  area.placeholder = 't=0,draw=_=>{...}';
  area.rows = 12;
  areaLabel.appendChild(area);

  const actions = document.createElement('div');
  actions.className = 'gallery-actions';

  const sample = document.createElement('button');
  sample.type = 'button';
  sample.className = 'btn';
  sample.textContent = 'Load sample';
  sample.addEventListener('click', () => {
    area.value = DEFAULT_SAMPLE;
  });

  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.className = 'btn';
  cancel.textContent = '← Gallery';
  cancel.addEventListener('click', () => handlers.onCancel());

  const build = document.createElement('button');
  build.type = 'button';
  build.className = 'btn btn-primary';
  build.textContent = 'Build sliders & run';
  build.addEventListener('click', () => {
    handlers.onBuild(area.value, titleInput.value.trim() || 'My paste');
  });

  actions.append(cancel, sample, build);
  root.append(h, p, titleLabel, areaLabel, actions);
}
