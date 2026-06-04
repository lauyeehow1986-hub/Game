import { describe, expect, it } from 'vitest';
import { buildDebrief } from './debrief';
import type { CaseDefinition, DecisionLogEntry } from './types';

function mkCase(decisions: Array<{ id: string; bestScore: number }>): CaseDefinition {
  return {
    id: 'c1',
    title: { en: 'Case 1', zh: '' },
    blurb: { en: '', zh: '' },
    category: 'acute',
    primaryFacility: 'ttsh',
    guidelines: [{ label: { en: 'Cite A', zh: '' }, body: { en: '', zh: '' } }],
    pathway: decisions.map((d, i) => ({
      id: `n${i}`,
      department: 'ed',
      durationMin: 5,
      framing: { patient: { en: '', zh: '' }, staff: { en: '', zh: '' }, caregiver: { en: '', zh: '' } },
      decision: {
        id: d.id,
        prompt: { en: `Prompt ${d.id}`, zh: '' },
        weight: 1,
        reference: { label: { en: `Ref ${d.id}`, zh: '' }, body: { en: '', zh: '' } },
        options: [
          {
            id: 'good',
            label: { en: 'Best opt', zh: '' },
            rationale: { en: 'Because guideline', zh: '' },
            score: d.bestScore,
            outcome: { patient: { en: '', zh: '' }, staff: { en: '', zh: '' }, caregiver: { en: '', zh: '' } },
          },
          {
            id: 'bad',
            label: { en: 'Worse opt', zh: '' },
            rationale: { en: '', zh: '' },
            score: 0,
            outcome: { patient: { en: '', zh: '' }, staff: { en: '', zh: '' }, caregiver: { en: '', zh: '' } },
          },
        ],
      },
    })),
  } as unknown as CaseDefinition;
}

const resolveText = (v: unknown): string => {
  if (v && typeof v === 'object' && 'en' in v) {
    const en = (v as { en?: unknown }).en;
    return typeof en === 'string' ? en : '';
  }
  return typeof v === 'string' ? v : '';
};

describe('debrief', () => {
  it('classifies a perfect run as a distinction with no misses', () => {
    const c = mkCase([{ id: 'd1', bestScore: 5 }, { id: 'd2', bestScore: 5 }]);
    const log: DecisionLogEntry[] = [
      { nodeId: 'n0', decisionId: 'd1', optionId: 'good', scoreEarned: 5, maxScore: 5 },
      { nodeId: 'n1', decisionId: 'd2', optionId: 'good', scoreEarned: 5, maxScore: 5 },
    ];
    const d = buildDebrief({
      caseDef: c,
      log,
      priorBestRatio: 0.8,
      priorMeanRatio: 0.8,
      globalMeanRatio: 0.8,
      competencyTier: 'competent',
      resolveText,
    });
    expect(d.headline).toBe('distinction');
    expect(d.misses).toHaveLength(0);
    expect(d.strengths).toHaveLength(2);
    expect(d.newPersonalBest).toBe(true);
  });

  it('orders misses weakest-first and produces a practice-weakest step', () => {
    const c = mkCase([
      { id: 'd1', bestScore: 10 },
      { id: 'd2', bestScore: 10 },
    ]);
    const log: DecisionLogEntry[] = [
      { nodeId: 'n0', decisionId: 'd1', optionId: 'bad', scoreEarned: 1, maxScore: 10 },
      { nodeId: 'n1', decisionId: 'd2', optionId: 'bad', scoreEarned: 4, maxScore: 10 },
    ];
    const d = buildDebrief({
      caseDef: c,
      log,
      priorBestRatio: null,
      priorMeanRatio: null,
      globalMeanRatio: 0.8,
      competencyTier: 'novice',
      resolveText,
    });
    expect(d.misses[0].decisionId).toBe('d1');
    expect(d.headline).toBe('unsafe');
    expect(d.nextSteps.some((s) => s.key === 'practice-weakest')).toBe(true);
    expect(d.nextSteps.some((s) => s.key === 'below-global-mean')).toBe(true);
  });

  it('emits lock-in-distinction when a new personal best clears 0.9', () => {
    const c = mkCase([{ id: 'd1', bestScore: 5 }]);
    const log: DecisionLogEntry[] = [
      { nodeId: 'n0', decisionId: 'd1', optionId: 'good', scoreEarned: 5, maxScore: 5 },
    ];
    const d = buildDebrief({
      caseDef: c,
      log,
      priorBestRatio: 0.8,
      priorMeanRatio: 0.8,
      globalMeanRatio: 0.8,
      competencyTier: 'competent',
      resolveText,
    });
    expect(d.nextSteps.some((s) => s.key === 'lock-in-distinction')).toBe(true);
  });

  it('emits below-personal-mean only when the run trails the case mean', () => {
    const c = mkCase([{ id: 'd1', bestScore: 10 }]);
    const log: DecisionLogEntry[] = [
      { nodeId: 'n0', decisionId: 'd1', optionId: 'bad', scoreEarned: 2, maxScore: 10 },
    ];
    const d = buildDebrief({
      caseDef: c,
      log,
      priorBestRatio: 0.9,
      priorMeanRatio: 0.8,
      globalMeanRatio: 0.8,
      competencyTier: 'competent',
      resolveText,
    });
    expect(d.nextSteps.some((s) => s.key === 'below-personal-mean')).toBe(true);
  });

  it('falls back to review-log when no other steps apply', () => {
    const c = mkCase([{ id: 'd1', bestScore: 5 }]);
    const log: DecisionLogEntry[] = [
      { nodeId: 'n0', decisionId: 'd1', optionId: 'good', scoreEarned: 5, maxScore: 5 },
    ];
    const d = buildDebrief({
      caseDef: c,
      log,
      priorBestRatio: 1, // already at 100% — not a new best
      priorMeanRatio: 1,
      globalMeanRatio: 1,
      competencyTier: 'expert',
      resolveText,
    });
    expect(d.nextSteps[0].key).toBe('review-log');
  });

  it('citations dedupe by label and skip decisions with maxScore 0', () => {
    const c = mkCase([{ id: 'd1', bestScore: 5 }]);
    const log: DecisionLogEntry[] = [
      { nodeId: 'n0', decisionId: 'd1', optionId: 'good', scoreEarned: 5, maxScore: 5 },
      { nodeId: 'n0', decisionId: 'noscore', optionId: 'x', scoreEarned: 0, maxScore: 0 },
    ];
    const d = buildDebrief({
      caseDef: c,
      log,
      priorBestRatio: null,
      priorMeanRatio: null,
      globalMeanRatio: null,
      competencyTier: 'novice',
      resolveText,
    });
    expect(d.citations).toHaveLength(1);
    // maxScore 0 entry didn't add to misses or strengths.
    expect(d.misses).toHaveLength(0);
    expect(d.strengths).toHaveLength(1);
  });
});
