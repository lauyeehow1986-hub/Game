import { describe, it, expect } from 'vitest';
import {
  caseHasLocale,
  caseLocaleStats,
  contentCoverage,
  suggestLocale,
} from './case-locale-coverage';
import { listCases } from '../content';
import type { CaseDefinition } from './types';

const tinyCase = (over: Partial<CaseDefinition> = {}): CaseDefinition =>
  ({
    id: 'tiny',
    title: { en: 'T', zh: '题' },
    blurb: { en: 'B', zh: '简' },
    category: 'acute',
    primaryFacility: 'ttsh',
    involvedFacilities: ['ttsh'],
    profileKey: 'diabeticUncle',
    allowsWardChoice: false,
    guidelines: [],
    pathway: [
      {
        id: 'n1',
        department: 'ed',
        framing: {
          patient: { en: 'p', zh: 'p-zh' },
          caregiver: { en: 'c', zh: 'c-zh' },
          staff: { en: 's', zh: 's-zh' },
        },
      },
    ],
    ...over,
  }) as CaseDefinition;

describe('caseLocaleStats', () => {
  it('counts every non-empty English string as translatable', () => {
    const s = caseLocaleStats(tinyCase(), 'zh');
    expect(s.total).toBe(5); // title, blurb, 3 framings
    expect(s.localised).toBe(5);
  });

  it('treats plain strings as English-only', () => {
    const c = tinyCase({ title: 'Plain title' as never });
    expect(caseLocaleStats(c, 'en').localised).toBeGreaterThan(0);
    const zh = caseLocaleStats(c, 'zh');
    expect(zh.localised).toBe(zh.total - 1);
  });

  it('skips intentionally-blank fields (empty en)', () => {
    const c = tinyCase();
    (c.pathway[0].framing as Record<string, unknown>).staff = { en: '', zh: '' };
    expect(caseLocaleStats(c, 'zh').total).toBe(4);
  });

  it('English is always fully localised', () => {
    for (const c of listCases()) {
      expect(caseHasLocale(c, 'en'), c.id).toBe(true);
    }
  });
});

describe('contentCoverage', () => {
  it('zh coverage floor — authored bilingual, must not regress', () => {
    const cov = contentCoverage(listCases(), 'zh');
    expect(cov.cases).toBeGreaterThan(30);
    // History: zh was long advertised as "every case" but the meter exposed
    // it at ~93.7% — the one untranslated case was stemi-acute, whose later
    // pathway nodes used plain English strings. That gap is now closed: zh
    // carries every translatable string in every case. Floor at full parity;
    // this only ever ratchets up.
    expect(cov.stringRatio).toBe(1);
    expect(cov.caseRatio).toBe(1);
  });

  it('reports ms/ta partial coverage without throwing', () => {
    for (const locale of ['ms', 'ta'] as const) {
      const cov = contentCoverage(listCases(), locale);
      expect(cov.cases).toBeGreaterThan(30);
      expect(cov.caseRatio).toBeGreaterThanOrEqual(0);
      expect(cov.caseRatio).toBeLessThanOrEqual(1);
      expect(cov.stringRatio).toBeLessThanOrEqual(1);
    }
  });

  it('ms/ta coverage floor — the v10.x track only moves up', () => {
    // Primary-care / public-health cases first, then the acute flagship
    // (stemi-acute) joined the fully-localised set. Raise these floors as
    // more cases are translated; never lower.
    expect(contentCoverage(listCases(), 'ms').localisedCases).toBeGreaterThanOrEqual(3);
    expect(contentCoverage(listCases(), 'ta').localisedCases).toBeGreaterThanOrEqual(3);
  });
});

describe('suggestLocale', () => {
  it('suggests the first supported mother tongue', () => {
    expect(suggestLocale(['zh-CN', 'en'])).toBe('zh');
    expect(suggestLocale(['ms'])).toBe('ms');
    expect(suggestLocale(['ta-SG', 'en-SG'])).toBe('ta');
  });

  it('returns null when English is preferred', () => {
    expect(suggestLocale(['en-SG', 'zh-CN'])).toBeNull();
    expect(suggestLocale(['en'])).toBeNull();
  });

  it('returns null for unsupported or empty language lists', () => {
    expect(suggestLocale(['fr-FR', 'de'])).toBeNull();
    expect(suggestLocale([])).toBeNull();
  });

  it('skips unsupported tags before finding a supported one', () => {
    expect(suggestLocale(['fr-FR', 'ta-IN'])).toBe('ta');
  });
});
