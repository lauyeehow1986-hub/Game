/**
 * Educator cohort mode — pure, backend-free.
 *
 * An educator encodes an ASSIGNMENT (a curriculum or an exam preset + a
 * passing target) into a shareable URL. Learners open it, complete the work,
 * and produce a COMPLETION TOKEN (name + score + pass + timestamp + the
 * assignment ref). The educator pastes the returned tokens into a roster view
 * that tabulates them and exports CSV. No server, no accounts — just URLs and
 * clipboard text.
 */

// ── base64url codec (self-contained so this module has no deps) ───────────
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

// ── Assignment ────────────────────────────────────────────────────────────
export interface Assignment {
  /** 'curriculum' assigns a named curriculum; 'exam' assigns an exam preset. */
  kind: 'curriculum' | 'exam';
  /** Curriculum id or exam preset name. */
  target: string;
  /** Human title shown to the learner. */
  title: string;
  /** Pass mark as a percentage (0-100). */
  passPct: number;
}

/** Short stable ref for an assignment so completions can be matched to it. */
export function assignmentRef(a: Assignment): string {
  const basis = `${a.kind}|${a.target}|${a.passPct}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < basis.length; i += 1) {
    h ^= basis.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36).toUpperCase().padStart(7, '0');
}

export function encodeAssignmentToUrl(a: Assignment, base?: string): string {
  const payload = toB64Url(JSON.stringify(a));
  const origin =
    base ?? (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '');
  return `${origin}?assign=${payload}`;
}

export function tryDecodeAssignment(href: string): Assignment | null {
  try {
    const url = new URL(href);
    const q = url.searchParams.get('assign');
    if (!q) return null;
    const obj = JSON.parse(fromB64Url(q));
    if (typeof obj !== 'object' || obj === null) return null;
    if (obj.kind !== 'curriculum' && obj.kind !== 'exam') return null;
    if (typeof obj.target !== 'string' || typeof obj.title !== 'string') return null;
    if (typeof obj.passPct !== 'number') return null;
    return obj as Assignment;
  } catch {
    return null;
  }
}

// ── Completion token ───────────────────────────────────────────────────────
export interface Completion {
  /** Assignment ref this completion answers. */
  ref: string;
  name: string;
  scorePct: number;
  passed: boolean;
  /** Epoch ms. */
  at: number;
}

export function encodeCompletion(c: Completion): string {
  // Token form: SGP1.<base64url>. The prefix lets us spot tokens in pasted text.
  return `SGP1.${toB64Url(JSON.stringify(c))}`;
}

export function decodeCompletion(token: string): Completion | null {
  try {
    const t = token.trim();
    if (!t.startsWith('SGP1.')) return null;
    const obj = JSON.parse(fromB64Url(t.slice(5)));
    if (typeof obj !== 'object' || obj === null) return null;
    if (
      typeof obj.ref !== 'string' ||
      typeof obj.name !== 'string' ||
      typeof obj.scorePct !== 'number' ||
      typeof obj.passed !== 'boolean' ||
      typeof obj.at !== 'number'
    ) return null;
    return obj as Completion;
  } catch {
    return null;
  }
}

/**
 * Parse a blob of pasted text (one or many tokens, any whitespace/lines) into
 * the valid completions it contains. Invalid fragments are skipped.
 */
export function parseRoster(text: string): Completion[] {
  const tokens = text.split(/\s+/).filter((x) => x.startsWith('SGP1.'));
  const out: Completion[] = [];
  for (const tok of tokens) {
    const c = decodeCompletion(tok);
    if (c) out.push(c);
  }
  return out;
}

/** RFC4180-ish CSV of a roster, newest first. */
export function rosterToCsv(completions: Completion[]): string {
  const esc = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
  const header = 'name,ref,scorePct,passed,completedAt';
  const rows = [...completions]
    .sort((a, b) => b.at - a.at)
    .map((c) =>
      [esc(c.name), esc(c.ref), String(c.scorePct), c.passed ? 'pass' : 'fail', new Date(c.at).toISOString()].join(','),
    );
  return [header, ...rows].join('\n');
}

export interface RosterSummary {
  total: number;
  passed: number;
  passRate: number;
  meanScorePct: number;
}

export function summariseRoster(completions: Completion[]): RosterSummary {
  const total = completions.length;
  if (total === 0) return { total: 0, passed: 0, passRate: 0, meanScorePct: 0 };
  const passed = completions.filter((c) => c.passed).length;
  const meanScorePct = completions.reduce((acc, c) => acc + c.scorePct, 0) / total;
  return { total, passed, passRate: passed / total, meanScorePct };
}
