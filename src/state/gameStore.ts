import { create } from 'zustand';
import type {
  CaseDefinition,
  CaseRunSnapshot,
  Decision,
  DecisionLogEntry,
  DecisionOption,
  PathwayNode,
} from '../lib/types';
import { bus, Events } from '../lib/events';
import {
  computeSegment,
  DEFAULT_PROFILES,
  totalsFor,
  type FinancingSegmentResult,
  type FinancingTotals,
  type PatientProfile,
  type WardClass,
  type ChasTier,
} from '../lib/financing';
import { getCase, getFacility } from '../content';
import { recordsFlowBetween, type RecordsFlow } from '../lib/referral';
import { firstVisibleNode, pickNextNode, walkToNextDecision, walkToFirstDecision } from '../lib/pathway';

interface CaregiverBurden {
  timeOffWorkHours: number;
  financialWorry: number;
  sleepDebt: number;
}

const emptyBurden: CaregiverBurden = {
  timeOffWorkHours: 0,
  financialWorry: 0,
  sleepDebt: 0,
};

export type Dorscon = 'Green' | 'Yellow' | 'Orange' | 'Red';

export interface PandemicState {
  dorscon: Dorscon;
  ppeStockpilePct: number;
  surgeCapacityPct: number;
  edDiversionActive: boolean;
  ncidActivated: boolean;
  rEffective: number;
  label: string;
}

interface KpiState {
  bedOccupancyPct: number;
  edWaitMin: number;
  staffFatiguePct: number;
  runningCostSGD: number;
  dorscon: Dorscon;
}

interface GameState {
  run: CaseRunSnapshot;
  caseDef: CaseDefinition | null;
  profile: PatientProfile | null;
  segments: FinancingSegmentResult[];
  totals: FinancingTotals;
  caregiverBurden: CaregiverBurden;
  viewedFacilityId: string;
  pandemic: PandemicState;
  lastTransfer: {
    fromFacilityId: string;
    toFacilityId: string;
    flow: RecordsFlow;
  } | null;
  transferLog: Array<{
    fromFacilityId: string;
    toFacilityId: string;
    flow: RecordsFlow;
  }>;
  kpis: KpiState;

  startCase: (caseDef: CaseDefinition) => void;
  setWardClass: (ward: WardClass) => void;
  setIntegratedShield: (on: boolean) => void;
  resolveDecision: (option: DecisionOption) => void;
  /** Real-time tick: advance the in-game clock by `deltaMin` while the
   *  player is reading. Honours acuteTimer.missedFlag so consequence
   *  branches still fire when the goal is exceeded. No-ops if no case
   *  is running or status is not awaiting-decision. */
  tickGameTime: (deltaMin: number) => void;
  resetRun: () => void;
  resumeFromHandoff: (h: import('../lib/handoff').Handoff) => boolean;
  viewFacility: (facilityId: string) => void;
  setDorscon: (level: Dorscon) => void;
  setPpe: (pct: number) => void;
  setSurge: (pct: number) => void;
  setEdDiversion: (on: boolean) => void;
  setNcidActivated: (on: boolean) => void;
  /** Restore a previously persisted run from snapshot data + a case def. */
  restoreRun: (caseDef: CaseDefinition, snap: PersistedSnapshot) => void;
}

interface PersistedSnapshot {
  run: CaseRunSnapshot;
  caseId: string;
  profile: PatientProfile;
  segments: FinancingSegmentResult[];
  totals: FinancingTotals;
  caregiverBurden: CaregiverBurden;
  viewedFacilityId: string;
  transferLog: GameState['transferLog'];
  lastTransfer: GameState['lastTransfer'];
  pandemic: PandemicState;
}

const emptyRun: CaseRunSnapshot = {
  caseId: null,
  status: 'idle',
  currentNodeId: null,
  currentFacilityId: null,
  pendingDecision: null,
  log: [],
  startedAtGameMin: 0,
  elapsedGameMin: 0,
  totalCostSGD: 0,
  flags: [],
  journey: [],
};

