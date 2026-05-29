import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Opt-in "real-time mode" for acute-timer cases. When enabled and an
 * acute case is in progress with status='awaiting-decision', a ticker
 * advances run.elapsedGameMin so the door-to-balloon / door-to-needle /
 * antibiotic-by clock keeps moving while the player reads. Default off
 * — a learner can take their time; opting in turns acute cases into
 * actually-acute simulations.
 *
 * Speed: 1 game-minute per `secondsPerGameMin` real seconds.
 */
interface PacingState {
  realtime: boolean;
  /** Real seconds that correspond to one in-game minute. Lower = more
   *  pressure. Defaults to 3 — a STEMI 90-minute door-to-balloon window
   *  becomes ~4.5 real minutes of decision time. */
  secondsPerGameMin: number;
  setRealtime: (b: boolean) => void;
  setSpeed: (sec: number) => void;
}

export const usePacing = create<PacingState>()(
  persist(
    (set) => ({
      realtime: false,
      secondsPerGameMin: 3,
      setRealtime: (b) => set({ realtime: b }),
      setSpeed: (sec) => set({ secondsPerGameMin: Math.max(1, sec) }),
    }),
    { name: 'sg-pathway-pacing-v1' },
  ),
);
