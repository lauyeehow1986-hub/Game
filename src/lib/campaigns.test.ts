import { describe, it, expect } from 'vitest';
import {
  CAMPAIGNS,
  campaignProgress,
  getCampaign,
  nextCaseInCampaign,
} from './campaigns';
import { cases } from '../content';

describe('CAMPAIGNS catalogue', () => {
  it('every campaign has ≥ 2 cases', () => {
    for (const c of CAMPAIGNS) expect(c.caseIds.length).toBeGreaterThanOrEqual(2);
  });
  it('ids are unique', () => {
    const ids = CAMPAIGNS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('every referenced case id resolves in the built-in catalogue', () => {
    for (const c of CAMPAIGNS) {
      for (const id of c.caseIds) {
        expect(cases[id], `${c.id} → ${id} not in catalogue`).toBeDefined();
      }
    }
  });
  it('passRatio is between 0 and 1', () => {
    for (const c of CAMPAIGNS) {
      expect(c.passRatio).toBeGreaterThan(0);
      expect(c.passRatio).toBeLessThanOrEqual(1);
    }
  });
});

describe('getCampaign', () => {
  it('returns by id', () => {
    expect(getCampaign('ed-night-shift')?.title).toContain('TTSH');
  });
  it('returns undefined for unknown id', () => {
    expect(getCampaign('nope')).toBeUndefined();
  });
});

const ed = getCampaign('ed-night-shift')!;

describe('campaignProgress', () => {
  it('reports 0/total for an empty progress map', () => {
    const p = campaignProgress(ed, {});
    expect(p.completed).toBe(0);
    expect(p.total).toBe(3);
    expect(p.ratio).toBe(0);
    expect(p.cumulativeScoreRatio).toBe(0);
  });
  it('sums ratios for completed cases', () => {
    const p = campaignProgress(ed, {
      'stemi-acute': { score: 10, max: 10 },
      'sepsis-bundle': { score: 5, max: 10 },
    });
    expect(p.completed).toBe(2);
    expect(p.cumulativeScoreRatio).toBeCloseTo(1.5);
    expect(p.ratio).toBeCloseTo(2 / 3);
  });
});

describe('nextCaseInCampaign', () => {
  it('returns the first unscored case', () => {
    expect(
      nextCaseInCampaign(ed, { 'stemi-acute': { score: 5, max: 10 } }),
    ).toBe('sepsis-bundle');
  });
  it('returns null when everything is scored', () => {
    expect(
      nextCaseInCampaign(ed, {
        'stemi-acute': { score: 1, max: 1 },
        'sepsis-bundle': { score: 1, max: 1 },
        'major-trauma': { score: 1, max: 1 },
      }),
    ).toBeNull();
  });
});
