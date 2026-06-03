import { describe, expect, it } from 'vitest';
import { DEFAULT_TARGETS, computeWeekReport, weekStart } from './learning-goals';
import type { RunHistoryEntry } from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

describe('learning-goals', () => {
  it('weekStart returns the local-Monday midnight for a midweek timestamp', () => {
    // Pick a Wednesday 2026-06-03 ~midday local time.
    const wed = new Date(2026, 5, 3, 14, 22, 0).getTime();
    const ws = weekStart(wed);
    const d = new Date(ws);
    expect(d.getDay()).toBe(1);
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
  });

  it('weekStart treats a Sunday as the end of the previous week', () => {
    const sun = new Date(2026, 5, 7, 12, 0, 0).getTime();
    const ws = weekStart(sun);
    const d = new Date(ws);
    expect(d.getDay()).toBe(1);
    // 7 - 6 = day 1 of the week (the prior Monday).
    expect(d.getDate()).toBe(1);
  });

  it('returns zero progress when there are no in-week runs', () => {
    const r = computeWeekReport({}, DEFAULT_TARGETS, new Date(2026, 5, 3).getTime());
    expect(r.casesCompleted).toBe(0);
    expect(r.distinctions).toBe(0);
    expect(r.meanRatio).toBe(0);
    expect(r.allMet).toBe(false);
  });

  it('counts unique cases, distinctions and mean ratio inside the week', () => {
    const now = new Date(2026, 5, 3, 10).getTime();
    const today = now - 30 * 60 * 1000;
    const yesterday = now - DAY_MS;
    const lastWeek = now - 10 * DAY_MS;
    const hist: Record<string, RunHistoryEntry[]> = {
      'case-a': [
        { score: 90, max: 100, at: today, log: [] },
        { score: 75, max: 100, at: yesterday, log: [] },
        { score: 60, max: 100, at: lastWeek, log: [] }, // out of week
      ],
      'case-b': [{ score: 95, max: 100, at: today, log: [] }],
    };
    const r = computeWeekReport(hist, DEFAULT_TARGETS, now);
    expect(r.casesCompleted).toBe(2);
    expect(r.distinctions).toBe(2); // 0.90 and 0.95 both ≥ 0.9
    expect(r.meanRatio).toBeCloseTo((0.9 + 0.75 + 0.95) / 3, 5);
  });

  it('flags allMet when every target is hit', () => {
    const now = Date.now();
    const hist: Record<string, RunHistoryEntry[]> = {
      a: [{ score: 90, max: 100, at: now, log: [] }],
      b: [{ score: 92, max: 100, at: now, log: [] }],
      c: [{ score: 88, max: 100, at: now, log: [] }],
    };
    const r = computeWeekReport(hist, DEFAULT_TARGETS, now);
    expect(r.casesCompleted).toBe(3);
    expect(r.distinctions).toBeGreaterThanOrEqual(1);
    expect(r.meanRatio).toBeGreaterThanOrEqual(0.75);
    expect(r.allMet).toBe(true);
    expect(r.progress.cases).toBe(1);
    expect(r.progress.distinctions).toBe(1);
    expect(r.progress.meanRatio).toBe(1);
  });

  it('clamps progress at 1 when a target is overshot', () => {
    const now = Date.now();
    const hist: Record<string, RunHistoryEntry[]> = Object.fromEntries(
      Array.from({ length: 8 }, (_, i) => [
        `c${i}`,
        [{ score: 95, max: 100, at: now, log: [] }] as RunHistoryEntry[],
      ]),
    );
    const r = computeWeekReport(hist, DEFAULT_TARGETS, now);
    expect(r.progress.cases).toBe(1);
    expect(r.progress.distinctions).toBe(1);
    expect(r.casesCompleted).toBe(8);
  });
});
