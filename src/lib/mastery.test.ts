import { describe, expect, it } from 'vitest';
import { caseMastery, masteryReport } from './mastery';
import type { CaseDefinition, RunHistoryEntry } from './types';

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = new Date(2026, 5, 3, 10).getTime();

function run(score: number, max: number, at: number): RunHistoryEntry {
  return { score, max, at, log: [] };
}

describe('mastery', () => {
  it('returns untouched when there is no history', () => {
    const m = caseMastery('c', undefined, undefined);
    expect(m.level).toBe('untouched');
    expect(m.attempts).toBe(0);
  });

  it('returns attempted on a single low-quality run', () => {
    const m = caseMastery(
      'c',
      { score: 40, max: 100, at: NOW },
      [run(40, 100, NOW)],
    );
    expect(m.level).toBe('attempted');
  });

  it('promotes to developing on three runs even without a high best', () => {
    const m = caseMastery(
      'c',
      { score: 60, max: 100, at: NOW },
      [run(40, 100, NOW - 2 * DAY_MS), run(55, 100, NOW - DAY_MS), run(60, 100, NOW)],
    );
    expect(m.level).toBe('developing');
  });

  it('mastered requires best ≥ 0.9 and latest ≥ 0.85 across at least two runs', () => {
    const m = caseMastery(
      'c',
      { score: 95, max: 100, at: NOW },
      [run(85, 100, NOW - 60 * 1000), run(95, 100, NOW)],
    );
    expect(m.level).toBe('mastered');
  });

  it('consolidated requires a second ≥ 0.85 run at least a day before the latest', () => {
    const m = caseMastery(
      'c',
      { score: 95, max: 100, at: NOW },
      [
        run(86, 100, NOW - 4 * DAY_MS),
        run(60, 100, NOW - 2 * DAY_MS),
        run(95, 100, NOW),
      ],
    );
    expect(m.level).toBe('consolidated');
  });

  it('back-to-back high runs stay mastered, not consolidated', () => {
    const m = caseMastery(
      'c',
      { score: 95, max: 100, at: NOW },
      [run(90, 100, NOW - 10 * 60 * 1000), run(95, 100, NOW)],
    );
    expect(m.level).toBe('mastered');
  });

  it('masteryReport tallies levels across the catalogue', () => {
    const catalogue: CaseDefinition[] = [
      { id: 'a' } as CaseDefinition,
      { id: 'b' } as CaseDefinition,
    ];
    const best = { a: { score: 95, max: 100, at: NOW } };
    const hist: Record<string, RunHistoryEntry[]> = {
      a: [run(86, 100, NOW - 2 * DAY_MS), run(95, 100, NOW)],
    };
    const r = masteryReport(catalogue, best, hist);
    expect(r.counts.consolidated).toBe(1);
    expect(r.counts.untouched).toBe(1);
  });
});
