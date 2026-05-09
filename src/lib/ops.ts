import type { Dorscon } from '../state/gameStore';

/**
 * Hospital Operations tycoon engine.
 *
 * A pure simulation layer: takes the current OpsState and a tick (in-game
 * minutes elapsed) and returns the next state. Side effects (audio, UI)
 * live in the store; the engine itself is deterministic given a seeded RNG.
 */

export type Acuity = 'P1' | 'P2' | 'P3' | 'P4';

export type OpsDepartmentId =
  | 'entrance'
  | 'triage'
  | 'ed'
  | 'imaging'
  | 'ot'
  | 'ward'
  | 'discharge';

export interface OpsPatient {
  id: string;
  /** Index into the route; patient is currently in route[step]. */
  step: number;
  /** Ordered department visits this patient must complete. */
  route: OpsDepartmentId[];
  /** Minutes remaining at the current department. 0 = ready to advance. */
  remainingMin: number;
  /** Acuity assigned at triage. P1 = sickest, P4 = lowest. */
  acuity: Acuity;
  /** Total minutes spent in the system (LOS so far). */
  losMin: number;
  /** Arrival method. */
  arrival: 'walk-in' | 'ambulance';
  /** True once the patient has reached discharge and been counted. */
  done?: boolean;
  /** True if the patient deteriorated waiting in a queue (counts as a bad outcome). */
  deteriorated?: boolean;
}

export interface OpsDepartment {
  id: OpsDepartmentId;
  name: string;
  /** Number of slots / beds. Patients occupy 1 slot until they advance. */
  capacity: number;
  /** Average time a patient spends per visit (in minutes). */
  serviceTimeMin: number;
  /** Whether the department is currently open (player can close to reallocate). */
  open: boolean;
  /** Number of doctors rostered. Required minimums vary by department. */
  doctors: number;
  /** Number of nurses rostered. */
  nurses: number;
  /** Daily fixed cost in SGD just for keeping the room open. */
  dailyFixedCostSGD: number;
}

export interface OpsBudget {
  /** Cash on hand (SGD). */
  cashSGD: number;
  /** Per-day fixed costs from open departments. */
  dailyFixedCostSGD: number;
  /** Per-day staffing cost. */
  dailyStaffingCostSGD: number;
  /** Cumulative revenue this shift. */
  revenueShiftSGD: number;
  /** Cumulative cost this shift. */
  costShiftSGD: number;
}

export interface OpsStaffingPolicy {
  doctorCostPerShift: number;
  nurseCostPerShift: number;
  revenuePerDischarge: number;
  reputationPenaltyPerDeterioration: number;
  reputationGainPerDischarge: number;
}

export const DEFAULT_STAFFING_POLICY: OpsStaffingPolicy = {
  doctorCostPerShift: 600,
  nurseCostPerShift: 280,
  revenuePerDischarge: 1900,
  reputationPenaltyPerDeterioration: 4,
  reputationGainPerDischarge: 0.2,
};

/** Entrance and discharge are flow nodes, not staffed wards — bypass the staffing gate. */
const STAFFING_EXEMPT: OpsDepartmentId[] = ['entrance', 'discharge'];

/**
 * Staffing constrains capacity for clinical departments. Above the minimum,
 * additional staff modestly speed up service time. Entrance and discharge
 * are exempt — they always allow patient flow.
 */
export function effectiveCapacity(dept: OpsDepartment): number {
  if (!dept.open) return 0;
  if (STAFFING_EXEMPT.includes(dept.id)) return dept.capacity;
  if (dept.doctors === 0 || dept.nurses === 0) return 0;
  return dept.capacity;
}

export function effectiveServiceTimeMin(dept: OpsDepartment): number {
  if (!dept.open) return dept.serviceTimeMin;
  const docFactor = 1 - 0.05 * Math.max(0, dept.doctors - 1);
  const nurFactor = 1 - 0.03 * Math.max(0, dept.nurses - 1);
  return Math.max(dept.serviceTimeMin * 0.5, dept.serviceTimeMin * docFactor * nurFactor);
}

export interface OpsKpis {
  /** Patients arrived today. */
  arrivals: number;
  /** Patients who reached discharge. */
  discharged: number;
  /** Patients who deteriorated waiting (bad outcome). */
  deteriorations: number;
  /** Mean LOS of discharged patients (min). */
  avgLosMin: number;
  /** P3 ED wait — mean queue minutes in `ed` department for P3 patients. */
  edWaitP3Min: number;
  /** Cumulative bed-occupancy ratio (0..1). */
  occupancy: number;
}

