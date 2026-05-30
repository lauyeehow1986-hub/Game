/**
 * Spaced-retrieval scheduler — pure, side-effect free.
 *
 * Evidence base (deep-research track 3): repeated retrieval at expanding
 * intervals is the single largest driver of retention in serious-games
 * meta-analyses. This module turns the player's run history into a queue of
 * `(caseId, decisionId)` items that are "due" for re-practice, scheduled at
 * widening intervals each time they're answered correctly.
 *
 * The scheduler is stateless about wall-clock graduation: it derives the
 * current interval purely from the chronological sequence of attempts in
 * runHistory, so it works off data the game already persists. A companion
 * store (spacedRepetitionStore) only needs to remember the *last surfaced*
 * timestamp so we don't re-show the same item twice in one session.
 */

import type { DecisionLogEntry, RunHistoryEntry } from './types';

/** Expanding intervals in days. Index = number of consecutive correct reviews. */
export const INTERVALS_DAYS = [1, 3, 7, 21, 60] as const;

const DAY_MS = 24 * 60 * 60 * 1000;

export interface ReviewItem {
  caseId: string;
  decisionId: string;
  /** ms timestamp when this item becomes due. */
  dueAt: number;
  /** 0-based index into INTERVALS_DAYS reflecting consecutive correct reviews. */
  stage: number;
  /** Last recorded attempt timestamp. */
  lastAt: number;
  /** True if the most recent attempt was below max score. */
  lastWrong: boolean;
}

interface Attempt {
  at: number;
  correct: boolean;
}

function isCorrect(e: DecisionLogEntry): boolean {
  return e.maxScore > 0 ? e.scoreEarned >= e.maxScore - 0.01 : e.scoreEarned >= 0;
}

/**
 * Walk a chronological attempt list and compute the current SR stage + due
 * date. A correct attempt advances the stage (capped at the last interval);
 * a wrong attempt resets to stage 0 (due in 1 day). The due date is the last
 * attempt time plus the interval for the resulting stage.
 */
function scheduleFromAttempts(attempts: Attempt[]): { stage: number; dueAt: number; lastAt: number; lastWrong: boolean } {
  let stage = 0;
  for (let i = 0; i < attempts.length; i += 1) {
    if (attempts[i].correct) {
      stage = Math.min(stage + 1, INTERVALS_DAYS.length - 1);
    } else {
      stage = 0;
    }
  }
  const last = attempts[attempts.length - 1];
  // After a correct attempt the "next" interval is the stage we just reached;
  // after a wrong attempt stage is 0 → review tomorrow.
  const intervalDays = INTERVALS_DAYS[Math.max(0, stage - (last.correct ? 1 : 0))] ?? INTERVALS_DAYS[0];
  return {
    stage,
    dueAt: last.at + intervalDays * DAY_MS,
    lastAt: last.at,
    lastWrong: !last.correct,
  };
}

/**
 * Build the full review schedule from run history. Only decisions that have
 * ever been answered incorrectly enter the schedule (correct-first-time items
 * don't need spaced review). Returns one item per (caseId|decisionId).
 */
export function buildSchedule(
  runHistory: Record<string, RunHistoryEntry[]>,
): ReviewItem[] {
  // Collect attempts per (caseId|decisionId).
  const byKey = new Map<string, { caseId: string; decisionId: string; attempts: Attempt[] }>();
  for (const [caseId, runs] of Object.entries(runHistory)) {
    for (const run of runs) {
      if (!run.log) continue;
      for (const e of run.log) {
        const key = `${caseId}|${e.decisionId}`;
        let bucket = byKey.get(key);
        if (!bucket) {
          bucket = { caseId, decisionId: e.decisionId, attempts: [] };
          byKey.set(key, bucket);
        }
        bucket.attempts.push({ at: run.at, correct: isCorrect(e) });
      }
    }
  }

  const items: ReviewItem[] = [];
  for (const { caseId, decisionId, attempts } of byKey.values()) {
    attempts.sort((a, b) => a.at - b.at);
    const everWrong = attempts.some((a) => !a.correct);
    if (!everWrong) continue;
    const sched = scheduleFromAttempts(attempts);
    items.push({ caseId, decisionId, ...sched });
  }
  return items;
}

/**
 * Items due at or before `now`, soonest-due first. These are the cards the
 * player should re-practice today.
 */
export function dueItems(
  runHistory: Record<string, RunHistoryEntry[]>,
  now: number = Date.now(),
): ReviewItem[] {
  return buildSchedule(runHistory)
    .filter((it) => it.dueAt <= now)
    .sort((a, b) => a.dueAt - b.dueAt);
}

/**
 * The single most-overdue case id, or null when nothing is due. Used to seed
 * the "Suggested next" recommendation ahead of the weakest-played fallback.
 */
export function topDueCaseId(
  runHistory: Record<string, RunHistoryEntry[]>,
  now: number = Date.now(),
): string | null {
  const due = dueItems(runHistory, now);
  return due.length > 0 ? due[0].caseId : null;
}
