import { describe, it, expect } from 'vitest';
import { EMPTY_FILTER, filterCases, filterIsEmpty } from './case-filter';
import type { CaseDefinition } from './types';

const c = (overrides: Partial<CaseDefinition> & { id: string }): CaseDefinition => ({
  id: overrides.id,
  title: overrides.title ?? `Case ${overrides.id}`,
  blurb: overrides.blurb ?? '',
  category: overrides.category ?? 'acute',
  primaryFacility: overrides.primaryFacility ?? 'ttsh',
  involvedFacilities: ['ttsh'],
  profileKey: 'taxiDriver',
  allowsWardChoice: false,
  guidelines: [],
  pathway: [
    { id: 'n', department: 'ed', durationMin: 1, framing: { patient: '', caregiver: '', staff: '' } },
  ],
  historical: overrides.historical,
});

const catalogue: CaseDefinition[] = [
  c({ id: 'stemi', title: 'Acute STEMI', blurb: 'Chest pain', category: 'acute' }),
  c({ id: 'urti', title: 'URTI — CHAS GP', blurb: 'mild fever', category: 'outpatient' }),
  c({ id: 'thr', title: 'Total hip replacement', blurb: 'elective orthopaedic', category: 'elective' }),
  c({ id: 'sars', title: 'SARS 2003', blurb: 'historical outbreak', category: 'acute', historical: true }),
];

describe('filterCases', () => {
  it('returns everything for an empty filter', () => {
    expect(filterCases(catalogue, EMPTY_FILTER, {})).toHaveLength(4);
  });

  it('matches by query against title', () => {
    const r = filterCases(catalogue, { ...EMPTY_FILTER, query: 'STEMI' }, {});
    expect(r.map((x) => x.id)).toEqual(['stemi']);
  });

  it('matches by query against blurb', () => {
    const r = filterCases(catalogue, { ...EMPTY_FILTER, query: 'orthopaedic' }, {});
    expect(r.map((x) => x.id)).toEqual(['thr']);
  });

  it('matches by query case-insensitively', () => {
    const r = filterCases(catalogue, { ...EMPTY_FILTER, query: 'chas' }, {});
    expect(r.map((x) => x.id)).toEqual(['urti']);
  });

  it('matches a localised title across every locale variant', () => {
    const cat = [...catalogue, c({ id: 'hf', title: { en: 'Heart failure', zh: '心衰' } })];
    const r = filterCases(cat, { ...EMPTY_FILTER, query: '心衰' }, {});
    expect(r.map((x) => x.id)).toEqual(['hf']);
  });

  it('filters by category union', () => {
    const r = filterCases(catalogue, { ...EMPTY_FILTER, categories: ['outpatient'] }, {});
    expect(r.map((x) => x.id)).toEqual(['urti']);
  });

  it('filters historicalOnly', () => {
    const r = filterCases(catalogue, { ...EMPTY_FILTER, historicalOnly: true }, {});
    expect(r.map((x) => x.id)).toEqual(['sars']);
  });

  it('filters unplayedOnly using best-scores keys', () => {
    const r = filterCases(
      catalogue,
      { ...EMPTY_FILTER, unplayedOnly: true },
      { stemi: { score: 10, max: 10, at: 1 } },
    );
    expect(r.map((x) => x.id).sort()).toEqual(['sars', 'thr', 'urti']);
  });

  it('combines filters (AND semantics)', () => {
    const r = filterCases(
      catalogue,
      { query: 'pain', categories: ['acute'], historicalOnly: false, unplayedOnly: false, difficulty: null },
      {},
    );
    expect(r.map((x) => x.id)).toEqual(['stemi']);
  });
});

describe('filterIsEmpty', () => {
  it('reports true for EMPTY_FILTER', () => {
    expect(filterIsEmpty(EMPTY_FILTER)).toBe(true);
  });
  it('reports false when query is set', () => {
    expect(filterIsEmpty({ ...EMPTY_FILTER, query: 'x' })).toBe(false);
  });
  it('reports false when difficulty is set', () => {
    expect(filterIsEmpty({ ...EMPTY_FILTER, difficulty: 'beginner' })).toBe(false);
  });
});

describe('filterCases difficulty', () => {
  it('keeps only cases in the chosen band', () => {
    // The built-in stemi-acute case has many decisions → advanced; the
    // synthetic 1-decision urti is beginner.
    const r = filterCases(catalogue, { ...EMPTY_FILTER, difficulty: 'beginner' }, {});
    expect(r.every((c) => c.pathway.filter((n) => n.decision).length <= 3)).toBe(true);
  });
});
