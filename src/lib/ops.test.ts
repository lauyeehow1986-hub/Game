import { describe, it, expect } from 'vitest';
import { arrivalRatePerMin, initialOpsState, mkRng, tickOps } from './ops';

describe('mkRng', () => {
  it('produces deterministic output for the same seed', () => {
    const a = mkRng(42);
    const b = mkRng(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
});

describe('arrivalRatePerMin', () => {
  it('Red >> Green', () => {
    expect(arrivalRatePerMin('Red', false)).toBeGreaterThan(arrivalRatePerMin('Green', false));
  });
  it('diversion reduces the rate', () => {
    expect(arrivalRatePerMin('Orange', true)).toBeLessThan(arrivalRatePerMin('Orange', false));
  });
});

describe('tickOps', () => {
  it('does not advance past shift end', () => {
    const s = { ...initialOpsState(), shiftMinElapsed: 480, shiftLengthMin: 480 };
    const next = tickOps(s, 'Green');
    expect(next).toBe(s);
  });

  it('accumulates arrivals over a 60-min Green shift run', () => {
    let s = initialOpsState(7);
    for (let i = 0; i < 60; i++) s = tickOps(s, 'Green');
    expect(s.kpis.arrivals).toBeGreaterThan(0);
    expect(s.shiftMinElapsed).toBe(60);
  });

  it('Red shift produces more arrivals than Green for the same length', () => {
    let green = initialOpsState(11);
    let red = initialOpsState(11);
    for (let i = 0; i < 120; i++) {
      green = tickOps(green, 'Green');
      red = tickOps(red, 'Red');
    }
    expect(red.kpis.arrivals).toBeGreaterThan(green.kpis.arrivals);
  });

  it('discharges some patients over a long enough run', () => {
    let s = initialOpsState(3);
    for (let i = 0; i < 480; i++) s = tickOps(s, 'Green');
    expect(s.kpis.discharged).toBeGreaterThan(0);
    expect(s.kpis.avgLosMin).toBeGreaterThan(0);
  });

  it('respects ED diversion: fewer arrivals than no-divert', () => {
    let withDiv = { ...initialOpsState(5), diversion: true };
    let noDiv = initialOpsState(5);
    for (let i = 0; i < 120; i++) {
      withDiv = tickOps(withDiv, 'Orange');
      noDiv = tickOps(noDiv, 'Orange');
    }
    expect(withDiv.kpis.arrivals).toBeLessThan(noDiv.kpis.arrivals);
  });
});
