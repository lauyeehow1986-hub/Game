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
} from '../lib/financing';
import { getFacility } from '../content';

interface CaregiverBurden {
  timeOffWorkHours: number;
  financialWorry: number; // 0..100
  sleepDebt: number; // 0..100
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
  /** Generic Disease X r0 (illustrative). */
  rEffective: number;
  /** Free-text current alert label. */
  label: string;
}

interface GameState {
  run: CaseRunSnapshot;
  caseDef: CaseDefinition | null;
  profile: PatientProfile | null;
  segments: FinancingSegmentResult[];
  totals: FinancingTotals;
  caregiverBurden: CaregiverBurden;
  /** Facility the player is currently viewing in the canvas. */
  viewedFacilityId: string;
  pandemic: PandemicState;

  kpis: {
    bedOccupancyPct: number;
    edWaitMin: number;
    staffFatiguePct: number;
    runningCostSGD: number;
    dorscon: Dorscon;
  };

  startCase: (caseDef: CaseDefinition) => void;
  setWardClass: (ward: WardClass) => void;
  setIntegratedShield: (on: boolean) => void;
  resolveDecision: (option: DecisionOption) => void;
  resetRun: () => void;
  viewFacility: (facilityId: string) => void;
  setDorscon: (level: Dorscon) => void;
  setPpe: (pct: number) => void;
  setSurge: (pct: number) => void;
  setEdDiversion: (on: boolean) => void;
  setNcidActivated: (on: boolean) => void;
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
};

const baseDorscon: Dorscon = 'Green';

const basePandemic: PandemicState = {
  dorscon: baseDorscon,
  ppeStockpilePct: 78,
  surgeCapacityPct: 22,
  edDiversionActive: false,
  ncidActivated: false,
  rEffective: 0.9,
  label: 'No outbreak in progress',
};


const baseKpis = {
  bedOccupancyPct: 87,
  edWaitMin: 168,
  staffFatiguePct: 64,
  runningCostSGD: 0,
  dorscon: 'Green' as const,
};

const emptyTotals: FinancingTotals = { gross: 0, subsidy: 0, mediShield: 0, mediSave: 0, cash: 0 };

