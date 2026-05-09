import { describe, it, expect } from 'vitest';
import { serialiseCase, validateCase } from './case-schema';
import type { CaseDefinition } from './types';

const validJson = {
  id: 'demo',
  title: 'Demo case',
  blurb: 'A short demo.',
  category: 'acute',
  primaryFacility: 'ttsh',
  involvedFacilities: ['ttsh'],
  profileKey: 'taxiDriver',
  allowsWardChoice: false,
  guidelines: [{ label: 'X', body: 'Y' }],
  pathway: [
    {
      id: 'a',
      department: 'ed',
      durationMin: 10,
      framing: { patient: 'p', caregiver: 'c', staff: 's' },
      decision: {
        id: 'd',
        prompt: 'pick',
        weight: 1,
        reference: { label: 'r', body: '' },
        options: [
          {
            id: 'good',
            label: 'good',
            score: 10,
            outcome: { patient: '', caregiver: '', staff: '' },
            effects: { setFlags: ['ok'] },
          },
          {
            id: 'bad',
            label: 'bad',
            score: -5,
            outcome: { patient: '', caregiver: '', staff: '' },
          },
        ],
      },
    },
    {
      id: 'b',
      department: 'discharge',
      durationMin: 1,
      framing: { patient: '', caregiver: '', staff: '' },
    },
  ],
};

describe('validateCase', () => {
  it('accepts a well-formed case', () => {
    const r = validateCase(validJson);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.case.id).toBe('demo');
  });

  it('rejects when top-level is not an object', () => {
    const r = validateCase('nope');
    expect(r.ok).toBe(false);
  });

  it('rejects when required fields missing', () => {
    const r = validateCase({ title: 'no id' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.join(' ')).toMatch(/id/);
  });

  it('rejects when category invalid', () => {
    const r = validateCase({ ...validJson, category: 'leisurely' });
    expect(r.ok).toBe(false);
  });

  it('rejects when pathway empty', () => {
    const r = validateCase({ ...validJson, pathway: [] });
    expect(r.ok).toBe(false);
  });

  it('rejects when a decision has < 2 options', () => {
    const broken = JSON.parse(JSON.stringify(validJson));
    broken.pathway[0].decision.options = [broken.pathway[0].decision.options[0]];
    const r = validateCase(broken);
    expect(r.ok).toBe(false);
  });

  it('rejects an effects.wardClass outside the allowed values', () => {
    const broken = JSON.parse(JSON.stringify(validJson));
    broken.pathway[0].decision.options[0].effects = { wardClass: 'X' };
    const r = validateCase(broken);
    expect(r.ok).toBe(false);
  });

  it('round-trips via serialiseCase + validateCase', () => {
    const r1 = validateCase(validJson);
    if (!r1.ok) throw new Error('initial invalid');
    const json = serialiseCase(r1.case);
    const r2 = validateCase(JSON.parse(json));
    expect(r2.ok).toBe(true);
    if (r2.ok) expect(r2.case.id).toBe(r1.case.id);
  });
});

describe('validateCase — helpful error messages', () => {
  it('points to the failing field by path', () => {
    const broken = JSON.parse(JSON.stringify(validJson));
    broken.pathway[0].framing.patient = 42; // wrong type
    const r = validateCase(broken);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      const joined = r.errors.join(' | ');
      expect(joined).toMatch(/pathway\[0\]\.framing\.patient/);
    }
  });
});

describe('serialiseCase', () => {
  it('produces JSON parseable back into the case', () => {
    const minimalCase: CaseDefinition = {
      id: 'mini',
      title: 'Mini',
      blurb: 'b',
      category: 'outpatient',
      primaryFacility: 'ttsh',
      involvedFacilities: ['ttsh'],
      profileKey: 'taxiDriver',
      allowsWardChoice: false,
      guidelines: [],
      pathway: [
        {
          id: 'n',
          department: 'soc',
          durationMin: 5,
          framing: { patient: '', caregiver: '', staff: '' },
        },
      ],
    };
    const round = JSON.parse(serialiseCase(minimalCase));
    expect(round.id).toBe('mini');
    expect(round.pathway).toHaveLength(1);
  });
});
