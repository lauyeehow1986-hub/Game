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

interface GameState {
  run: CaseRunSnapshot;
  caseDef: CaseDefinition | null;

  // dashboard / tycoon-style read-only KPIs (illustrative for v0.1)
  kpis: {
    bedOccupancyPct: number;
    edWaitMin: number;
    staffFatiguePct: number;
    runningCostSGD: number;
    dorscon: 'Green' | 'Yellow' | 'Orange' | 'Red';
  };

  startCase: (caseDef: CaseDefinition) => void;
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

export const useGame = create<GameState>((set, get) => ({
  run: { ...emptyRun },
  caseDef: null,
  kpis: { ...baseKpis },

  startCase: (caseDef) => {
    const first = caseDef.pathway[0];
    set({
      caseDef,
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
        totalCostSGD: first?.costSGD ?? 0,
      },
      kpis: { ...baseKpis, runningCostSGD: first?.costSGD ?? 0 },
    });
    bus.emit(Events.CaseStart, { caseId: caseDef.id });
    bus.emit(Events.PatientMoveTo, { department: first?.department });
    if (first?.decision) {
      bus.emit(Events.CaseDecisionRequested, { decision: first.decision, nodeId: first.id });
    }
  },

  resolveDecision: (option) => {
    const { caseDef, run } = get();
    if (!caseDef || !run.pendingDecision) return;

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

    const idx = caseDef.pathway.findIndex((n) => n.id === nodeId);
    let nextNode: PathwayNode | undefined;
    if (option.nextNode) {
      nextNode = caseDef.pathway.find((n) => n.id === option.nextNode);
    } else {
      nextNode = caseDef.pathway[idx + 1];
    }

    if (!nextNode) {
      set((s) => ({
        run: {
          ...s.run,
          status: 'completed',
          pendingDecision: null,
          log: [...s.run.log, entry],
        },
      }));
      bus.emit(Events.CaseCompleted);
      return;
    }

    const newCost = (run.totalCostSGD ?? 0) + (nextNode.costSGD ?? 0);
    set((s) => ({
      run: {
        ...s.run,
        currentNodeId: nextNode!.id,
        status: nextNode!.decision ? 'awaiting-decision' : 'running',
        pendingDecision: nextNode!.decision
          ? { nodeId: nextNode!.id, decision: nextNode!.decision }
          : null,
        log: [...s.run.log, entry],
        elapsedGameMin: s.run.elapsedGameMin + nextNode!.durationMin,
        totalCostSGD: newCost,
      },
      kpis: { ...s.kpis, runningCostSGD: newCost },
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
    set({ run: { ...emptyRun }, caseDef: null, kpis: { ...baseKpis } });
    bus.emit(Events.CaseReset);
  },
}));

// Convenience selector for the current node definition.
export function getCurrentNode(): PathwayNode | undefined {
  const { caseDef, run } = useGame.getState();
  if (!caseDef || !run.currentNodeId) return undefined;
  return caseDef.pathway.find((n) => n.id === run.currentNodeId);
}

// Helper to look up the active decision (if any).
export function getPendingDecision(): Decision | null {
  return useGame.getState().run.pendingDecision?.decision ?? null;
}
