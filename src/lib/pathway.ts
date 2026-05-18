import type {
  CaseDefinition,
  DecisionEffects,
  PathwayNode,
} from './types';

/**
 * Choose the next node to enter from a pathway, honouring decision effects
 * (`branchTo`, `nextNode`) and node visibility flags (`requiresAnyFlag`,
 * `skipIfAnyFlag`). Returns undefined when the case has run out.
 */
export function pickNextNode(
  caseDef: CaseDefinition,
  currentNodeId: string,
  effects: DecisionEffects | undefined,
  optionNextNode: string | undefined,
  flags: Set<string>,
): PathwayNode | undefined {
  // Compute the new flag set as if the decision were committed.
  const flagsAfter = new Set(flags);
  effects?.setFlags?.forEach((f) => flagsAfter.add(f));
  effects?.clearFlags?.forEach((f) => flagsAfter.delete(f));

  const explicit = effects?.branchTo ?? optionNextNode;
  let idx = caseDef.pathway.findIndex((n) => n.id === currentNodeId);

  if (explicit) {
    const target = caseDef.pathway.findIndex((n) => n.id === explicit);
    if (target === -1) return undefined;
    idx = target - 1; // step back so the loop below picks `target`
  }

  // Walk forward looking for the next visible node.
  for (let i = idx + 1; i < caseDef.pathway.length; i++) {
    const candidate = caseDef.pathway[i];
    if (isVisible(candidate, flagsAfter)) return candidate;
  }
  return undefined;
}

export function isVisible(node: PathwayNode, flags: Set<string>): boolean {
  if (node.requiresAnyFlag && node.requiresAnyFlag.length > 0) {
    if (!node.requiresAnyFlag.some((f) => flags.has(f))) return false;
  }
  if (node.skipIfAnyFlag && node.skipIfAnyFlag.some((f) => flags.has(f))) {
    return false;
  }
  return true;
}

/**
 * Walk the pathway from the start, honouring requiresAnyFlag / skipIfAnyFlag
 * with no flags set, returning the first visible node. Used by startCase.
 */
export function firstVisibleNode(caseDef: CaseDefinition): PathwayNode | undefined {
  const empty = new Set<string>();
  return caseDef.pathway.find((n) => isVisible(n, empty));
}

/**
 * Apply a decision option's flag effects to a flag set, returning a new set.
 */
export function applyFlagEffects(
  flags: Set<string>,
  effects: DecisionEffects | undefined,
): Set<string> {
  const next = new Set(flags);
  effects?.setFlags?.forEach((f) => next.add(f));
  effects?.clearFlags?.forEach((f) => next.delete(f));
  return next;
}

/**
 * Walk forward from `fromNodeId`, collecting the chain of visible nodes up
 * to and including the next decision-bearing node (or the end of the case).
 *
 * Cases author transit nodes (triage, imaging, ward) between decisions; the
 * engine has no real-time tick, so without this helper the case stalls on
 * any non-decision node. resolveDecision walks the returned chain to apply
 * each node's duration / cost / financing / burden / facility transition
 * and ends on the next decision (or completes the case).
 *
 * `effects` and `optionNextNode` apply only to the first hop (the decision
 * that prompted this walk); subsequent hops follow linear pathway order.
 */
export function walkToNextDecision(
  caseDef: CaseDefinition,
  fromNodeId: string,
  effects: DecisionEffects | undefined,
  optionNextNode: string | undefined,
  flags: Set<string>,
): PathwayNode[] {
  const chain: PathwayNode[] = [];
  const flagsAfter = applyFlagEffects(flags, effects);
  let next = pickNextNode(caseDef, fromNodeId, effects, optionNextNode, flags);
  while (next) {
    chain.push(next);
    if (next.decision) return chain;
    next = pickNextNode(caseDef, next.id, undefined, undefined, flagsAfter);
  }
  return chain;
}

/**
 * Same as walkToNextDecision but starting from the beginning of the case.
 * Used by startCase so a case whose first node is a transit doesn't stall.
 */
export function walkToFirstDecision(caseDef: CaseDefinition): PathwayNode[] {
  const first = firstVisibleNode(caseDef);
  if (!first) return [];
  if (first.decision) return [first];
  const rest = walkToNextDecision(caseDef, first.id, undefined, undefined, new Set());
  return [first, ...rest];
}
