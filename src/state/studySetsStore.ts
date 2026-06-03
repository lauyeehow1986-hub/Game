import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StudySet {
  id: string;
  name: string;
  caseIds: string[];
  createdAt: number;
}

interface StudySetsState {
  sets: Record<string, StudySet>;
  create: (name: string, caseIds: string[]) => StudySet;
  rename: (id: string, name: string) => void;
  addCase: (id: string, caseId: string) => void;
  removeCase: (id: string, caseId: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

function slug(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 32);
}

export const useStudySets = create<StudySetsState>()(
  persist(
    (set, get) => ({
      sets: {},
      create: (name, caseIds) => {
        const base = slug(name) || 'set';
        let id = base;
        let i = 1;
        while (get().sets[id]) id = `${base}-${i++}`;
        const studySet: StudySet = { id, name: name.trim() || 'Untitled set', caseIds: [...new Set(caseIds)], createdAt: Date.now() };
        set((s) => ({ sets: { ...s.sets, [id]: studySet } }));
        return studySet;
      },
      rename: (id, name) => set((s) => {
        const existing = s.sets[id];
        if (!existing) return s;
        return { sets: { ...s.sets, [id]: { ...existing, name: name.trim() || existing.name } } };
      }),
      addCase: (id, caseId) => set((s) => {
        const existing = s.sets[id];
        if (!existing) return s;
        if (existing.caseIds.includes(caseId)) return s;
        return { sets: { ...s.sets, [id]: { ...existing, caseIds: [...existing.caseIds, caseId] } } };
      }),
      removeCase: (id, caseId) => set((s) => {
        const existing = s.sets[id];
        if (!existing) return s;
        return { sets: { ...s.sets, [id]: { ...existing, caseIds: existing.caseIds.filter((x) => x !== caseId) } } };
      }),
      remove: (id) => set((s) => {
        const next = { ...s.sets };
        delete next[id];
        return { sets: next };
      }),
      clear: () => set({ sets: {} }),
    }),
    { name: 'sg-pathway-study-sets-v1' },
  ),
);
