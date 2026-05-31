import { describe, it, expect } from 'vitest';
import { gradeHistogram, runsPerWeek, analyticsSummary } from './analytics';
import type { RunHistoryEntry } from './types';

const DAY = 24 * 60 * 60 * 1000;
const r = (score: number, max: number, at = 0): RunHistoryEntry => ({ score, max, at });

describe('gradeHistogram', () => {
  it('buckets runs into A/B/C/D by ratio', () => {
    const h = gradeHistogram({
      x: [r(10, 10), r(8, 10), r(6, 10), r(2, 10)],
    });
    expect(h.find((b) => b.band === 'A')!.count).toBe(1); // 100%
    expect(h.find((b) => b.band === 'B')!.count).toBe(1); // 80%
    expect(h.find((b) => b.band === 'C')!.count).toBe(1); // 60%
    expect(h.find((b) => b.band === 'D')!.count).toBe(1); // 20%
  });

  it('is all-zero for empty history', () => {
    expect(gradeHistogram({}).every((b) => b.count === 0)).toBe(true);
  });
});

describe('runsPerWeek', () => {
  it('returns the requested number of week buckets, oldest first', () => {
    const w = runsPerWeek({}, 8, new Date(2026, 0, 15));
    expect(w).toHaveLength(8);
  });

  it('counts a recent run into the latest bucket', () => {
    const now = new Date(2026, 0, 15);
    const w = runsPerWeek({ x: [r(5, 10, now.getTime())] }, 8, now);
    expect(w[w.length - 1].runs).toBe(1);
  });

  it('ignores runs older than the window', () => {
    const now = new Date(2026, 0, 15);
    const old = now.getTime() - 100 * DAY;
    const w = runsPerWeek({ x: [r(5, 10, old)] }, 4, now);
    expect(w.reduce((a, b) => a + b.runs, 0)).toBe(0);
  });
});

describe('analyticsSummary', () => {
  it('summarises runs, mean, best, distinctions, distinct cases', () => {
    const s = analyticsSummary({
      a: [r(9, 10), r(10, 10)],
      b: [r(4, 10)],
    });
    expect(s.totalRuns).toBe(3);
    expect(s.distinctCases).toBe(2);
    expect(s.distinctions).toBe(2); // 90% and 100%
    expect(s.bestRatio).toBeCloseTo(1);
    expect(s.meanRatio).toBeCloseTo((0.9 + 1 + 0.4) / 3);
  });

  it('is zeroed for empty history', () => {
    const s = analyticsSummary({});
    expect(s).toEqual({ totalRuns: 0, meanRatio: 0, bestRatio: 0, distinctions: 0, distinctCases: 0 });
  });
});
