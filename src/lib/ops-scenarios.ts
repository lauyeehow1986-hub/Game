import type { Dorscon } from '../state/gameStore';
import {
  initialOpsState,
  type OpsDepartment,
  type OpsDepartmentId,
  type OpsState,
} from './ops';

export interface OpsScenario {
  id: string;
  name: string;
  description: string;
  /** DORSCON level the scenario starts under. */
  dorscon: Dorscon;
  /** Diversion default. */
  diversion: boolean;
  /** Starting cash. */
  cashSGD: number;
  /** Patches applied to the default departments. */
  deptPatches?: Partial<Record<OpsDepartmentId, Partial<OpsDepartment>>>;
  /** RNG seed (deterministic replays). */
  seed: number;
  /** Reputation target needed to "pass" the shift. */
  successCriteria: {
    minReputation: number;
    maxDeteriorations: number;
    minDischarged: number;
    minNetSGD: number;
  };
}

export const SCENARIOS: OpsScenario[] = [
  {
    id: 'baseline',
    name: 'Baseline weekday shift',
    description: 'A normal Tuesday 8-h shift. DORSCON Green. Standard arrivals.',
    dorscon: 'Green',
    diversion: false,
    cashSGD: 80000,
    seed: 7,
    successCriteria: {
      minReputation: 65,
      maxDeteriorations: 1,
      minDischarged: 12,
      minNetSGD: 0,
    },
  },
  {
    id: 'dorscon-orange',
    name: 'DORSCON Orange surge',
    description: 'Outbreak suspected. Arrivals up ~2x; acuity skewed higher; PPE limited.',
    dorscon: 'Orange',
    diversion: false,
    cashSGD: 110000,
    seed: 13,
    deptPatches: {
      ed: { capacity: 16 },
      ot: { capacity: 4 },
    },
    successCriteria: {
      minReputation: 55,
      maxDeteriorations: 3,
      minDischarged: 18,
      minNetSGD: -30000,
    },
  },
  {
    id: 'ppe-shortage',
    name: 'PPE shortage — staffed-down ED',
    description: 'PPE rationing. ED capacity drops; you must reallocate staff fast.',
    dorscon: 'Yellow',
    diversion: false,
    cashSGD: 60000,
    seed: 21,
    deptPatches: {
      ed: { capacity: 6, doctors: 2, nurses: 4 },
      imaging: { doctors: 1 },
    },
    successCriteria: {
      minReputation: 60,
      maxDeteriorations: 2,
      minDischarged: 10,
      minNetSGD: 0,
    },
  },
  {
    id: 'holiday-weekend',
    name: 'Long weekend — skeleton crew',
    description: 'Fewer staff on the roster but reduced arrivals. Watch the budget.',
    dorscon: 'Green',
    diversion: false,
    cashSGD: 50000,
    seed: 33,
    deptPatches: {
      ed: { doctors: 2, nurses: 5 },
      ward: { doctors: 1, nurses: 6 },
      ot: { open: false },
    },
    successCriteria: {
      minReputation: 65,
      maxDeteriorations: 1,
      minDischarged: 8,
      minNetSGD: 5000,
    },
  },
];

export function applyScenario(scenario: OpsScenario): OpsState {
  const state = initialOpsState(scenario.seed, scenario.cashSGD, 1);
  if (scenario.deptPatches) {
    for (const [id, patch] of Object.entries(scenario.deptPatches) as Array<
      [OpsDepartmentId, Partial<OpsDepartment>]
    >) {
      state.departments[id] = { ...state.departments[id], ...patch };
    }
  }
  state.diversion = scenario.diversion;
  // Recompute budget after patches.
  return state;
}

export function getScenario(id: string): OpsScenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