const basePandemic: PandemicState = {
  dorscon: 'Green',
  ppeStockpilePct: 78,
  surgeCapacityPct: 22,
  edDiversionActive: false,
  ncidActivated: false,
  rEffective: 0.9,
  label: 'No outbreak in progress',
};

/** Baseline KPIs for DORSCON Green; deriveKpis modifies them by pandemic state. */
const baseKpisGreen: KpiState = {
  bedOccupancyPct: 87,
  edWaitMin: 168,
  staffFatiguePct: 64,
  runningCostSGD: 0,
  dorscon: 'Green',
};

const emptyTotals: FinancingTotals = {
  gross: 0,
  subsidy: 0,
  mediShield: 0,
  mediSave: 0,
  cash: 0,
};

const SAVE_KEY = 'sg-pathway-active-run-v1';

/**
 * Compute live KPIs from pandemic state so that DORSCON, PPE depletion, surge
 * capacity, and ED diversion actually bite. Replaces the previous static
 * values that didn't change.
 */
function deriveKpis(pandemic: PandemicState, runningCost: number): KpiState {
  const dorsconLoad: Record<Dorscon, number> = {
    Green: 0,
    Yellow: 0.15,
    Orange: 0.45,
    Red: 0.9,
  };
  const load = dorsconLoad[pandemic.dorscon];
  const ppeShortfall = Math.max(0, (50 - pandemic.ppeStockpilePct) / 50);
  const surgeBuffer = Math.max(0, (40 - pandemic.surgeCapacityPct) / 40);
  const diversion = pandemic.edDiversionActive ? -40 : 0;
  return {
    bedOccupancyPct: clamp(
      Math.round(baseKpisGreen.bedOccupancyPct + load * 12 + surgeBuffer * 6),
      0,
      100,
    ),
    edWaitMin: Math.max(
      30,
      Math.round(baseKpisGreen.edWaitMin + load * 240 + ppeShortfall * 60 + diversion),
    ),
    staffFatiguePct: clamp(
      Math.round(baseKpisGreen.staffFatiguePct + load * 30 + ppeShortfall * 10 + surgeBuffer * 8),
      0,
      100,
    ),
    runningCostSGD: runningCost,
    dorscon: pandemic.dorscon,
  };
}

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function tierForFacility(facilityId?: string): 'subsidised' | 'private' {
  if (!facilityId) return 'subsidised';
  const f = getFacility(facilityId);
  if (!f) return 'subsidised';
  if (f.sector === 'private' && f.type !== 'ancillary') return 'private';
  if (f.type === 'private-acute' || f.type === 'private-specialist') return 'private';
  if (f.type === 'gp' || f.type === 'telemed') return 'private';
  return 'subsidised';
}

function applyNodeFinancing(
  profile: PatientProfile | null,
  prev: FinancingSegmentResult[],
  node: PathwayNode,
  fallbackFacilityId?: string,
): FinancingSegmentResult[] {
  if (!profile || !node.costSGD || !node.charge) return prev;
  const tier = tierForFacility(node.facility ?? fallbackFacilityId);
  const seg = computeSegment(profile, {
    charge: node.charge,
    grossSGD: node.costSGD,
    tier,
  });
  return [...prev, seg];
}

function applyBurden(prev: CaregiverBurden, node: PathwayNode): CaregiverBurden {
  const b = node.caregiverBurden;
  if (!b) return prev;
  return {
    timeOffWorkHours: prev.timeOffWorkHours + (b.timeOffWorkHours ?? 0),
    financialWorry: clamp(prev.financialWorry + (b.financialWorry ?? 0)),
    sleepDebt: clamp(prev.sleepDebt + (b.sleepDebt ?? 0)),
  };
}

