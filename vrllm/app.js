'use strict';

// All benchmark values come from Table 1 of the supplied technical report.
const benchmark = [
  {name:'TabPFN-3', recall:3.2, prauc:8.2},
  {name:'TabFM', recall:5.3, prauc:6.5},
  {name:'TabICLv2', recall:4.0, prauc:8.4},
  {name:'KumoTabular', recall:6.1, prauc:11.2},
  {name:'XGBoost', recall:6.5, prauc:12.7},
  {name:'LightGBM', recall:8.1, prauc:13.1},
  {name:'SAINT', recall:7.3, prauc:14.0},
  {name:'TabTransformer', recall:10.7, prauc:15.7},
  {name:'DCNv2', recall:11.8, prauc:18.8},
  {name:'Production model', recall:37.5, prauc:35.2},
  {name:'VRLLM', recall:38.3, prauc:35.3},
  {name:'Production + VRLLM', recall:45.9, prauc:38.7}
];
const chart = document.querySelector('#benchmark-chart');
const metricButtons = document.querySelectorAll('[data-metric]');
for (const button of metricButtons) {
  button.addEventListener('click', () => {
    const metric = button.dataset.metric;
    for (const item of metricButtons) {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    }
    for (const [index, row] of [...chart.querySelectorAll('.bar-row')].entries()) {
      const value = benchmark[index][metric];
      row.querySelector('.bar-fill').style.setProperty('--bar-width', `${value * 2}%`);
      row.querySelector('.bar-value').textContent = value.toFixed(1);
    }
    const name = metric === 'recall' ? 'Recall at the operating false-positive rate' : 'Area under the precision-recall curve';
    document.querySelector('#metric-description').textContent = `${name} · Higher is better`;
    chart.setAttribute('aria-label', `${name} in percent: ${benchmark.map(model => `${model.name} ${model[metric].toFixed(1)}`).join(', ')}.`);
    document.querySelector('#chart-announcement').textContent = `${name}: production model ${benchmark[9][metric]}%, VRLLM ${benchmark[10][metric]}%, ensemble ${benchmark[11][metric]}%.`;
  });
}

// Values transcribed from the report's frontier_model_perf.pdf; same versions and setup.
const frontier = [
  ['GPT-6-Astra',6.77], ['Claude-fable-5.1',4.54], ['Gemini-4-argon',4.12],
  ['GPT-5.1',3.27], ['Gemini-3-pro',2.91], ['Grok-4.7',2.89], ['Kimi-K3',2.80],
  ['GPT-4.1',2.63], ['Claude-opus-4.5',2.59], ['Perplexity-Decider-v1.2',2.44],
  ['GLM-5.3',2.27], ['OpenAI Decisions API',2.22], ['Gemini-2.5-pro',2.15],
  ['Grok-4.1-reasoning',2.11], ['Claude-sonnet-4',2.11], ['GLM-5.2',1.96], ['Grok-4',1.93]
];
const frontierChart = document.querySelector('#frontier-chart');
for (const [name, value] of frontier) {
  const row = document.createElement('div');
  row.className = 'frontier-row';
  const label = document.createElement('span');
  label.className = 'frontier-name';
  label.textContent = name;
  const track = document.createElement('span');
  track.className = 'frontier-track';
  const bar = document.createElement('span');
  bar.className = 'frontier-fill';
  bar.style.setProperty('--bar-width', `${value / 7 * 100}%`);
  track.append(bar);
  const score = document.createElement('span');
  score.className = 'frontier-value';
  score.textContent = value.toFixed(2);
  row.append(label, track, score);
  frontierChart.append(row);
}

const templates = {
  value: {
    code: 'Northstar Cafe | 24.50 | restaurant\nLabel:',
    description: 'Compact, fixed-order values minimize token overhead. This template performs best at the largest training scale in our experiments.'
  },
  short: {
    code: 'Merchant: Northstar Cafe\nAmount: 24.50\nCategory: restaurant\nLabel:',
    description: 'Concise field names add semantic context. In the ablation study, the short template has a modest advantage at intermediate training stages.'
  },
  long: {
    code: 'The transaction occurred at Northstar Cafe.\nThe transaction amount is 24.50.\nThe merchant category is restaurant.\nThe classification label is:',
    description: 'Natural-language descriptions provide a useful prior when training data are limited. The rich template has the highest recall in the 1M-example template comparison.'
  }
};
const templateTabs = [...document.querySelectorAll('[data-template]')];
function selectTemplate(button) {
  const template = templates[button.dataset.template];
  for (const tab of templateTabs) {
    const selected = tab === button;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  }
  document.querySelector('#template-panel').setAttribute('aria-labelledby', button.id);
  document.querySelector('#template-code').textContent = template.code;
  document.querySelector('#template-explanation').textContent = template.description;
}
templateTabs.forEach((button, index) => {
  button.addEventListener('click', () => selectTemplate(button));
  button.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % templateTabs.length;
    if (event.key === 'ArrowLeft') next = (index + templateTabs.length - 1) % templateTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = templateTabs.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      selectTemplate(templateTabs[next]);
      templateTabs[next].focus();
    }
  });
});

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
function closeMenu() {
  menuToggle.setAttribute('aria-expanded','false');
  nav.classList.remove('is-open');
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('is-open')) {
    closeMenu();
    menuToggle.focus();
  }
});

const dialog = document.querySelector('#figure-dialog');
const figureImage = document.querySelector('#figure-image');
let figureTrigger;
for (const button of document.querySelectorAll('[data-figure]')) {
  button.addEventListener('click', () => {
    figureTrigger = button;
    figureImage.src = button.dataset.figure;
    figureImage.alt = button.dataset.caption;
    document.querySelector('#figure-caption').textContent = button.dataset.caption;
    dialog.showModal();
    document.body.classList.add('dialog-open');
  });
}
document.querySelector('#figure-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target === dialog) {
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  }
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  figureTrigger?.focus();
});

const citationButton = document.querySelector('#copy-citation');
citationButton.addEventListener('click', async () => {
  const text = document.querySelector('#citation-code').textContent.trim();
  let copied = false;
  if (navigator.clipboard && window.isSecureContext) {
    try { await navigator.clipboard.writeText(text); copied = true; } catch { /* Local-file fallback below. */ }
  }
  if (!copied) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = 'position:fixed;left:-9999px;top:0';
    document.body.append(textarea);
    textarea.select();
    try { copied = document.execCommand('copy'); } catch { copied = false; }
    textarea.remove();
    citationButton.focus();
  }
  citationButton.querySelector('span').textContent = copied ? 'Copied!' : 'Download .bib';
  document.querySelector('#copy-status').textContent = copied ? 'BibTeX citation copied to clipboard.' : 'Clipboard unavailable. Use the Download citation link below.';
  if (!copied) document.querySelector('.citation-download').focus();
  window.setTimeout(() => { citationButton.querySelector('span').textContent = 'Copy BibTeX'; }, 2400);
});
