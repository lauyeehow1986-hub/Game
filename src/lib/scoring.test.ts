import { describe, it, expect } from 'vitest';
import { gradeForRatio, maxScoreForCase, maxScoreForDecision, totalScoreFromLog } from './scoring';
import type { CaseDefinition, Decision } from './types';

const decision: Decision = {
  id: 'd',
  prompt: '',
  weight: 2,
  reference: { label: '', body: '' },
  options: [
    {
      id: 'good',
      label: 'good',
      rationale: '',
      score: 10,
      outcome: { patient: '', caregiver: '', staff: '' },
    },
    {
      id: 'bad',
      label: 'bad',
      rationale: '',
      score: -5,
      outcome: { patient: '', caregiver: '', staff: '' },
    },
  ],
};

describe('maxScoreForDecision', () => {
  it('returns weighted best option', () => {
    expect(maxScoreForDecision(decision)).toBe(20);
  });
});

describe('maxScoreForCase', () => {
  it('sums the weighted maxima', () => {
    const caseDef: CaseDefinition = {
      id: '',
      title: '',
      blurb: '',
      category: 'acute',
      primaryFacility: '',
      involvedFacilities: [],
      profileKey: 'taxiDriver',
      allowsWardChoice: false,
      guidelines: [],
      pathway: [
        {
          id: 'a',
          department: 'ward',
          durationMin: 1,
          framing: { patient: '', caregiver: '', staff: '' },
          decision,
        },
        {
          id: 'b',
          department: 'ward',
          durationMin: 1,
          framing: { patient: '', caregiver: '', staff: '' },
          decision,
        },
      ],
    };
    expect(maxScoreForCase(caseDef)).toBe(40);
  });
});

describe('totalScoreFromLog', () => {
  it('sums earned and max across entries', () => {
    const result = totalScoreFromLog([
      { nodeId: 'a', decisionId: 'd', optionId: 'good', scoreEarned: 20, maxScore: 20 },
      { nodeId: 'b', decisionId: 'd', optionId: 'bad', scoreEarned: -10, maxScore: 20 },
    ]);
    expect(result.earned).toBe(10);
    expect(result.max).toBe(40);
  });
});

describe('gradeForRatio', () => {
  it('produces a Distinction at >=0.9', () => {
    expect(gradeForRatio(0.95).grade).toBe('Distinction');
  });
  it('Pass at 0.75', () => {
    expect(gradeForRatio(0.8).grade).toBe('Pass');
  });
  it('Borderline at 0.5', () => {
    expect(gradeForRatio(0.6).grade).toBe('Borderline');
  });
  it('Unsafe below 0.5', () => {
    expect(gradeForRatio(0.3).grade).toBe('Unsafe');
  });
});
