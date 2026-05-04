import { create } from 'zustand';
import type { Perspective } from '../lib/types';

interface PerspectiveState {
  current: Perspective;
  set: (p: Perspective) => void;
  cycle: () => void;
}

const order: Perspective[] = ['patient', 'caregiver', 'staff'];

export const usePerspective = create<PerspectiveState>((set, get) => ({
  current: 'staff',
  set: (p) => set({ current: p }),
  cycle: () => {
    const idx = order.indexOf(get().current);
    set({ current: order[(idx + 1) % order.length] });
  },
}));
