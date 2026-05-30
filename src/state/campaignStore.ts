import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CampaignState {
  /** Id of the campaign currently in progress, or null when no campaign
   *  is active. The Trends panel + CaseList read this to know whether the
   *  next-case CTA should advance a campaign or pick from the catalogue. */
  activeId: string | null;
  /** Index of the next case in the active campaign — 0 when starting. */
  step: number;
  setActive: (id: string | null) => void;
  advance: () => void;
  reset: () => void;
}

export const useCampaign = create<CampaignState>()(
  persist(
    (set) => ({
      activeId: null,
      step: 0,
      setActive: (id) => set({ activeId: id, step: 0 }),
      advance: () => set((s) => ({ step: s.step + 1 })),
      reset: () => set({ activeId: null, step: 0 }),
    }),
    { name: 'sg-pathway-campaign-v1' },
  ),
);
