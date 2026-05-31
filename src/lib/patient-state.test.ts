import { describe, it, expect } from 'vitest';
import { computeStability, bandFor } from './patient-state';
import type { DecisionLogEntry } from './types';

const e = (scoreEarned: number, maxScore: number): DecisionLogEntry => ({
  nodeId: 'n', decisionId: 'd', optionId: 'o', scoreEarned, maxScore,
});

describe('bandFor', () => {
  it('maps value to a band', () => {
    expect(bandFor(90)).toBe('stable');
    expect(bandFor(50)).toBe('guarded');
    expect(bandFor(10)).toBe('critical');
  });
});

describe('computeStability', () => {
  it('starts at the baseline with an empty log', () => {
    const t = computeStability([]);
    expect(t.value).toBe(70);
    expect(t.points).toEqual([]);
  });

  it('best choices raise stability toward 100', () => {
    const t = computeStability([e(10, 10), e(10, 10), e(10, 10)]);
    expect(t.value).toBeGreaterThan(70);
    expect(t.band).toBe('stable');
  });

  it('harmful choices drive stability down', () => {
    const t = computeStability([e(-10, 10), e(-10, 10), e(-10, 10), e(-10, 10)]);
    expect(t.value).toBeLessThan(34);
    expect(t.band).toBe('critical');
  });

  it('clamps within 0..100', () => {
    const many = Array.from({ length: 20 }, () => e(10, 10));
    expect(computeStability(many).value).toBeLessThanOrEqual(100);
    const bad = Array.from({ length: 20 }, () => e(-10, 10));
    expect(computeStability(bad).value).toBeGreaterThanOrEqual(0);
  });

  it('records one trajectory point per decision', () => {
    const t = computeStability([e(8, 10), e(2, 10)]);
    expect(t.points.map((p) => p.step)).toEqual([0, 1]);
  });

  it('a missed acute timer applies an extra penalty point', () => {
    const without = computeStability([e(8, 10)]);
    const withMiss = computeStability([e(8, 10)], { acuteTimerMissed: true });
    expect(withMiss.value).toBeLessThan(without.value);
    expect(withMiss.points).toHaveLength(2);
  });

  it('ignores zero-max decisions safely', () => {
    expect(computeStability([e(0, 0)]).value).toBe(70);
  });
});
