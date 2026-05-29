import { describe, it, expect } from 'vitest';
import { SCENARIOS, applyScenario, getScenario } from './ops-scenarios';

describe('SCENARIOS', () => {
  it('has unique ids', () => {
    const ids = SCENARIOS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every scenario has a non-empty name + description', () => {
    for (const s of SCENARIOS) {
      expect(s.name.trim().length).toBeGreaterThan(0);
      expect(s.description.trim().length).toBeGreaterThan(0);
    }
  });

  it('every scenario has a non-negative starting cash', () => {
    for (const s of SCENARIOS) expect(s.cashSGD).toBeGreaterThanOrEqual(0);
  });

  it('every scenario references a valid DORSCON level', () => {
    const ok = new Set(['Green', 'Yellow', 'Orange', 'Red']);
    for (const s of SCENARIOS) expect(ok.has(s.dorscon)).toBe(true);
  });
});

describe('getScenario', () => {
  it('returns the matching scenario', () => {
    const s = getScenario(SCENARIOS[0].id);
    expect(s?.id).toBe(SCENARIOS[0].id);
  });

  it('returns undefined for an unknown id', () => {
    expect(getScenario('does-not-exist')).toBeUndefined();
  });
});

describe('applyScenario', () => {
  it('sets diversion from the scenario', () => {
    const sc = { ...SCENARIOS[0], diversion: true };
    expect(applyScenario(sc).diversion).toBe(true);
  });

  it('applies department patches over the default state', () => {
    const sc = {
      ...SCENARIOS[0],
      deptPatches: { ed: { doctors: 9, nurses: 9 } as Partial<unknown> as never },
    };
    const state = applyScenario(sc);
    expect(state.departments.ed.doctors).toBe(9);
    expect(state.departments.ed.nurses).toBe(9);
  });

  it('honours the success criteria from the source scenario', () => {
    for (const s of SCENARIOS) {
      expect(s.successCriteria.minReputation).toBeGreaterThanOrEqual(0);
      expect(s.successCriteria.minDischarged).toBeGreaterThanOrEqual(0);
    }
  });
});
