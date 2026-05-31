/**
 * Adaptive study planner — pure.
 *
 * Composes the existing pieces (spaced-retrieval queue, weakest played case,
 * untouched discovery case, daily challenge) into a ranked, length-bounded
 * "today's plan". No new state — purely a function of data the game already
 * persists.
 */

import type { CaseDefinition, RunHistoryEntry } from './types';
import { dueItems } from './spaced-repetition';
import { pickDailyCaseId } from './daily-pick';
import { localDateKey } from './streak';

export type StudyKind = 'review' | 'practice' | 'curriculum' | 'discover' | 'daily';

export interface StudyTask {
  kind: StudyKind;
  caseId: string;
  /** When the task is decision-level (review), the (caseId|decisionId) it targets. */
  decisionId?: string;
  /** Short rationale string key for i18n in the UI. */
  reason: string;
  /** Lower numbers come first. */
  priority: number;
}

export interface PlanInput {
  bestScores: Record<string, { score: number; max: number; at: number }>;
  runHistory: Record<string, RunHistoryEntry[]>;
  playableIds: string[];
  unplayedIds: string[];
  curricula: Array<{ id: string; caseIds: string[] }>;
}

/**
 * Compose up to `length` (default 5) tasks ordered by priority. Order:
 *   1. The most-overdue spaced-retrieval review (decision-level)
 *   2. The weakest played case below 0.85 ratio
 *   3. The next unfinished curriculum case
 *   4. Today's daily challenge (deterministic per local date)
 *   5. An unplayed discovery pick
 * Duplicate caseIds are collapsed (first occurrence wins) so the plan reads
 * as five distinct things to do.
 */
export function buildStudyPlan(
  input: PlanInput,
  length = 5,
  today: string = localDateKey(),
): StudyTask[] {
  const out: StudyTask[] = [];
  const seenCases = new Set<string>();

  const add = (task: StudyTask) => {
    if (out.length >= length) return;
    if (seenCases.has(task.caseId)) return;
    if (!input.playableIds.includes(task.caseId)) return;
    seenCases.add(task.caseId);
    out.push(task);
  };

  // 1. Spaced-retrieval (highest priority)
  for (const item of dueItems(input.runHistory)) {
    add({
      kind: 'review',
      caseId: item.caseId,
      decisionId: item.decisionId,
      reason: 'plan.reason.review',
      priority: 1,
    });
    if (out.length >= length) return out;
  }

  // 2. Weakest played case below 0.85.
  const played: Array<{ id: string; ratio: number }> = [];
  for (const id of Object.keys(input.bestScores)) {
    const b = input.bestScores[id];
    if (b.max > 0) played.push({ id, ratio: b.score / b.max });
  }
  played.sort((a, b) => a.ratio - b.ratio);
  const weakest = played.find((p) => p.ratio < 0.85);
  if (weakest) {
    add({ kind: 'practice', caseId: weakest.id, reason: 'plan.reason.practice', priority: 2 });
  }

  // 3. Next unfinished curriculum case.
  for (const c of input.curricula) {
    const played = c.caseIds.filter((id) => input.bestScores[id]).length;
    if (played === 0 || played === c.caseIds.length) continue;
    const nextId = c.caseIds.find((id) => !input.bestScores[id]);
    if (nextId) {
      add({ kind: 'curriculum', caseId: nextId, reason: 'plan.reason.curriculum', priority: 3 });
      break;
    }
  }

  // 4. Today's daily challenge.
  const daily = pickDailyCaseId(input.playableIds, today);
  if (daily) add({ kind: 'daily', caseId: daily, reason: 'plan.reason.daily', priority: 4 });

  // 5. Discovery pick.
  const discover = input.unplayedIds.find((id) => !seenCases.has(id));
  if (discover) {
    add({ kind: 'discover', caseId: discover, reason: 'plan.reason.discover', priority: 5 });
  }

  return out;
}