function applyEffectBurden(prev: CaregiverBurden, eff: DecisionOption['effects']): CaregiverBurden {
  if (!eff?.caregiverBurden) return prev;
  const b = eff.caregiverBurden;
  return {
    timeOffWorkHours: prev.timeOffWorkHours + (b.timeOffWorkHours ?? 0),
    financialWorry: clamp(prev.financialWorry + (b.financialWorry ?? 0)),
    sleepDebt: clamp(prev.sleepDebt + (b.sleepDebt ?? 0)),
  };
}

const DORSCON_ORDER: Dorscon[] = ['Green', 'Yellow', 'Orange', 'Red'];
function shiftDorscon(current: Dorscon, delta: 1 | -1 | undefined): Dorscon {
  if (!delta) return current;
  const idx = DORSCON_ORDER.indexOf(current);
  return DORSCON_ORDER[clamp(idx + delta, 0, DORSCON_ORDER.length - 1)];
}

function dorsconLabel(level: Dorscon): string {
  switch (level) {
    case 'Green':
      return 'No or low pathogen activity';
    case 'Yellow':
      return 'Mild disease, mostly contained — heightened vigilance';
    case 'Orange':
      return 'Moderate transmission — NCID-led, hospital surge plans active';
    case 'Red':
      return 'Severe widespread transmission — system-wide surge and resource rationing';
  }
}

/**
 * Optionally perturb a profile within case-allowed ranges so each run feels
 * different. Used when CaseDefinition.randomiseProfile is set.
 */
function maybeRandomiseProfile(profile: PatientProfile, randomise: boolean | undefined): PatientProfile {
  if (!randomise) return profile;
  const chasTiers: ChasTier[] = ['none', 'green', 'orange', 'blue', 'pg', 'mg'];
  const pickedChas = chasTiers[Math.floor(Math.random() * chasTiers.length)];
  const ipFlip = Math.random() < 0.35;
  const incomeJitter = Math.round((Math.random() * 800 - 400));
  const msJitter = Math.round((Math.random() * 4000 - 1500));
  return {
    ...profile,
    chasTier: pickedChas,
    hasIntegratedShield: ipFlip ? !profile.hasIntegratedShield : profile.hasIntegratedShield,
    perCapitaIncomeSGD: clamp(profile.perCapitaIncomeSGD + incomeJitter, 600, 8000),
    mediSaveBalanceSGD: Math.max(500, profile.mediSaveBalanceSGD + msJitter),
  };
}

function persistSnapshot(state: GameState): void {
  if (typeof window === 'undefined') return;
  if (!state.caseDef || state.run.status === 'idle' || state.run.status === 'completed') {
    localStorage.removeItem(SAVE_KEY);
    return;
  }
  try {
    const payload: PersistedSnapshot = {
      run: state.run,
      caseId: state.caseDef.id,
      profile: state.profile!,
      segments: state.segments,
      totals: state.totals,
      caregiverBurden: state.caregiverBurden,
      viewedFacilityId: state.viewedFacilityId,
      transferLog: state.transferLog,
      lastTransfer: state.lastTransfer,
      pandemic: state.pandemic,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  } catch {
    /* swallow quota / serialisation errors */
  }
}

export function loadSnapshot(): PersistedSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedSnapshot;
  } catch {
    return null;
  }
}

export function clearSnapshot(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SAVE_KEY);
}