export interface OpsState {
  /** In-game time of day (0..1440 min over a 24h cycle, but a shift is 8h). */
  shiftMinElapsed: number;
  shiftLengthMin: number;
  /** Active patients (in any department or queue). */
  patients: OpsPatient[];
  departments: Record<OpsDepartmentId, OpsDepartment>;
  /** Queue per department — patient ids waiting for a slot. */
  queues: Record<OpsDepartmentId, string[]>;
  /** ED diversion: when true, ambulances are routed elsewhere. */
  diversion: boolean;
  /** Cumulative KPIs over the current shift. */
  kpis: OpsKpis;
  /** Running RNG seed for reproducibility. */
  rngSeed: number;
  /** Cumulative day count (1-based). Increments on shift end. */
  dayNumber: number;
  /** Hospital budget. Drains by minute, refills on discharge. */
  budget: OpsBudget;
  /** Reputation 0..100. Drops on deteriorations, rises on discharges. */
  reputation: number;
  /** Staffing/cost policy in effect. */
  policy: OpsStaffingPolicy;
}

/** Mulberry32 — deterministic RNG. */
export function mkRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Probability of a new arrival per minute, scaled by DORSCON.
 * Green = baseline; Red = ~3x. Returned probability is per-minute.
 */
export function arrivalRatePerMin(dorscon: Dorscon, diversion: boolean): number {
  const base: Record<Dorscon, number> = {
    Green: 0.6,
    Yellow: 0.85,
    Orange: 1.4,
    Red: 2.0,
  };
  const r = base[dorscon];
  return diversion ? r * 0.55 : r;
}

function rollAcuity(rand: () => number, dorscon: Dorscon): Acuity {
  // DORSCON skews acuity higher.
  const skew: Record<Dorscon, number[]> = {
    Green: [0.05, 0.2, 0.55, 0.2],
    Yellow: [0.1, 0.25, 0.5, 0.15],
    Orange: [0.18, 0.3, 0.4, 0.12],
    Red: [0.3, 0.35, 0.3, 0.05],
  };
  const probs = skew[dorscon];
  const r = rand();
  let cum = 0;
  const tiers: Acuity[] = ['P1', 'P2', 'P3', 'P4'];
  for (let i = 0; i < tiers.length; i++) {
    cum += probs[i];
    if (r < cum) return tiers[i];
  }
  return 'P4';
}

function makeRoute(rand: () => number, acuity: Acuity): OpsDepartmentId[] {
  // Every patient: entrance → triage → some path → discharge.
  // Routes are stylised; not every patient hits every department.
  const route: OpsDepartmentId[] = ['entrance', 'triage'];
  if (acuity === 'P1' || acuity === 'P2') {
    route.push('ed');
    if (rand() < 0.7) route.push('imaging');
    if (rand() < 0.4) route.push('ot');
    route.push('ward');
  } else if (acuity === 'P3') {
    route.push('ed');
    if (rand() < 0.5) route.push('imaging');
    if (rand() < 0.2) route.push('ward');
  } else {
    route.push('ed');
    if (rand() < 0.2) route.push('imaging');
  }
  route.push('discharge');
  return route;
}

const DEFAULT_DEPARTMENTS: Record<OpsDepartmentId, OpsDepartment> = {
  entrance: { id: 'entrance', name: 'Entrance', capacity: 999, serviceTimeMin: 1, open: true, doctors: 0, nurses: 1, dailyFixedCostSGD: 200 },
  triage: { id: 'triage', name: 'Triage', capacity: 4, serviceTimeMin: 8, open: true, doctors: 1, nurses: 2, dailyFixedCostSGD: 800 },
  ed: { id: 'ed', name: 'ED', capacity: 12, serviceTimeMin: 90, open: true, doctors: 4, nurses: 8, dailyFixedCostSGD: 4500 },
  imaging: { id: 'imaging', name: 'Imaging', capacity: 4, serviceTimeMin: 25, open: true, doctors: 2, nurses: 2, dailyFixedCostSGD: 2200 },
  ot: { id: 'ot', name: 'OT', capacity: 3, serviceTimeMin: 110, open: true, doctors: 3, nurses: 4, dailyFixedCostSGD: 5800 },
  ward: { id: 'ward', name: 'Ward', capacity: 30, serviceTimeMin: 720, open: true, doctors: 3, nurses: 10, dailyFixedCostSGD: 6500 },
  discharge: { id: 'discharge', name: 'Discharge', capacity: 999, serviceTimeMin: 5, open: true, doctors: 0, nurses: 1, dailyFixedCostSGD: 150 },
};

/**
 * Walk all departments and sum daily staff + fixed costs at the given policy.
 */
export function summariseBudget(
  departments: Record<OpsDepartmentId, OpsDepartment>,
  policy: OpsStaffingPolicy,
): { dailyFixedCostSGD: number; dailyStaffingCostSGD: number } {
  let fixed = 0;
  let staff = 0;
  for (const d of Object.values(departments)) {
    if (!d.open) continue;
    fixed += d.dailyFixedCostSGD;
    staff += d.doctors * policy.doctorCostPerShift + d.nurses * policy.nurseCostPerShift;
  }
  return { dailyFixedCostSGD: fixed, dailyStaffingCostSGD: staff };
}

