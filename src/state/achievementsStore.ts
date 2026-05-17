import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  CURRICULA,
  curriculumProgress,
} from '../lib/curricula';
import {
  evaluate,
  type AchievementId,
  type ProgressSnapshot,
  type Trigger,
} from '../lib/achievements';
import { listCases } from '../content';
import { useProgress } from './progressStore';

interface AchievementsState {
  unlocked: AchievementId[];
  /** Queue of recent unlocks for the AchievementToast to display. */
  toastQueue: AchievementId[];
  fire: (trigger: Trigger) => void;
  dismissToast: (id: AchievementId) => void;
  reset: () => void;
}

function snapshot(): ProgressSnapshot {
  const progress = useProgress.getState();
  const builtin = listCases().map((c) => c.id);
  const totalBuiltinCases = builtin.length;
  const builtinSet = new Set(builtin);
  const playedBuiltinCaseIds = new Set<string>();
  let distinctionCount = 0;
  for (const id of Object.keys(progress.bestScores)) {
    if (builtinSet.has(id)) playedBuiltinCaseIds.add(id);
    const entry = progress.bestScores[id];
    if (entry.max > 0 && entry.score / entry.max >= 0.9) distinctionCount += 1;
  }
  const completedCurriculumIds = new Set<string>();
  for (const c of CURRICULA) {
    const p = curriculumProgress(c, progress.bestScores);
    if (p.total > 0 && p.completed === p.total) completedCurriculumIds.add(c.id);
  }
  return {
    distinctionCount,
    totalBuiltinCases,
    playedBuiltinCaseIds,
    completedCurriculumIds,
  };
}

export const useAchievements = create<AchievementsState>()(
  persist(
    (set, get) => ({
      unlocked: [],
      toastQueue: [],
      fire: (trigger) => {
        const already = new Set(get().unlocked);
        const newly = evaluate(trigger, already, snapshot());
        if (newly.length === 0) return;
        set((s) => ({
          unlocked: [...s.unlocked, ...newly],
          toastQueue: [...s.toastQueue, ...newly],
        }));
      },
      dismissToast: (id) =>
        set((s) => ({ toastQueue: s.toastQueue.filter((x) => x !== id) })),
      reset: () => set({ unlocked: [], toastQueue: [] }),
    }),
    { name: 'sg-pathway-achievements-v1' },
  ),
);
