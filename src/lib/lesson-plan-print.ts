import { generateLessonPlan, type LessonPlanInput } from './lesson-plan';
import { markdownToHtml } from './markdown';

const PRINT_CSS = `
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    font-family: 'Inter', system-ui, -apple-system, Segoe UI, sans-serif;
    color: #0b1320;
    background: #fff;
    margin: 0;
    padding: 24px;
    line-height: 1.55;
    max-width: 760px;
    margin-inline: auto;
  }
  h1 { font-size: 22px; margin: 0 0 8px; }
  h2 { font-size: 16px; margin: 24px 0 4px; padding-bottom: 4px; border-bottom: 1px solid #d4d8e0; }
  h3 { font-size: 14px; margin: 16px 0 4px; color: #1f2a44; }
  p, li { font-size: 12px; }
  ul { padding-left: 22px; margin: 6px 0; }
  li { margin: 2px 0; }
  blockquote {
    border-left: 3px solid #ED2939;
    margin: 12px 0;
    padding: 4px 12px;
    color: #1f2a44;
    background: #fff5f5;
    border-radius: 0 4px 4px 0;
  }
  hr { border: none; border-top: 1px solid #d4d8e0; margin: 18px 0; }
  code {
    font-family: ui-monospace, SFMono-Regular, monospace;
    background: #f1f3f8;
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 11px;
  }
  .footer { color: #7d8ba4; font-size: 10px; margin-top: 24px; }
  @media print {
    body { padding: 12mm; }
    @page { margin: 12mm; }
  }
`;

/**
 * Open a new window containing a print-friendly HTML rendering of the
 * lesson plan and trigger the OS print dialog. Users can save as PDF
 * from there. No external dependencies — markdownToHtml ships in-bundle.
 */
export function openPrintableLessonPlan(input: LessonPlanInput): void {
  if (typeof window === 'undefined') return;
  const md = generateLessonPlan(input);
  const body = markdownToHtml(md);
  const title = typeof input.caseDef.title === 'string'
    ? input.caseDef.title
    : input.caseDef.title.en ?? input.caseDef.id;
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>SG Pathway — ${escapeHtmlForTitle(title)}</title>
<style>${PRINT_CSS}</style>
</head>
<body>
${body}
<div class="footer">SG Pathway — educational simulation. Numbers are illustrative.</div>
<script>
  // Auto-trigger the print dialog once the window finishes loading.
  window.addEventListener('load', () => {
    setTimeout(() => window.print(), 100);
  });
</script>
</body>
</html>`;
  const w = window.open('', '_blank', 'noopener,noreferrer');
  if (!w) {
    // Pop-up blocker — fall back to data URL.
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.location.href = url;
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}

function escapeHtmlForTitle(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
