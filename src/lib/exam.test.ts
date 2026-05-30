import { describe, it, expect } from 'vitest';
import {
  buildExam,
  gradeExam,
  buildCertificate,
  EXAM_PRESETS,
} from './exam';
import type { CaseDefinition, PathwayNode } from './types';

const dec = { id: 'd', prompt: '', weight: 1, reference: { label: '', body: '' }, options: [] };

function mkCase(id: string, decisions: number): CaseDefinition {
  const pathway: PathwayNode[] = [];
  for (let i = 0; i < decisions; i++) {
    pathway.push({
      id: `${id}-n${i}`,
      department: 'ed',
      durationMin: 5,
      framing: { patient: '', caregiver: '', staff: '' },
      decision: { ...dec, id: `${id}-d${i}` },
    });
  }
  return {
    id,
    title: id,
    blurb: '',
    category: 'acute',
    primaryFacility: 'ttsh',
    involvedFacilities: ['ttsh'],
    profileKey: 'taxiDriver',
    allowsWardChoice: false,
    guidelines: [],
    pathway,
  };
}

describe('buildExam', () => {
  const cases = [mkCase('a', 3), mkCase('b', 3), mkCase('c', 3)];

  it('returns exactly count items when enough decisions exist', () => {
    expect(buildExam(cases, 6, 1)).toHaveLength(6);
  });

  it('caps at the total available decisions', () => {
    expect(buildExam(cases, 100, 1)).toHaveLength(9);
  });

  it('is deterministic for a given seed', () => {
    expect(buildExam(cases, 6, 42)).toEqual(buildExam(cases, 6, 42));
  });

  it('spreads early picks across distinct cases (breadth first)', () => {
    const first3 = buildExam(cases, 3, 7).map((q) => q.caseId);
    expect(new Set(first3).size).toBe(3);
  });

  it('returns empty when no decisions exist', () => {
    expect(buildExam([mkCase('x', 0)], 5, 1)).toEqual([]);
  });
});

describe('gradeExam', () => {
  it('computes ratio and pass/fail', () => {
    const r = gradeExam([{ score: 8, max: 10 }, { score: 6, max: 10 }], 2, 0.65);
    expect(r.earned).toBe(14);
    expect(r.max).toBe(20);
    expect(r.ratio).toBeCloseTo(0.7);
    expect(r.passed).toBe(true);
  });

  it('clamps negative per-item scores to zero', () => {
    const r = gradeExam([{ score: -5, max: 10 }], 1, 0.65);
    expect(r.earned).toBe(0);
    expect(r.passed).toBe(false);
  });

  it('fails below the threshold', () => {
    const r = gradeExam([{ score: 5, max: 10 }], 1, 0.65);
    expect(r.passed).toBe(false);
  });
});

describe('buildCertificate', () => {
  it('is deterministic for the same result + timestamp', () => {
    const r = gradeExam([{ score: 8, max: 10 }], 1, 0.65);
    const a = buildCertificate(r, 'standard', 1000);
    const b = buildCertificate(r, 'standard', 1000);
    expect(a.ref).toBe(b.ref);
    expect(a.ratioPct).toBe(80);
    expect(a.passed).toBe(true);
  });

  it('different timestamps yield different refs', () => {
    const r = gradeExam([{ score: 8, max: 10 }], 1, 0.65);
    expect(buildCertificate(r, 'standard', 1000).ref).not.toBe(
      buildCertificate(r, 'standard', 2000).ref,
    );
  });
});

describe('EXAM_PRESETS', () => {
  it('all presets have a positive count, duration and 0<passRatio<=1', () => {
    for (const p of Object.values(EXAM_PRESETS)) {
      expect(p.count).toBeGreaterThan(0);
      expect(p.durationSec).toBeGreaterThan(0);
      expect(p.passRatio).toBeGreaterThan(0);
      expect(p.passRatio).toBeLessThanOrEqual(1);
    }
  });
});
