import { describe, it, expect } from 'vitest';
import { computeDecisionWeaknesses } from './personal-trends';
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

  it('populates recommendations.practiceCaseId when a played case is below 0.85', () => {
    const scores = {
      a: { score: 3, max: 10, at: 1 },
      b: { score: 9, max: 10, at: 2 },
    };
    const t = computePersonalTrends(scores, catalogue, resolveTitle);
    expect(t.recommendations.practiceCaseId).toBe('a');
  });

  it('picks a curriculum continuation when one is started but unfinished', () => {
    const scores = { a: { score: 9, max: 10, at: 1 } };
    const curricula = [{ id: 'cardio', caseIds: ['a', 'b', 'c'] }];
    const t = computePersonalTrends(scores, catalogue, resolveTitle, curricula);
    expect(t.recommendations.curriculumCaseId).toBe('b');
  });

  it('ignores a curriculum the user has not started or already finished', () => {
    const curricula = [
      { id: 'untouched', caseIds: ['c', 'd'] },
      { id: 'done', caseIds: ['a', 'b'] },
    ];
    const scores = {
      a: { score: 9, max: 10, at: 1 },
      b: { score: 9, max: 10, at: 2 },
    };
    const t = computePersonalTrends(scores, catalogue, resolveTitle, curricula);
    expect(t.recommendations.curriculumCaseId).toBe(null);
  });

  it('never proposes the same case across practice / curriculum / discover slots', () => {
    const scores = { a: { score: 2, max: 10, at: 1 } };
    const curricula = [{ id: 'cardio', caseIds: ['a', 'b'] }];
    const t = computePersonalTrends(scores, catalogue, resolveTitle, curricula);
    const ids = [
      t.recommendations.practiceCaseId,
      t.recommendations.curriculumCaseId,
      t.recommendations.discoverCaseId,
    ].filter(Boolean) as string[];
    expect(new Set(ids).size).toBe(ids.length);
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

describe('computeDecisionWeaknesses', () => {
  const tr = (v: unknown) => (typeof v === 'string' ? v : '');
  const catWithDecisions = [
    {
      ...sampleCase('a'),
      pathway: [
        {
          id: 'n1',
          department: 'ed',
          durationMin: 5,
          framing: { patient: '', caregiver: '', staff: '' },
          decision: {
            id: 'd1',
            prompt: 'Best loading regimen?',
            weight: 1,
            reference: { label: '', body: '' },
            options: [],
          },
        },
        {
          id: 'n2',
          department: 'ed',
          durationMin: 5,
          framing: { patient: '', caregiver: '', staff: '' },
          decision: {
            id: 'd2',
            prompt: 'Reperfusion strategy?',
            weight: 1,
            reference: { label: '', body: '' },
            options: [],
          },
        },
      ],
    },
  ];

  it('aggregates ratios per decision across multiple history entries', () => {
    const history = {
      a: [
        {
          score: 0, max: 0, at: 1,
          log: [
            { nodeId: 'n1', decisionId: 'd1', optionId: 'x', scoreEarned: 2, maxScore: 10 },
            { nodeId: 'n2', decisionId: 'd2', optionId: 'y', scoreEarned: 10, maxScore: 10 },
          ],
        },
        {
          score: 0, max: 0, at: 2,
          log: [
            { nodeId: 'n1', decisionId: 'd1', optionId: 'x', scoreEarned: 4, maxScore: 10 },
          ],
        },
      ],
    };
    const ws = computeDecisionWeaknesses(history, catWithDecisions, tr);
    expect(ws).toHaveLength(1);
    expect(ws[0].decisionId).toBe('d1');
    expect(ws[0].attempts).toBe(2);
    expect(ws[0].meanRatio).toBeCloseTo(0.3, 5);
    expect(ws[0].prompt).toBe('Best loading regimen?');
  });

  it('hides decisions whose mean ratio is at or above 0.85', () => {
    const history = {
      a: [
        {
          score: 0, max: 0, at: 1,
          log: [{ nodeId: 'n1', decisionId: 'd1', optionId: 'x', scoreEarned: 9, maxScore: 10 }],
        },
      ],
    };
    expect(computeDecisionWeaknesses(history, catWithDecisions, tr)).toEqual([]);
  });

  it('skips entries that have no log (legacy pre-v16 history)', () => {
    const history = { a: [{ score: 5, max: 10, at: 1 }] };
    expect(computeDecisionWeaknesses(history, catWithDecisions, tr)).toEqual([]);
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
