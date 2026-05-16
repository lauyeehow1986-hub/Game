import { describe, it, expect } from 'vitest';
import { serialiseCurriculum, validateCurriculum } from './curriculum-schema';
import type { CaseDefinition } from './types';

const minimalCase = (id: string): CaseDefinition => ({
  id,
  title: `Case ${id}`,
  blurb: 'b',
  category: 'acute',
  primaryFacility: 'ttsh',
  involvedFacilities: ['ttsh'],
  profileKey: 'taxiDriver',
  allowsWardChoice: false,
  guidelines: [],
  pathway: [
    {
      id: 'a',
      department: 'ed',
      durationMin: 5,
      framing: { patient: '', caregiver: '', staff: '' },
    },
  ],
});

const validBundle = {
  id: 'cardio-mini',
  title: 'Cardio mini',
  blurb: 'Three quick acute-cardiology cases.',
  objectives: ['Recognise STEMI', 'Right-site to GP'],
  caseIds: ['stemi-acute', 'hf-outpatient', 'urti-chas-gp'],
  author: 'Dr Q',
};

describe('validateCurriculum', () => {
  it('accepts a well-formed bundle without embedded cases', () => {
    const r = validateCurriculum(validBundle);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.bundle.id).toBe('cardio-mini');
      expect(r.bundle.caseIds).toHaveLength(3);
      expect(r.bundle.cases).toBeUndefined();
    }
  });

  it('accepts localised title and objectives', () => {
    const r = validateCurriculum({
      ...validBundle,
      title: { en: 'Cardio mini', zh: '心脏小课' },
      objectives: [{ en: 'a', zh: '甲' }, 'b'],
    });
    expect(r.ok).toBe(true);
  });

  it('accepts embedded cases that themselves validate', () => {
    const r = validateCurriculum({
      ...validBundle,
      cases: [minimalCase('x'), minimalCase('y')],
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.bundle.cases).toHaveLength(2);
  });

  it('rejects bundles with fewer than 2 caseIds', () => {
    const r = validateCurriculum({ ...validBundle, caseIds: ['only-one'] });
    expect(r.ok).toBe(false);
  });

  it('rejects bundles with empty objectives', () => {
    const r = validateCurriculum({ ...validBundle, objectives: [] });
    expect(r.ok).toBe(false);
  });

  it('rejects when an embedded case is malformed', () => {
    const broken = { ...minimalCase('z'), category: 'leisurely' };
    const r = validateCurriculum({ ...validBundle, cases: [broken] });
    expect(r.ok).toBe(false);
  });

  it('round-trips via serialiseCurriculum', () => {
    const r1 = validateCurriculum(validBundle);
    if (!r1.ok) throw new Error('initial invalid');
    const r2 = validateCurriculum(JSON.parse(serialiseCurriculum(r1.bundle)));
    expect(r2.ok).toBe(true);
  });
});
