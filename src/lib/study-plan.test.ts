import { describe, it, expect } from 'vitest';
import { buildStudyPlan, type PlanInput } from './study-plan';
import type { RunHistoryEntry } from './types';

const DAY = 24 * 60 * 60 * 1000;

function r(at: number, decisionId: string, scoreEarned: number, maxScore: number): RunHistoryEntry {
  return {
    score: scoreEarned, max: maxScore, at,
    log: [{ nodeId: decisionId, decisionId, optionId: 'o', scoreEarned, maxScore }],
  };
}

function emptyInput(over: Partial<PlanInput> = {}): PlanInput {
  return {
    bestScores: {},
    runHistory: {},
    playableIds: ['stemi', 'sepsis', 'hf', 'urti', 'thr'],
    unplayedIds: ['stemi', 'sepsis', 'hf', 'urti', 'thr'],
    curricula: [],
    ...over,
  };
}

describe('buildStudyPlan', () => {
  it('returns up to N tasks ordered by priority', () => {
    const plan = buildStudyPlan(emptyInput(), 5, '2026-05-29');
    expect(plan.length).toBeLessThanOrEqual(5);
    expect(plan.map((t) => t.priority)).toEqual([...plan.map((t) => t.priority)].sort((a, b) => a - b));
  });

  it('leads with a spaced-retrieval review when one is due', () => {
    const t0 = Date.now() - 7 * DAY;
    const plan = buildStudyPlan(
      emptyInput({
        bestScores: { stemi: { score: 1, max: 10, at: t0 } },
        runHistory: { stemi: [r(t0, 'd1', 1, 10)] },
        unplayedIds: ['sepsis', 'hf', 'urti', 'thr'],
      }),
      5,
      '2026-05-29',
    );
    expect(plan[0].kind).toBe('review');
    expect(plan[0].caseId).toBe('stemi');
    expect(plan[0].decisionId).toBe('d1');
  });

  it('surfaces the weakest played case below 0.85', () => {
    const plan = buildStudyPlan(
      emptyInput({
        bestScores: {
          urti: { score: 10, max: 10, at: 0 }, // 100%
          hf: { score: 5, max: 10, at: 0 },    // 50% — should be picked
        },
        unplayedIds: ['stemi', 'sepsis', 'thr'],
      }),
      5,
      '2026-05-29',
    );
    expect(plan.find((t) => t.kind === 'practice')?.caseId).toBe('hf');
  });

  it('picks the next case in an unfinished curriculum', () => {
    const plan = buildStudyPlan(
      emptyInput({
        bestScores: { stemi: { score: 10, max: 10, at: 0 } },
        curricula: [{ id: 'cardio', caseIds: ['stemi', 'hf', 'urti'] }],
        unplayedIds: ['sepsis', 'thr'],
      }),
      5,
      '2026-05-29',
    );
    expect(plan.find((t) => t.kind === 'curriculum')?.caseId).toBe('hf');
  });

  it('includes today\'s daily challenge', () => {
    const plan = buildStudyPlan(emptyInput(), 5, '2026-05-29');
    expect(plan.find((t) => t.kind === 'daily')).toBeTruthy();
  });

  it('never repeats a caseId across tasks', () => {
    const plan = buildStudyPlan(emptyInput(), 5, '2026-05-29');
    const ids = plan.map((t) => t.caseId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('skips a case that is not in the playable set', () => {
    const t0 = Date.now() - 7 * DAY;
    const plan = buildStudyPlan(
      emptyInput({
        bestScores: { locked: { score: 1, max: 10, at: t0 } },
        runHistory: { locked: [r(t0, 'd1', 1, 10)] },
        playableIds: ['stemi', 'sepsis'],
        unplayedIds: ['stemi', 'sepsis'],
      }),
      5,
      '2026-05-29',
    );
    expect(plan.find((t) => t.caseId === 'locked')).toBeUndefined();
  });
});
