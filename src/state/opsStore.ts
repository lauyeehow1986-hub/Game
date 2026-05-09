import { create } from 'zustand';
import {
  rollIntoNextDay,
  summariseBudget,
  summariseDay,
  tickOps,
  type OpsDaySummary,
  type OpsDepartment,
  type OpsDepartmentId,
  type OpsState,
} from '../lib/ops';
import { applyScenario, getScenario, SCENARIOS, type OpsScenario } from '../lib/ops-scenarios';
import { useGame } from './gameStore';

export type OpsMode = 'idle' | 'running' | 'paused' | 'ended';
export type OpsSpeed = 1 | 5 | 30;

interface OpsStore {
  state: OpsState;
  mode: OpsMode;
  speed: OpsSpeed;
  intervalHandle: number | null;
  scenarioId: string;
  /** Per-day summaries for the current campaign. */
  history: OpsDaySummary[];

  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  end: () => void;
  setSpeed: (s: OpsSpeed) => void;
  setDiversion: (on: boolean) => void;
  setDepartmentCapacity: (id: OpsDepartmentId, capacity: number) => void;
  setDepartmentOpen: (id: OpsDepartmentId, open: boolean) => void;
  hire: (id: OpsDepartmentId, kind: 'doctors' | 'nurses', delta: 1 | -1) => void;
  selectScenario: (id: string) => void;
  nextDay: () => void;
  step: () => void;
}

const TICK_HZ = 4;

function recomputeBudget(s: OpsState): OpsState {
  const sums = summariseBudget(s.departments, s.policy);
  return {
    ...s,
    budget: {
      ...s.budget,
      dailyFixedCostSGD: sums.dailyFixedCostSGD,
      dailyStaffingCostSGD: sums.dailyStaffingCostSGD,
    },
  };
}

export const useOps = create<OpsStore>((set, get) => ({
  state: applyScenario(SCENARIOS[0]),
  mode: 'idle',
  speed: 5,
  intervalHandle: null,
  scenarioId: SCENARIOS[0].id,
  history: [],

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
    const { intervalHandle, scenarioId } = get();
    if (intervalHandle !== null && typeof window !== 'undefined') {
      window.clearInterval(intervalHandle);
    }
    const sc = getScenario(scenarioId) ?? SCENARIOS[0];
    set({
      state: applyScenario(sc),
      mode: 'idle',
      intervalHandle: null,
      history: [],
    });
  },

  end: () => {
    const { intervalHandle, state, history } = get();
    if (intervalHandle !== null && typeof window !== 'undefined') {
      window.clearInterval(intervalHandle);
    }
    set({
      mode: 'ended',
      intervalHandle: null,
      history: [...history, summariseDay(state)],
    });
  },

  setSpeed: (s) => set({ speed: s }),

  setDiversion: (on) => set((g) => ({ state: { ...g.state, diversion: on } })),

  setDepartmentCapacity: (id, capacity) =>
    set((g) => {
      const updated = {
        ...g.state,
        departments: {
          ...g.state.departments,
          [id]: { ...g.state.departments[id], capacity: Math.max(0, capacity) },
        },
      };
      return { state: recomputeBudget(updated) };
    }),

  setDepartmentOpen: (id, open) =>
    set((g) => {
      const updated = {
        ...g.state,
        departments: {
          ...g.state.departments,
          [id]: { ...g.state.departments[id], open },
        },
      };
      return { state: recomputeBudget(updated) };
    }),

  hire: (id, kind, delta) =>
    set((g) => {
      const dept = g.state.departments[id];
      const next = Math.max(0, dept[kind] + delta);
      const updated = {
        ...g.state,
        departments: {
          ...g.state.departments,
          [id]: { ...dept, [kind]: next } as OpsDepartment,
        },
      };
      return { state: recomputeBudget(updated) };
    }),

  selectScenario: (id) => {
    const sc = getScenario(id);
    if (!sc) return;
    const { intervalHandle } = get();
    if (intervalHandle !== null && typeof window !== 'undefined') {
      window.clearInterval(intervalHandle);
    }
    set({
      scenarioId: id,
      state: applyScenario(sc),
      mode: 'idle',
      intervalHandle: null,
      history: [],
    });
  },

  nextDay: () => {
    const { state } = get();
    if (state.shiftMinElapsed < state.shiftLengthMin) return;
    set({
      state: rollIntoNextDay(state),
      mode: 'idle',
    });
  },

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

export { SCENARIOS };
export type { OpsScenario };
