import { describe, it, expect } from 'vitest';
import { applyFlagEffects, firstVisibleNode, isVisible, pickNextNode } from './pathway';
import type { CaseDefinition, PathwayNode } from './types';

const node = (id: string, extra: Partial<PathwayNode> = {}): PathwayNode => ({
  id,
  department: 'ward',
  durationMin: 5,
  framing: { patient: '', caregiver: '', staff: '' },
  ...extra,
});

const sample: CaseDefinition = {
  id: 'sample',
  title: 'Sample',
  blurb: '',
  category: 'acute',
  primaryFacility: 'ttsh',
  involvedFacilities: ['ttsh'],
  profileKey: 'taxiDriver',
  allowsWardChoice: false,
  guidelines: [],
  pathway: [
    node('a'),
    node('b'),
    node('c-good', { skipIfAnyFlag: ['bad'] }),
    node('c-bad', { requiresAnyFlag: ['bad'] }),
    node('d'),
  ],
};

describe('isVisible', () => {
  it('shows the default node when no flags', () => {
    expect(isVisible(sample.pathway[2], new Set())).toBe(true);
    expect(isVisible(sample.pathway[3], new Set())).toBe(false);
  });
  it('switches branch when bad flag is set', () => {
    const flags = new Set(['bad']);
    expect(isVisible(sample.pathway[2], flags)).toBe(false);
    expect(isVisible(sample.pathway[3], flags)).toBe(true);
  });
});

describe('firstVisibleNode', () => {
  it('returns the first node when nothing is hidden', () => {
    expect(firstVisibleNode(sample)?.id).toBe('a');
  });
});

describe('pickNextNode', () => {
  it('walks linearly when no effects given', () => {
    const next = pickNextNode(sample, 'a', undefined, undefined, new Set());
    expect(next?.id).toBe('b');
  });

  it('skips the good branch and lands on bad branch when flag is set by effects', () => {
    const next = pickNextNode(sample, 'b', { setFlags: ['bad'] }, undefined, new Set());
    expect(next?.id).toBe('c-bad');
  });

  it('falls through to the next node after the branch', () => {
    const next = pickNextNode(sample, 'c-good', undefined, undefined, new Set());
    expect(next?.id).toBe('d');
  });

  it('respects explicit branchTo on effects', () => {
    const next = pickNextNode(sample, 'a', { branchTo: 'd' }, undefined, new Set());
    expect(next?.id).toBe('d');
  });

  it('returns undefined at the end of the pathway', () => {
    const next = pickNextNode(sample, 'd', undefined, undefined, new Set());
    expect(next).toBeUndefined();
  });
});

describe('applyFlagEffects', () => {
  it('adds setFlags and removes clearFlags', () => {
    const before = new Set(['x', 'y']);
    const after = applyFlagEffects(before, { setFlags: ['z'], clearFlags: ['x'] });
    expect([...after].sort()).toEqual(['y', 'z']);
  });

  it('returns identical content when effects undefined', () => {
    const before = new Set(['a']);
    const after = applyFlagEffects(before, undefined);
    expect([...after]).toEqual(['a']);
  });
});
