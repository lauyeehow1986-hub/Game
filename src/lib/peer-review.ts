/**
 * Peer-review threads — pure.
 *
 * A run snapshot already round-trips through ?run= (lib/case-share). Peer
 * review extends it: a reviewer composes per-decision comments, encoded as
 * a small thread payload and shared back. Locally, threads persist alongside
 * the snapshot by ref so the same run shows the same comments next time.
 *
 * No server — everything moves through clipboard / URL just like case-share.
 */

// ── self-contained base64url codec ──────────────────────────────────────
function toB64Url(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromB64Url(s: string): string {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export interface ReviewComment {
  /** Step index in the run log (0-based). */
  step: number;
  author: string;
  body: string;
  /** ms timestamp. */
  at: number;
}

export interface ReviewThread {
  /** Short stable ref of the run being reviewed. */
  runRef: string;
  comments: ReviewComment[];
}

/** Stable short ref from a run snapshot — FNV-1a 32-bit over caseId + log. */
export function runRef(snapshot: { caseId: string; log: Array<{ optionId: string }> }): string {
  const basis = `${snapshot.caseId}|${snapshot.log.map((e) => e.optionId).join('|')}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < basis.length; i += 1) {
    h ^= basis.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36).toUpperCase().padStart(7, '0');
}

export function encodeThread(thread: ReviewThread): string {
  return `SGR1.${toB64Url(JSON.stringify(thread))}`;
}

export function decodeThread(token: string): ReviewThread | null {
  try {
    const t = token.trim();
    if (!t.startsWith('SGR1.')) return null;
    const obj = JSON.parse(fromB64Url(t.slice(5)));
    if (typeof obj !== 'object' || obj === null) return null;
    if (typeof obj.runRef !== 'string' || !Array.isArray(obj.comments)) return null;
    const comments = obj.comments.filter(
      (c: unknown): c is ReviewComment => {
        if (typeof c !== 'object' || c === null) return false;
        const x = c as Record<string, unknown>;
        return (
          typeof x.step === 'number' &&
          typeof x.author === 'string' &&
          typeof x.body === 'string' &&
          typeof x.at === 'number'
        );
      },
    );
    return { runRef: obj.runRef, comments };
  } catch {
    return null;
  }
}

/** Merge two threads on the same runRef, deduplicating identical comments. */
export function mergeThreads(a: ReviewThread, b: ReviewThread): ReviewThread {
  if (a.runRef !== b.runRef) return a;
  const key = (c: ReviewComment) => `${c.step}|${c.author}|${c.body}|${c.at}`;
  const seen = new Set(a.comments.map(key));
  const merged = [...a.comments];
  for (const c of b.comments) {
    if (!seen.has(key(c))) merged.push(c);
  }
  merged.sort((x, y) => x.at - y.at);
  return { runRef: a.runRef, comments: merged };
}

/** Parse a free-text blob and extract every valid SGR1.* token inside it. */
export function parsePastedThreads(text: string): ReviewThread[] {
  return text
    .split(/\s+/)
    .filter((x) => x.startsWith('SGR1.'))
    .map(decodeThread)
    .filter((t): t is ReviewThread => t !== null);
}
