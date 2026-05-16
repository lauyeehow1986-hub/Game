import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CurriculumBundle } from '../lib/curriculum-schema';

interface CustomCurriculaState {
  bundles: Record<string, CurriculumBundle>;
  add: (b: CurriculumBundle) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useCustomCurricula = create<CustomCurriculaState>()(
  persist(
    (set) => ({
      bundles: {},
      add: (b) => set((s) => ({ bundles: { ...s.bundles, [b.id]: b } })),
      remove: (id) =>
        set((s) => {
          const next = { ...s.bundles };
          delete next[id];
          return { bundles: next };
        }),
      clear: () => set({ bundles: {} }),
    }),
    { name: 'sg-pathway-custom-curricula-v1' },
  ),
);
