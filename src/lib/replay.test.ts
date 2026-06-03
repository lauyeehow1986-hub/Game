import { describe, it, expect } from 'vitest';
import { buildReplay } from './replay';
import type { CaseDefinition, DecisionLogEntry, PathwayNode } from './types';

function caseFixture(): CaseDefinition {
  const opt = (id: string, score: number) => ({
    id, label: id, score, rationale: '', outcome: { patient: '', caregiver: '', staff: '' },
  });
  const node = (id: string, opts: ReturnType<typeof opt>[], nextNode?: string): PathwayNode => ({
    id, department: 'ed', durationMin: 5,
    framing: { patient: '', caregiver: '', staff: '' },
    decision: {
      id: `${id}-d`, prompt: '', weight: 1, reference: { label: '', body: '' },
      options: opts.map((o) => ({ ...o, nextNode })),
    },
  });
  return {
    id: 'c', title: 'c', blurb: '', category: 'acute',
    primaryFacility: 'ttsh', involvedFacilities: ['ttsh'],
    profileKey: 'taxiDriver', allowsWardChoice: false, guidelines: [],
    pathway: [
      node('a', [opt('good', 10), opt('bad', -5)]),
      node('b', [opt('ok', 5)]),
      node('c', [opt('done', 8)]),
    ],
  };
}

const log = (n: string, o: string, s: number, m: number): DecisionLogEntry => ({
  nodeId: n, decisionId: `${n}-d`, optionId: o, scoreEarned: s, maxScore: m,
});

describe('buildReplay', () => {
  it('returns one step per log entry', () => {
    const r = buildReplay(caseFixture(), [
      log('a', 'good', 10, 10),
      log('b', 'ok', 5, 5),
    ]);
    expect(r).toHaveLength(2);
  });

  it('accumulates score + max monotonically', () => {
    const r = buildReplay(caseFixture(), [
      log('a', 'good', 10, 10),
      log('b', 'ok', 5, 5),
    ]);
    expect(r[0].cumScore).toBe(10);
    expect(r[0].cumMax).toBe(10);
    expect(r[1].cumScore).toBe(15);
    expect(r[1].cumMax).toBe(15);
  });

  it('grows the journey as nodes are visited', () => {
    const r = buildReplay(caseFixture(), [
      log('a', 'good', 10, 10),
      log('b', 'ok', 5, 5),
    ]);
    expect(r[0].journey).toContain('a');
    expect(r[1].journey).toContain('b');
    expect(r[0].journey.length).toBeLessThanOrEqual(r[1].journey.length);
  });

  it('looks up the chosen option label', () => {
    const r = buildReplay(caseFixture(), [log('a', 'bad', -5, 10)]);
    expect(r[0].optionLabel).toBe('bad');
  });

  it('attaches a stability trajectory to each step', () => {
    const r = buildReplay(caseFixture(), [
      log('a', 'good', 10, 10),
      log('b', 'ok', 5, 5),
    ]);
    expect(r[0].stability.points).toHaveLength(1);
    expect(r[1].stability.points).toHaveLength(2);
  });

  it('handles an empty log', () => {
    expect(buildReplay(caseFixture(), [])).toEqual([]);
  });
});
