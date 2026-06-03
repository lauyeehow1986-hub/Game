import { describe, expect, it } from 'vitest';
import { buildFlashcards, shuffleFlashcards } from './flashcards';
import type { CaseDefinition } from './types';

function mkCase(id: string, decisions: Array<{ id: string; bestScore: number }>): CaseDefinition {
  return {
    id,
    title: { en: `Case ${id}`, zh: '' },
    blurb: { en: '', zh: '' },
    category: 'acute',
    primaryFacility: 'ttsh',
    guidelines: [],
    pathway: decisions.map((d, i) => ({
      id: `n${i}`,
      department: 'ed',
      durationMin: 5,
      framing: { patient: { en: '', zh: '' }, staff: { en: '', zh: '' }, caregiver: { en: '', zh: '' } },
      decision: {
        id: d.id,
        prompt: { en: `Prompt ${d.id}`, zh: '' },
        weight: 1,
        reference: { label: { en: 'Ref', zh: '' }, body: { en: 'Body', zh: '' } },
        options: [
          {
            id: 'good',
            label: { en: 'Good', zh: '' },
            rationale: { en: 'Because', zh: '' },
            score: d.bestScore,
            outcome: { patient: { en: '', zh: '' }, staff: { en: '', zh: '' }, caregiver: { en: '', zh: '' } },
          },
          {
            id: 'bad',
            label: { en: 'Bad', zh: '' },
            rationale: { en: '', zh: '' },
            score: 0,
            outcome: { patient: { en: '', zh: '' }, staff: { en: '', zh: '' }, caregiver: { en: '', zh: '' } },
          },
        ],
      },
    })),
  } as unknown as CaseDefinition;
}

describe('flashcards', () => {
  it('builds one card per scorable decision across cases', () => {
    const cases = [
      mkCase('b-case', [{ id: 'd1', bestScore: 5 }, { id: 'd2', bestScore: 3 }]),
      mkCase('a-case', [{ id: 'd1', bestScore: 1 }]),
    ];
    const deck = buildFlashcards(cases);
    expect(deck).toHaveLength(3);
    // Deterministic: alphabetical case id, then sequential within a case.
    expect(deck.map((c) => `${c.caseId}|${c.decisionId}`)).toEqual([
      'a-case|d1',
      'b-case|d1',
      'b-case|d2',
    ]);
  });

  it('filters to the requested case ids', () => {
    const cases = [
      mkCase('a', [{ id: 'd1', bestScore: 5 }]),
      mkCase('b', [{ id: 'd2', bestScore: 5 }]),
    ];
    const deck = buildFlashcards(cases, ['a']);
    expect(deck.map((c) => c.caseId)).toEqual(['a']);
  });

  it('skips decisions whose best option scores 0', () => {
    const cases = [mkCase('a', [{ id: 'd1', bestScore: 0 }])];
    expect(buildFlashcards(cases)).toHaveLength(0);
  });

  it('shuffleFlashcards is deterministic per seed', () => {
    const cases = [
      mkCase('a', [{ id: 'd1', bestScore: 5 }, { id: 'd2', bestScore: 5 }, { id: 'd3', bestScore: 5 }]),
    ];
    const deck = buildFlashcards(cases);
    const a = shuffleFlashcards(deck, 42).map((c) => c.decisionId);
    const b = shuffleFlashcards(deck, 42).map((c) => c.decisionId);
    expect(a).toEqual(b);
  });

  it('different seeds give different orders for non-trivial decks', () => {
    const cases = [
      mkCase('a', Array.from({ length: 10 }, (_, i) => ({ id: `d${i}`, bestScore: 1 }))),
    ];
    const deck = buildFlashcards(cases);
    const a = shuffleFlashcards(deck, 1).map((c) => c.decisionId);
    const b = shuffleFlashcards(deck, 999).map((c) => c.decisionId);
    expect(a).not.toEqual(b);
  });
});
