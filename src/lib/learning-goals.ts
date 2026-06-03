/**
 * Weekly learning-goal targets — pure.
 *
 * Lets a learner pin concrete weekly intent (cases done, distinctions earned,
 * mean ratio) and reports per-target progress from existing runHistory. The
 * store holds the user-set targets; this module turns runHistory + the active
 * week into a progress report the panel can render.
 *
 * The "week" boundary is local-Monday, mirroring streak-heatmap.
 */

import type { RunHistoryEntry } from './types';

export interface WeeklyTargets {
  casesPerWeek: number;
  distinctionsPerWeek: number;
  /** Mean ratio across this week's runs (0..1). */
  meanRatio: number;
}

export const DEFAULT_TARGETS: WeeklyTargets = {
  casesPerWeek: 3,
  distinctionsPerWeek: 1,
  meanRatio: 0.75,
};

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Local-Monday timestamp at 00:00 for the week containing `now`. JS Date's
 * getDay() is Sun=0..Sat=6; we want Mon=0..Sun=6 so a Sunday counts toward
 * the week that's just ending rather than the new one.
 */
export function weekStart(now: number = Date.now()): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  const day = (d.getDay() + 6) % 7;
  return d.getTime() - day * DAY_MS;
}

export interface WeekReport {
  /** Inclusive lower bound, ms. */
  from: number;
  /** Exclusive upper bound, ms. */
  to: number;
  casesCompleted: number;
  distinctions: number;
  meanRatio: number;
  /** Per-target completion ratio, clamped 0..1. 1 = goal met. */
  progress: {
    cases: number;
    distinctions: number;
    meanRatio: number;
  };
  /** True if every target is met. */
  allMet: boolean;
}

const DISTINCTION_RATIO = 0.9;

/**
 * Compute this week's progress against the targets. A "case" counts once per
 * unique caseId completed in-week. "Distinctions" count runs (any case) with
 * ratio ≥ 0.9. meanRatio is the average of in-week run ratios.
 */
export function computeWeekReport(
  runHistory: Record<string, RunHistoryEntry[]>,
  targets: WeeklyTargets,
  now: number = Date.now(),
): WeekReport {
  const from = weekStart(now);
  const to = from + 7 * DAY_MS;

  const caseIds = new Set<string>();
  let distinctions = 0;
  let sumRatio = 0;
  let runs = 0;

  for (const [caseId, entries] of Object.entries(runHistory)) {
    for (const e of entries) {
      if (e.at < from || e.at >= to) continue;
      caseIds.add(caseId);
      runs += 1;
      const ratio = e.max > 0 ? e.score / e.max : 0;
      sumRatio += ratio;
      if (ratio >= DISTINCTION_RATIO) distinctions += 1;
    }
  }

  const casesCompleted = caseIds.size;
  const meanRatio = runs === 0 ? 0 : sumRatio / runs;

  const progress = {
    cases: targets.casesPerWeek > 0 ? Math.min(1, casesCompleted / targets.casesPerWeek) : 1,
    distinctions:
      targets.distinctionsPerWeek > 0
        ? Math.min(1, distinctions / targets.distinctionsPerWeek)
        : 1,
    meanRatio: targets.meanRatio > 0 ? Math.min(1, meanRatio / targets.meanRatio) : 1,
  };
  const allMet =
    progress.cases >= 1 && progress.distinctions >= 1 && progress.meanRatio >= 1 && runs > 0;

  return { from, to, casesCompleted, distinctions, meanRatio, progress, allMet };
}
