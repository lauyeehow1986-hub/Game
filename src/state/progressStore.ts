import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProgressState } from '../lib/types';

interface ProgressStore extends ProgressState {
  unlockCase: (id: string) => void;
  recordCaseResult: (caseId: string, score: number, max: number) => void;
  recordDecisionMade: () => void;
  reset: () => void;
}

const initial: ProgressState = {
  unlockedCaseIds: [
    'stemi-acute',
    'elective-thr',
    'outpatient-diabetes',
    'disease-x',
    'paeds-fever-kkh',
    'breast-ca-crosscluster',
    'stroke-thrombectomy',
    'palliative-eol',
    'urti-chas-gp',
    'private-cataract',
    'private-to-public-handover',
  ],
  bestScores: {},
  decisionsMade: 0,
  casesCompleted: 0,
};

export const useProgress = create<ProgressStore>()(
  persist(
    (set, get) => ({
      ...initial,
      unlockCase: (id) =>
        set((s) =>
          s.unlockedCaseIds.includes(id)
            ? s
            : { unlockedCaseIds: [...s.unlockedCaseIds, id] },
        ),
      recordDecisionMade: () => set((s) => ({ decisionsMade: s.decisionsMade + 1 })),
      recordCaseResult: (caseId, score, max) => {
        const prev = get().bestScores[caseId];
        const isBetter = !prev || score > prev.score;
        set((s) => ({
          casesCompleted: s.casesCompleted + 1,
          bestScores: {
            ...s.bestScores,
            [caseId]: isBetter
              ? { score, max, at: Date.now() }
              : prev,
          },
        }));
      },
      reset: () => set({ ...initial }),
    }),
    {
      name: 'sg-pathway-progress',
      version: 9,
      migrate: (persisted: unknown, version) => {
        const obj = (persisted ?? {}) as Partial<ProgressState>;
        if (version < 9) {
          const merged = new Set([
            ...(obj.unlockedCaseIds ?? []),
            ...initial.unlockedCaseIds,
          ]);
          return { ...initial, ...obj, unlockedCaseIds: Array.from(merged) };
        }
        return obj as ProgressState;
      },
    },
  ),
);