export function initialOpsState(seed = 1, startingCashSGD = 80000, dayNumber = 1): OpsState {
  const empties: Record<OpsDepartmentId, string[]> = {
    entrance: [],
    triage: [],
    ed: [],
    imaging: [],
    ot: [],
    ward: [],
    discharge: [],
  };
  const departments = { ...DEFAULT_DEPARTMENTS };
  const sums = summariseBudget(departments, DEFAULT_STAFFING_POLICY);
  return {
    shiftMinElapsed: 0,
    shiftLengthMin: 480,
    patients: [],
    departments,
    queues: empties,
    diversion: false,
    kpis: {
      arrivals: 0,
      discharged: 0,
      deteriorations: 0,
      avgLosMin: 0,
      edWaitP3Min: 0,
      occupancy: 0,
    },
    rngSeed: seed,
    dayNumber,
    budget: {
      cashSGD: startingCashSGD,
      dailyFixedCostSGD: sums.dailyFixedCostSGD,
      dailyStaffingCostSGD: sums.dailyStaffingCostSGD,
      revenueShiftSGD: 0,
      costShiftSGD: 0,
    },
    reputation: 70,
    policy: DEFAULT_STAFFING_POLICY,
  };
}

/**
 * Count patients currently occupying a department (not the queue).
 */
function activeCount(state: OpsState, dept: OpsDepartmentId): number {
  return state.patients.filter((p) => !p.done && p.route[p.step] === dept && !state.queues[dept].includes(p.id)).length;
}

/**
 * Advance the simulation by one tick (`tickMin` in-game minutes, default 1).
 */
