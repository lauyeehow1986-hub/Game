import type { CaseDefinition, DecisionLogEntry, DecisionOption, PathwayNode } from './types';
import { firstVisibleNode, pickNextNode } from './pathway';

export interface BestPathStep {
  nodeId: string;
  decisionId: string;
  optionId: string;
  optionLabel: string;
  rationale: string;
  score: number;
}

/**
 * Walk a case picking the highest-scoring option at every decision node.
 * Honours the same flag-driven branching the live engine uses (effects.setFlags,
 * requiresAnyFlag, etc.), so the best-path output reflects how a perfect run
 * actually unfolds — which may differ from the worst-run flag set.
 */
export function bestPath(caseDef: CaseDefinition): BestPathStep[] {
  const steps: BestPathStep[] = [];
  let node: PathwayNode | undefined = firstVisibleNode(caseDef);
  const flags = new Set<string>();
  // Safety cap so a malformed case can't loop forever.
  for (let i = 0; node && i < caseDef.pathway.length * 2; i++) {
    if (node.decision) {
      const best = node.decision.options.reduce<DecisionOption | null>(
        (acc, o) => (acc === null || o.score > acc.score ? o : acc),
        null,
      );
      if (best) {
        steps.push({
          nodeId: node.id,
          decisionId: node.decision.id,
          optionId: best.id,
          optionLabel: best.label,
          rationale: best.rationale,
          score: best.score * node.decision.weight,
        });
        const nextNode = pickNextNode(caseDef, node.id, best.effects, best.nextNode, flags);
        best.effects?.setFlags?.forEach((f) => flags.add(f));
        best.effects?.clearFlags?.forEach((f) => flags.delete(f));
        node = nextNode;
        continue;
      }
    }
    // No decision at this node — advance linearly via pickNextNode without effects.
    node = pickNextNode(caseDef, node.id, undefined, undefined, flags);
  }
  return steps;
}

export interface DiffRow {
  decisionId: string;
  prompt: string;
  yours: { label: string; score: number; maxScore: number } | null;
  best: { label: string; score: number };
  match: boolean;
}

/**
 * Pair each entry in the player's log with the corresponding best-path step.
 * Returns one DiffRow per decision the player actually saw — best-path-only
 * steps are skipped so the comparison stays one-to-one with what the player
 * experienced.
 */
export function compareToBestPath(
  caseDef: CaseDefinition,
  log: DecisionLogEntry[],
): DiffRow[] {
  const best = bestPath(caseDef);
  const bestByDecisionId = new Map(best.map((s) => [s.decisionId, s]));
  const rows: DiffRow[] = [];
  for (const e of log) {
    const node = caseDef.pathway.find((n) => n.id === e.nodeId);
    const decision = node?.decision;
    const option = decision?.options.find((o) => o.id === e.optionId);
    const bestStep = decision ? bestByDecisionId.get(decision.id) : undefined;
    if (!decision || !bestStep) continue;
    rows.push({
      decisionId: decision.id,
      prompt: decision.prompt,
      yours: option
        ? { label: option.label, score: e.scoreEarned, maxScore: e.maxScore }
        : null,
      best: { label: bestStep.optionLabel, score: bestStep.score },
      match: option?.id === bestStep.optionId,
    });
  }
  return rows;
}
