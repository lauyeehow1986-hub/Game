/**
 * Timed exam / OSCE mode — pure helpers.
 *
 * Unlike Quick Quiz (immediate per-question feedback, pure revision), the exam
 * presents N decisions back-to-back with NO rationale until the end, under a
 * countdown, then grades pass/fail against a threshold and emits a certificate
 * payload. Builds on the same QuizItem shape.
 */

import type { CaseDefinition } from './types';
import type { QuizItem } from './quiz';

export interface ExamConfig {
  /** Number of decisions in the exam. */
  count: number;
  /** Seconds allowed for the whole paper. */
  durationSec: number;
  /** Fraction of max score needed to pass (0..1). */
  passRatio: number;
}

export const EXAM_PRESETS: Record<'short' | 'standard' | 'osce', ExamConfig> = {
  short: { count: 8, durationSec: 8 * 60, passRatio: 0.65 },
  standard: { count: 15, durationSec: 20 * 60, passRatio: 0.65 },
  osce: { count: 20, durationSec: 30 * 60, passRatio: 0.7 },
};

/** Tiny seeded RNG (mulberry32) so an exam can be reproduced from a seed. */
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

/**
 * Build an exam of `count` decisions sampled WITHOUT replacement across the
 * supplied cases, spreading picks across distinct cases first for breadth.
 * Deterministic when a seed is given.
 */
export function buildExam(
  cases: CaseDefinition[],
  count: number,
  seed?: number,
): QuizItem[] {
  // Collect all decisions grouped by case.
  const byCase: QuizItem[][] = [];
  for (const c of cases) {
    const items: QuizItem[] = [];
    for (const node of c.pathway) {
      if (node.decision) items.push({ caseId: c.id, decisionId: node.decision.id });
    }
    if (items.length > 0) byCase.push(items);
  }
  if (byCase.length === 0) return [];

  const rng = seed !== undefined ? mulberry32(seed) : Math.random;
  // Shuffle each case's decisions and the case order.
  const shuffle = <T>(arr: T[]): T[] => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const pools = shuffle(byCase).map((items) => shuffle(items));

  // Round-robin across cases for breadth, then top up if count exceeds the
  // number of distinct cases.
  const out: QuizItem[] = [];
  let round = 0;
  while (out.length < count) {
    let added = false;
    for (const pool of pools) {
      if (pool[round]) {
        out.push(pool[round]);
        added = true;
        if (out.length >= count) break;
      }
    }
    if (!added) break; // exhausted every pool
    round += 1;
  }
  return out;
}

export interface ExamPick {
  score: number;
  max: number;
}

export interface ExamResult {
  earned: number;
  max: number;
  ratio: number;
  passed: boolean;
  /** Number of questions answered (picks supplied). */
  answered: number;
  total: number;
}

export function gradeExam(
  picks: ExamPick[],
  total: number,
  passRatio: number,
): ExamResult {
  let earned = 0;
  let max = 0;
  for (const p of picks) {
    // Negative-scoring options shouldn't pull the exam below zero per item;
    // clamp the per-item floor at 0 so the exam ratio stays in [0,1].
    earned += Math.max(0, p.score);
    max += p.max;
  }
  const ratio = max > 0 ? earned / max : 0;
  return {
    earned,
    max,
    ratio,
    passed: ratio >= passRatio,
    answered: picks.length,
    total,
  };
}

export interface Certificate {
  title: string;
  ratioPct: number;
  passed: boolean;
  issuedAt: number;
  preset: string;
  /** Short verification id derived from the result + timestamp. */
  ref: string;
}

export function buildCertificate(
  result: ExamResult,
  preset: string,
  issuedAt: number = Date.now(),
): Certificate {
  // Deterministic short ref so the same result+time produces the same id.
  const basis = `${preset}|${result.earned}|${result.max}|${issuedAt}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < basis.length; i += 1) {
    h ^= basis.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  const ref = (h >>> 0).toString(36).toUpperCase().padStart(7, '0');
  return {
    title: 'SG Pathway — Clinical Decisions Exam',
    ratioPct: Math.round(result.ratio * 100),
    passed: result.passed,
    issuedAt,
    preset,
    ref,
  };
}
