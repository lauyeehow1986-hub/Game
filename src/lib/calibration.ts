/**
 * Confidence-rated scoring — pure.
 *
 * In an exam paper or quiz, a learner can attach a confidence rating to each
 * answer. We score with the Brier score: (forecast - outcome)^2, where the
 * outcome is 1 if the chosen option was the best-scoring one and 0
 * otherwise. Lower Brier is better; a well-calibrated learner who is 80%
 * confident is right ~80% of the time.
 *
 * Also produces a coarse reliability diagram (binned forecast vs observed).
 */

export type Confidence = 0.2 | 0.4 | 0.6 | 0.8 | 1.0;

export const CONFIDENCE_LEVELS: Confidence[] = [0.2, 0.4, 0.6, 0.8, 1.0];

export interface CalibrationPick {
  /** Confidence the learner attached to their answer (0..1). */
  forecast: number;
  /** 1 = picked the best option, 0 = did not. */
  correct: 0 | 1;
}

export interface CalibrationReport {
  count: number;
  /** Mean Brier score, lower is better. 0 = perfect, 0.25 = chance. */
  brier: number;
  /** Mean observed correctness — overall hit rate. */
  hitRate: number;
  /** Mean forecast — how confident the learner was on average. */
  meanForecast: number;
  /** Overconfidence: meanForecast - hitRate (positive = overconfident). */
  overconfidence: number;
  /** Per-confidence-bin observed rate + count for a reliability diagram. */
  bins: Array<{ forecast: Confidence; n: number; observed: number }>;
}

/** Snap an arbitrary 0..1 value to the nearest fixed bin. */
function snapToBin(f: number): Confidence {
  let best: Confidence = CONFIDENCE_LEVELS[0];
  let bestD = Infinity;
  for (const c of CONFIDENCE_LEVELS) {
    const d = Math.abs(c - f);
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best;
}

export function score(picks: CalibrationPick[]): CalibrationReport {
  if (picks.length === 0) {
    return {
      count: 0,
      brier: 0,
      hitRate: 0,
      meanForecast: 0,
      overconfidence: 0,
      bins: CONFIDENCE_LEVELS.map((f) => ({ forecast: f, n: 0, observed: 0 })),
    };
  }
  let brierSum = 0;
  let hitSum = 0;
  let forecastSum = 0;
  const binCount = new Map<Confidence, number>();
  const binHits = new Map<Confidence, number>();
  for (const p of picks) {
    const f = Math.max(0, Math.min(1, p.forecast));
    const o = p.correct === 1 ? 1 : 0;
    brierSum += (f - o) ** 2;
    hitSum += o;
    forecastSum += f;
    const bin = snapToBin(f);
    binCount.set(bin, (binCount.get(bin) ?? 0) + 1);
    binHits.set(bin, (binHits.get(bin) ?? 0) + o);
  }
  const bins = CONFIDENCE_LEVELS.map((f) => {
    const n = binCount.get(f) ?? 0;
    const observed = n > 0 ? (binHits.get(f) ?? 0) / n : 0;
    return { forecast: f, n, observed };
  });
  const meanForecast = forecastSum / picks.length;
  const hitRate = hitSum / picks.length;
  return {
    count: picks.length,
    brier: brierSum / picks.length,
    hitRate,
    meanForecast,
    overconfidence: meanForecast - hitRate,
    bins,
  };
}
