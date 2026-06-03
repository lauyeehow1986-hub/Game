import { describe, expect, it } from 'vitest';
import { buildPortfolio } from './portfolio';
import { DEFAULT_TARGETS } from './learning-goals';
import type { CaseDefinition, RunHistoryEntry } from './types';

const NOW = new Date(2026, 5, 3, 12).getTime();

function mkCase(id: string, title: string): CaseDefinition {
  return {
    id,
    title: { en: title, zh: '' },
    blurb: { en: '', zh: '' },
    category: 'acute',
    primaryFacility: 'ttsh',
    guidelines: [],
    pathway: [],
  } as unknown as CaseDefinition;
}

describe('portfolio', () => {
  it('rolls up empty progress into a portfolio with anonymous learner', () => {
    const p = buildPortfolio({
      learnerName: '   ',
      generatedAt: NOW,
      bestScores: {},
      runHistory: {},
      decisionNotes: {},
      bookmarks: {},
      catalogue: [],
      goals: DEFAULT_TARGETS,
      unlockedAchievements: [],
      resolveTitle: () => '',
      resolveDecisionPrompt: () => null,
    });
    expect(p.learnerName).toBe('Anonymous learner');
    expect(p.totals.played).toBe(0);
    expect(p.totals.distinctions).toBe(0);
    expect(p.competency.tier).toBe('novice');
    expect(p.topCases).toHaveLength(0);
  });

  it('computes mean, distinction count and ranks top cases', () => {
    const catalogue = [mkCase('a', 'A case'), mkCase('b', 'B case'), mkCase('c', 'C case')];
    const bestScores = {
      a: { score: 95, max: 100, at: NOW },
      b: { score: 60, max: 100, at: NOW },
      c: { score: 90, max: 100, at: NOW },
    };
    const runHistory: Record<string, RunHistoryEntry[]> = {
      a: [{ score: 95, max: 100, at: NOW, log: [{ nodeId: 'n', decisionId: 'd', optionId: 'o', scoreEarned: 1, maxScore: 1 }] }],
    };
    const p = buildPortfolio({
      learnerName: 'Dr. X',
      generatedAt: NOW,
      bestScores,
      runHistory,
      decisionNotes: {},
      bookmarks: {},
      catalogue,
      goals: DEFAULT_TARGETS,
      unlockedAchievements: ['ach-1'],
      resolveTitle: (c) => (c.title as { en: string }).en,
      resolveDecisionPrompt: () => null,
    });
    expect(p.totals.played).toBe(3);
    expect(p.totals.distinctions).toBe(2);
    expect(p.totals.achievements).toBe(1);
    expect(p.totals.decisionsLogged).toBe(1);
    expect(p.meanRatio).toBeCloseTo((0.95 + 0.6 + 0.9) / 3, 5);
    expect(p.topCases[0].caseId).toBe('a');
    expect(p.topCases[2].caseId).toBe('b');
  });

  it('caps recent reflections + bookmarks to 5', () => {
    const catalogue = Array.from({ length: 8 }, (_, i) => mkCase(`c${i}`, `Case ${i}`));
    const decisionNotes = Object.fromEntries(
      Array.from({ length: 8 }, (_, i) => [`c${i}|d`, `note ${i}`]),
    );
    const bookmarks = Object.fromEntries(
      Array.from({ length: 8 }, (_, i) => [
        `c${i}|d`,
        { caseId: `c${i}`, decisionId: 'd', addedAt: NOW - i * 60_000 },
      ]),
    );
    const p = buildPortfolio({
      learnerName: 'a',
      generatedAt: NOW,
      bestScores: {},
      runHistory: {},
      decisionNotes,
      bookmarks,
      catalogue,
      goals: DEFAULT_TARGETS,
      unlockedAchievements: [],
      resolveTitle: (c) => (c.title as { en: string }).en,
      resolveDecisionPrompt: () => 'prompt',
    });
    expect(p.recentReflections).toHaveLength(5);
    expect(p.recentBookmarks).toHaveLength(5);
    // Bookmarks sorted newest-first.
    expect(p.recentBookmarks[0].caseId).toBe('c0');
  });

  it('skips empty reflection text', () => {
    const catalogue = [mkCase('a', 'A')];
    const p = buildPortfolio({
      learnerName: 'a',
      generatedAt: NOW,
      bestScores: {},
      runHistory: {},
      decisionNotes: { 'a|d1': '   ', 'a|d2': 'real note' },
      bookmarks: {},
      catalogue,
      goals: DEFAULT_TARGETS,
      unlockedAchievements: [],
      resolveTitle: (c) => (c.title as { en: string }).en,
      resolveDecisionPrompt: () => null,
    });
    expect(p.recentReflections).toHaveLength(1);
    expect(p.recentReflections[0].text).toBe('real note');
  });
});
