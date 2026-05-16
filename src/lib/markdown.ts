/**
 * Tiny markdown-to-HTML converter. Supports only the subset our lesson
 * plans use: # / ## / ### headings, - unordered lists, **bold**, *italic*,
 * `code`, > blockquote, --- horizontal rule, paragraphs. Output is safe-
 * by-construction: every user-supplied character is HTML-escaped before
 * inline replacements are applied.
 *
 * Not a general-purpose markdown engine — don't reach for it elsewhere.
 */

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function inline(s: string): string {
  // The caller passes pre-escaped text, so we don't re-escape inside `code`.
  // Order matters: bold before italic so **x** isn't mis-parsed as italic.
  return s
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

export function markdownToHtml(md: string): string {
  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let inList = false;
  let inBlockquote = false;
  let paraBuffer: string[] = [];

  const flushPara = () => {
    if (paraBuffer.length === 0) return;
    const text = paraBuffer.join(' ').trim();
    if (text) out.push(`<p>${inline(escapeHtml(text))}</p>`);
    paraBuffer = [];
  };
  const closeList = () => {
    if (inList) {
      out.push('</ul>');
      inList = false;
    }
  };
  const closeBlockquote = () => {
    if (inBlockquote) {
      out.push('</blockquote>');
      inBlockquote = false;
    }
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (line === '') {
      flushPara();
      closeList();
      closeBlockquote();
      continue;
    }
    if (line.startsWith('### ')) {
      flushPara(); closeList(); closeBlockquote();
      out.push(`<h3>${inline(escapeHtml(line.slice(4)))}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      flushPara(); closeList(); closeBlockquote();
      out.push(`<h2>${inline(escapeHtml(line.slice(3)))}</h2>`);
      continue;
    }
    if (line.startsWith('# ')) {
      flushPara(); closeList(); closeBlockquote();
      out.push(`<h1>${inline(escapeHtml(line.slice(2)))}</h1>`);
      continue;
    }
    if (/^---+$/.test(line)) {
      flushPara(); closeList(); closeBlockquote();
      out.push('<hr/>');
      continue;
    }
    if (line.startsWith('- ')) {
      flushPara(); closeBlockquote();
      if (!inList) {
        out.push('<ul>');
        inList = true;
      }
      out.push(`<li>${inline(escapeHtml(line.slice(2)))}</li>`);
      continue;
    }
    // Numbered list (1. 2. ...) → reuse <ul> so we don't need <ol> state.
    const num = line.match(/^\d+\.\s+(.*)$/);
    if (num) {
      flushPara(); closeBlockquote();
      if (!inList) {
        out.push('<ul>');
        inList = true;
      }
      out.push(`<li>${inline(escapeHtml(num[1]))}</li>`);
      continue;
    }
    if (line.startsWith('> ')) {
      flushPara(); closeList();
      if (!inBlockquote) {
        out.push('<blockquote>');
        inBlockquote = true;
      }
      out.push(`<p>${inline(escapeHtml(line.slice(2)))}</p>`);
      continue;
    }
    // Default: paragraph text.
    closeList(); closeBlockquote();
    paraBuffer.push(line);
  }
  flushPara();
  closeList();
  closeBlockquote();
  return out.join('\n');
}
