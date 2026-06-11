import { describe, it, expect } from 'vitest';
import {
  ACHIEVEMENTS,
  evaluate,
  getAchievement,
  type ProgressSnapshot,
  type Trigger,
} from './achievements';

const snap = (overrides: Partial<ProgressSnapshot> = {}): ProgressSnapshot => ({
  distinctionCount: 0,
  totalBuiltinCases: 20,
  playedBuiltinCaseIds: new Set(),
  completedCurriculumIds: new Set(),
  ...overrides,
});

describe('ACHIEVEMENTS catalogue', () => {
  it('has unique ids', () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('every achievement has a non-trivial title + description', () => {
    for (const a of ACHIEVEMENTS) {
      // A non-empty string of at least 3 characters — catches accidental
      // truncation (e.g. someone replacing description with a single
      // character) that the old truthy check would have missed.
      expect(a.title.length, `${a.id} title too short`).toBeGreaterThanOrEqual(3);
      expect(a.description.length, `${a.id} description too short`).toBeGreaterThanOrEqual(10);
      // Description should end with a sentence-terminator.
      expect(a.description, `${a.id} description not a sentence`).toMatch(/[.!?]$/);
    }
  });
});

describe('evaluate — case-completed', () => {
  const t: Trigger = { kind: 'case-completed', caseId: 'stemi', scoreRatio: 0.5, runsForThisCase: 1 };

  it('unlocks first-case on the first completion', () => {
    expect(evaluate(t, new Set(), snap())).toContain('first-case');
  });

  it("doesn't re-unlock first-case once unlocked", () => {
    const already = new Set(['first-case' as const]);
    expect(evaluate(t, already, snap())).not.toContain('first-case');
  });

  it('unlocks distinction at scoreRatio ≥ 0.9', () => {
    const hit = { ...t, scoreRatio: 0.91 };
    expect(evaluate(hit, new Set(), snap())).toContain('distinction');
    const miss = { ...t, scoreRatio: 0.89 };
    expect(evaluate(miss, new Set(), snap())).not.toContain('distinction');
  });

  it('unlocks triple-distinction once the snapshot reports ≥ 3', () => {
    const trip = evaluate(
      { ...t, scoreRatio: 0.95 },
      new Set(),
      snap({ distinctionCount: 3 }),
    );
    expect(trip).toContain('triple-distinction');
    expect(trip).toContain('distinction');
  });

  it('unlocks streak-master at runsForThisCase ≥ 3', () => {
    expect(
      evaluate({ ...t, runsForThisCase: 3 }, new Set(), snap()),
    ).toContain('streak-master');
  });

  it('unlocks daily-streak tiers as currentStreakDays rises', () => {
    const r3 = evaluate({ ...t, currentStreakDays: 3 }, new Set(), snap());
    expect(r3).toContain('daily-streak-3');
    expect(r3).not.toContain('daily-streak-7');

    const r7 = evaluate({ ...t, currentStreakDays: 7 }, new Set(), snap());
    expect(r7).toEqual(expect.arrayContaining(['daily-streak-3', 'daily-streak-7']));

    const r30 = evaluate({ ...t, currentStreakDays: 30 }, new Set(), snap());
    expect(r30).toEqual(expect.arrayContaining(['daily-streak-3', 'daily-streak-7', 'daily-streak-30']));
  });

  it('does not unlock daily-streak tiers when currentStreakDays is absent or 0', () => {
    expect(evaluate(t, new Set(), snap())).not.toContain('daily-streak-3');
    expect(
      evaluate({ ...t, currentStreakDays: 0 }, new Set(), snap()),
    ).not.toContain('daily-streak-3');
  });

  it('unlocks curriculum-graduate when any curriculum is complete', () => {
    expect(
      evaluate(t, new Set(), snap({ completedCurriculumIds: new Set(['cardio']) })),
    ).toContain('curriculum-graduate');
  });

  it('unlocks completionist once every built-in case has been played', () => {
    const all = new Set(Array.from({ length: 20 }, (_, i) => `c${i}`));
    expect(
      evaluate(t, new Set(), snap({ playedBuiltinCaseIds: all, totalBuiltinCases: 20 })),
    ).toContain('completionist');
  });
});

describe('evaluate — campaign-completed', () => {
  it('completing any campaign unlocks shift-complete', () => {
    const u = evaluate(
      { kind: 'campaign-completed', campaignId: 'ed-night-shift', passed: false },
      new Set(),
      snap(),
    );
    expect(u).toContain('shift-complete');
    expect(u).not.toContain('shift-passed');
  });
  it('passing the target ratio also unlocks shift-passed', () => {
    const u = evaluate(
      { kind: 'campaign-completed', campaignId: 'x', passed: true },
      new Set(),
      snap(),
    );
    expect(u).toEqual(expect.arrayContaining(['shift-complete', 'shift-passed']));
  });
});

describe('evaluate — ops + locale + content triggers', () => {
  it('ops-shift-ended unlocks tycoon; profit > 0 unlocks tycoon-profit too', () => {
    const u = evaluate({ kind: 'ops-shift-ended', netSGD: 1 }, new Set(), snap());
    expect(u).toEqual(expect.arrayContaining(['tycoon', 'tycoon-profit']));
  });
  it('ops-shift-ended in deficit unlocks only tycoon', () => {
    const u = evaluate({ kind: 'ops-shift-ended', netSGD: -1 }, new Set(), snap());
    expect(u).toContain('tycoon');
    expect(u).not.toContain('tycoon-profit');
  });
  it('polyglot fires only when the locale leaves English', () => {
    expect(evaluate({ kind: 'locale-changed', locale: 'zh' }, new Set(), snap())).toContain('polyglot');
    expect(evaluate({ kind: 'locale-changed', locale: 'en' }, new Set(), snap())).not.toContain('polyglot');
  });
  it('demo-opened unlocks open-mind', () => {
    expect(evaluate({ kind: 'demo-opened' }, new Set(), snap())).toContain('open-mind');
  });
  it('export-used unlocks educator', () => {
    expect(evaluate({ kind: 'export-used' }, new Set(), snap())).toContain('educator');
  });
  it('custom-content-added unlocks author', () => {
    expect(evaluate({ kind: 'custom-content-added' }, new Set(), snap())).toContain('author');
  });
});

describe('evaluate — walkthrough-completed (v9.16 third pathway, v11.x fourth pathway added)', () => {
  it('completing the STEMI walkthrough unlocks walk-stemi only', () => {
    const u = evaluate({ kind: 'walkthrough-completed', walkthroughId: 'stemi-pathway-v1' }, new Set(), snap());
    expect(u).toContain('walk-stemi');
    expect(u).not.toContain('walk-stroke');
    expect(u).not.toContain('walk-sepsis');
    expect(u).not.toContain('walk-trauma');
    expect(u).not.toContain('walk-multi-pathway');
  });
  it('completing the stroke walkthrough unlocks walk-stroke only', () => {
    const u = evaluate({ kind: 'walkthrough-completed', walkthroughId: 'stroke-pathway-v1' }, new Set(), snap());
    expect(u).toContain('walk-stroke');
    expect(u).not.toContain('walk-stemi');
    expect(u).not.toContain('walk-multi-pathway');
  });
  it('completing the sepsis walkthrough unlocks walk-sepsis only', () => {
    const u = evaluate({ kind: 'walkthrough-completed', walkthroughId: 'sepsis-pathway-v1' }, new Set(), snap());
    expect(u).toContain('walk-sepsis');
    expect(u).not.toContain('walk-stemi');
    expect(u).not.toContain('walk-multi-pathway');
  });
  it('completing the trauma walkthrough unlocks walk-trauma only', () => {
    const u = evaluate({ kind: 'walkthrough-completed', walkthroughId: 'trauma-pathway-v1' }, new Set(), snap());
    expect(u).toContain('walk-trauma');
    expect(u).not.toContain('walk-stemi');
    expect(u).not.toContain('walk-multi-pathway');
  });
  it('three of four pathways does NOT unlock multi-pathway', () => {
    const u = evaluate(
      { kind: 'walkthrough-completed', walkthroughId: 'sepsis-pathway-v1' },
      new Set(['walk-stemi', 'walk-stroke']),
      snap(),
    );
    expect(u).toContain('walk-sepsis');
    expect(u).not.toContain('walk-multi-pathway');
  });
  it('completing the final (fourth) pathway unlocks multi-pathway in the same pass', () => {
    const u = evaluate(
      { kind: 'walkthrough-completed', walkthroughId: 'trauma-pathway-v1' },
      new Set(['walk-stemi', 'walk-stroke', 'walk-sepsis']),
      snap(),
    );
    expect(u).toEqual(expect.arrayContaining(['walk-trauma', 'walk-multi-pathway']));
  });
  it('replaying an already-earned pathway unlocks nothing new', () => {
    const u = evaluate(
      { kind: 'walkthrough-completed', walkthroughId: 'stemi-pathway-v1' },
      new Set(['walk-stemi']),
      snap(),
    );
    expect(u).toEqual([]);
  });
  it('an unknown walkthrough id unlocks nothing', () => {
    const u = evaluate({ kind: 'walkthrough-completed', walkthroughId: 'meningitis-pathway-v1' }, new Set(), snap());
    expect(u).toEqual([]);
  });
});

describe('getAchievement', () => {
  it('returns by id', () => {
    expect(getAchievement('tycoon')?.title).toBe('Tycoon');
  });
  it('returns undefined for an unknown id', () => {
    expect(getAchievement('nope' as never)).toBeUndefined();
  });
});
