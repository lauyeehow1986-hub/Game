import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface JournalEntry {
  text: string;
  updatedAt: number;
}

interface CaseJournalState {
  entries: Record<string, JournalEntry>;
  set: (caseId: string, text: string) => void;
  remove: (caseId: string) => void;
  clear: () => void;
}

export const useCaseJournal = create<CaseJournalState>()(
  persist(
    (set) => ({
      entries: {},
      set: (caseId, text) =>
        set((s) => {
          const trimmed = text.trim();
          if (!trimmed) {
            const next = { ...s.entries };
            delete next[caseId];
            return { entries: next };
          }
          return {
            entries: {
              ...s.entries,
              [caseId]: { text: trimmed, updatedAt: Date.now() },
            },
          };
        }),
      remove: (caseId) =>
        set((s) => {
          const next = { ...s.entries };
          delete next[caseId];
          return { entries: next };
        }),
      clear: () => set({ entries: {} }),
    }),
    { name: 'sg-pathway-case-journal-v1' },
  ),
);