export const useGame = create<GameState>((set, get) => ({
  run: { ...emptyRun },
  caseDef: null,
  profile: null,
  segments: [],
  totals: { ...emptyTotals },
  caregiverBurden: { ...emptyBurden },
  viewedFacilityId: 'ttsh',
  pandemic: { ...basePandemic },
  lastTransfer: null,
  transferLog: [],
  kpis: deriveKpis(basePandemic, 0),

  startCase: (caseDef) => {
    const chain = walkToFirstDecision(caseDef);
    if (chain.length === 0) return;
    const baseProfile =
      DEFAULT_PROFILES[caseDef.profileKey] ?? DEFAULT_PROFILES.taxiDriver;
    const profile = maybeRandomiseProfile({ ...baseProfile }, caseDef.randomiseProfile);

    let segments: FinancingSegmentResult[] = [];
    let burden = { ...emptyBurden };
    let elapsed = 0;
    let prevFacilityId: string | null = null;
    const facilityHops: Array<{ from: string | null; to: string }> = [];

    for (const node of chain) {
      segments = applyNodeFinancing(profile, segments, node, caseDef.primaryFacility);
      burden = applyBurden(burden, node);
      elapsed += node.durationMin;
      const facilityId = node.facility ?? caseDef.primaryFacility;
      if (facilityId !== prevFacilityId) facilityHops.push({ from: prevFacilityId, to: facilityId });
      prevFacilityId = facilityId;
    }
    const totals = totalsFor(segments);
    const finalNode = chain[chain.length - 1];
    const finalFacilityId = finalNode.facility ?? caseDef.primaryFacility;
    const endsOnDecision = finalNode.decision != null;

    set((s) => ({
      caseDef,
      profile,
      segments,
      totals,
      caregiverBurden: burden,
      viewedFacilityId: finalFacilityId,
      lastTransfer: null,
      transferLog: [],
      run: {
        caseId: caseDef.id,
        status: endsOnDecision ? 'awaiting-decision' : 'completed',
        currentNodeId: finalNode.id,
        currentFacilityId: finalFacilityId,
        pendingDecision: endsOnDecision && finalNode.decision
          ? { nodeId: finalNode.id, decision: finalNode.decision }
          : null,
        log: [],
        startedAtGameMin: 0,
        elapsedGameMin: elapsed,
        totalCostSGD: totals.cash,
        flags: [],
        journey: chain.map((n) => n.id),
      },
      kpis: deriveKpis(s.pandemic, totals.cash),
    }));
    bus.emit(Events.CaseStart, { caseId: caseDef.id });
    for (const hop of facilityHops) {
      bus.emit(Events.FacilityChanged, { facilityId: hop.to });
    }
    for (const node of chain) {
      bus.emit(Events.PatientMoveTo, { department: node.department });
    }
    if (endsOnDecision && finalNode.decision) {
      bus.emit(Events.CaseDecisionRequested, { decision: finalNode.decision, nodeId: finalNode.id });
    }
    persistSnapshot(get());
  },

  restoreRun: (caseDef, snap) => {
    set(() => ({
      caseDef,
      profile: snap.profile,
      segments: snap.segments,
      totals: snap.totals,
      caregiverBurden: snap.caregiverBurden,
      viewedFacilityId: snap.viewedFacilityId,
      lastTransfer: snap.lastTransfer,
      transferLog: snap.transferLog,
      run: { ...snap.run, journey: snap.run.journey ?? [] },
      pandemic: snap.pandemic,
      kpis: deriveKpis(snap.pandemic, snap.totals.cash),
    }));
    bus.emit(Events.CaseStart, { caseId: caseDef.id });
    if (snap.run.currentFacilityId) {
      bus.emit(Events.FacilityChanged, { facilityId: snap.run.currentFacilityId });
    }
    bus.emit(Events.PatientMoveTo, {
      department:
        caseDef.pathway.find((n) => n.id === snap.run.currentNodeId)?.department ?? 'entrance',
    });
    if (snap.run.pendingDecision) {
      bus.emit(Events.CaseDecisionRequested, {
        decision: snap.run.pendingDecision.decision,
        nodeId: snap.run.pendingDecision.nodeId,
      });
    }
  },

  viewFacility: (facilityId) => {
    set({ viewedFacilityId: facilityId });
    bus.emit(Events.FacilityChanged, { facilityId });
  },

  setDorscon: (level) =>
    set((s) => {
      const pandemic: PandemicState = {
        ...s.pandemic,
        dorscon: level,
        label: dorsconLabel(level),
        ncidActivated: level === 'Orange' || level === 'Red' ? true : s.pandemic.ncidActivated,
      };
      return {
        pandemic,
        kpis: deriveKpis(pandemic, s.run.totalCostSGD),
      };
    }),

  setPpe: (pct) =>
    set((s) => {
      const pandemic = { ...s.pandemic, ppeStockpilePct: clamp(pct) };
      return { pandemic, kpis: deriveKpis(pandemic, s.run.totalCostSGD) };
    }),

  setSurge: (pct) =>
    set((s) => {
      const pandemic = { ...s.pandemic, surgeCapacityPct: clamp(pct) };
      return { pandemic, kpis: deriveKpis(pandemic, s.run.totalCostSGD) };
    }),

  setEdDiversion: (on) =>
    set((s) => {
      const pandemic = { ...s.pandemic, edDiversionActive: on };
      return { pandemic, kpis: deriveKpis(pandemic, s.run.totalCostSGD) };
    }),

  setNcidActivated: (on) =>
    set((s) => ({ pandemic: { ...s.pandemic, ncidActivated: on } })),

  setWardClass: (ward) => {
    const { profile, caseDef, segments } = get();
    if (!profile || !caseDef) return;
    const next: PatientProfile = { ...profile, wardClass: ward };
    const recomputed = segments.map((s) =>
      computeSegment(next, { charge: s.charge, grossSGD: s.grossSGD, tier: s.tier }),
    );
    const totals = totalsFor(recomputed);
    set((s) => ({
      profile: next,
      segments: recomputed,
      totals,
      run: { ...s.run, totalCostSGD: totals.cash },
      kpis: deriveKpis(s.pandemic, totals.cash),
    }));
    persistSnapshot(get());
  },

  setIntegratedShield: (on) => {
    const { profile, segments } = get();
    if (!profile) return;
    const next: PatientProfile = { ...profile, hasIntegratedShield: on };
    const recomputed = segments.map((s) =>
      computeSegment(next, { charge: s.charge, grossSGD: s.grossSGD, tier: s.tier }),
    );
    const totals = totalsFor(recomputed);
    set((s) => ({
      profile: next,
      segments: recomputed,
      totals,
      run: { ...s.run, totalCostSGD: totals.cash },
      kpis: deriveKpis(s.pandemic, totals.cash),
    }));
    persistSnapshot(get());
  },

  resolveDecision: (option) => {
    const { caseDef, run, profile } = get();
    if (!caseDef || !run.pendingDecision || !profile) return;

    const { nodeId, decision } = run.pendingDecision;
    const maxScore = decision.options.reduce(
      (acc, o) => Math.max(acc, o.score),
      Number.NEGATIVE_INFINITY,
    );
    const entry: DecisionLogEntry = {
      nodeId,
      decisionId: decision.id,
      optionId: option.id,
      scoreEarned: option.score * decision.weight,
      maxScore: maxScore * decision.weight,
    };
    bus.emit(Events.CaseDecisionResolved, { entry });

    // ===== apply effects =====
    let nextProfile = profile;
    if (option.effects?.wardClass) {
      nextProfile = { ...nextProfile, wardClass: option.effects.wardClass };
    }
    if (typeof option.effects?.integratedShield === 'boolean') {
      nextProfile = { ...nextProfile, hasIntegratedShield: option.effects.integratedShield };
    }

    let nextPandemic = get().pandemic;
    if (option.effects?.pandemic) {
      const p = option.effects.pandemic;
      nextPandemic = {
        ...nextPandemic,
        dorscon: shiftDorscon(nextPandemic.dorscon, p.dorsconShift),
        label: dorsconLabel(shiftDorscon(nextPandemic.dorscon, p.dorsconShift)),
        ppeStockpilePct: clamp(nextPandemic.ppeStockpilePct + (p.ppeStockpilePctDelta ?? 0)),
        surgeCapacityPct: clamp(nextPandemic.surgeCapacityPct + (p.surgeCapacityPctDelta ?? 0)),
      };
    }

    const flagsAfter = new Set(run.flags);
    option.effects?.setFlags?.forEach((f) => flagsAfter.add(f));
    option.effects?.clearFlags?.forEach((f) => flagsAfter.delete(f));
    // Acute timer: if we've already blown past the goal, mark the missed-
    // deadline flag so consequence nodes (deterioration, family meeting) fire.
    if (caseDef.acuteTimer && run.elapsedGameMin > caseDef.acuteTimer.goalMin) {
      flagsAfter.add(caseDef.acuteTimer.missedFlag);
    }

    // Walk forward through transit nodes until we hit the next decision
    // (or end of case). Each intermediate node still contributes its
    // duration, cost, burden, and facility transition.
    const chain = walkToNextDecision(caseDef, nodeId, option.effects, option.nextNode, new Set(run.flags));

    if (chain.length === 0) {
      const recomputed = get().segments.map((s) =>
        computeSegment(nextProfile, { charge: s.charge, grossSGD: s.grossSGD, tier: s.tier }),
      );
      const totals = totalsFor(recomputed);
      const burdenWithEffect = applyEffectBurden(get().caregiverBurden, option.effects);
      set((s) => ({
        profile: nextProfile,
        segments: recomputed,
        totals,
        caregiverBurden: burdenWithEffect,
        pandemic: nextPandemic,
        run: {
          ...s.run,
          status: 'completed',
          pendingDecision: null,
          log: [...s.run.log, entry],
          totalCostSGD: totals.cash,
          flags: Array.from(flagsAfter),
        },
        kpis: deriveKpis(nextPandemic, totals.cash),
      }));
      bus.emit(Events.CaseCompleted);
      persistSnapshot(get()); // will clear, since status === 'completed'
      return;
    }

    let segmentsAcc = get().segments;
    let burdenAcc = applyEffectBurden(get().caregiverBurden, option.effects);
    let elapsedDelta = 0;
    let prevFacilityId = get().run.currentFacilityId;
    const facilityHops: Array<{ from: string; to: string }> = [];

    for (const node of chain) {
      segmentsAcc = applyNodeFinancing(nextProfile, segmentsAcc, node, caseDef.primaryFacility);
      burdenAcc = applyBurden(burdenAcc, node);
      elapsedDelta += node.durationMin;
      const facilityId = node.facility ?? caseDef.primaryFacility;
      if (prevFacilityId && facilityId !== prevFacilityId) {
        facilityHops.push({ from: prevFacilityId, to: facilityId });
      }
      prevFacilityId = facilityId;
    }

    const finalNode = chain[chain.length - 1];
    const finalFacilityId = finalNode.facility ?? caseDef.primaryFacility;
    const fully = segmentsAcc.map((s) =>
      computeSegment(nextProfile, { charge: s.charge, grossSGD: s.grossSGD, tier: s.tier }),
    );
    const totals = totalsFor(fully);

    const endsOnDecision = finalNode.decision != null;
    set((s) => ({
      profile: nextProfile,
      segments: fully,
      totals,
      caregiverBurden: burdenAcc,
      viewedFacilityId: finalFacilityId,
      pandemic: nextPandemic,
      run: {
        ...s.run,
        currentNodeId: finalNode.id,
        currentFacilityId: finalFacilityId,
        status: endsOnDecision ? 'awaiting-decision' : 'completed',
        pendingDecision: endsOnDecision && finalNode.decision
          ? { nodeId: finalNode.id, decision: finalNode.decision }
          : null,
        log: [...s.run.log, entry],
        elapsedGameMin: s.run.elapsedGameMin + elapsedDelta,
        totalCostSGD: totals.cash,
        flags: Array.from(flagsAfter),
        journey: [...s.run.journey, ...chain.map((n) => n.id)],
      },
      kpis: deriveKpis(nextPandemic, totals.cash),
    }));

    for (const hop of facilityHops) {
      const fromF = getFacility(hop.from);
      const toF = getFacility(hop.to);
      if (fromF && toF) {
        const flow = recordsFlowBetween(fromF, toF);
        const transfer = { fromFacilityId: fromF.id, toFacilityId: toF.id, flow };
        set((s) => ({
          lastTransfer: transfer,
          transferLog: [...s.transferLog, transfer],
        }));
      }
      bus.emit(Events.FacilityChanged, { facilityId: hop.to });
    }
    for (const node of chain) {
      bus.emit(Events.PatientMoveTo, { department: node.department });
    }
    if (finalNode.decision) {
      bus.emit(Events.CaseDecisionRequested, {
        decision: finalNode.decision,
        nodeId: finalNode.id,
      });
    } else {
      // Walked off the end with no further decisions — complete the case.
      bus.emit(Events.CaseCompleted);
    }
    persistSnapshot(get());
  },

  tickGameTime: (deltaMin) => {
    const state = get();
    if (!state.caseDef || state.run.status !== 'awaiting-decision') return;
    const next = state.run.elapsedGameMin + deltaMin;
    const timer = state.caseDef.acuteTimer;
    const flagsAfter = new Set(state.run.flags);
    if (timer && next > timer.goalMin) flagsAfter.add(timer.missedFlag);
    set((s) => ({
      run: {
        ...s.run,
        elapsedGameMin: next,
        flags: Array.from(flagsAfter),
      },
    }));
  },

  resetRun: () => {
    set((s) => ({
      run: { ...emptyRun },
      caseDef: null,
      profile: null,
      segments: [],
      totals: { ...emptyTotals },
      caregiverBurden: { ...emptyBurden },
      lastTransfer: null,
      transferLog: [],
      kpis: deriveKpis(s.pandemic, 0),
    }));
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SAVE_KEY);
    }
    bus.emit(Events.CaseReset);
  },

  resumeFromHandoff: (h) => {
    const caseDef = getCase(h.caseId) ?? null;
    if (!caseDef) return false;
    const baseProfile = DEFAULT_PROFILES[caseDef.profileKey] ?? DEFAULT_PROFILES.taxiDriver;
    const profile = maybeRandomiseProfile({ ...baseProfile }, caseDef.randomiseProfile);

    // Determine the current node + whether it carries a decision.
    const currentNode = h.currentNodeId
      ? caseDef.pathway.find((n) => n.id === h.currentNodeId) ?? null
      : null;
    const endsOnDecision = currentNode?.decision != null;
    const facilityId = h.currentFacilityId ?? caseDef.primaryFacility;

    set((s) => ({
      caseDef,
      profile,
      segments: [],
      totals: { ...emptyTotals, cash: h.totalCostSGD },
      caregiverBurden: { ...emptyBurden },
      viewedFacilityId: facilityId,
      lastTransfer: null,
      transferLog: [],
      run: {
        caseId: caseDef.id,
        status: endsOnDecision ? 'awaiting-decision' : 'running',
        currentNodeId: h.currentNodeId,
        currentFacilityId: facilityId,
        pendingDecision: endsOnDecision && currentNode?.decision
          ? { nodeId: currentNode.id, decision: currentNode.decision }
          : null,
        log: h.log.slice(),
        startedAtGameMin: 0,
        elapsedGameMin: h.elapsedGameMin,
        totalCostSGD: h.totalCostSGD,
        flags: h.flags.slice(),
        journey: h.journey.slice(),
      },
      kpis: deriveKpis(s.pandemic, h.totalCostSGD),
    }));
    bus.emit(Events.CaseStart, { caseId: caseDef.id });
    if (endsOnDecision && currentNode?.decision) {
      bus.emit(Events.CaseDecisionRequested, { decision: currentNode.decision, nodeId: currentNode.id });
    }
    return true;
  },
}));

export function getCurrentNode(): PathwayNode | undefined {
  const { caseDef, run } = useGame.getState();
  if (!caseDef || !run.currentNodeId) return undefined;
  return caseDef.pathway.find((n) => n.id === run.currentNodeId);
}

export function getPendingDecision(): Decision | null {
  return useGame.getState().run.pendingDecision?.decision ?? null;
}

export function hasPersistedRun(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(SAVE_KEY) !== null;
}
