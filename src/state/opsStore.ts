import { create } from 'zustand';
import { initialOpsState, tickOps, type OpsDepartment, type OpsState } from '../lib/ops';
import { useGame } from './gameStore';

export type OpsMode = 'idle' | 'running' | 'paused' | 'ended';
export type OpsSpeed = 1 | 5 | 30;

interface OpsStore {
  state: OpsState;
  mode: OpsMode;
  speed: OpsSpeed;
  intervalHandle: number | null;

  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  end: () => void;
  setSpeed: (s: OpsSpeed) => void;
  setDiversion: (on: boolean) => void;
  setDepartmentCapacity: (id: OpsDepartment['id'], capacity: number) => void;
  setDepartmentOpen: (id: OpsDepartment['id'], open: boolean) => void;
  step: () => void;
}

const TICK_HZ = 4; // 4 ticks per real second; one tick advances `speed` minutes.

export const useOps = create<OpsStore>((set, get) => ({
  state: initialOpsState(Date.now()),
  mode: 'idle',
  speed: 5,
  intervalHandle: null,

  start: () => {
    get().reset();
    get().resume();
  },

  resume: () => {
    if (get().mode === 'running') return;
    set({ mode: 'running' });
    if (typeof window === 'undefined') return;
    const handle = window.setInterval(() => {
      get().step();
    }, 1000 / TICK_HZ);
    set({ intervalHandle: handle });
  },

  pause: () => {
    const { intervalHandle } = get();
    if (intervalHandle !== null && typeof window !== 'undefined') {
      window.clearInterval(intervalHandle);
    }
    set({ mode: 'paused', intervalHandle: null });
  },

  reset: () => {
    const { intervalHandle } = get();
    if (intervalHandle !== null && typeof window !== 'undefined') {
      window.clearInterval(intervalHandle);
    }
    set({
      state: initialOpsState(Date.now()),
      mode: 'idle',
      intervalHandle: null,
    });
  },

  end: () => {
    const { intervalHandle } = get();
    if (intervalHandle !== null && typeof window !== 'undefined') {
      window.clearInterval(intervalHandle);
    }
    set({ mode: 'ended', intervalHandle: null });
  },

  setSpeed: (s) => set({ speed: s }),

  setDiversion: (on) =>
    set((g) => ({ state: { ...g.state, diversion: on } })),

  setDepartmentCapacity: (id, capacity) =>
    set((g) => ({
      state: {
        ...g.state,
        departments: {
          ...g.state.departments,
          [id]: { ...g.state.departments[id], capacity: Math.max(0, capacity) },
        },
      },
    })),

  setDepartmentOpen: (id, open) =>
    set((g) => ({
      state: {
        ...g.state,
        departments: {
          ...g.state.departments,
          [id]: { ...g.state.departments[id], open },
        },
      },
    })),

  step: () => {
    const { state, speed } = get();
    const dorscon = useGame.getState().pandemic.dorscon;
    const next = tickOps(state, dorscon, speed);
    set({ state: next });
    if (next.shiftMinElapsed >= next.shiftLengthMin) {
      get().end();
    }
  },
}));
