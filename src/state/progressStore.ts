import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProgressState, RunHistoryEntry } from '../lib/types';

const HISTORY_CAP_PER_CASE = 10;

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
    'sepsis-bundle',
    'major-trauma',
    'ckd-dialysis',
    'imh-first-psychosis',
    'obstetric-delivery',
    'geriatric-falls',
    'hf-outpatient',
    'sars-2003-historical',
    'covid19-historical',
    'migrant-worker-injury',
    'ipv-kkh-one-centre',
  ],
  bestScores: {},
  runHistory: {},
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
        const entry: RunHistoryEntry = { score, max, at: Date.now() };
        set((s) => {
          const caseHistory = s.runHistory[caseId] ?? [];
          const updatedHistory = [...caseHistory, entry].slice(-HISTORY_CAP_PER_CASE);
          return {
            casesCompleted: s.casesCompleted + 1,
            bestScores: {
              ...s.bestScores,
              [caseId]: isBetter
                ? { score, max, at: entry.at }
                : prev,
            },
            runHistory: {
              ...s.runHistory,
              [caseId]: updatedHistory,
            },
          };
        });
      },
      reset: () => set({ ...initial }),
    }),
    {
      name: 'sg-pathway-progress',
      version: 14,
      migrate: (persisted: unknown, version) => {
        const obj = (persisted ?? {}) as Partial<ProgressState>;
        if (version < 14) {
          const merged = new Set([
            ...(obj.unlockedCaseIds ?? []),
            ...initial.unlockedCaseIds,
          ]);
          return {
            ...initial,
            ...obj,
            unlockedCaseIds: Array.from(merged),
            runHistory: obj.runHistory ?? {},
          };
        }
        return obj as ProgressState;
      },
    },
  ),
);
