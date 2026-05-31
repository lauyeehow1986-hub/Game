/**
 * Derived clinical-stability model — pure.
 *
 * The game has no real vitals engine; this turns the decision log into a
 * plausible "how is the patient doing because of your choices" trajectory.
 * Each committed decision nudges a 0-100 stability index by how good the
 * choice was (scoreEarned / maxScore mapped to a bounded delta). A missed
 * acute timer applies a one-off penalty. Purely a function of data the game
 * already records — no engine change, fully testable.
 */

import type { DecisionLogEntry } from './types';

export type StabilityBand = 'stable' | 'guarded' | 'critical';

export interface StabilityPoint {
  /** Index of the decision in the log (0-based). */
  step: number;
  value: number; // 0..100
}

export interface StabilityTrajectory {
  start: number;
  points: StabilityPoint[];
  value: number; // final 0..100
  band: StabilityBand;
}

const START = 70; // a patient arrives "guarded-to-stable"
const MAX_DELTA = 18; // a perfect/worst decision moves the needle this much

function clamp(n: number): number {
  return Math.max(0, Math.min(100, n));
}

export function bandFor(value: number): StabilityBand {
  if (value >= 67) return 'stable';
  if (value >= 34) return 'guarded';
  return 'critical';
}

/**
 * Map a single decision's score ratio to a stability delta. A ratio of 1
 * (best option) gives +MAX_DELTA; a ratio of 0 gives a mild negative; a
 * strongly negative score (harmful option) gives close to -MAX_DELTA.
 */
function deltaFor(scoreEarned: number, maxScore: number): number {
  if (maxScore <= 0) return 0;
  const ratio = scoreEarned / maxScore; // can be negative for harmful options
  // ratio 1 -> +MAX_DELTA, ratio 0 -> -MAX_DELTA*0.3, ratio -1 -> -MAX_DELTA
  const norm = Math.max(-1, Math.min(1, ratio));
  if (norm >= 0) return norm * MAX_DELTA - (1 - norm) * (MAX_DELTA * 0.3);
  return norm * MAX_DELTA;
}

export function computeStability(
  log: DecisionLogEntry[],
  opts: { acuteTimerMissed?: boolean } = {},
): StabilityTrajectory {
  let value = START;
  const points: StabilityPoint[] = [];
  log.forEach((e, i) => {
    value = clamp(value + deltaFor(e.scoreEarned, e.maxScore));
    points.push({ step: i, value: Math.round(value) });
  });
  if (opts.acuteTimerMissed) {
    value = clamp(value - MAX_DELTA);
    points.push({ step: log.length, value: Math.round(value) });
  }
  return { start: START, points, value: Math.round(value), band: bandFor(value) };
}
