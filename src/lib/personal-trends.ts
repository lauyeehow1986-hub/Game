import type { CaseDefinition, DecisionLogEntry } from './types';
import { gradeForRatio, totalScoreFromLog } from './scoring';
import { compareToBestPath } from './best-path';

/**
 * Personal-trends analytics computed from progress + run data. Pure
 * functions so a Trends panel can render trends without touching state.
 */

export interface CategoryStrength {
  category: 'acute' | 'elective' | 'outpatient';
  cases: number;
  meanRatio: number;
}

export interface CaseTrend {
  caseId: string;
  title: string;
  /** Score / max as a 0..1 ratio. */
  ratio: number;
  score: number;
  max: number;
  at: number;
  category: 'acute' | 'elective' | 'outpatient';
}

export interface DivergenceReport {
  /** Total decisions counted across the analysed runs. */
  decisions: number;
  /** Decisions where the player picked the best-practice option. */
  matched: number;
  /** Ratio matched / decisions. */
  matchRate: number;
}

export interface PersonalTrends {
  totalCases: number;
  totalPlayed: number;
  meanRatio: number;
  caseTrends: CaseTrend[];
  byCategory: CategoryStrength[];
  /** Cases never played, ordered alphabetically for a deterministic suggestion. */
  unplayed: { caseId: string; title: string }[];
  /** A single recommended case: lowest-scoring played case, else first unplayed. */
  recommendedCaseId: string | null;
}

interface ScoreEntry {
  score: number;
  max: number;
  at: number;
}

/**
 * Compute every panel-relevant trend value in one pass.
 */
export function computePersonalTrends(
  bestScores: Record<string, ScoreEntry>,
  catalogue: CaseDefinition[],
  resolveTitle: (c: CaseDefinition) => string,
): PersonalTrends {
  const totalCases = catalogue.length;
  const trends: CaseTrend[] = [];
  for (const c of catalogue) {
    const b = bestScores[c.id];
    if (!b) continue;
    trends.push({
      caseId: c.id,
      title: resolveTitle(c),
      ratio: b.max > 0 ? b.score / b.max : 0,
      score: b.score,
      max: b.max,
      at: b.at,
      category: c.category,
    });
  }
  // Newest first when timestamps tie.
  trends.sort((a, b) => b.at - a.at);

  const meanRatio =
    trends.length === 0 ? 0 : trends.reduce((acc, t) => acc + t.ratio, 0) / trends.length;

  const categories: CategoryStrength['category'][] = ['acute', 'elective', 'outpatient'];
  const byCategory: CategoryStrength[] = categories.map((cat) => {
    const inCat = trends.filter((t) => t.category === cat);
    return {
      category: cat,
      cases: inCat.length,
      meanRatio: inCat.length === 0 ? 0 : inCat.reduce((acc, t) => acc + t.ratio, 0) / inCat.length,
    };
  });

  const unplayed = catalogue
    .filter((c) => !bestScores[c.id])
    .map((c) => ({ caseId: c.id, title: resolveTitle(c) }))
    .sort((a, b) => a.title.localeCompare(b.title));

  // Recommendation: weakest played case (lowest ratio), or first unplayed.
  let recommendedCaseId: string | null = null;
  if (trends.length > 0) {
    const weakest = [...trends].sort((a, b) => a.ratio - b.ratio)[0];
    if (weakest.ratio < 0.85) recommendedCaseId = weakest.caseId;
  }
  if (!recommendedCaseId && unplayed.length > 0) recommendedCaseId = unplayed[0].caseId;

  return {
    totalCases,
    totalPlayed: trends.length,
    meanRatio,
    caseTrends: trends,
    byCategory,
    unplayed,
    recommendedCaseId,
  };
}

/**
 * Given a player's decision log against a case, summarise best-path
 * divergence. Used to power per-case insights or aggregate per-category
 * weakness reports.
 */
export function divergenceFromBestPath(
  caseDef: CaseDefinition,
  log: DecisionLogEntry[],
): DivergenceReport {
  const diff = compareToBestPath(caseDef, log);
  const matched = diff.filter((row) => row.match).length;
  return {
    decisions: diff.length,
    matched,
    matchRate: diff.length === 0 ? 0 : matched / diff.length,
  };
}

/**
 * Grade a ratio with the same bands the ResultsModal uses but as plain text.
 */
export function gradeBandLabel(ratio: number): 'Distinction' | 'Pass' | 'Borderline' | 'Unsafe' {
  return gradeForRatio(ratio).grade as 'Distinction' | 'Pass' | 'Borderline' | 'Unsafe';
}

export { totalScoreFromLog };
