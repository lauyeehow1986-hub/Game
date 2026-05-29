import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { bestStreak, currentStreak, localDateKey, recordDay } from '../lib/streak';

interface StreakState {
  days: string[];
  recordToday: () => void;
  reset: () => void;
}

export const useStreak = create<StreakState>()(
  persist(
    (set, get) => ({
      days: [],
      recordToday: () => set({ days: recordDay(get().days) }),
      reset: () => set({ days: [] }),
    }),
    { name: 'sg-pathway-streak-v1' },
  ),
);

export function currentStreakValue(state: { days: string[] } = useStreak.getState()): number {
  return currentStreak(state.days, localDateKey());
}

export function bestStreakValue(state: { days: string[] } = useStreak.getState()): number {
  return bestStreak(state.days);
}
