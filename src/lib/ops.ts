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
  entrance: { id: 'entrance', name: 'Entrance', capacity: 999, serviceTimeMin: 1, open: true },
  triage: { id: 'triage', name: 'Triage', capacity: 4, serviceTimeMin: 8, open: true },
  ed: { id: 'ed', name: 'ED', capacity: 12, serviceTimeMin: 90, open: true },
  imaging: { id: 'imaging', name: 'Imaging', capacity: 4, serviceTimeMin: 25, open: true },
  ot: { id: 'ot', name: 'OT', capacity: 3, serviceTimeMin: 110, open: true },
  ward: { id: 'ward', name: 'Ward', capacity: 30, serviceTimeMin: 720, open: true },
  discharge: { id: 'discharge', name: 'Discharge', capacity: 999, serviceTimeMin: 5, open: true },
};

export function initialOpsState(seed = 1): OpsState {
  const empties: Record<OpsDepartmentId, string[]> = {
    entrance: [],
    triage: [],
    ed: [],
    imaging: [],
    ot: [],
    ward: [],
    discharge: [],
  };
  return {
    shiftMinElapsed: 0,
    shiftLengthMin: 480,
    patients: [],
    departments: { ...DEFAULT_DEPARTMENTS },
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
  };

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
        continue;
      }
      const nextDept = patient.route[nextStep];
      const nextDeptState = next.departments[nextDept];
      const occupants = activeCount(next, nextDept);
      const queueLen = next.queues[nextDept].length;
      if (!nextDeptState.open) {
        // Closed → patient stays in current dept until reopened.
        patient.remainingMin = 5;
        continue;
      }
      if (occupants + 1 <= nextDeptState.capacity) {
        // Take a slot.
        patient.step = nextStep;
        patient.remainingMin = nextDeptState.serviceTimeMin;
      } else {
        // Queue.
        patient.step = nextStep;
        patient.remainingMin = nextDeptState.serviceTimeMin;
        next.queues[nextDept].push(patient.id);
      }
    }
  }

  // --- 3. Drain queues into freed slots ---
  for (const id of Object.keys(next.queues) as OpsDepartmentId[]) {
    const dept = next.departments[id];
    if (!dept.open) continue;
    const occupants = activeCount(next, id);
    let free = dept.capacity - occupants;
    while (free > 0 && next.queues[id].length > 0) {
      const patientId = next.queues[id].shift()!;
      free -= 1;
      // Already pointed at this dept; just take a slot (queue removal is the slot).
      const _p = next.patients.find((p) => p.id === patientId);
      void _p;
    }
  }

  // --- 4. Update derived KPIs ---
  const totalCapacity = Object.values(next.departments)
    .filter((d) => d.id !== 'entrance' && d.id !== 'discharge')
    .reduce((acc, d) => acc + d.capacity, 0);
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
