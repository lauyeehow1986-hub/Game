import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StreakFreezeState {
  available: number;
  /** Set of week keys (YYYY-MM-DD of Monday) that have already minted a freeze. */
  awardedWeeks: string[];
  /** Idempotent: award one freeze for `weekKey` if not yet awarded. */
  awardForWeek: (weekKey: string, max?: number) => boolean;
  /** Manually add a freeze (used by ad-hoc triggers). */
  grant: (n?: number) => void;
  consume: (n?: number) => void;
  reset: () => void;
}

const DEFAULT_MAX = 5;

export const useStreakFreezes = create<StreakFreezeState>()(
  persist(
    (set, get) => ({
      available: 0,
      awardedWeeks: [],
      awardForWeek: (weekKey, max = DEFAULT_MAX) => {
        if (get().awardedWeeks.includes(weekKey)) return false;
        set((s) => ({
          available: Math.min(max, s.available + 1),
          awardedWeeks: [...s.awardedWeeks, weekKey],
        }));
        return true;
      },
      grant: (n = 1) =>
        set((s) => ({ available: Math.min(DEFAULT_MAX, s.available + n) })),
      consume: (n = 1) =>
        set((s) => ({ available: Math.max(0, s.available - n) })),
      reset: () => set({ available: 0, awardedWeeks: [] }),
    }),
    { name: 'sg-pathway-streak-freezes-v1' },
  ),
);
