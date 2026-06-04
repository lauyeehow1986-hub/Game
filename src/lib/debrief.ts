/**
 * Post-run smart debrief — pure.
 *
 * Given a freshly completed run (case + log) plus a thin analytics context
 * (this case's history + global mean + competency tier), build a structured
 * coaching debrief: headline grade, strengths, misses, concrete next steps,
 * and the case's authoritative citations.
 *
 * The debrief is locale-agnostic at this layer — every string is built from
 * the case's already-localised LocalisedString fields via resolveText.
 */

import type { CaseDefinition, DecisionLogEntry, GuidelineRef } from './types';
import type { Tier } from './competency';

export interface DebriefInput {
  caseDef: CaseDefinition;
  log: DecisionLogEntry[];
  /** Best ratio prior to this run, 0..1; null when this is the first attempt. */
  priorBestRatio: number | null;
  /** Mean ratio across all of this case's runs (prior). */
  priorMeanRatio: number | null;
  /** Mean ratio across the player's entire catalogue. */
  globalMeanRatio: number | null;
  competencyTier: Tier;
  resolveText: (value: unknown) => string;
}

export interface DebriefMiss {
  decisionId: string;
  prompt: string;
  chosenLabel: string;
  bestLabel: string;
  ratio: number;
  rationale: string;
  reference: GuidelineRef;
}

export interface DebriefStep {
  /** Stable key for i18n / aria. */
  key: string;
  text: string;
}

export interface Debrief {
  caseId: string;
  caseTitle: string;
  ratio: number;
  scoreEarned: number;
  scoreMax: number;
  /** True if this run ties or beats the prior best. */
  newPersonalBest: boolean;
  headline: 'distinction' | 'pass' | 'borderline' | 'unsafe';
  /** Sorted weakest-first (lowest scoreEarned/maxScore ratio). */
  misses: DebriefMiss[];
  /** Decisions where the player picked the best (or near-best) option. */
  strengths: Array<{ decisionId: string; prompt: string; reference: GuidelineRef }>;
  citations: GuidelineRef[];
  nextSteps: DebriefStep[];
}

function gradeHeadline(ratio: number): Debrief['headline'] {
  if (ratio >= 0.9) return 'distinction';
  if (ratio >= 0.75) return 'pass';
  if (ratio >= 0.5) return 'borderline';
  return 'unsafe';
}

const NEAR_BEST_TOLERANCE = 0.01;

export function buildDebrief(input: DebriefInput): Debrief {
  const { caseDef, log, resolveText } = input;
  const max = log.reduce((acc, e) => acc + e.maxScore, 0);
  const earned = log.reduce((acc, e) => acc + e.scoreEarned, 0);
  const ratio = max > 0 ? earned / max : 0;

  const misses: DebriefMiss[] = [];
  const strengths: Debrief['strengths'] = [];

  for (const entry of log) {
    if (entry.maxScore <= 0) continue;
    const node = caseDef.pathway.find((n) => n.decision?.id === entry.decisionId);
    const decision = node?.decision;
    if (!decision) continue;
    const chosen = decision.options.find((o) => o.id === entry.optionId);
    if (!chosen) continue;
    const bestOption = [...decision.options].sort((a, b) => b.score - a.score)[0];
    const r = entry.scoreEarned / entry.maxScore;
    if (r >= 1 - NEAR_BEST_TOLERANCE) {
      strengths.push({
        decisionId: entry.decisionId,
        prompt: resolveText(decision.prompt),
        reference: decision.reference,
      });
    } else {
      misses.push({
        decisionId: entry.decisionId,
        prompt: resolveText(decision.prompt),
        chosenLabel: resolveText(chosen.label),
        bestLabel: resolveText(bestOption.label),
        ratio: r,
        rationale: resolveText(bestOption.rationale),
        reference: decision.reference,
      });
    }
  }
  misses.sort((a, b) => a.ratio - b.ratio);

  const newPersonalBest =
    input.priorBestRatio == null || ratio > input.priorBestRatio + 1e-9;

  // Citations are the case's headline guidelines, dedup'd by label.
  const citationKeys = new Set<string>();
  const citations: GuidelineRef[] = [];
  for (const g of caseDef.guidelines ?? []) {
    const key = resolveText(g.label);
    if (citationKeys.has(key)) continue;
    citationKeys.add(key);
    citations.push(g);
  }

  // Next-step recommendations — concrete, derived from the debrief itself.
  const nextSteps: DebriefStep[] = [];
  if (misses.length > 0) {
    const weakest = misses[0];
    nextSteps.push({
      key: 'practice-weakest',
      text: `Re-attempt this decision: "${weakest.prompt}" — the best answer was "${weakest.bestLabel}".`,
    });
  }
  if (input.priorMeanRatio != null && ratio < input.priorMeanRatio - 0.05) {
    nextSteps.push({
      key: 'below-personal-mean',
      text: 'This run is below your personal mean on this case — try the printable cheatsheet section for this category before re-running.',
    });
  }
  if (
    input.globalMeanRatio != null &&
    ratio < input.globalMeanRatio - 0.1 &&
    misses.length > 0
  ) {
    nextSteps.push({
      key: 'below-global-mean',
      text: 'Score sits well below your usual mean across cases — bookmark a miss and revisit it via Trends → Saved for review.',
    });
  }
  if (citations.length > 0 && (misses.length > 0 || ratio < 0.75)) {
    nextSteps.push({
      key: 'read-citations',
      text: `Read the source: ${citations.map((g) => resolveText(g.label)).slice(0, 2).join(' · ')}.`,
    });
  }
  if (newPersonalBest && ratio >= 0.9) {
    nextSteps.push({
      key: 'lock-in-distinction',
      text: 'Distinction-grade personal best — print the certificate and add a journal note while it\'s fresh.',
    });
  }
  if (input.competencyTier === 'proficient' && ratio >= 0.85 && misses.length <= 1) {
    nextSteps.push({
      key: 'aim-expert',
      text: 'Proficient-tier learner stacking distinctions: keep the streak and dial your exam confidence to match.',
    });
  }
  // Always end with a generic "review log" pointer when no other steps fire.
  if (nextSteps.length === 0) {
    nextSteps.push({
      key: 'review-log',
      text: 'Walk back through the decision log to lock in the reasoning, then queue a fresh case.',
    });
  }

  return {
    caseId: caseDef.id,
    caseTitle: resolveText(caseDef.title),
    ratio,
    scoreEarned: earned,
    scoreMax: max,
    newPersonalBest,
    headline: gradeHeadline(ratio),
    misses,
    strengths,
    citations,
    nextSteps,
  };
}
