/**
 * Learner portfolio — pure data shaping.
 *
 * Aggregates progress, competency, mastery, weekly-goal progress, recent
 * reflections, and saved bookmarks into a single artefact suitable for a
 * print-and-keep portfolio. No I/O here; the printable HTML lives in
 * `portfolio-print.ts` so this module can be unit-tested in isolation.
 */

import type { CaseDefinition, RunHistoryEntry } from './types';
import { competency, type CompetencyReport } from './competency';
import { masteryReport, type MasteryReport } from './mastery';
import { computeWeekReport, type WeeklyTargets, type WeekReport } from './learning-goals';

export interface PortfolioInputs {
  learnerName: string;
  generatedAt: number;
  bestScores: Record<string, { score: number; max: number; at: number }>;
  runHistory: Record<string, RunHistoryEntry[]>;
  decisionNotes: Record<string, string>;
  bookmarks: Record<string, { caseId: string; decisionId: string; addedAt: number; note?: string }>;
  catalogue: CaseDefinition[];
  goals: WeeklyTargets;
  unlockedAchievements: string[];
  resolveTitle: (c: CaseDefinition) => string;
  resolveDecisionPrompt: (caseId: string, decisionId: string) => string | null;
}

export interface PortfolioCaseRow {
  caseId: string;
  title: string;
  bestRatio: number;
  attempts: number;
}

export interface PortfolioReflection {
  caseId: string;
  caseTitle: string;
  decisionId: string;
  prompt: string | null;
  text: string;
}

export interface PortfolioBookmark {
  caseId: string;
  caseTitle: string;
  decisionId: string;
  prompt: string | null;
  addedAt: number;
}

export interface Portfolio {
  learnerName: string;
  generatedAt: number;
  totals: {
    catalogue: number;
    played: number;
    distinctions: number;
    decisionsLogged: number;
    achievements: number;
  };
  meanRatio: number;
  competency: CompetencyReport;
  mastery: MasteryReport;
  week: WeekReport;
  goals: WeeklyTargets;
  /** Top 10 best-scoring cases. */
  topCases: PortfolioCaseRow[];
  /** Up to 5 most recent reflections. */
  recentReflections: PortfolioReflection[];
  /** Up to 5 most recent bookmarks. */
  recentBookmarks: PortfolioBookmark[];
}

const DISTINCTION_RATIO = 0.9;

export function buildPortfolio(input: PortfolioInputs): Portfolio {
  const bestEntries = Object.entries(input.bestScores);
  const played = bestEntries.length;
  const distinctions = bestEntries.filter(
    ([, b]) => b.max > 0 && b.score / b.max >= DISTINCTION_RATIO,
  ).length;
  const meanRatio =
    played === 0
      ? 0
      : bestEntries.reduce((acc, [, b]) => acc + (b.max > 0 ? b.score / b.max : 0), 0) / played;

  const decisionsLogged = Object.values(input.runHistory).reduce(
    (acc, runs) => acc + runs.reduce((rAcc, r) => rAcc + (r.log?.length ?? 0), 0),
    0,
  );

  const c = competency({
    distinctCasesPlayed: played,
    meanRatio,
    distinctions,
  });
  const m = masteryReport(input.catalogue, input.bestScores, input.runHistory);
  const week = computeWeekReport(input.runHistory, input.goals, input.generatedAt);

  const titleById = new Map<string, string>();
  for (const c of input.catalogue) titleById.set(c.id, input.resolveTitle(c));

  const topCases: PortfolioCaseRow[] = bestEntries
    .map(([caseId, b]) => ({
      caseId,
      title: titleById.get(caseId) ?? caseId,
      bestRatio: b.max > 0 ? b.score / b.max : 0,
      attempts: input.runHistory[caseId]?.length ?? 0,
    }))
    .sort((a, b) => b.bestRatio - a.bestRatio)
    .slice(0, 10);

  const recentReflections: PortfolioReflection[] = Object.entries(input.decisionNotes)
    .filter(([, text]) => text.trim().length > 0)
    .map(([key, text]) => {
      const [caseId, decisionId] = key.split('|');
      return {
        caseId,
        caseTitle: titleById.get(caseId) ?? caseId,
        decisionId,
        prompt: input.resolveDecisionPrompt(caseId, decisionId),
        text,
      };
    })
    // Reflections aren't time-stamped individually; show them in
    // catalogue order for stability.
    .sort((a, b) => a.caseTitle.localeCompare(b.caseTitle))
    .slice(0, 5);

  const recentBookmarks: PortfolioBookmark[] = Object.values(input.bookmarks)
    .sort((a, b) => b.addedAt - a.addedAt)
    .slice(0, 5)
    .map((b) => ({
      caseId: b.caseId,
      caseTitle: titleById.get(b.caseId) ?? b.caseId,
      decisionId: b.decisionId,
      prompt: input.resolveDecisionPrompt(b.caseId, b.decisionId),
      addedAt: b.addedAt,
    }));

  return {
    learnerName: input.learnerName.trim() || 'Anonymous learner',
    generatedAt: input.generatedAt,
    totals: {
      catalogue: input.catalogue.length,
      played,
      distinctions,
      decisionsLogged,
      achievements: input.unlockedAchievements.length,
    },
    meanRatio,
    competency: c,
    mastery: m,
    week,
    goals: input.goals,
    topCases,
    recentReflections,
    recentBookmarks,
  };
}
