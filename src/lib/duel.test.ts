import { describe, it, expect } from 'vitest';
import { gradeDuel, whoIsUp } from './duel';

describe('whoIsUp', () => {
  it('alternates 0,1,0,1', () => {
    expect([0, 1, 2, 3, 4].map((i) => whoIsUp(i))).toEqual([0, 1, 0, 1, 0]);
  });
});

describe('gradeDuel', () => {
  it('totals per-player and rounds to %', () => {
    const r = gradeDuel([
      { player: 0, score: 10, max: 10 },
      { player: 1, score: 5, max: 10 },
      { player: 0, score: 8, max: 10 },
      { player: 1, score: 6, max: 10 },
    ]);
    expect(r.p0.earned).toBe(18);
    expect(r.p1.earned).toBe(11);
    expect(r.p0.ratioPct).toBe(90);
    expect(r.p1.ratioPct).toBe(55);
    expect(r.winner).toBe(0);
  });

  it('clamps negative per-item scores to zero', () => {
    const r = gradeDuel([{ player: 0, score: -5, max: 10 }]);
    expect(r.p0.earned).toBe(0);
  });

  it('declares a draw on equal ratios', () => {
    const r = gradeDuel([
      { player: 0, score: 5, max: 10 },
      { player: 1, score: 5, max: 10 },
    ]);
    expect(r.winner).toBe('draw');
  });

  it('handles an empty paper safely', () => {
    expect(gradeDuel([])).toEqual({
      p0: { earned: 0, max: 0, ratioPct: 0 },
      p1: { earned: 0, max: 0, ratioPct: 0 },
      winner: 'draw',
    });
  });
});
