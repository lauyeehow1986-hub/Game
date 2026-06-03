/**
 * Per-case personal-best certificate — pure presentation.
 *
 * Distinct from the OSCE/exam certificate: this celebrates an individual
 * case's personal best after a completed run. Triggered from the results
 * screen only when the current run ties or beats the previous best.
 */

export interface PersonalBestData {
  caseTitle: string;
  caseCategory: string;
  ratioPct: number;
  score: number;
  max: number;
  /** ms timestamp the run completed at. */
  at: number;
  /** Short stable ref derived from caseId + at. */
  ref: string;
  learnerName?: string;
  locale?: 'en' | 'zh';
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const LABELS = {
  en: {
    kicker: 'SG Pathway · Personal best',
    title: 'Certificate of personal best',
    sub1: 'This certifies that',
    sub2: 'achieved their personal best on the case',
    score: 'Score',
    issued: 'Recorded',
    ref: 'Ref',
    disclaimer: 'Educational simulation only. Not a clinical qualification or licence. Scores reflect performance in a simulated decision-set; numbers and scenarios are illustrative.',
  },
  zh: {
    kicker: 'SG Pathway · 个人最佳',
    title: '个人最佳证书',
    sub1: '兹证明',
    sub2: '在以下病例中取得个人最佳成绩',
    score: '成绩',
    issued: '记录于',
    ref: '编号',
    disclaimer: '仅供教育模拟使用。不构成临床资格或执照。成绩反映模拟决策表现;数字与情境仅为示例。',
  },
} as const;

/**
 * Stable short ref from caseId + ms timestamp; avoids name collisions when
 * the same case is hit multiple times.
 */
export function personalBestRef(caseId: string, at: number): string {
  const basis = `${caseId}|${at}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < basis.length; i += 1) {
    h ^= basis.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36).toUpperCase().padStart(7, '0');
}

export function renderPersonalBestHtml(d: PersonalBestData): string {
  const locale = d.locale ?? 'en';
  const L = LABELS[locale];
  const dateStr = new Date(d.at).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-CA');
  const name = (d.learnerName ?? '').trim() || (locale === 'zh' ? '学习者' : 'Learner');
  const accent = d.ratioPct >= 90 ? '#1a7f4b' : d.ratioPct >= 75 ? '#1d4ed8' : '#b45309';

  return `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<title>SG Pathway — Personal best — ${esc(d.ref)}</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    font-family: 'Inter', system-ui, -apple-system, Segoe UI, sans-serif;
    color: #0b1320; background: #fff; margin: 0; padding: 40px;
    display: flex; align-items: center; justify-content: center; min-height: 100vh;
  }
  .cert {
    border: 3px solid ${accent}; border-radius: 12px; padding: 48px 56px;
    max-width: 720px; width: 100%; text-align: center; position: relative;
  }
  .kicker { text-transform: uppercase; letter-spacing: 3px; font-size: 11px; color: #6b7280; }
  h1 { font-size: 24px; margin: 8px 0 4px; }
  .sub { font-size: 13px; color: #374151; margin-bottom: 18px; }
  .name { font-size: 22px; font-weight: 700; margin: 8px 0; border-bottom: 1px solid #d4d8e0; display: inline-block; padding: 0 24px 6px; }
  .case-title { font-size: 18px; font-weight: 600; margin: 12px 0 4px; color: #0b1320; }
  .case-cat { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #6b7280; }
  .score { font-size: 32px; font-weight: 800; color: ${accent}; margin: 22px 0 4px; letter-spacing: 1px; }
  .score-detail { font-size: 12px; color: #4b5563; }
  .meta { margin-top: 28px; font-size: 11px; color: #6b7280; display: flex; justify-content: space-between; }
  .disclaimer { margin-top: 18px; font-size: 10px; color: #9ca3af; }
</style>
</head>
<body>
  <div class="cert">
    <div class="kicker">${esc(L.kicker)}</div>
    <h1>${esc(L.title)}</h1>
    <div class="sub">${esc(L.sub1)}</div>
    <div class="name">${esc(name)}</div>
    <div class="sub" style="margin-top:14px;">${esc(L.sub2)}</div>
    <div class="case-title">${esc(d.caseTitle)}</div>
    <div class="case-cat">${esc(d.caseCategory)}</div>
    <div class="score">${d.ratioPct}%</div>
    <div class="score-detail">${esc(L.score)}: ${d.score.toFixed(1)} / ${d.max.toFixed(1)}</div>
    <div class="meta">
      <span>${esc(L.issued)}: ${dateStr}</span>
      <span>${esc(L.ref)}: ${esc(d.ref)}</span>
    </div>
    <div class="disclaimer">${esc(L.disclaimer)}</div>
  </div>
  <script>
    window.addEventListener('load', () => { setTimeout(() => window.print(), 120); });
  </script>
</body>
</html>`;
}

export function openPersonalBestCertificate(d: PersonalBestData): void {
  if (typeof window === 'undefined') return;
  const html = renderPersonalBestHtml(d);
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
