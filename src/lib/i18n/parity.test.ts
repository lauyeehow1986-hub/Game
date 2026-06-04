import { describe, it, expect } from 'vitest';
import { en } from './en';
import { zh } from './zh';
import { ms } from './ms';
import { ta } from './ta';
import { LOCALES } from '../i18n';

/**
 * UI-chrome parity metric. English is the source of truth; every other locale
 * is measured against it. This test turns the previously-silent drift of the
 * official-language locales (Malay, Tamil) into a tracked, enforced number.
 *
 * Floors rise as the official-language track (docs/ROADMAP.md) lands:
 *   - 'full' locales must be exactly 100% (no missing, no extra keys).
 *   - 'partial' locales must clear a rising floor so they cannot regress.
 *
 * When v9.2 / v9.3 raise Malay / Tamil to parity, bump their floor to 1.0 and
 * flip their `coverage` to 'full' in LOCALES — this test will then enforce it.
 */

const enKeys = new Set(Object.keys(en));

/** Minimum UI-chrome coverage each partial locale must maintain. */
/**
 * Empty means every shipped locale is at full parity. When future partial
 * locales are scaffolded, add them here as `{ code: 0.NN }` and the floor
 * test will hold them above their introduction percentage.
 */
const PARTIAL_FLOOR: Record<string, number> = {};

function coverage(dict: Record<string, string>): number {
  let present = 0;
  for (const k of enKeys) if (dict[k]) present += 1;
  return present / enKeys.size;
}

function missing(dict: Record<string, string>): string[] {
  return [...enKeys].filter((k) => !dict[k]);
}

const DICTS: Record<string, Record<string, string>> = { en, zh, ms, ta };

describe('i18n UI-chrome parity', () => {
  it('English is the non-empty source of truth', () => {
    expect(enKeys.size).toBeGreaterThan(500);
  });

  it('full-coverage locales are at exact 100% parity with English', () => {
    for (const meta of LOCALES) {
      if (meta.coverage !== 'full' || meta.code === 'en') continue;
      const dict = DICTS[meta.code];
      const miss = missing(dict);
      expect(miss, `${meta.code} (declared 'full') missing ${miss.length}: ${miss.slice(0, 8).join(', ')}`).toEqual([]);
      // No stray keys that don't exist in English either.
      const extra = Object.keys(dict).filter((k) => !enKeys.has(k));
      expect(extra, `${meta.code} has keys absent from en: ${extra.slice(0, 8).join(', ')}`).toEqual([]);
    }
  });

  it('partial locales hold their coverage floor (no silent regression)', () => {
    for (const [code, floor] of Object.entries(PARTIAL_FLOOR)) {
      const cov = coverage(DICTS[code]);
      expect(
        cov,
        `${code} coverage ${(cov * 100).toFixed(1)}% dropped below floor ${(floor * 100).toFixed(0)}%`,
      ).toBeGreaterThanOrEqual(floor);
    }
  });

  it('every partial locale carries the partial-coverage hint keys', () => {
    for (const meta of LOCALES) {
      if (meta.coverage !== 'partial') continue;
      const dict = DICTS[meta.code];
      expect(dict['lang.partialMark'], `${meta.code} missing lang.partialMark`).toBeTruthy();
      expect(dict['lang.partialHint'], `${meta.code} missing lang.partialHint`).toBeTruthy();
    }
  });

  it('reports current coverage (informational — never fails)', () => {
    const report = LOCALES.map((m) => {
      const cov = m.code === 'en' ? 1 : coverage(DICTS[m.code]);
      return `${m.code}=${(cov * 100).toFixed(1)}%(${m.coverage})`;
    }).join('  ');
    // eslint-disable-next-line no-console
    console.info(`[i18n parity] ${report}  | en keys=${enKeys.size}`);
    expect(report).toContain('en=100.0%');
  });
});
