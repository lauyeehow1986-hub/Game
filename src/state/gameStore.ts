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

interface GameState {
  run: CaseRunSnapshot;
  caseDef: CaseDefinition | null;
  profile: PatientProfile | null;
  segments: FinancingSegmentResult[];
  totals: FinancingTotals;
  caregiverBurden: CaregiverBurden;

  kpis: {
    bedOccupancyPct: number;
    edWaitMin: number;
    staffFatiguePct: number;
    runningCostSGD: number;
    dorscon: 'Green' | 'Yellow' | 'Orange' | 'Red';
  };

  startCase: (caseDef: CaseDefinition) => void;
  setWardClass: (ward: WardClass) => void;
  resolveDecision: (option: DecisionOption) => void;
  resetRun: () => void;
}

const emptyRun: CaseRunSnapshot = {
  caseId: null,
  status: 'idle',
  currentNodeId: null,
  pendingDecision: null,
  log: [],
  startedAtGameMin: 0,
  elapsedGameMin: 0,
  totalCostSGD: 0,
};

const baseKpis = {
  bedOccupancyPct: 87,
  edWaitMin: 168,
  staffFatiguePct: 64,
  runningCostSGD: 0,
  dorscon: 'Green' as const,
};

const emptyTotals: FinancingTotals = { gross: 0, subsidy: 0, mediShield: 0, mediSave: 0, cash: 0 };

function applyNodeFinancing(
  profile: PatientProfile | null,
  prev: FinancingSegmentResult[],
  node: PathwayNode,
): FinancingSegmentResult[] {
  if (!profile || !node.costSGD || !node.charge) return prev;
  const seg = computeSegment(profile, { charge: node.charge, grossSGD: node.costSGD });
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
  kpis: { ...baseKpis },

  startCase: (caseDef) => {
    const first = caseDef.pathway[0];
    const profileTemplate =
      DEFAULT_PROFILES[caseDef.profileKey] ?? DEFAULT_PROFILES.taxiDriver;
    const profile: PatientProfile = { ...profileTemplate };
    const segments = first ? applyNodeFinancing(profile, [], first) : [];
    const totals = totalsFor(segments);
    const burden = first ? applyBurden(emptyBurden, first) : emptyBurden;

    set({
      caseDef,
      profile,
      segments,
      totals,
      caregiverBurden: burden,
      run: {
        caseId: caseDef.id,
        status: first?.decision ? 'awaiting-decision' : 'running',
        currentNodeId: first?.id ?? null,
        pendingDecision:
          first && first.decision
            ? { nodeId: first.id, decision: first.decision }
            : null,
        log: [],
        startedAtGameMin: 0,
        elapsedGameMin: 0,
        totalCostSGD: totals.cash,
      },
      kpis: { ...baseKpis, runningCostSGD: totals.cash },
    });
    bus.emit(Events.CaseStart, { caseId: caseDef.id });
    bus.emit(Events.PatientMoveTo, { department: first?.department });
    if (first?.decision) {
      bus.emit(Events.CaseDecisionRequested, { decision: first.decision, nodeId: first.id });
    }
  },

  setWardClass: (ward) => {
    const { profile, caseDef, segments } = get();
    if (!profile || !caseDef) return;
    const next: PatientProfile = { ...profile, wardClass: ward };
    // Recompute existing segments with the new profile so the bill reflects the
    // selection consistently — important if the player switches mid-run.
    const recomputed = segments.map((s) =>
      computeSegment(next, { charge: s.charge, grossSGD: s.grossSGD }),
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
        computeSegment(nextProfile, { charge: s.charge, grossSGD: s.grossSGD }),
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

    const newSegments = applyNodeFinancing(nextProfile, get().segments, nextNode);
    // Recompute everything against the latest profile so a ward-class change
    // earlier in the run propagates.
    const fully = newSegments.map((s) =>
      computeSegment(nextProfile, { charge: s.charge, grossSGD: s.grossSGD }),
    );
    const totals = totalsFor(fully);
    const burden = applyBurden(get().caregiverBurden, nextNode);

    set((s) => ({
      profile: nextProfile,
      segments: fully,
      totals,
      caregiverBurden: burden,
      run: {
        ...s.run,
        currentNodeId: nextNode!.id,
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
    bus.emit(Events.PatientMoveTo, { department: nextNode.department });
    if (nextNode.decision) {
      bus.emit(Events.CaseDecisionRequested, {
        decision: nextNode.decision,
        nodeId: nextNode.id,
      });
    }
  },

  resetRun: () => {
    set({
      run: { ...emptyRun },
      caseDef: null,
      profile: null,
      segments: [],
      totals: { ...emptyTotals },
      caregiverBurden: { ...emptyBurden },
      kpis: { ...baseKpis },
    });
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
