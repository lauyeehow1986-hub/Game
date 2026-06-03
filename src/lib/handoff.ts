/**
 * Pause / handoff tokens — pure.
 *
 * Encode just enough of a live run to resume it later (or on another device).
 * Distinct from RunSnapshot (which is for completed-run sharing): a handoff
 * captures the IN-PROGRESS state — current node, flags, journey, log,
 * cumulative cost/time — and packs it into a compact base64url token with
 * an SGH1.* prefix so it can be spotted in pasted text.
 *
 * The actual case is referenced by id; the receiver loads it from their
 * catalogue. Token verification is shape-only (no signing) — handoff is for
 * cooperation, not authentication.
 */

import type { CaseRunSnapshot, DecisionLogEntry } from './types';

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

export interface Handoff {
  caseId: string;
  currentNodeId: string | null;
  currentFacilityId: string | null;
  log: DecisionLogEntry[];
  elapsedGameMin: number;
  totalCostSGD: number;
  flags: string[];
  journey: string[];
  /** ms timestamp when the handoff was created. */
  at: number;
}

/**
 * Build a Handoff from the live run state. Returns null when the run isn't
 * actually in progress (no caseId / status idle / completed) — those don't
 * need handing off, just sharing via RunSnapshot.
 */
export function buildHandoff(run: CaseRunSnapshot, now: number = Date.now()): Handoff | null {
  if (!run.caseId) return null;
  if (run.status !== 'running' && run.status !== 'awaiting-decision') return null;
  return {
    caseId: run.caseId,
    currentNodeId: run.currentNodeId,
    currentFacilityId: run.currentFacilityId,
    log: run.log.slice(),
    elapsedGameMin: run.elapsedGameMin,
    totalCostSGD: run.totalCostSGD,
    flags: run.flags.slice(),
    journey: run.journey.slice(),
    at: now,
  };
}

export function encodeHandoff(h: Handoff): string {
  return `SGH1.${toB64Url(JSON.stringify(h))}`;
}

export function decodeHandoff(token: string): Handoff | null {
  try {
    const t = token.trim();
    if (!t.startsWith('SGH1.')) return null;
    const obj = JSON.parse(fromB64Url(t.slice(5)));
    if (typeof obj !== 'object' || obj === null) return null;
    const x = obj as Record<string, unknown>;
    if (typeof x.caseId !== 'string') return null;
    if (!Array.isArray(x.log)) return null;
    if (!Array.isArray(x.flags) || !x.flags.every((f) => typeof f === 'string')) return null;
    if (!Array.isArray(x.journey) || !x.journey.every((j) => typeof j === 'string')) return null;
    if (typeof x.elapsedGameMin !== 'number' || typeof x.totalCostSGD !== 'number') return null;
    if (typeof x.at !== 'number') return null;
    // currentNodeId / currentFacilityId can be null.
    return obj as Handoff;
  } catch {
    return null;
  }
}

/**
 * Extract every handoff token from a free-text blob. Useful when a learner
 * pastes "here's where I left off: SGH1.… have a look".
 */
export function extractHandoffs(text: string): Handoff[] {
  return text
    .split(/\s+/)
    .filter((x) => x.startsWith('SGH1.'))
    .map(decodeHandoff)
    .filter((h): h is Handoff => h !== null);
}
