import { describe, it, expect } from 'vitest';
import { buildRandomQuiz, totalQuizScore } from './quiz';
import type { CaseDefinition, PathwayNode } from './types';

const dec = { id: 'd', prompt: '', weight: 1, reference: { label: '', body: '' }, options: [] };

function mkCase(id: string, decisions: number): CaseDefinition {
  const pathway: PathwayNode[] = [];
  for (let i = 0; i < decisions; i++) {
    pathway.push({
      id: `${id}-n${i}`,
      department: 'ed',
      durationMin: 5,
      framing: { patient: '', caregiver: '', staff: '' },
      decision: { ...dec, id: `${id}-d${i}` },
    });
  }
  return {
    id,
    title: id,
    blurb: '',
    category: 'acute',
    primaryFacility: 'ttsh',
    involvedFacilities: ['ttsh'],
    profileKey: 'taxiDriver',
    allowsWardChoice: false,
    guidelines: [],
    pathway,
  };
}

describe('buildRandomQuiz', () => {
  it('returns N items when the pool is at least N', () => {
    const cases = [mkCase('a', 4), mkCase('b', 4)];
    expect(buildRandomQuiz(cases, 5, 1).length).toBe(5);
  });

  it('returns up to the pool size when N exceeds available decisions', () => {
    const cases = [mkCase('a', 2)];
    expect(buildRandomQuiz(cases, 10, 1).length).toBe(2);
  });

  it('returns no duplicates within a single quiz', () => {
    const cases = [mkCase('a', 6)];
    const ids = buildRandomQuiz(cases, 6, 42).map((q) => q.decisionId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('is deterministic with a seed', () => {
    const cases = [mkCase('a', 6), mkCase('b', 6)];
    const q1 = buildRandomQuiz(cases, 5, 7);
    const q2 = buildRandomQuiz(cases, 5, 7);
    expect(q1).toEqual(q2);
  });

  it('returns an empty array when no decisions exist', () => {
    const cases = [mkCase('a', 0)];
    expect(buildRandomQuiz(cases, 5, 1)).toEqual([]);
  });
});

describe('totalQuizScore', () => {
  it('sums earned and max, computes ratio', () => {
    const r = totalQuizScore([
      { score: 5, max: 10 },
      { score: 8, max: 10 },
    ]);
    expect(r.earned).toBe(13);
    expect(r.max).toBe(20);
    expect(r.ratio).toBe(0.65);
  });

  it('handles empty input (ratio 0)', () => {
    expect(totalQuizScore([])).toEqual({ earned: 0, max: 0, ratio: 0 });
  });
});
