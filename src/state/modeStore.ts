import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppMode = 'case' | 'ops';

interface ModeState {
  mode: AppMode;
  setMode: (m: AppMode) => void;
}

export const useMode = create<ModeState>()(
  persist(
    (set) => ({
      mode: 'case',
      setMode: (m) => set({ mode: m }),
    }),
    { name: 'sg-pathway-mode-v1' },
  ),
);