function tierForFacility(facilityId?: string): 'subsidised' | 'private' {
  if (!facilityId) return 'subsidised';
  const f = getFacility(facilityId);
  if (!f) return 'subsidised';
  // Private hospitals / specialists / GPs / telemed bill at private rate.
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

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
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
  kpis: { ...baseKpis },

  startCase: (caseDef) => {
    const first = caseDef.pathway[0];
    const profileTemplate =
      DEFAULT_PROFILES[caseDef.profileKey] ?? DEFAULT_PROFILES.taxiDriver;
    const profile: PatientProfile = { ...profileTemplate };
    const segments = first ? applyNodeFinancing(profile, [], first, caseDef.primaryFacility) : [];
    const totals = totalsFor(segments);
    const burden = first ? applyBurden(emptyBurden, first) : emptyBurden;
    const startFacilityId = first?.facility ?? caseDef.primaryFacility;

    set((s) => ({
      caseDef,
      profile,
      segments,
      totals,
      caregiverBurden: burden,
      viewedFacilityId: startFacilityId,
      run: {
        caseId: caseDef.id,
        status: first?.decision ? 'awaiting-decision' : 'running',
        currentNodeId: first?.id ?? null,
        currentFacilityId: startFacilityId,
        pendingDecision:
          first && first.decision
            ? { nodeId: first.id, decision: first.decision }
            : null,
        log: [],
        startedAtGameMin: 0,
        elapsedGameMin: 0,
        totalCostSGD: totals.cash,
      },
      kpis: { ...baseKpis, runningCostSGD: totals.cash, dorscon: s.pandemic.dorscon },
    }));
    bus.emit(Events.CaseStart, { caseId: caseDef.id });
    bus.emit(Events.FacilityChanged, { facilityId: startFacilityId });
    bus.emit(Events.PatientMoveTo, { department: first?.department });
    if (first?.decision) {
      bus.emit(Events.CaseDecisionRequested, { decision: first.decision, nodeId: first.id });
    }
  },

  viewFacility: (facilityId) => {
    set({ viewedFacilityId: facilityId });
    bus.emit(Events.FacilityChanged, { facilityId });
  },

  setDorscon: (level) =>
    set((s) => ({
      pandemic: {
        ...s.pandemic,
        dorscon: level,
        label:
          level === 'Green'
            ? 'No or low pathogen activity'
            : level === 'Yellow'
            ? 'Mild disease, mostly contained — heightened vigilance'
            : level === 'Orange'
            ? 'Moderate transmission — NCID-led, hospital surge plans active'
            : 'Severe widespread transmission — system-wide surge and resource rationing',
        ncidActivated: level === 'Orange' || level === 'Red' ? true : s.pandemic.ncidActivated,
      },
      kpis: { ...s.kpis, dorscon: level },
    })),
  setPpe: (pct) => set((s) => ({ pandemic: { ...s.pandemic, ppeStockpilePct: clamp(pct) } })),
  setSurge: (pct) => set((s) => ({ pandemic: { ...s.pandemic, surgeCapacityPct: clamp(pct) } })),
  setEdDiversion: (on) => set((s) => ({ pandemic: { ...s.pandemic, edDiversionActive: on } })),
  setNcidActivated: (on) => set((s) => ({ pandemic: { ...s.pandemic, ncidActivated: on } })),

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
      kpis: { ...s.kpis, runningCostSGD: totals.cash },
    }));
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
      kpis: { ...s.kpis, runningCostSGD: totals.cash },
    }));
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

    // Decisions in v0.2 can change the patient profile (ward-class option).
    let nextProfile = profile;
    const wardOption = option.id.startsWith('class-') ? (option.id.split('-')[1].toUpperCase() as WardClass) : null;
    if (wardOption && decision.id === 'subsidy-class') {
      nextProfile = { ...profile, wardClass: wardOption };
    }

    const idx = caseDef.pathway.findIndex((n) => n.id === nodeId);
    let nextNode: PathwayNode | undefined;
    if (option.nextNode) {
      nextNode = caseDef.pathway.find((n) => n.id === option.nextNode);
    } else {
      nextNode = caseDef.pathway[idx + 1];
    }

    if (!nextNode) {
      const recomputed = get().segments.map((s) =>
        computeSegment(nextProfile, { charge: s.charge, grossSGD: s.grossSGD, tier: s.tier }),
      );
      const totals = totalsFor(recomputed);
      set((s) => ({
        profile: nextProfile,
        segments: recomputed,
        totals,
        run: {
          ...s.run,
          status: 'completed',
          pendingDecision: null,
          log: [...s.run.log, entry],
          totalCostSGD: totals.cash,
        },
        kpis: { ...s.kpis, runningCostSGD: totals.cash },
      }));
      bus.emit(Events.CaseCompleted);
      return;
    }

    const newSegments = applyNodeFinancing(nextProfile, get().segments, nextNode, caseDef.primaryFacility);
    const fully = newSegments.map((s) =>
      computeSegment(nextProfile, { charge: s.charge, grossSGD: s.grossSGD, tier: s.tier }),
    );
    const totals = totalsFor(fully);
    const burden = applyBurden(get().caregiverBurden, nextNode);
    const nextFacilityId = nextNode.facility ?? caseDef.primaryFacility;
    const facilityChanged = nextFacilityId !== get().run.currentFacilityId;

    set((s) => ({
      profile: nextProfile,
      segments: fully,
      totals,
      caregiverBurden: burden,
      viewedFacilityId: nextFacilityId,
      run: {
        ...s.run,
        currentNodeId: nextNode!.id,
        currentFacilityId: nextFacilityId,
        status: nextNode!.decision ? 'awaiting-decision' : 'running',
        pendingDecision: nextNode!.decision
          ? { nodeId: nextNode!.id, decision: nextNode!.decision }
          : null,
        log: [...s.run.log, entry],
        elapsedGameMin: s.run.elapsedGameMin + nextNode!.durationMin,
        totalCostSGD: totals.cash,
      },
      kpis: { ...s.kpis, runningCostSGD: totals.cash },
    }));
    if (facilityChanged) {
      bus.emit(Events.FacilityChanged, { facilityId: nextFacilityId });
    }
    bus.emit(Events.PatientMoveTo, { department: nextNode.department });
    if (nextNode.decision) {
      bus.emit(Events.CaseDecisionRequested, {
        decision: nextNode.decision,
        nodeId: nextNode.id,
      });
    }
  },

  resetRun: () => {
    set((s) => ({
      run: { ...emptyRun },
      caseDef: null,
      profile: null,
      segments: [],
      totals: { ...emptyTotals },
      caregiverBurden: { ...emptyBurden },
      kpis: { ...baseKpis, dorscon: s.pandemic.dorscon },
    }));
    bus.emit(Events.CaseReset);
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
