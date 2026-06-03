import { describe, it, expect } from 'vitest';
import { coachSuggestion } from './coach';
import type { CaseDefinition } from './types';

function mk(id: string, cat: CaseDefinition['category']): CaseDefinition {
  return {
    id, title: id, blurb: '', category: cat,
    primaryFacility: 'ttsh', involvedFacilities: ['ttsh'],
    profileKey: 'taxiDriver', allowsWardChoice: false, guidelines: [],
    pathway: [],
  };
}

const cases: CaseDefinition[] = [
  mk('a1', 'acute'), mk('a2', 'acute'), mk('a3', 'acute'), mk('a4', 'acute'),
  mk('e1', 'elective'), mk('e2', 'elective'),
  mk('o1', 'outpatient'),
];

describe('coachSuggestion', () => {
  it('returns null when no category is below 0.85', () => {
    const s = coachSuggestion({
      bestScores: { a1: { score: 9, max: 10, at: 0 } },
      catalogue: cases,
      byCategory: [
        { category: 'acute', cases: 1, meanRatio: 0.95 },
        { category: 'elective', cases: 0, meanRatio: 0 },
        { category: 'outpatient', cases: 0, meanRatio: 0 },
      ],
    });
    expect(s).toBeNull();
  });

  it('targets the weakest played category', () => {
    const s = coachSuggestion({
      bestScores: {
        a1: { score: 5, max: 10, at: 0 },
        e1: { score: 9, max: 10, at: 0 },
      },
      catalogue: cases,
      byCategory: [
        { category: 'acute', cases: 1, meanRatio: 0.5 },
        { category: 'elective', cases: 1, meanRatio: 0.9 },
        { category: 'outpatient', cases: 0, meanRatio: 0 },
      ],
    });
    expect(s?.category).toBe('acute');
    expect(s?.caseIds.length).toBeLessThanOrEqual(3);
  });

  it('prefers unplayed cases first, then weaker plays', () => {
    const s = coachSuggestion({
      bestScores: {
        a1: { score: 4, max: 10, at: 0 }, // weak played
        a2: { score: 9, max: 10, at: 0 }, // aced
      },
      catalogue: cases,
      byCategory: [
        { category: 'acute', cases: 2, meanRatio: 0.65 },
      ],
    });
    expect(s?.caseIds[0]).not.toBe('a2'); // aced last
    // Unplayed picks (a3, a4) should appear before a1.
    expect(s?.caseIds.indexOf('a3')).toBeLessThan(s?.caseIds.indexOf('a1') ?? -1);
  });

  it('ignores categories the player hasn\'t played at all', () => {
    const s = coachSuggestion({
      bestScores: { a1: { score: 5, max: 10, at: 0 } },
      catalogue: cases,
      byCategory: [
        { category: 'acute', cases: 1, meanRatio: 0.5 },
        { category: 'elective', cases: 0, meanRatio: 0 },
      ],
    });
    expect(s?.category).toBe('acute');
  });
});
