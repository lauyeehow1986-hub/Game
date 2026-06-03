/**
 * Per-case mastery — pure.
 *
 * Many learners want a single "have I really learned this case?" badge that
 * goes deeper than the highest single score. Mastery requires both a high
 * best (≥ 0.9) and a stable recent run (most-recent ≥ 0.85), with at least
 * two attempts so a fluke first-time distinction doesn't count.
 *
 * The next tier above mastery — "consolidated" — adds a second high-quality
 * run separated by a minimum cool-off (≥ 1 day apart) so the learner has
 * proven retention rather than back-to-back rote.
 */

import type { CaseDefinition, RunHistoryEntry } from './types';

export type MasteryLevel = 'untouched' | 'attempted' | 'developing' | 'mastered' | 'consolidated';

export interface CaseMastery {
  caseId: string;
  attempts: number;
  bestRatio: number;
  latestRatio: number;
  latestAt: number;
  level: MasteryLevel;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function ratioOf(e: { score: number; max: number }): number {
  return e.max > 0 ? e.score / e.max : 0;
}

export function caseMastery(
  caseId: string,
  best: { score: number; max: number; at: number } | undefined,
  runs: RunHistoryEntry[] | undefined,
): CaseMastery {
  const attempts = runs?.length ?? 0;
  if (attempts === 0 || !best) {
    return {
      caseId,
      attempts,
      bestRatio: 0,
      latestRatio: 0,
      latestAt: 0,
      level: attempts === 0 ? 'untouched' : 'attempted',
    };
  }
  const sortedRuns = [...(runs ?? [])].sort((a, b) => a.at - b.at);
  const latest = sortedRuns[sortedRuns.length - 1];
  const bestRatio = ratioOf(best);
  const latestRatio = ratioOf(latest);

  let level: MasteryLevel = 'attempted';
  if (bestRatio >= 0.9 && latestRatio >= 0.85 && attempts >= 2) {
    // Look for a second ≥ 0.85 run at least 1 day before the latest one.
    const hasCoolOffRetention = sortedRuns
      .slice(0, -1)
      .some((r) => ratioOf(r) >= 0.85 && latest.at - r.at >= DAY_MS);
    level = hasCoolOffRetention ? 'consolidated' : 'mastered';
  } else if (bestRatio >= 0.75 || attempts >= 3) {
    level = 'developing';
  }

  return {
    caseId,
    attempts,
    bestRatio,
    latestRatio,
    latestAt: latest.at,
    level,
  };
}

export interface MasteryReport {
  byCase: CaseMastery[];
  counts: Record<MasteryLevel, number>;
}

export function masteryReport(
  catalogue: CaseDefinition[],
  bestScores: Record<string, { score: number; max: number; at: number }>,
  runHistory: Record<string, RunHistoryEntry[]>,
): MasteryReport {
  const byCase = catalogue.map((c) => caseMastery(c.id, bestScores[c.id], runHistory[c.id]));
  const counts: Record<MasteryLevel, number> = {
    untouched: 0,
    attempted: 0,
    developing: 0,
    mastered: 0,
    consolidated: 0,
  };
  for (const m of byCase) counts[m.level] += 1;
  return { byCase, counts };
}
