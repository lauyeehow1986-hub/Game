/**
 * Analytics-as-coach — pure.
 *
 * Picks the player's weakest category from personal-trends, then composes a
 * 3-case micro-curriculum drawn from the catalogue in that category. Cases
 * the player has already aced (≥90%) are deprioritised in favour of weaker
 * or unplayed ones. The result is a structured recommendation the UI can
 * surface as "Coach suggests".
 */

import type { CaseDefinition } from './types';

export interface CoachSuggestion {
  category: 'acute' | 'elective' | 'outpatient';
  reason: string;
  caseIds: string[];
}

export interface CoachInput {
  bestScores: Record<string, { score: number; max: number; at: number }>;
  catalogue: CaseDefinition[];
  /** Pre-computed mean ratio per category from personal-trends. */
  byCategory: Array<{ category: 'acute' | 'elective' | 'outpatient'; cases: number; meanRatio: number }>;
}

/**
 * Returns a 3-case suggestion targeting the weakest category. Skips
 * categories with zero plays (the player hasn't done any case in them yet,
 * so the recommender doesn't have evidence of weakness). Returns null when
 * there's nothing meaningful to suggest.
 */
export function coachSuggestion(input: CoachInput, size = 3): CoachSuggestion | null {
  // Find weakest *played* category — mean below 0.85 with at least one case.
  const candidates = input.byCategory
    .filter((c) => c.cases > 0)
    .sort((a, b) => a.meanRatio - b.meanRatio);
  const weakest = candidates.find((c) => c.meanRatio < 0.85);
  if (!weakest) return null;

  // Pool: cases in that category. Rank by helpfulness:
  //   1. unplayed (highest)
  //   2. played but below 0.85 (sorted weakest first)
  //   3. played ≥ 0.85 (lowest — no need to redo)
  const pool = input.catalogue.filter((c) => c.category === weakest.category);
  if (pool.length === 0) return null;

  const score = (c: CaseDefinition): number => {
    const b = input.bestScores[c.id];
    if (!b) return 0; // unplayed → top
    const r = b.max > 0 ? b.score / b.max : 0;
    if (r < 0.85) return 1 + r; // weaker plays first within "played"
    return 2 + r; // aced last
  };
  const ranked = [...pool].sort((a, b) => score(a) - score(b)).slice(0, size);

  return {
    category: weakest.category,
    reason: `coach.reason.${weakest.category}`,
    caseIds: ranked.map((c) => c.id),
  };
}
