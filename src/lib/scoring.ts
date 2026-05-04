import type { CaseDefinition, DecisionLogEntry, Decision } from './types';

export function maxScoreForDecision(decision: Decision): number {
  const best = decision.options.reduce(
    (acc, o) => (o.score > acc ? o.score : acc),
    Number.NEGATIVE_INFINITY,
  );
  return best * decision.weight;
}

export function maxScoreForCase(c: CaseDefinition): number {
  return c.pathway.reduce(
    (acc, n) => acc + (n.decision ? maxScoreForDecision(n.decision) : 0),
    0,
  );
}

export function totalScoreFromLog(log: DecisionLogEntry[]): {
  earned: number;
  max: number;
} {
  return log.reduce(
    (acc, e) => ({ earned: acc.earned + e.scoreEarned, max: acc.max + e.maxScore }),
    { earned: 0, max: 0 },
  );
}

export function gradeForRatio(ratio: number): {
  grade: string;
  colour: string;
  message: string;
} {
  if (ratio >= 0.9)
    return { grade: 'Distinction', colour: '#4ade80', message: 'Guideline-concordant care.' };
  if (ratio >= 0.75)
    return { grade: 'Pass', colour: '#a3e635', message: 'Mostly correct, minor deviations.' };
  if (ratio >= 0.5)
    return {
      grade: 'Borderline',
      colour: '#facc15',
      message: 'Important steps missed; review the rationale.',
    };
  return {
    grade: 'Unsafe',
    colour: '#f87171',
    message: 'Multiple critical decisions diverged from guidelines.',
  };
}
