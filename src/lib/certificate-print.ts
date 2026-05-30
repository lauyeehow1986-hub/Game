import type { Certificate } from './exam';

/**
 * Open a printable certificate in a new window. Pure presentation — the
 * Certificate payload comes from exam.buildCertificate(). Honours pop-up
 * blockers by falling back to a blob URL navigation.
 */
export function openPrintableCertificate(cert: Certificate, learnerName?: string): void {
  if (typeof window === 'undefined') return;
  const issued = new Date(cert.issuedAt);
  const dateStr = issued.toLocaleDateString('en-CA');
  const name = (learnerName ?? '').trim();
  const verdict = cert.passed ? 'PASS' : 'NOT YET PASSED';
  const accent = cert.passed ? '#1a7f4b' : '#b45309';

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>SG Pathway Certificate — ${cert.ref}</title>
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
  h1 { font-size: 26px; margin: 8px 0 4px; }
  .sub { font-size: 13px; color: #374151; margin-bottom: 28px; }
  .name { font-size: 22px; font-weight: 700; margin: 8px 0; border-bottom: 1px solid #d4d8e0; display: inline-block; padding: 0 24px 6px; }
  .verdict { font-size: 30px; font-weight: 800; color: ${accent}; margin: 20px 0 6px; letter-spacing: 1px; }
  .score { font-size: 15px; color: #1f2a44; }
  .meta { margin-top: 28px; font-size: 11px; color: #6b7280; display: flex; justify-content: space-between; }
  .disclaimer { margin-top: 18px; font-size: 10px; color: #9ca3af; }
</style>
</head>
<body>
  <div class="cert">
    <div class="kicker">SG Pathway · Clinical Decisions Exam</div>
    <h1>Certificate of Completion</h1>
    <div class="sub">This certifies that</div>
    <div class="name">${escapeHtml(name || 'Learner')}</div>
    <div class="sub" style="margin-top:18px;">completed the ${escapeHtml(cert.preset)} exam paper</div>
    <div class="verdict">${verdict}</div>
    <div class="score">Score: ${cert.ratioPct}%</div>
    <div class="meta">
      <span>Issued: ${dateStr}</span>
      <span>Ref: ${cert.ref}</span>
    </div>
    <div class="disclaimer">Educational simulation only. Not a clinical qualification or licence. Numbers and scenarios are illustrative.</div>
  </div>
  <script>
    window.addEventListener('load', () => { setTimeout(() => window.print(), 120); });
  </script>
</body>
</html>`;

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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
