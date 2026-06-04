/**
 * Printable smart debrief — pure presentation.
 *
 * Renders a Debrief (from `debrief.ts`) as a one-page printable HTML
 * summary. Mirrors the cheatsheet / portfolio-print conventions so the
 * three artefacts feel like a family.
 */

import type { Debrief, DebriefMiss } from './debrief';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const PRINT_CSS = `
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    font-family: 'Inter', system-ui, -apple-system, Segoe UI, sans-serif;
    color: #0b1320; background: #fff; margin: 0;
    padding: 16px 22px; line-height: 1.45;
    max-width: 820px; margin-inline: auto;
  }
  h1 { font-size: 20px; margin: 0 0 4px; }
  h2 { font-size: 13px; margin: 16px 0 6px; border-bottom: 1px solid #d4d8e0; padding-bottom: 2px; }
  .sub { font-size: 10.5px; color: #4b5563; margin-bottom: 14px; }
  .headline { display: inline-block; padding: 3px 10px; border-radius: 999px; font-weight: 700; font-size: 12px; letter-spacing: 0.04em; text-transform: uppercase; }
  .headline.distinction { background: #d1fae5; color: #065f46; }
  .headline.pass { background: #dbeafe; color: #1e40af; }
  .headline.borderline { background: #fef3c7; color: #92400e; }
  .headline.unsafe { background: #fee2e2; color: #991b1b; }
  .pb { display: inline-block; margin-left: 6px; font-size: 10px; color: #b45309; }
  .score { font-size: 12px; color: #1f2a44; margin-top: 6px; }
  ul.tight { margin: 0; padding-left: 16px; }
  ul.tight li { font-size: 10.5px; margin: 2px 0; }
  .miss { break-inside: avoid; border: 1px solid #fcd5d5; border-left: 4px solid #dc2626; border-radius: 6px; padding: 7px 9px; margin: 5px 0; background: #fff7f7; }
  .miss .q { font-size: 11px; font-weight: 600; }
  .miss .chosen { font-size: 10px; color: #6b7280; margin: 1px 0; }
  .miss .best { font-size: 10px; color: #166534; }
  .miss .rationale { font-size: 10.5px; color: #1f2a44; margin-top: 3px; }
  .miss .ref { font-size: 9.5px; color: #6b7280; margin-top: 2px; font-family: ui-monospace, monospace; }
  .step { break-inside: avoid; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 9px; margin: 4px 0; font-size: 10.5px; }
  .footer { margin-top: 20px; font-size: 9.5px; color: #6b7280; border-top: 1px solid #d4d8e0; padding-top: 6px; }
  @page { margin: 14mm; }
`;

interface PrintLabels {
  title: string;
  generated: string;
  newPersonalBest: string;
  strengths: string;
  misses: string;
  steps: string;
  citations: string;
  chosen: string;
  best: string;
  noMisses: string;
  noStrengths: string;
  noCitations: string;
  footer: string;
  headline: Record<Debrief['headline'], string>;
}

const LABELS: Record<'en' | 'zh', PrintLabels> = {
  en: {
    title: 'Run debrief',
    generated: 'Generated',
    newPersonalBest: '★ new personal best',
    strengths: 'Strengths',
    misses: 'Misses — practice these first',
    steps: 'Next steps',
    citations: 'Cited guidelines',
    chosen: 'You chose',
    best: 'Best answer',
    noMisses: 'No scored misses on this run — well done.',
    noStrengths: 'No strengths logged for this run.',
    noCitations: 'This case ships no headline guidelines.',
    footer: 'Educational simulation only. Always defer to current local guidance.',
    headline: {
      distinction: 'Distinction',
      pass: 'Pass',
      borderline: 'Borderline',
      unsafe: 'Unsafe',
    },
  },
  zh: {
    title: '复盘小结',
    generated: '生成于',
    newPersonalBest: '★ 个人最佳',
    strengths: '亮点',
    misses: '失分点 — 先练习这些',
    steps: '下一步',
    citations: '引用指南',
    chosen: '你选择了',
    best: '最佳答案',
    noMisses: '本次无失分点 — 表现很好。',
    noStrengths: '本次未记录亮点。',
    noCitations: '此病例无核心引用指南。',
    footer: '仅供教育模拟使用。请以最新本地指南为准。',
    headline: {
      distinction: '优异',
      pass: '通过',
      borderline: '勉强',
      unsafe: '不安全',
    },
  },
};

