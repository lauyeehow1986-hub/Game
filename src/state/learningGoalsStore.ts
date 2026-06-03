import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_TARGETS, type WeeklyTargets } from '../lib/learning-goals';

interface LearningGoalsState {
  targets: WeeklyTargets;
  setTargets: (partial: Partial<WeeklyTargets>) => void;
  reset: () => void;
}

function clampPositive(n: number, fallback: number, max: number): number {
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.min(n, max);
}

function clampRatio(n: number, fallback: number): number {
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.min(n, 1);
}

export const useLearningGoals = create<LearningGoalsState>()(
  persist(
    (set) => ({
      targets: DEFAULT_TARGETS,
      setTargets: (partial) =>
        set((s) => ({
          targets: {
            casesPerWeek: clampPositive(
              partial.casesPerWeek ?? s.targets.casesPerWeek,
              s.targets.casesPerWeek,
              50,
            ),
            distinctionsPerWeek: clampPositive(
              partial.distinctionsPerWeek ?? s.targets.distinctionsPerWeek,
              s.targets.distinctionsPerWeek,
              50,
            ),
            meanRatio: clampRatio(
              partial.meanRatio ?? s.targets.meanRatio,
              s.targets.meanRatio,
            ),
          },
        })),
      reset: () => set({ targets: DEFAULT_TARGETS }),
    }),
    { name: 'sg-pathway-learning-goals-v1' },
  ),
);