export function tickOps(state: OpsState, dorscon: Dorscon, tickMin = 1): OpsState {
  if (state.shiftMinElapsed >= state.shiftLengthMin) return state;

  const rand = mkRng(state.rngSeed + state.shiftMinElapsed);
  const next: OpsState = {
    ...state,
    shiftMinElapsed: state.shiftMinElapsed + tickMin,
    patients: state.patients.map((p) => ({ ...p })),
    queues: {
      entrance: [...state.queues.entrance],
      triage: [...state.queues.triage],
      ed: [...state.queues.ed],
      imaging: [...state.queues.imaging],
      ot: [...state.queues.ot],
      ward: [...state.queues.ward],
      discharge: [...state.queues.discharge],
    },
    departments: { ...state.departments },
    kpis: { ...state.kpis },
    budget: { ...state.budget },
    reputation: state.reputation,
  };

  // --- 0. Drain budget for the elapsed minutes (proportional). ---
  const minuteFraction = tickMin / state.shiftLengthMin;
  const tickCost = (state.budget.dailyFixedCostSGD + state.budget.dailyStaffingCostSGD) * minuteFraction;
  next.budget.costShiftSGD += tickCost;
  next.budget.cashSGD -= tickCost;

  // --- 1. Generate arrivals ---
  const rate = arrivalRatePerMin(dorscon, state.diversion) * tickMin;
  // Poisson-ish: keep rolling while r < rate (allows multi-arrival ticks).
  let attempts = Math.ceil(rate) + 1;
  let pending = rate;
  while (attempts-- > 0 && rand() < Math.min(pending, 0.95)) {
    const acuity = rollAcuity(rand, dorscon);
    const route = makeRoute(rand, acuity);
    const id = `p-${state.shiftMinElapsed}-${rand().toString(36).slice(2, 7)}`;
    next.patients.push({
      id,
      step: 0,
      route,
      remainingMin: next.departments.entrance.serviceTimeMin,
      acuity,
      losMin: 0,
      arrival: rand() < 0.25 ? 'ambulance' : 'walk-in',
    });
    next.kpis.arrivals += 1;
    pending -= 1;
  }

  // --- 2. Tick existing patients ---
  for (const patient of next.patients) {
    if (patient.done) continue;
    patient.losMin += tickMin;

    const currentDept = patient.route[patient.step];

    // If the patient is queued (i.e. not occupying a slot), they don't tick service time.
    const inQueue = next.queues[currentDept].includes(patient.id);
    if (inQueue) {
      // Deterioration risk: P1/P2 waiting > 30 min in queue → flag.
      if ((patient.acuity === 'P1' || patient.acuity === 'P2') && patient.losMin > 30) {
        if (rand() < 0.05 * tickMin) {
          patient.deteriorated = true;
          patient.done = true;
          next.kpis.deteriorations += 1;
          next.reputation = Math.max(0, next.reputation - next.policy.reputationPenaltyPerDeterioration);
        }
      }
      continue;
    }

    // Patient is in service.
    patient.remainingMin -= tickMin;
    if (patient.remainingMin <= 0) {
      // Try to advance.
      const nextStep = patient.step + 1;
      if (nextStep >= patient.route.length) {
        patient.done = true;
        next.kpis.discharged += 1;
        const prevAvg = next.kpis.avgLosMin;
        const n = next.kpis.discharged;
        next.kpis.avgLosMin = prevAvg + (patient.losMin - prevAvg) / n;
        // Revenue + reputation on each clean discharge.
        next.budget.revenueShiftSGD += next.policy.revenuePerDischarge;
        next.budget.cashSGD += next.policy.revenuePerDischarge;
        next.reputation = Math.min(100, next.reputation + next.policy.reputationGainPerDischarge);
        continue;
      }
      const nextDept = patient.route[nextStep];
      const nextDeptState = next.departments[nextDept];
      const cap = effectiveCapacity(nextDeptState);
      const svcTime = effectiveServiceTimeMin(nextDeptState);
      const occupants = activeCount(next, nextDept);
      if (cap === 0) {
        // No effective capacity (closed / unstaffed) → patient waits at current dept.
        patient.remainingMin = 5;
        continue;
      }
      if (occupants + 1 <= cap) {
        patient.step = nextStep;
        patient.remainingMin = svcTime;
      } else {
        patient.step = nextStep;
        patient.remainingMin = svcTime;
        next.queues[nextDept].push(patient.id);
      }
    }
  }

  // --- 3. Drain queues into freed slots ---
  for (const id of Object.keys(next.queues) as OpsDepartmentId[]) {
    const dept = next.departments[id];
    const cap = effectiveCapacity(dept);
    if (cap === 0) continue;
    const occupants = activeCount(next, id);
    let free = cap - occupants;
    while (free > 0 && next.queues[id].length > 0) {
      const patientId = next.queues[id].shift()!;
      free -= 1;
      const _p = next.patients.find((p) => p.id === patientId);
      void _p;
    }
  }

  // --- 4. Update derived KPIs ---
  const totalCapacity = Object.values(next.departments)
    .filter((d) => d.id !== 'entrance' && d.id !== 'discharge')
    .reduce((acc, d) => acc + effectiveCapacity(d), 0);
  const totalActive = (['triage', 'ed', 'imaging', 'ot', 'ward'] as OpsDepartmentId[])
    .reduce((acc, d) => acc + activeCount(next, d), 0);
  next.kpis.occupancy = totalCapacity > 0 ? totalActive / totalCapacity : 0;

  // ED P3 wait — mean LOS-so-far of P3 patients still queued / in ED.
  const edP3 = next.patients.filter(
    (p) => !p.done && p.acuity === 'P3' && p.route[p.step] === 'ed',
  );
  next.kpis.edWaitP3Min =
    edP3.length === 0 ? 0 : Math.round(edP3.reduce((a, p) => a + p.losMin, 0) / edP3.length);

  // Garbage-collect done patients to keep the array small.
  if (next.patients.length > 200) {
    next.patients = next.patients.filter((p) => !p.done);
  }

  return next;
}

export interface OpsDaySummary {
  day: number;
  arrivals: number;
  discharged: number;
  deteriorations: number;
  avgLosMin: number;
  netSGD: number;
  reputation: number;
}

export function summariseDay(state: OpsState): OpsDaySummary {
  return {
    day: state.dayNumber,
    arrivals: state.kpis.arrivals,
    discharged: state.kpis.discharged,
    deteriorations: state.kpis.deteriorations,
    avgLosMin: state.kpis.avgLosMin,
    netSGD: state.budget.revenueShiftSGD - state.budget.costShiftSGD,
    reputation: state.reputation,
  };
}

/**
 * Roll a finished shift into the next day: keep cash, reputation, and
 * department configuration; reset patients, queues, KPIs, shift clock.
 */
export function rollIntoNextDay(state: OpsState): OpsState {
  const sums = summariseBudget(state.departments, state.policy);
  const empties: Record<OpsDepartmentId, string[]> = {
    entrance: [], triage: [], ed: [], imaging: [], ot: [], ward: [], discharge: [],
  };
  return {
    ...state,
    dayNumber: state.dayNumber + 1,
    shiftMinElapsed: 0,
    patients: [],
    queues: empties,
    kpis: { arrivals: 0, discharged: 0, deteriorations: 0, avgLosMin: 0, edWaitP3Min: 0, occupancy: 0 },
    budget: {
      ...state.budget,
      dailyFixedCostSGD: sums.dailyFixedCostSGD,
      dailyStaffingCostSGD: sums.dailyStaffingCostSGD,
      revenueShiftSGD: 0,
      costShiftSGD: 0,
    },
    rngSeed: state.rngSeed + 1, // change RNG so each day differs
  };
}