function missBlock(m: DebriefMiss, L: PrintLabels, locale: 'en' | 'zh'): string {
  return `<div class="miss">
    <div class="q">${esc(m.prompt)}</div>
    <div class="chosen">${esc(L.chosen)}: ${esc(m.chosenLabel)} · ${(m.ratio * 100).toFixed(0)}%</div>
    <div class="best">${esc(L.best)}: ${esc(m.bestLabel)}</div>
    <div class="rationale">${esc(m.rationale)}</div>
    <div class="ref">${esc(typeof m.reference.label === 'string' ? m.reference.label : (m.reference.label as Record<string, string>)[locale] ?? '')}</div>
  </div>`;
}

export function renderDebriefHtml(d: Debrief, locale: 'en' | 'zh' = 'en'): string {
  const L = LABELS[locale];
  const headlineLabel = L.headline[d.headline];
  const date = new Date().toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-CA');

  const missesBlock = d.misses.length === 0
    ? `<p>${esc(L.noMisses)}</p>`
    : d.misses.map((m) => missBlock(m, L, locale)).join('');

  const strengthsBlock = d.strengths.length === 0
    ? `<p>${esc(L.noStrengths)}</p>`
    : `<ul class="tight">${d.strengths
        .map((s) => `<li>${esc(s.prompt)}</li>`)
        .join('')}</ul>`;

  const stepsBlock = d.nextSteps
    .map((s) => `<div class="step">${esc(s.text)}</div>`)
    .join('');

  const citationsBlock = d.citations.length === 0
    ? `<p>${esc(L.noCitations)}</p>`
    : `<ul class="tight">${d.citations
        .map((g) => {
          const label = typeof g.label === 'string' ? g.label : (g.label as Record<string, string>)[locale] ?? '';
          const body = typeof g.body === 'string' ? g.body : (g.body as Record<string, string>)[locale] ?? '';
          return `<li><b>${esc(label)}</b> — ${esc(body.slice(0, 240))}</li>`;
        })
        .join('')}</ul>`;

  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8">
<title>${esc(L.title)} — ${esc(d.caseTitle)}</title><style>${PRINT_CSS}</style></head>
<body>
  <h1>${esc(L.title)} — ${esc(d.caseTitle)}</h1>
  <div class="sub">${esc(L.generated)} ${esc(date)}</div>
  <p>
    <span class="headline ${d.headline}">${esc(headlineLabel)}</span>
    ${d.newPersonalBest ? `<span class="pb">${esc(L.newPersonalBest)}</span>` : ''}
  </p>
  <div class="score">${d.scoreEarned.toFixed(1)} / ${d.scoreMax.toFixed(1)} (${(d.ratio * 100).toFixed(0)}%)</div>

  <h2>${esc(L.steps)}</h2>
  ${stepsBlock}

  <h2>${esc(L.misses)}</h2>
  ${missesBlock}

  <h2>${esc(L.strengths)}</h2>
  ${strengthsBlock}

  <h2>${esc(L.citations)}</h2>
  ${citationsBlock}

  <div class="footer">${esc(L.footer)}</div>
  <script>window.addEventListener('load', () => setTimeout(() => window.print(), 120));</script>
</body></html>`;
}

export function openPrintableDebrief(d: Debrief, locale: 'en' | 'zh' = 'en'): void {
  if (typeof window === 'undefined') return;
  const html = renderDebriefHtml(d, locale);
  const w = window.open('', '_blank', 'noopener,noreferrer');
  if (!w) {
    const blob = new Blob([html], { type: 'text/html' });
    window.location.href = URL.createObjectURL(blob);
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}
