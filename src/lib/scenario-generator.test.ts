import { describe, it, expect } from 'vitest';
import {
  generateScenario,
  generateScenarioFrom,
  conditionOptions,
  profileOptions,
  SCENARIO_CONDITION_COUNT,
} from './scenario-generator';
import { maxScoreForCase } from './scoring';

describe('generateScenario', () => {
  it('produces a valid case with two decision nodes', () => {
    const c = generateScenario(1);
    expect(c.pathway).toHaveLength(2);
    expect(c.pathway.every((n) => n.decision)).toBe(true);
    expect(c.id.startsWith('gen-')).toBe(true);
  });

  it('is deterministic for a given seed', () => {
    expect(generateScenario(42).id).toBe(generateScenario(42).id);
    expect(generateScenario(42).title).toEqual(generateScenario(42).title);
  });

  it('different seeds vary the scenario across the condition set', () => {
    const ids = new Set(
      Array.from({ length: 40 }, (_, i) => generateScenario(i).id.split('-')[1]),
    );
    // Should surface more than one distinct condition key.
    expect(ids.size).toBeGreaterThan(1);
  });

  it('every generated case is bilingual (en + zh title/blurb)', () => {
    for (let s = 0; s < 12; s++) {
      const c = generateScenario(s);
      const title = c.title as Record<string, string>;
      const blurb = c.blurb as Record<string, string>;
      expect(title.en && title.zh).toBeTruthy();
      expect(blurb.en && blurb.zh).toBeTruthy();
    }
  });

  it('has a positive achievable max score (a best answer exists)', () => {
    expect(maxScoreForCase(generateScenario(7))).toBeGreaterThan(0);
  });

  it('exposes a non-trivial condition library', () => {
    expect(SCENARIO_CONDITION_COUNT).toBeGreaterThanOrEqual(3);
  });
});

describe('generateScenarioFrom (Sandbox)', () => {
  it('honours an explicit condition + profile pick', () => {
    const cond = conditionOptions()[0].key;
    const prof = profileOptions()[0].key;
    const c = generateScenarioFrom({ conditionKey: cond, profileKey: prof, seed: 3 });
    expect(c.id).toContain(`gen-${cond}-`);
    expect(c.profileKey).toBe(prof);
  });

  it('falls back to random for unknown keys', () => {
    const c = generateScenarioFrom({ conditionKey: 'nope', profileKey: 'nope', seed: 1 });
    expect(c.pathway).toHaveLength(2);
  });

  it('condition + profile option lists are non-empty', () => {
    expect(conditionOptions().length).toBeGreaterThanOrEqual(3);
    expect(profileOptions().length).toBeGreaterThanOrEqual(3);
  });
});
