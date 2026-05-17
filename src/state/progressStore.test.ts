import { beforeEach, describe, it, expect } from 'vitest';
import { useProgress } from './progressStore';

describe('progressStore.recordCaseResult', () => {
  beforeEach(() => {
    useProgress.getState().reset();
  });

  it('writes a best score on the first run', () => {
    useProgress.getState().recordCaseResult('stemi', 8, 10);
    const s = useProgress.getState();
    expect(s.bestScores.stemi.score).toBe(8);
    expect(s.bestScores.stemi.max).toBe(10);
    expect(s.runHistory.stemi).toHaveLength(1);
    expect(s.casesCompleted).toBe(1);
  });

  it('keeps the higher score as best across runs', () => {
    useProgress.getState().recordCaseResult('stemi', 6, 10);
    useProgress.getState().recordCaseResult('stemi', 9, 10);
    useProgress.getState().recordCaseResult('stemi', 7, 10);
    expect(useProgress.getState().bestScores.stemi.score).toBe(9);
  });

  it('accumulates runHistory entries in order of recording', () => {
    useProgress.getState().recordCaseResult('stemi', 5, 10);
    useProgress.getState().recordCaseResult('stemi', 8, 10);
    useProgress.getState().recordCaseResult('stemi', 7, 10);
    const hist = useProgress.getState().runHistory.stemi;
    expect(hist.map((e) => e.score)).toEqual([5, 8, 7]);
  });

  it('caps runHistory at 10 entries per case', () => {
    for (let i = 1; i <= 15; i++) {
      useProgress.getState().recordCaseResult('stemi', i, 20);
    }
    const hist = useProgress.getState().runHistory.stemi;
    expect(hist).toHaveLength(10);
    // The oldest five (scores 1..5) should have been dropped; the most
    // recent 10 (6..15) retained.
    expect(hist[0].score).toBe(6);
    expect(hist[hist.length - 1].score).toBe(15);
  });

  it('keeps history per case independent', () => {
    useProgress.getState().recordCaseResult('a', 5, 10);
    useProgress.getState().recordCaseResult('b', 9, 10);
    useProgress.getState().recordCaseResult('a', 6, 10);
    const s = useProgress.getState();
    expect(s.runHistory.a).toHaveLength(2);
    expect(s.runHistory.b).toHaveLength(1);
  });

  it('reset() clears runHistory + bestScores together', () => {
    useProgress.getState().recordCaseResult('stemi', 5, 10);
    useProgress.getState().reset();
    expect(useProgress.getState().runHistory).toEqual({});
    expect(useProgress.getState().bestScores).toEqual({});
    expect(useProgress.getState().casesCompleted).toBe(0);
  });
});
