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
  it('every achievement has a title + description', () => {
    for (const a of ACHIEVEMENTS) {
      expect(a.title).toBeTruthy();
      expect(a.description).toBeTruthy();
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

describe('getAchievement', () => {
  it('returns by id', () => {
    expect(getAchievement('tycoon')?.title).toBe('Tycoon');
  });
  it('returns undefined for an unknown id', () => {
    expect(getAchievement('nope' as never)).toBeUndefined();
  });
});
