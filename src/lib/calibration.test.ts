import { describe, it, expect } from 'vitest';
import { score, CONFIDENCE_LEVELS } from './calibration';

describe('calibration.score', () => {
  it('zero picks returns zeros', () => {
    const r = score([]);
    expect(r.count).toBe(0);
    expect(r.brier).toBe(0);
    expect(r.bins).toHaveLength(5);
  });

  it('perfectly calibrated picks score Brier 0', () => {
    const r = score([
      { forecast: 1, correct: 1 },
      { forecast: 1, correct: 1 },
    ]);
    expect(r.brier).toBe(0);
    expect(r.hitRate).toBe(1);
    expect(r.overconfidence).toBe(0);
  });

  it('chance-confidence on a coin flip gives Brier 0.25', () => {
    const r = score([
      { forecast: 0.6, correct: 1 },
      { forecast: 0.6, correct: 0 },
    ]);
    // (0.6-1)^2 + (0.6-0)^2 = 0.16 + 0.36 = 0.52 / 2 = 0.26
    expect(r.brier).toBeCloseTo(0.26);
  });

  it('detects overconfidence', () => {
    const r = score([
      { forecast: 1, correct: 0 },
      { forecast: 1, correct: 0 },
      { forecast: 1, correct: 1 },
    ]);
    expect(r.hitRate).toBeCloseTo(1 / 3);
    expect(r.overconfidence).toBeGreaterThan(0.5);
  });

  it('bins forecasts into the 5 nearest confidence levels', () => {
    const r = score([
      { forecast: 0.21, correct: 0 },
      { forecast: 0.79, correct: 1 },
      { forecast: 0.95, correct: 1 },
    ]);
    expect(r.bins.find((b) => b.forecast === 0.2)?.n).toBe(1);
    expect(r.bins.find((b) => b.forecast === 0.8)?.n).toBe(1);
    expect(r.bins.find((b) => b.forecast === 1.0)?.n).toBe(1);
    expect(CONFIDENCE_LEVELS).toHaveLength(5);
  });
});
