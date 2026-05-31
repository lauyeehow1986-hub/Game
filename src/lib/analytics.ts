/**
 * Aggregations for the analytics dashboard — pure functions over the
 * persisted runHistory. Complements personal-trends (which drives the inline
 * panel) with distribution + time-series views for a richer dashboard.
 */

import type { RunHistoryEntry } from './types';

export interface GradeBucket {
  band: 'A' | 'B' | 'C' | 'D';
  label: string;
  /** Inclusive lower ratio bound. */
  min: number;
  count: number;
}

/** Buckets every run into a grade band by score ratio. */
export function gradeHistogram(runHistory: Record<string, RunHistoryEntry[]>): GradeBucket[] {
  const buckets: GradeBucket[] = [
    { band: 'A', label: '≥90%', min: 0.9, count: 0 },
    { band: 'B', label: '75-89%', min: 0.75, count: 0 },
    { band: 'C', label: '50-74%', min: 0.5, count: 0 },
    { band: 'D', label: '<50%', min: 0, count: 0 },
  ];
  for (const runs of Object.values(runHistory)) {
    for (const r of runs) {
      const ratio = r.max > 0 ? r.score / r.max : 0;
      const b = buckets.find((x) => ratio >= x.min)!;
      b.count += 1;
    }
  }
  return buckets;
}

export interface WeekActivity {
  /** ISO week start (YYYY-MM-DD, local) for the bucket. */
  weekStart: string;
  runs: number;
}

const DAY = 24 * 60 * 60 * 1000;

function localDate(d: Date): string {
  return d.toLocaleDateString('en-CA');
}

/** Runs per ISO week for the last `weeks` weeks, oldest first. */
export function runsPerWeek(
  runHistory: Record<string, RunHistoryEntry[]>,
  weeks = 8,
  now: Date = new Date(),
): WeekActivity[] {
  // Monday of the current week.
  const monday = new Date(now);
  const dow = (monday.getDay() + 6) % 7;
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - dow);

  const buckets: WeekActivity[] = [];
  for (let i = weeks - 1; i >= 0; i -= 1) {
    const start = new Date(monday.getTime() - i * 7 * DAY);
    buckets.push({ weekStart: localDate(start), runs: 0 });
  }
  const earliest = monday.getTime() - (weeks - 1) * 7 * DAY;
  for (const runs of Object.values(runHistory)) {
    for (const r of runs) {
      if (r.at < earliest) continue;
      const idx = Math.floor((r.at - earliest) / (7 * DAY));
      if (idx >= 0 && idx < buckets.length) buckets[idx].runs += 1;
    }
  }
  return buckets;
}

export interface AnalyticsSummary {
  totalRuns: number;
  meanRatio: number;
  bestRatio: number;
  distinctions: number; // runs ≥ 90%
  distinctCases: number;
}

export function analyticsSummary(runHistory: Record<string, RunHistoryEntry[]>): AnalyticsSummary {
  let totalRuns = 0;
  let sumRatio = 0;
  let bestRatio = 0;
  let distinctions = 0;
  let distinctCases = 0;
  for (const runs of Object.values(runHistory)) {
    if (runs.length > 0) distinctCases += 1;
    for (const r of runs) {
      const ratio = r.max > 0 ? r.score / r.max : 0;
      totalRuns += 1;
      sumRatio += ratio;
      if (ratio > bestRatio) bestRatio = ratio;
      if (ratio >= 0.9) distinctions += 1;
    }
  }
  return {
    totalRuns,
    meanRatio: totalRuns > 0 ? sumRatio / totalRuns : 0,
    bestRatio,
    distinctions,
    distinctCases,
  };
}
