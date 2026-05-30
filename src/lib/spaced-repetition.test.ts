import { describe, it, expect } from 'vitest';
import {
  buildSchedule,
  dueItems,
  topDueCaseId,
  INTERVALS_DAYS,
} from './spaced-repetition';
import type { RunHistoryEntry } from './types';

const DAY = 24 * 60 * 60 * 1000;

function run(at: number, entries: Array<[string, number, number]>): RunHistoryEntry {
  return {
    score: 0,
    max: 0,
    at,
    log: entries.map(([decisionId, scoreEarned, maxScore]) => ({
      nodeId: decisionId,
      decisionId,
      optionId: 'o',
      scoreEarned,
      maxScore,
    })),
  };
}

describe('buildSchedule', () => {
  it('ignores decisions always answered correctly', () => {
    const hist = { stemi: [run(0, [['d1', 10, 10]])] };
    expect(buildSchedule(hist)).toEqual([]);
  });

  it('schedules a decision that was answered wrong', () => {
    const t0 = 1_000_000_000_000;
    const hist = { stemi: [run(t0, [['d1', 2, 10]])] };
    const sched = buildSchedule(hist);
    expect(sched).toHaveLength(1);
    expect(sched[0].caseId).toBe('stemi');
    expect(sched[0].decisionId).toBe('d1');
    expect(sched[0].lastWrong).toBe(true);
    // wrong → stage 0 → due in 1 day
    expect(sched[0].dueAt).toBe(t0 + INTERVALS_DAYS[0] * DAY);
  });

  it('advances the interval after a correct re-attempt', () => {
    const t0 = 1_000_000_000_000;
    const hist = {
      stemi: [
        run(t0, [['d1', 2, 10]]), // wrong
        run(t0 + 2 * DAY, [['d1', 10, 10]]), // correct → stage 1
      ],
    };
    const sched = buildSchedule(hist);
    expect(sched[0].lastWrong).toBe(false);
    // After one correct review, next interval is INTERVALS_DAYS[0]=1 day from
    // the last attempt (stage 1, last.correct → index stage-1 = 0).
    expect(sched[0].dueAt).toBe(t0 + 2 * DAY + INTERVALS_DAYS[0] * DAY);
  });

  it('resets to stage 0 after a relapse', () => {
    const t0 = 1_000_000_000_000;
    const hist = {
      stemi: [
        run(t0, [['d1', 2, 10]]),
        run(t0 + 2 * DAY, [['d1', 10, 10]]),
        run(t0 + 5 * DAY, [['d1', 1, 10]]), // wrong again
      ],
    };
    const sched = buildSchedule(hist);
    expect(sched[0].stage).toBe(0);
    expect(sched[0].dueAt).toBe(t0 + 5 * DAY + INTERVALS_DAYS[0] * DAY);
  });
});

describe('dueItems', () => {
  it('returns only items due at or before now, soonest first', () => {
    const t0 = 1_000_000_000_000;
    const hist = {
      a: [run(t0 - 10 * DAY, [['d1', 0, 10]])], // due long ago
      b: [run(t0 - 2 * DAY, [['d2', 0, 10]])], // due ~1 day ago
      c: [run(t0, [['d3', 0, 10]])], // due tomorrow, not yet
    };
    const due = dueItems(hist, t0);
    expect(due.map((d) => d.caseId)).toEqual(['a', 'b']);
  });
});

describe('topDueCaseId', () => {
  it('returns the most-overdue case id', () => {
    const t0 = 1_000_000_000_000;
    const hist = {
      a: [run(t0 - 3 * DAY, [['d1', 0, 10]])],
      b: [run(t0 - 30 * DAY, [['d2', 0, 10]])],
    };
    expect(topDueCaseId(hist, t0)).toBe('b');
  });

  it('returns null when nothing is due', () => {
    expect(topDueCaseId({}, Date.now())).toBeNull();
  });
});
