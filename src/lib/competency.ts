/**
 * Dreyfus competency tier — pure.
 *
 * The classic Dreyfus model maps practitioners through 5 levels: Novice →
 * Advanced Beginner → Competent → Proficient → Expert. We approximate this
 * from data the game already persists: how many distinct cases played, the
 * mean ratio across them, the number of distinctions (≥ 90%), and an
 * out-of-band signal (recent calibration / weakness).
 *
 * The mapping is illustrative — the game is not a credential. The tier is
 * intended to give the learner a coherent narrative across runs.
 */

export type Tier = 'novice' | 'advanced-beginner' | 'competent' | 'proficient' | 'expert';

export interface CompetencyInput {
  distinctCasesPlayed: number;
  meanRatio: number;
  distinctions: number;
  /** 0 by default; values ≥ 1 imply outstanding calibration (Brier ≤ 0.1). */
  wellCalibrated?: number;
}

export interface CompetencyReport {
  tier: Tier;
  /** Optional next-tier nudge — what the learner needs to reach the next rung. */
  nextTier: Tier | null;
  /** Short reason key for i18n. */
  reason: string;
  /** 0..1 progress within the current tier toward the next. */
  progress: number;
}

const ORDER: Tier[] = ['novice', 'advanced-beginner', 'competent', 'proficient', 'expert'];

function nextOf(t: Tier): Tier | null {
  const i = ORDER.indexOf(t);
  return i < ORDER.length - 1 ? ORDER[i + 1] : null;
}

/**
 * The thresholds are illustrative: the goal is a coherent, monotonic
 * narrative, not a credential. Calibration nudges a borderline learner up by
 * one rung when their Brier is genuinely good.
 */
export function competency(input: CompetencyInput): CompetencyReport {
  const { distinctCasesPlayed: cases, meanRatio: ratio, distinctions, wellCalibrated = 0 } = input;

  let tier: Tier;
  let progress: number;
  let reason: string;

  if (cases < 3) {
    tier = 'novice';
    progress = cases / 3;
    reason = 'competency.reason.novice';
  } else if (cases < 8 || ratio < 0.6) {
    tier = 'advanced-beginner';
    progress = Math.min(1, cases / 8);
    reason = 'competency.reason.advancedBeginner';
  } else if (cases < 14 || ratio < 0.75) {
    tier = 'competent';
    progress = Math.min(1, (cases - 8) / 6);
    reason = 'competency.reason.competent';
  } else if (ratio < 0.85 || distinctions < 5) {
    tier = 'proficient';
    progress = Math.min(1, distinctions / 5);
    reason = 'competency.reason.proficient';
  } else {
    tier = 'expert';
    progress = 1;
    reason = 'competency.reason.expert';
  }

  // Calibration bonus: a well-calibrated proficient → expert nudge, etc.
  if (wellCalibrated >= 1 && tier !== 'expert') {
    const idx = ORDER.indexOf(tier);
    const promoted = ORDER[idx + 1];
    if (tier === 'proficient' && ratio >= 0.8 && distinctions >= 3) {
      tier = promoted;
      progress = 1;
      reason = 'competency.reason.calibrationBonus';
    }
  }

  return { tier, nextTier: nextOf(tier), reason, progress };
}
