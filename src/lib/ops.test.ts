import { describe, it, expect } from 'vitest';
import {
  arrivalRatePerMin,
  effectiveCapacity,
  effectiveServiceTimeMin,
  initialOpsState,
  mkRng,
  rollIntoNextDay,
  summariseBudget,
  summariseDay,
  tickOps,
  DEFAULT_STAFFING_POLICY,
} from './ops';

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

  it('drains cash over time according to daily costs', () => {
    let s = initialOpsState(9);
    const startingCash = s.budget.cashSGD;
    for (let i = 0; i < 60; i++) s = tickOps(s, 'Green');
    // Cash should have drained at least somewhat (modulo any discharges this early).
    expect(s.budget.costShiftSGD).toBeGreaterThan(0);
    expect(s.budget.cashSGD).toBeLessThan(startingCash + s.budget.revenueShiftSGD);
  });

  it('discharges accrue revenue', () => {
    let s = initialOpsState(3);
    for (let i = 0; i < 480; i++) s = tickOps(s, 'Green');
    expect(s.budget.revenueShiftSGD).toBeGreaterThan(0);
  });
});

describe('staffing & capacity', () => {
  it('clinical dept with 0 doctors has 0 effective capacity', () => {
    const s = initialOpsState();
    const ed = { ...s.departments.ed, doctors: 0 };
    expect(effectiveCapacity(ed)).toBe(0);
  });

  it('entrance and discharge are staffing-exempt', () => {
    const s = initialOpsState();
    expect(effectiveCapacity({ ...s.departments.entrance, doctors: 0 })).toBeGreaterThan(0);
    expect(effectiveCapacity({ ...s.departments.discharge, doctors: 0 })).toBeGreaterThan(0);
  });

  it('effective service time decreases with more doctors', () => {
    const s = initialOpsState();
    const ed1 = { ...s.departments.ed, doctors: 1 };
    const ed4 = { ...s.departments.ed, doctors: 4 };
    expect(effectiveServiceTimeMin(ed4)).toBeLessThan(effectiveServiceTimeMin(ed1));
  });
});

describe('summariseBudget', () => {
  it('skips closed departments', () => {
    const s = initialOpsState();
    const open = summariseBudget(s.departments, DEFAULT_STAFFING_POLICY);
    s.departments.ot.open = false;
    const closed = summariseBudget(s.departments, DEFAULT_STAFFING_POLICY);
    expect(closed.dailyFixedCostSGD).toBeLessThan(open.dailyFixedCostSGD);
    expect(closed.dailyStaffingCostSGD).toBeLessThan(open.dailyStaffingCostSGD);
  });
});

describe('rollIntoNextDay', () => {
  it('increments dayNumber, clears patients, keeps cash + reputation', () => {
    let s = initialOpsState(3);
    for (let i = 0; i < 480; i++) s = tickOps(s, 'Green');
    const cashBefore = s.budget.cashSGD;
    const repBefore = s.reputation;
    const day = rollIntoNextDay(s);
    expect(day.dayNumber).toBe(s.dayNumber + 1);
    expect(day.patients.length).toBe(0);
    expect(day.shiftMinElapsed).toBe(0);
    expect(day.budget.cashSGD).toBe(cashBefore);
    expect(day.reputation).toBe(repBefore);
    expect(day.kpis.arrivals).toBe(0);
  });
});

describe('summariseDay', () => {
  it('captures arrivals, discharged, net SGD, reputation', () => {
    let s = initialOpsState(5);
    for (let i = 0; i < 240; i++) s = tickOps(s, 'Green');
    const sum = summariseDay(s);
    expect(sum.day).toBe(s.dayNumber);
    expect(sum.arrivals).toBe(s.kpis.arrivals);
    expect(sum.netSGD).toBe(s.budget.revenueShiftSGD - s.budget.costShiftSGD);
  });
});
