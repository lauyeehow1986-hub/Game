import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CaseDefinition } from '../lib/types';

interface CustomCasesState {
  cases: Record<string, CaseDefinition>;
  add: (c: CaseDefinition) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useCustomCases = create<CustomCasesState>()(
  persist(
    (set) => ({
      cases: {},
      add: (c) =>
        set((s) => ({
          cases: { ...s.cases, [c.id]: c },
        })),
      remove: (id) =>
        set((s) => {
          const next = { ...s.cases };
          delete next[id];
          return { cases: next };
        }),
      clear: () => set({ cases: {} }),
    }),
    { name: 'sg-pathway-custom-cases-v1' },
  ),
);

export function listCustomCases(): CaseDefinition[] {
  return Object.values(useCustomCases.getState().cases);
}
