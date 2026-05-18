import { describe, it, expect } from 'vitest';
import { computeDifficulty } from './case-difficulty';
import type { CaseDefinition, PathwayNode } from './types';

function mkDecisionNode(id: string, scores: number[], weight = 1): PathwayNode {
  return {
    id,
    department: 'ed',
    durationMin: 10,
    framing: { patient: '', caregiver: '', staff: '' },
    decision: {
      id: `${id}-d`,
      prompt: '',
      reference: { label: '', body: '' },
      weight,
      options: scores.map((s, i) => ({
        id: `${id}-o${i}`,
        label: `o${i}`,
        rationale: '',
        score: s,
        outcome: { patient: '', caregiver: '', staff: '' },
      })),
    },
  };
}

function mkCase(over: Partial<CaseDefinition> & { pathway: PathwayNode[] }): CaseDefinition {
  return {
    id: 't',
    title: 't',
    blurb: '',
    category: 'acute',
    primaryFacility: 'ttsh',
    involvedFacilities: ['ttsh'],
    guidelines: [],
    profileKey: 'default',
    allowsWardChoice: false,
    ...over,
  };
}

describe('computeDifficulty', () => {
  it('classifies short, low-stakes cases as beginner', () => {
    const c = mkCase({ pathway: [mkDecisionNode('a', [5, 3, 0]), mkDecisionNode('b', [4, 2])] });
    const d = computeDifficulty(c);
    expect(d.band).toBe('beginner');
    expect(d.decisions).toBe(2);
  });

  it('classifies long cases as advanced', () => {
    const c = mkCase({
      pathway: Array.from({ length: 8 }, (_, i) => mkDecisionNode(`n${i}`, [5, 0])),
    });
    expect(computeDifficulty(c).band).toBe('advanced');
  });

  it('bumps beginner to intermediate when score gap is huge', () => {
    const c = mkCase({ pathway: [mkDecisionNode('a', [10, -10])] });
    expect(computeDifficulty(c).band).toBe('intermediate');
  });

  it('bumps intermediate to advanced on big score gap', () => {
    const c = mkCase({
      pathway: [
        mkDecisionNode('a', [10, 0]),
        mkDecisionNode('b', [10, -15]),
        mkDecisionNode('c', [5, 0]),
        mkDecisionNode('d', [5, 0]),
        mkDecisionNode('e', [5, 0]),
      ],
    });
    expect(computeDifficulty(c).band).toBe('advanced');
  });

  it('historical or randomiseProfile lifts a beginner one band', () => {
    const c = mkCase({ pathway: [mkDecisionNode('a', [5, 0])], historical: true });
    expect(computeDifficulty(c).band).toBe('intermediate');
  });
});
