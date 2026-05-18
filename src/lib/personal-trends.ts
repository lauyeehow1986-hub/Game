import type { CaseDefinition, DecisionLogEntry, RunHistoryEntry } from './types';
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
  /** Legacy single rec: weakest played, else first unplayed. */
  recommendedCaseId: string | null;
  /** Categorised recs so the panel can offer practice / progress / discover.
   *  Any field may be null when nothing applies (e.g. user is at 100%
   *  distinction or has played every case). */
  recommendations: {
    /** Lowest-ratio played case below 0.85 — focus practice on a weak spot. */
    practiceCaseId: string | null;
    /** First unplayed case in a curriculum the user has started but not
     *  finished — keep progressing on a coherent track. */
    curriculumCaseId: string | null;
    /** Any unplayed case the user hasn't touched yet — try something new. */
    discoverCaseId: string | null;
  };
}

export interface CurriculumLite {
  id: string;
  caseIds: string[];
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
  curricula: CurriculumLite[] = [],
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

  // Practice: weakest played case below 0.85 ratio.
  let practiceCaseId: string | null = null;
  if (trends.length > 0) {
    const weakest = [...trends].sort((a, b) => a.ratio - b.ratio)[0];
    if (weakest.ratio < 0.85) practiceCaseId = weakest.caseId;
  }

  // Curriculum continuation: the first unplayed case in a curriculum that
  // the user has started (at least one case played) but not finished.
  let curriculumCaseId: string | null = null;
  for (const c of curricula) {
    if (c.caseIds.length === 0) continue;
    const played = c.caseIds.filter((id) => bestScores[id]).length;
    if (played === 0 || played === c.caseIds.length) continue;
    const nextId = c.caseIds.find((id) => !bestScores[id]);
    if (nextId) {
      curriculumCaseId = nextId;
      break;
    }
  }

  // Discover: first unplayed case that isn't already proposed as practice
  // or curriculum, biased toward beginner difficulty for fresh players.
  const usedIds = new Set([practiceCaseId, curriculumCaseId].filter(Boolean) as string[]);
  const discoverCaseId =
    unplayed.find((u) => !usedIds.has(u.caseId))?.caseId ?? null;

  // Legacy single-value rec kept for the existing callsite.
  const recommendedCaseId = practiceCaseId ?? curriculumCaseId ?? discoverCaseId;

  return {
    totalCases,
    totalPlayed: trends.length,
    meanRatio,
    caseTrends: trends,
    byCategory,
    unplayed,
    recommendedCaseId,
    recommendations: {
      practiceCaseId,
      curriculumCaseId,
      discoverCaseId,
    },
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

export interface DecisionWeakness {
  caseId: string;
  decisionId: string;
  /** The decision prompt's resolved text, for the UI. */
  prompt: string;
  /** How many times this decision appears in the player's history. */
  attempts: number;
  /** Mean ratio of scoreEarned / maxScore across those attempts. */
  meanRatio: number;
}

/**
 * Aggregate the player's runHistory into per-decision performance, so the
 * Trends panel can surface the decisions where they consistently miss.
 *
 * Decisions whose best-score is non-positive (purely punitive) are skipped
 * because ratios aren't meaningful there. Decisions with a single attempt
 * are kept but sort below repeat-offenders at the same ratio.
 */
export function computeDecisionWeaknesses(
  runHistory: Record<string, RunHistoryEntry[]>,
  catalogue: CaseDefinition[],
  resolveText: (v: unknown) => string,
  limit = 5,
): DecisionWeakness[] {
  const buckets = new Map<string, { sum: number; n: number; prompt: string; caseId: string; decisionId: string }>();
  for (const [caseId, entries] of Object.entries(runHistory)) {
    const c = catalogue.find((x) => x.id === caseId);
    if (!c) continue;
    for (const entry of entries) {
      if (!entry.log) continue;
      for (const e of entry.log) {
        if (e.maxScore <= 0) continue;
        const key = `${caseId}|${e.decisionId}`;
        const ratio = Math.max(0, Math.min(1, e.scoreEarned / e.maxScore));
        const existing = buckets.get(key);
        if (existing) {
          existing.sum += ratio;
          existing.n += 1;
        } else {
          const node = c.pathway.find((n) => n.decision?.id === e.decisionId);
          const prompt = node?.decision ? resolveText(node.decision.prompt) : e.decisionId;
          buckets.set(key, { sum: ratio, n: 1, prompt, caseId, decisionId: e.decisionId });
        }
      }
    }
  }
  const weaknesses: DecisionWeakness[] = Array.from(buckets.values())
    .map((b) => ({
      caseId: b.caseId,
      decisionId: b.decisionId,
      prompt: b.prompt,
      attempts: b.n,
      meanRatio: b.sum / b.n,
    }))
    .filter((w) => w.meanRatio < 0.85)
    .sort((a, b) => {
      if (a.meanRatio !== b.meanRatio) return a.meanRatio - b.meanRatio;
      return b.attempts - a.attempts;
    })
    .slice(0, limit);
  return weaknesses;
}
