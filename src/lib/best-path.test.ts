import { describe, it, expect } from 'vitest';
import { bestPath, compareToBestPath } from './best-path';
import type { CaseDefinition, Decision, DecisionLogEntry, PathwayNode } from './types';

const decision: Decision = {
  id: 'd1',
  prompt: 'pick one',
  weight: 1,
  reference: { label: 'ref', body: '' },
  options: [
    { id: 'good', label: 'good', rationale: 'r', score: 10, outcome: { patient: '', caregiver: '', staff: '' } },
    { id: 'bad', label: 'bad', rationale: 'r', score: -5, outcome: { patient: '', caregiver: '', staff: '' } },
  ],
};

const node = (id: string, decisionAttr?: Decision, extra?: Partial<PathwayNode>): PathwayNode => ({
  id,
  department: 'ed',
  durationMin: 5,
  framing: { patient: '', caregiver: '', staff: '' },
  decision: decisionAttr,
  ...extra,
});

const caseDef: CaseDefinition = {
  id: 'c',
  title: 'c',
  blurb: '',
  category: 'acute',
  primaryFacility: 'ttsh',
  involvedFacilities: ['ttsh'],
  profileKey: 'taxiDriver',
  allowsWardChoice: false,
  guidelines: [],
  pathway: [node('a', decision), node('b', decision), node('c')],
};

describe('bestPath', () => {
  it('picks the highest-scoring option at each decision node', () => {
    const path = bestPath(caseDef);
    expect(path).toHaveLength(2);
    expect(path.every((s) => s.optionId === 'good')).toBe(true);
    expect(path.every((s) => s.score === 10)).toBe(true);
  });

  it('handles a single-node decisionless case', () => {
    const noDecCase: CaseDefinition = { ...caseDef, pathway: [node('only')] };
    expect(bestPath(noDecCase)).toEqual([]);
  });
});

describe('compareToBestPath', () => {
  it('flags mismatches between user log and best path', () => {
    const log: DecisionLogEntry[] = [
      { nodeId: 'a', decisionId: 'd1', optionId: 'good', scoreEarned: 10, maxScore: 10 },
      { nodeId: 'b', decisionId: 'd1', optionId: 'bad', scoreEarned: -5, maxScore: 10 },
    ];
    const rows = compareToBestPath(caseDef, log);
    expect(rows).toHaveLength(2);
    expect(rows[0].match).toBe(true);
    expect(rows[1].match).toBe(false);
    expect(rows[1].best.label).toBe('good');
  });

  it('skips log entries with no corresponding best step', () => {
    const log: DecisionLogEntry[] = [
      { nodeId: 'nope', decisionId: 'doesnt-exist', optionId: 'x', scoreEarned: 0, maxScore: 0 },
    ];
    expect(compareToBestPath(caseDef, log)).toEqual([]);
  });
});
