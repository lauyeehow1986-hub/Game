import { describe, it, expect } from 'vitest';
import { computePersonalTrends, divergenceFromBestPath, gradeBandLabel } from './personal-trends';
import type { CaseDefinition, DecisionLogEntry } from './types';

const sampleCase = (id: string, category: CaseDefinition['category'] = 'acute'): CaseDefinition => ({
  id,
  title: `Case ${id}`,
  blurb: 'b',
  category,
  primaryFacility: 'ttsh',
  involvedFacilities: ['ttsh'],
  profileKey: 'taxiDriver',
  allowsWardChoice: false,
  guidelines: [],
  pathway: [
    {
      id: 'a',
      department: 'ed',
      durationMin: 5,
      framing: { patient: '', caregiver: '', staff: '' },
      decision: {
        id: 'd',
        prompt: 'pick',
        weight: 1,
        reference: { label: 'r', body: '' },
        options: [
          { id: 'good', label: 'good', rationale: '', score: 10, outcome: { patient: '', caregiver: '', staff: '' } },
          { id: 'bad', label: 'bad', rationale: '', score: -5, outcome: { patient: '', caregiver: '', staff: '' } },
        ],
      },
    },
  ],
});

const catalogue = [
  sampleCase('a', 'acute'),
  sampleCase('b', 'acute'),
  sampleCase('c', 'outpatient'),
  sampleCase('d', 'elective'),
];

describe('computePersonalTrends', () => {
  const resolveTitle = (c: CaseDefinition) =>
    typeof c.title === 'string' ? c.title : (c.title.en ?? '');

  it('returns zeros when nothing has been played', () => {
    const t = computePersonalTrends({}, catalogue, resolveTitle);
    expect(t.totalCases).toBe(4);
    expect(t.totalPlayed).toBe(0);
    expect(t.meanRatio).toBe(0);
    expect(t.unplayed).toHaveLength(4);
    expect(t.recommendedCaseId).toBe('a'); // first unplayed alphabetically
  });

  it('aggregates by category with mean ratio', () => {
    const scores = {
      a: { score: 10, max: 10, at: 1 },
      b: { score: 5, max: 10, at: 2 },
      c: { score: 8, max: 10, at: 3 },
    };
    const t = computePersonalTrends(scores, catalogue, resolveTitle);
    expect(t.totalPlayed).toBe(3);
    const acute = t.byCategory.find((c) => c.category === 'acute');
    expect(acute?.cases).toBe(2);
    expect(acute?.meanRatio).toBeCloseTo(0.75, 5);
    const outpat = t.byCategory.find((c) => c.category === 'outpatient');
    expect(outpat?.cases).toBe(1);
    expect(outpat?.meanRatio).toBe(0.8);
  });

  it('recommends the weakest played case when one is below the mastery band', () => {
    const scores = {
      a: { score: 10, max: 10, at: 1 },
      b: { score: 4, max: 10, at: 2 },
    };
    const t = computePersonalTrends(scores, catalogue, resolveTitle);
    expect(t.recommendedCaseId).toBe('b');
  });

  it('recommends the first unplayed case when all played are at mastery', () => {
    const scores = {
      a: { score: 10, max: 10, at: 1 },
      b: { score: 9, max: 10, at: 2 },
    };
    const t = computePersonalTrends(scores, catalogue, resolveTitle);
    expect(t.recommendedCaseId).toBe('c');
  });

  it('orders case trends newest-first', () => {
    const scores = {
      a: { score: 1, max: 10, at: 10 },
      b: { score: 1, max: 10, at: 30 },
      c: { score: 1, max: 10, at: 20 },
    };
    const t = computePersonalTrends(scores, catalogue, resolveTitle);
    expect(t.caseTrends.map((x) => x.caseId)).toEqual(['b', 'c', 'a']);
  });
});

describe('divergenceFromBestPath', () => {
  const caseDef = sampleCase('x');

  it('reports 100% match rate when player picks all best options', () => {
    const log: DecisionLogEntry[] = [
      { nodeId: 'a', decisionId: 'd', optionId: 'good', scoreEarned: 10, maxScore: 10 },
    ];
    const r = divergenceFromBestPath(caseDef, log);
    expect(r.decisions).toBe(1);
    expect(r.matched).toBe(1);
    expect(r.matchRate).toBe(1);
  });

  it('reports 0% match rate when player picks the wrong option', () => {
    const log: DecisionLogEntry[] = [
      { nodeId: 'a', decisionId: 'd', optionId: 'bad', scoreEarned: -5, maxScore: 10 },
    ];
    const r = divergenceFromBestPath(caseDef, log);
    expect(r.matchRate).toBe(0);
  });
});

describe('gradeBandLabel', () => {
  it('maps ratios to the same bands as the ResultsModal', () => {
    expect(gradeBandLabel(0.95)).toBe('Distinction');
    expect(gradeBandLabel(0.8)).toBe('Pass');
    expect(gradeBandLabel(0.6)).toBe('Borderline');
    expect(gradeBandLabel(0.3)).toBe('Unsafe');
  });
});
