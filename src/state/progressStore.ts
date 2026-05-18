import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DecisionLogEntry, ProgressState, RunHistoryEntry } from '../lib/types';

const HISTORY_CAP_PER_CASE = 10;

interface ProgressStore extends ProgressState {
  unlockCase: (id: string) => void;
  recordCaseResult: (caseId: string, score: number, max: number, log?: DecisionLogEntry[]) => void;
  recordDecisionMade: () => void;
  setDecisionNote: (caseId: string, decisionId: string, text: string) => void;
  reset: () => void;
}

const noteKey = (caseId: string, decisionId: string) => `${caseId}|${decisionId}`;

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
    'mental-health-crisis-sgh-imh',
  ],
  bestScores: {},
  runHistory: {},
  decisionNotes: {},
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
      setDecisionNote: (caseId, decisionId, text) =>
        set((s) => {
          const k = noteKey(caseId, decisionId);
          const trimmed = text.trim();
          const next = { ...s.decisionNotes };
          if (trimmed.length === 0) delete next[k];
          else next[k] = text;
          return { decisionNotes: next };
        }),
      recordCaseResult: (caseId, score, max, log) => {
        const prev = get().bestScores[caseId];
        const isBetter = !prev || score > prev.score;
        const entry: RunHistoryEntry = {
          score,
          max,
          at: Date.now(),
          ...(log ? { log } : {}),
        };
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
      version: 17,
      migrate: (persisted: unknown, version) => {
        const obj = (persisted ?? {}) as Partial<ProgressState>;
        if (version < 17) {
          const merged = new Set([
            ...(obj.unlockedCaseIds ?? []),
            ...initial.unlockedCaseIds,
          ]);
          return {
            ...initial,
            ...obj,
            unlockedCaseIds: Array.from(merged),
            runHistory: obj.runHistory ?? {},
            decisionNotes: obj.decisionNotes ?? {},
          };
        }
        return obj as ProgressState;
      },
    },
  ),
);
