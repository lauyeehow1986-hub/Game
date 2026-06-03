/**
 * Printable learner portfolio.
 *
 * Renders the aggregated Portfolio shape as a single-page printable HTML
 * artefact (window.print on load). Standard print-and-keep CV / clinical
 * portfolio shape: header + competency tier + mastery + week-progress +
 * top cases + recent reflections + bookmarks.
 */

import type { Portfolio } from './portfolio';

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
  .stat-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin: 6px 0; }
  .stat { border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px; }
  .stat .v { font-size: 14px; font-weight: 700; color: #0b1320; }
  .stat .l { font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.04em; color: #6b7280; }
  .tier { display: inline-block; border: 1.5px solid #2563eb; color: #2563eb; padding: 1px 8px; border-radius: 999px; font-weight: 600; font-size: 11px; }
  .tier.expert { border-color: #d97706; color: #b45309; }
  .tier.proficient { border-color: #16a34a; color: #15803d; }
  .tier.competent { border-color: #2563eb; color: #1d4ed8; }
  .tier.advanced-beginner { border-color: #f59e0b; color: #b45309; }
  .tier.novice { border-color: #6b7280; color: #4b5563; }
  .bar { display: inline-block; height: 6px; border-radius: 3px; background: #d4d8e0; width: 60px; vertical-align: middle; margin: 0 4px; overflow: hidden; }
  .bar > span { display: block; height: 100%; background: #16a34a; }
  ul.tight { margin: 0; padding-left: 16px; }
  ul.tight li { font-size: 10.5px; margin: 2px 0; }
  .mastery { font-size: 10.5px; }
  .mastery .sw { display: inline-block; width: 8px; height: 8px; margin-right: 3px; border-radius: 1.5px; vertical-align: middle; }
  .card { break-inside: avoid; border: 1px solid #e2e8f0; border-radius: 6px; padding: 7px 9px; margin: 5px 0; }
  .card .t { font-size: 11px; font-weight: 600; }
  .card .b { font-size: 10px; color: #1f2a44; margin-top: 2px; }
  .footer { margin-top: 20px; font-size: 9.5px; color: #6b7280; border-top: 1px solid #d4d8e0; padding-top: 6px; }
  @page { margin: 14mm; }
`;

const MASTERY_COLOURS: Record<string, string> = {
  consolidated: '#16a34a',
  mastered: '#65a30d',
  developing: '#d97706',
  attempted: '#dc2626',
  untouched: '#94a3b8',
};

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

interface PrintLabels {
  title: string;
  competency: string;
  mastery: string;
  week: string;
  topCases: string;
  reflections: string;
  bookmarks: string;
  journal: string;
  footer: string;
  emptyReflections: string;
  emptyBookmarks: string;
  emptyCases: string;
  tier: Record<string, string>;
  masteryLabel: Record<string, string>;
  totalsLabels: { catalogue: string; played: string; distinctions: string; mean: string; achievements: string };
  weekLabels: { cases: string; distinctions: string; mean: string };
}

const LABELS: Record<'en' | 'zh', PrintLabels> = {
  en: {
    title: 'SG Pathway — learner portfolio',
    competency: 'Competency tier',
    mastery: 'Mastery breakdown',
    week: 'This week\'s goal progress',
    topCases: 'Top cases',
    reflections: 'Recent decision reflections',
    bookmarks: 'Saved for review',
    journal: 'Case journal',
    footer: 'Generated locally from your offline progress. No accounts, no servers.',
    emptyReflections: 'No reflection notes yet.',
    emptyBookmarks: 'No bookmarks yet.',
    emptyCases: 'Play any case to populate this section.',
    tier: {
      novice: 'Novice',
      'advanced-beginner': 'Advanced beginner',
      competent: 'Competent',
      proficient: 'Proficient',
      expert: 'Expert',
    },
    masteryLabel: {
      consolidated: 'Consolidated',
      mastered: 'Mastered',
      developing: 'Developing',
      attempted: 'Attempted',
      untouched: 'Untouched',
    },
    totalsLabels: { catalogue: 'Catalogue', played: 'Played', distinctions: 'Distinctions', mean: 'Mean', achievements: 'Achievements' },
    weekLabels: { cases: 'Cases', distinctions: 'Distinctions', mean: 'Mean ratio' },
  },
  zh: {
    title: 'SG Pathway — 学习者档案',
    competency: '能力层级',
    mastery: '掌握度分布',
    week: '本周目标进度',
    topCases: '最佳病例',
    reflections: '最近决策反思',
    bookmarks: '待复习',
    journal: '病例日志',
    footer: '从你的本地离线进度生成。无账户、无服务器。',
    emptyReflections: '尚无反思笔记。',
    emptyBookmarks: '尚无收藏。',
    emptyCases: '完成任何病例以填充此部分。',
    tier: {
      novice: '新手',
      'advanced-beginner': '高级初学者',
      competent: '胜任',
      proficient: '熟练',
      expert: '专家',
    },
    masteryLabel: {
      consolidated: '已巩固',
      mastered: '已掌握',
      developing: '发展中',
      attempted: '已尝试',
      untouched: '未触及',
    },
    totalsLabels: { catalogue: '目录', played: '已玩', distinctions: '优异', mean: '平均', achievements: '成就' },
    weekLabels: { cases: '病例', distinctions: '优异', mean: '平均比率' },
  },
};

export function renderPortfolioHtml(p: Portfolio, locale: 'en' | 'zh' = 'en'): string {
  const L = LABELS[locale];
  const tierLabel = L.tier[p.competency.tier] ?? p.competency.tier;
  const date = new Date(p.generatedAt).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-CA');

  const totalsBlock = `
    <div class="stat-row">
      <div class="stat"><div class="v">${p.totals.played}/${p.totals.catalogue}</div><div class="l">${esc(L.totalsLabels.catalogue)}</div></div>
      <div class="stat"><div class="v">${p.totals.distinctions}</div><div class="l">${esc(L.totalsLabels.distinctions)}</div></div>
      <div class="stat"><div class="v">${pct(p.meanRatio)}</div><div class="l">${esc(L.totalsLabels.mean)}</div></div>
      <div class="stat"><div class="v">${p.totals.decisionsLogged}</div><div class="l">decisions</div></div>
      <div class="stat"><div class="v">${p.totals.achievements}</div><div class="l">${esc(L.totalsLabels.achievements)}</div></div>
    </div>`;

  const masterySwatches = (['consolidated', 'mastered', 'developing', 'attempted', 'untouched'] as const)
    .map((k) => {
      const colour = MASTERY_COLOURS[k] ?? '#94a3b8';
      return `<span style="margin-right:14px"><span class="sw" style="background:${colour}"></span>${esc(L.masteryLabel[k] ?? k)} <b>${p.mastery.counts[k]}</b></span>`;
    })
    .join('');

  const weekRow = (label: string, value: number, target: number, prog: number) => {
    return `<div class="card"><div class="t">${esc(label)}</div>
      <div class="b"><span class="bar"><span style="width:${Math.round(prog * 100)}%"></span></span><b>${value}</b> / ${target}</div></div>`;
  };

  const topCasesBlock = p.topCases.length === 0
    ? `<p class="b">${esc(L.emptyCases)}</p>`
    : `<ul class="tight">${p.topCases
        .map((c) => `<li><b>${esc(c.title)}</b> — ${pct(c.bestRatio)} (${c.attempts} ${c.attempts === 1 ? 'attempt' : 'attempts'})</li>`)
        .join('')}</ul>`;

  const reflectionsBlock = p.recentReflections.length === 0
    ? `<p class="b">${esc(L.emptyReflections)}</p>`
    : p.recentReflections
        .map((r) => `<div class="card"><div class="t">${esc(r.caseTitle)}${r.prompt ? ` — ${esc(r.prompt)}` : ''}</div><div class="b">${esc(r.text)}</div></div>`)
        .join('');

  const journalBlock = p.recentJournal.length === 0
    ? ''
    : `<h2>${esc(L.journal)}</h2>` + p.recentJournal
        .map((j) => `<div class="card"><div class="t">${esc(j.caseTitle)}</div><div class="b">${esc(j.text)}</div></div>`)
        .join('');

  const bookmarksBlock = p.recentBookmarks.length === 0
    ? `<p class="b">${esc(L.emptyBookmarks)}</p>`
    : `<ul class="tight">${p.recentBookmarks
        .map((b) => `<li><b>${esc(b.caseTitle)}</b>${b.prompt ? ` — ${esc(b.prompt)}` : ''}</li>`)
        .join('')}</ul>`;

  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8">
<title>${esc(L.title)}</title><style>${PRINT_CSS}</style></head>
<body>
  <h1>${esc(L.title)}</h1>
  <div class="sub"><b>${esc(p.learnerName)}</b> · ${esc(date)}</div>

  ${totalsBlock}

  <h2>${esc(L.competency)}</h2>
  <p><span class="tier ${p.competency.tier}">${esc(tierLabel)}</span></p>

  <h2>${esc(L.mastery)}</h2>
  <p class="mastery">${masterySwatches}</p>

  <h2>${esc(L.week)}</h2>
  ${weekRow(L.weekLabels.cases, p.week.casesCompleted, p.goals.casesPerWeek, p.week.progress.cases)}
  ${weekRow(L.weekLabels.distinctions, p.week.distinctions, p.goals.distinctionsPerWeek, p.week.progress.distinctions)}
  ${weekRow(L.weekLabels.mean, Math.round(p.week.meanRatio * 100), Math.round(p.goals.meanRatio * 100), p.week.progress.meanRatio)}

  <h2>${esc(L.topCases)}</h2>
  ${topCasesBlock}

  ${journalBlock}

  <h2>${esc(L.reflections)}</h2>
  ${reflectionsBlock}

  <h2>${esc(L.bookmarks)}</h2>
  ${bookmarksBlock}

  <div class="footer">${esc(L.footer)}</div>
  <script>window.addEventListener('load', () => setTimeout(() => window.print(), 120));</script>
</body></html>`;
}

export function openPrintablePortfolio(p: Portfolio, locale: 'en' | 'zh' = 'en'): void {
  if (typeof window === 'undefined') return;
  const html = renderPortfolioHtml(p, locale);
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
