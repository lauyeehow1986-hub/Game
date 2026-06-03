/**
 * Printable cheatsheet — pure presentation.
 *
 * Generates a one-pager of the catalogue grouped by category, showing each
 * case's title, blurb and a bulleted list of guideline labels. Opens in a
 * new window and auto-prints (matches the pattern of lesson-plan-print and
 * certificate-print).
 */

import type { CaseDefinition, LocalisedString } from './types';

function asText(v: LocalisedString | undefined, locale: 'en' | 'zh' = 'en'): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  return v[locale] ?? v.en ?? v.zh ?? '';
}

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
  h1 { font-size: 18px; margin: 0 0 6px; }
  .sub { font-size: 10.5px; color: #4b5563; margin-bottom: 14px; }
  h2 { font-size: 13px; margin: 18px 0 6px; border-bottom: 1px solid #d4d8e0; padding-bottom: 2px; }
  .card { break-inside: avoid; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 10px; margin: 6px 0; }
  .card h3 { font-size: 12px; margin: 0 0 2px; }
  .card .blurb { font-size: 10.5px; color: #1f2a44; margin: 0 0 6px; }
  .card ul { margin: 0; padding-left: 16px; }
  .card li { font-size: 10px; color: #1f2a44; margin: 1px 0; }
  .card li b { font-weight: 600; }
  .footer { margin-top: 18px; font-size: 9.5px; color: #6b7280; border-top: 1px solid #d4d8e0; padding-top: 6px; }
  @page { margin: 14mm; }
`;

export function openPrintableCheatsheet(
  cases: CaseDefinition[],
  locale: 'en' | 'zh' = 'en',
): void {
  if (typeof window === 'undefined') return;
  const byCat: Record<CaseDefinition['category'], CaseDefinition[]> = {
    acute: [],
    elective: [],
    outpatient: [],
  };
  for (const c of cases) byCat[c.category].push(c);

  const section = (label: string, list: CaseDefinition[]) => {
    if (list.length === 0) return '';
    return `<h2>${esc(label)} (${list.length})</h2>` + list.map((c) => {
      const guides = (c.guidelines ?? [])
        .map((g) => `<li><b>${esc(asText(g.label, locale))}</b> — ${esc(asText(g.body, locale).slice(0, 220))}</li>`)
        .join('');
      return `<div class="card">
        <h3>${esc(asText(c.title, locale))}</h3>
        <p class="blurb">${esc(asText(c.blurb, locale))}</p>
        <ul>${guides}</ul>
      </div>`;
    }).join('');
  };

  const date = new Date().toLocaleDateString('en-CA');
  const titles = {
    en: { h1: 'SG Pathway — clinical cheatsheet', sub: `Generated ${date} · ${cases.length} cases`, acute: 'Acute', elective: 'Elective', outpatient: 'Outpatient', foot: 'Educational simulation. Numbers and scenarios are illustrative. Always defer to current local guidance.' },
    zh: { h1: 'SG Pathway — 临床速查', sub: `生成于 ${date} · ${cases.length} 例`, acute: '急性', elective: '择期', outpatient: '门诊', foot: '仅供教育模拟使用。数字与情境仅为示例。请以最新本地指南为准。' },
  } as const;
  const T = titles[locale];

  const html = `<!doctype html><html lang="${locale}"><head><meta charset="utf-8">
<title>${esc(T.h1)}</title><style>${PRINT_CSS}</style></head>
<body>
  <h1>${esc(T.h1)}</h1>
  <div class="sub">${esc(T.sub)}</div>
  ${section(T.acute, byCat.acute)}
  ${section(T.elective, byCat.elective)}
  ${section(T.outpatient, byCat.outpatient)}
  <div class="footer">${esc(T.foot)}</div>
  <script>window.addEventListener('load', () => setTimeout(() => window.print(), 120));</script>
</body></html>`;

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
