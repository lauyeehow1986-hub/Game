import type { CaseDefinition } from './types';

/**
 * Difficulty band derived from intrinsic case features.
 *
 * Heuristic: count decisions (signal of length) plus the largest score
 * gap between best and worst option (signal of consequence). High score
 * gaps usually mean a wrong choice tanks the score — more stressful for
 * a learner. Historical and randomise-profile flags bump one band up
 * because they introduce non-standard reasoning.
 */
export type DifficultyBand = 'beginner' | 'intermediate' | 'advanced';

export interface CaseDifficulty {
  band: DifficultyBand;
  /** Total decision points in the longest reachable path. */
  decisions: number;
  /** Max score gap between best and worst option of any decision. */
  maxScoreGap: number;
  /** Sum across decisions of weight × max option score. */
  totalMax: number;
}

export function computeDifficulty(caseDef: CaseDefinition): CaseDifficulty {
  let decisions = 0;
  let maxScoreGap = 0;
  let totalMax = 0;
  for (const node of caseDef.pathway) {
    if (!node.decision) continue;
    decisions += 1;
    const scores = node.decision.options.map((o) => o.score);
    const best = Math.max(...scores);
    const worst = Math.min(...scores);
    maxScoreGap = Math.max(maxScoreGap, best - worst);
    totalMax += best * node.decision.weight;
  }

  let band: DifficultyBand;
  if (decisions <= 3) band = 'beginner';
  else if (decisions <= 6) band = 'intermediate';
  else band = 'advanced';

  // Big consequence per decision bumps a band up, capped at advanced.
  if (maxScoreGap >= 18 && band === 'beginner') band = 'intermediate';
  if (maxScoreGap >= 22 && band === 'intermediate') band = 'advanced';

  // Historical reconstructions or randomised profiles add reasoning load.
  if ((caseDef.historical || caseDef.randomiseProfile) && band === 'beginner') {
    band = 'intermediate';
  }

  return { band, decisions, maxScoreGap, totalMax };
}

export const DIFFICULTY_COLOUR: Record<DifficultyBand, string> = {
  beginner: '#4ade80',
  intermediate: '#facc15',
  advanced: '#f87171',
};
