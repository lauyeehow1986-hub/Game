/**
 * Decision-rationale flashcards — pure.
 *
 * Pulls each played case's decisions into a deck of cards: front is the
 * decision prompt, back is the highest-scoring option, its rationale, and
 * the guideline reference. Used for spaced revision separate from the
 * exam / quiz scoring loops.
 *
 * Determinism: the order is stable per (deckSeed, includedCaseIds) so a
 * learner who returns to a deck the same day sees the same sequence.
 */

import type { CaseDefinition, DecisionOption, GuidelineRef, LocalisedString } from './types';

export interface Flashcard {
  caseId: string;
  decisionId: string;
  caseTitle: LocalisedString;
  prompt: LocalisedString;
  bestOption: LocalisedString;
  rationale: LocalisedString;
  reference: GuidelineRef;
}

function bestOptionOf(options: DecisionOption[]): DecisionOption | null {
  if (options.length === 0) return null;
  return [...options].sort((a, b) => b.score - a.score)[0];
}

/**
 * Build the flashcard deck. When `caseIds` is omitted, every catalogue case
 * contributes. Decisions whose best option scores ≤ 0 are skipped (no clear
 * "right answer" to review). Order is alphabetical by caseId then sequential
 * within a case so the deck is deterministic.
 */
export function buildFlashcards(
  catalogue: CaseDefinition[],
  caseIds?: string[],
): Flashcard[] {
  const include = caseIds ? new Set(caseIds) : null;
  const out: Flashcard[] = [];
  const ordered = [...catalogue].sort((a, b) => a.id.localeCompare(b.id));
  for (const c of ordered) {
    if (include && !include.has(c.id)) continue;
    for (const node of c.pathway) {
      const d = node.decision;
      if (!d) continue;
      const best = bestOptionOf(d.options);
      if (!best || best.score <= 0) continue;
      out.push({
        caseId: c.id,
        decisionId: d.id,
        caseTitle: c.title,
        prompt: d.prompt,
        bestOption: best.label,
        rationale: best.rationale,
        reference: d.reference,
      });
    }
  }
  return out;
}

/**
 * Mulberry32 PRNG — small, deterministic, no deps. Used to shuffle the deck
 * predictably from an integer seed.
 */
function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stable shuffle from a numeric seed. */
export function shuffleFlashcards(deck: Flashcard[], seed: number): Flashcard[] {
  const out = [...deck];
  const r = rng(seed);
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
