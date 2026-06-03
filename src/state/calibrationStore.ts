import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CalibrationPick } from '../lib/calibration';

interface ExamSession {
  at: number;
  picks: CalibrationPick[];
  brier: number;
}

interface CalibrationState {
  sessions: ExamSession[];
  recordSession: (picks: CalibrationPick[], brier: number) => void;
  clear: () => void;
}

const SESSION_CAP = 20;

export const useCalibration = create<CalibrationState>()(
  persist(
    (set) => ({
      sessions: [],
      recordSession: (picks, brier) => {
        if (picks.length === 0) return;
        set((s) => {
          const next = [...s.sessions, { at: Date.now(), picks, brier }];
          return { sessions: next.slice(-SESSION_CAP) };
        });
      },
      clear: () => set({ sessions: [] }),
    }),
    { name: 'sg-pathway-calibration-v1' },
  ),
);
