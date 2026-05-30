import type { CaseDefinition } from './types';

export interface QuizItem {
  caseId: string;
  decisionId: string;
}

/**
 * Build a random quiz of N decisions drawn from the supplied cases.
 * Pure function — caller seeds the cases list (e.g. unplayed cases,
 * weakest cases, full catalogue). Deterministic when a seed is given,
 * random otherwise.
 */
export function buildRandomQuiz(
  cases: CaseDefinition[],
  count: number,
  seed?: number,
): QuizItem[] {
  const decisions: QuizItem[] = [];
  for (const c of cases) {
    for (const node of c.pathway) {
      if (node.decision) decisions.push({ caseId: c.id, decisionId: node.decision.id });
    }
  }
  if (decisions.length === 0) return [];
  const out: QuizItem[] = [];
  const pool = decisions.slice();
  const rng = seed !== undefined ? mulberry32(seed) : Math.random;
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(rng() * pool.length);
    out.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return out;
}

/**
 * Build a quiz from an explicit list of (caseId, decisionId) pairs — used by
 * the spaced-retrieval scheduler to resurface due items. Only keeps pairs
 * that still resolve to a real decision in the catalogue, capped at `count`
 * (0 = no cap), preserving input order (the scheduler hands them soonest-due
 * first).
 */
export function buildQuizFromDecisions(
  pairs: Array<{ caseId: string; decisionId: string }>,
  cases: CaseDefinition[],
  count = 0,
): QuizItem[] {
  const byId = new Map(cases.map((c) => [c.id, c]));
  const out: QuizItem[] = [];
  for (const p of pairs) {
    const c = byId.get(p.caseId);
    if (!c) continue;
    const exists = c.pathway.some((n) => n.decision?.id === p.decisionId);
    if (!exists) continue;
    out.push({ caseId: p.caseId, decisionId: p.decisionId });
    if (count > 0 && out.length >= count) break;
  }
  return out;
}

/** Tiny seeded RNG so tests can pin behaviour. */
function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export interface QuizScore {
  earned: number;
  max: number;
  ratio: number;
}

export function totalQuizScore(picks: Array<{ score: number; max: number }>): QuizScore {
  let earned = 0;
  let max = 0;
  for (const p of picks) {
    earned += p.score;
    max += p.max;
  }
  return { earned, max, ratio: max > 0 ? earned / max : 0 };
}
