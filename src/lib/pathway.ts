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
