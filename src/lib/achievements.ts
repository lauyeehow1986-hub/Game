import type { Locale } from './i18n';

/**
 * Achievement definitions and the condition functions that unlock them.
 *
 * Condition functions are pure: they take the current trigger payload and
 * the player's progress snapshot and return true if the achievement
 * should be unlocked. The store calls them whenever a relevant action
 * fires; no polling, no setInterval.
 */

export type AchievementId =
  | 'first-case'
  | 'distinction'
  | 'triple-distinction'
  | 'curriculum-graduate'
  | 'streak-master'
  | 'daily-streak-3'
  | 'daily-streak-7'
  | 'daily-streak-30'
  | 'shift-complete'
  | 'shift-passed'
  | 'tycoon'
  | 'tycoon-profit'
  | 'polyglot'
  | 'open-mind'
  | 'educator'
  | 'author'
  | 'completionist'
  | 'walk-stemi'
  | 'walk-stroke'
  | 'walk-multi-pathway';

export type TriggerKind =
  | 'case-completed'
  | 'ops-shift-ended'
  | 'locale-changed'
  | 'demo-opened'
  | 'export-used'
  | 'custom-content-added'
  | 'walkthrough-completed';

export interface AchievementDefinition {
  id: AchievementId;
  title: string;
  description: string;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  { id: 'first-case',          title: 'First case',          description: 'Complete your first case.' },
  { id: 'distinction',         title: 'Distinction',         description: 'Score 90% or higher on any case.' },
  { id: 'triple-distinction',  title: 'Triple Distinction',  description: 'Score 90% or higher on three different cases.' },
  { id: 'curriculum-graduate', title: 'Curriculum graduate', description: 'Complete every case in a curriculum.' },
  { id: 'streak-master',       title: 'Streak master',       description: 'Replay the same case three times.' },
  { id: 'daily-streak-3',      title: 'Three on the trot',   description: 'Play on three consecutive days.' },
  { id: 'daily-streak-7',      title: 'Week on call',        description: 'Play on seven consecutive days.' },
  { id: 'daily-streak-30',     title: 'Houseman year',       description: 'Play on thirty consecutive days.' },
  { id: 'shift-complete',      title: 'Shift survived',      description: 'Complete every case in a campaign.' },
  { id: 'shift-passed',        title: 'Shift passed',        description: 'Hit a campaign\'s pass-ratio target.' },
  { id: 'tycoon',              title: 'Tycoon',              description: 'Finish a Hospital Ops shift.' },
  { id: 'tycoon-profit',       title: 'In the black',        description: 'Finish a Hospital Ops shift with positive net SGD.' },
  { id: 'polyglot',            title: 'Polyglot',            description: 'Switch the interface language away from English.' },
  { id: 'open-mind',           title: 'Open mind',           description: 'Open the Demo best run for any case.' },
  { id: 'educator',            title: 'Educator',            description: 'Export a lesson plan or share a run/curriculum URL.' },
  { id: 'author',              title: 'Author',              description: 'Import or build a custom case or curriculum.' },
  { id: 'completionist',       title: 'Completionist',       description: 'Score at least once on every built-in case.' },
  { id: 'walk-stemi',          title: '🫀 Cardiac arrest to recovery', description: 'Completed the full STEMI patient pathway walkthrough.' },
  { id: 'walk-stroke',         title: '🧠 Stroke pathway hero',        description: 'Completed the large-vessel-occlusion stroke pathway walkthrough.' },
  { id: 'walk-multi-pathway',  title: '🏆 Multi-pathway master',       description: 'Completed every walkthrough in the catalogue.' },
];

// ──────────────────────────────────────────────────────────────────────────
// Trigger payloads
// ──────────────────────────────────────────────────────────────────────────

export type Trigger =
  | { kind: 'case-completed'; caseId: string; scoreRatio: number; runsForThisCase: number; currentStreakDays?: number }
  | { kind: 'campaign-completed'; campaignId: string; passed: boolean }
  | { kind: 'ops-shift-ended'; netSGD: number }
  | { kind: 'locale-changed'; locale: Locale }
  | { kind: 'demo-opened' }
  | { kind: 'export-used' }
  | { kind: 'custom-content-added' }
  | { kind: 'walkthrough-completed'; walkthroughId: string };

export interface ProgressSnapshot {
  /** Count of cases where the best score ratio is ≥ 0.9. */
  distinctionCount: number;
  /** Total built-in case ids. */
  totalBuiltinCases: number;
  /** Played built-in case ids (any score). */
  playedBuiltinCaseIds: Set<string>;
  /** Curriculum ids whose every case has at least one score. */
  completedCurriculumIds: Set<string>;
}

export function evaluate(
  trigger: Trigger,
  already: Set<AchievementId>,
  snapshot: ProgressSnapshot,
): AchievementId[] {
  const unlocked: AchievementId[] = [];
  const want = (id: AchievementId, cond: boolean) => {
    if (cond && !already.has(id)) unlocked.push(id);
  };

  switch (trigger.kind) {
    case 'case-completed':
      want('first-case', true);
      want('distinction', trigger.scoreRatio >= 0.9);
      want('triple-distinction', snapshot.distinctionCount >= 3);
      want('streak-master', trigger.runsForThisCase >= 3);
      want('daily-streak-3', (trigger.currentStreakDays ?? 0) >= 3);
      want('daily-streak-7', (trigger.currentStreakDays ?? 0) >= 7);
      want('daily-streak-30', (trigger.currentStreakDays ?? 0) >= 30);
      want('curriculum-graduate', snapshot.completedCurriculumIds.size > 0);
      want('completionist',
        snapshot.playedBuiltinCaseIds.size >= snapshot.totalBuiltinCases &&
          snapshot.totalBuiltinCases > 0,
      );
      break;
    case 'campaign-completed':
      want('shift-complete', true);
      want('shift-passed', trigger.passed);
      break;
    case 'ops-shift-ended':
      want('tycoon', true);
      want('tycoon-profit', trigger.netSGD > 0);
      break;
    case 'locale-changed':
      want('polyglot', trigger.locale !== 'en');
      break;
    case 'demo-opened':
      want('open-mind', true);
      break;
    case 'export-used':
      want('educator', true);
      break;
    case 'custom-content-added':
      want('author', true);
      break;
    case 'walkthrough-completed': {
      // Single-pathway badges, deterministic from the walkthrough id.
      const id = trigger.walkthroughId;
      if (id.startsWith('stemi')) want('walk-stemi', true);
      if (id.startsWith('stroke')) want('walk-stroke', true);
      // Multi-pathway master fires once both single-pathway badges are unlocked
      // — including the one we are about to unlock in this same evaluation.
      const willHaveStemi = already.has('walk-stemi') || (id.startsWith('stemi'));
      const willHaveStroke = already.has('walk-stroke') || (id.startsWith('stroke'));
      want('walk-multi-pathway', willHaveStemi && willHaveStroke);
      break;
    }
  }
  return unlocked;
}

export function getAchievement(id: AchievementId): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
