/**
 * Replay scrubber — pure.
 *
 * Given a CaseDefinition and a decision log, returns the state visible
 * after `step` decisions have been committed: the journey so far, cumulative
 * score, cumulative max score, and (delegated to patient-state) the derived
 * stability index. Lets the UI scrub a finished run forward and backward.
 */

import type { CaseDefinition, DecisionLogEntry, PathwayNode, DecisionOption } from './types';
import { applyFlagEffects, firstVisibleNode, pickNextNode } from './pathway';
import { computeStability, type StabilityTrajectory } from './patient-state';

export interface ReplayStep {
  /** Node id where the decision was committed. */
  nodeId: string;
  /** Decision id committed. */
  decisionId: string;
  /** Option label (LocalisedString | string) for display. */
  optionLabel: unknown;
  /** Cumulative weighted score after this step. */
  cumScore: number;
  /** Cumulative max-score after this step. */
  cumMax: number;
  /** Ordered node ids visited up to and including the next stop. */
  journey: string[];
  /** Stability trajectory at this step (truncated log). */
  stability: StabilityTrajectory;
}

/**
 * Materialise a replay. Returns one ReplayStep per entry in `log`. Walking
 * the case uses the same pathway engine as the live run, so branchTo /
 * requiresAnyFlag is honoured — the journey reflects what the player saw.
 */
export function buildReplay(caseDef: CaseDefinition, log: DecisionLogEntry[]): ReplayStep[] {
  const steps: ReplayStep[] = [];
  let cumScore = 0;
  let cumMax = 0;
  let flags = new Set<string>();
  let node: PathwayNode | undefined = firstVisibleNode(caseDef);
  const journey: string[] = node ? [node.id] : [];

  for (const entry of log) {
    // Fast-forward in case the entry doesn't match the current node (e.g.
    // transit nodes were skipped — the engine handles linear walks).
    while (node && node.id !== entry.nodeId) {
      const next = pickNextNode(caseDef, node.id, undefined, undefined, flags);
      if (!next) break;
      node = next;
      journey.push(node.id);
    }
    if (!node) break;

    const decision = node.decision;
    const option: DecisionOption | undefined = decision?.options.find((o) => o.id === entry.optionId);
    cumScore += entry.scoreEarned;
    cumMax += entry.maxScore;

    flags = applyFlagEffects(flags, option?.effects);
    const nextNode = pickNextNode(caseDef, node.id, option?.effects, option?.nextNode, flags);

    steps.push({
      nodeId: node.id,
      decisionId: entry.decisionId,
      optionLabel: option?.label ?? '?',
      cumScore,
      cumMax,
      journey: journey.slice(),
      stability: computeStability(log.slice(0, steps.length + 1)),
    });

    if (nextNode) {
      node = nextNode;
      journey.push(node.id);
    } else {
      node = undefined;
    }
  }
  return steps;
}
