import { describe, it, expect } from 'vitest';
import { en } from './en';
import { zh } from './zh';
import { ms } from './ms';
import { ta } from './ta';

/**
 * Critical UI-chrome keys that MUST exist in every shipped locale so a
 * language switch never leaves a primary control showing a raw key. Feature
 * BODY text (rationales, hints) is allowed to fall back to English; this list
 * is navigation + entry points + verdicts only.
 */
const CRITICAL = [
  'common.close', 'common.start', 'common.cancel', 'common.confirm', 'common.score',
  'app.brand.short', 'app.brand.subtitle',
  'hud.mode.case', 'hud.mode.ops', 'hud.about', 'hud.language',
  'hud.perspective.patient', 'hud.perspective.caregiver', 'hud.perspective.staff',
  'cases.heading', 'cases.build', 'cases.random', 'cases.today', 'cases.importJson',
  'campaigns.heading', 'campaigns.start', 'campaigns.continue',
  'exam.heading', 'exam.preset.short', 'exam.preset.standard', 'exam.preset.osce',
  'exam.passed', 'exam.failed',
  'educator.open', 'educator.heading',
  'narration.speak', 'narration.auto',
  'assignment.start',
];

const LOCALES: Record<string, Record<string, string>> = { en, zh, ms, ta };

describe('i18n critical-key coverage', () => {
  it('English defines every critical key (the fallback source)', () => {
    for (const key of CRITICAL) {
      expect(en[key], `en missing ${key}`).toBeTruthy();
    }
  });

  for (const [name, dict] of Object.entries(LOCALES)) {
    it(`${name} defines every critical UI key`, () => {
      const missing = CRITICAL.filter((k) => !dict[k]);
      expect(missing, `${name} missing: ${missing.join(', ')}`).toEqual([]);
    });
  }

  it('no critical key is accidentally identical to its dotted key name', () => {
    for (const [name, dict] of Object.entries(LOCALES)) {
      for (const k of CRITICAL) {
        if (dict[k]) expect(dict[k], `${name}:${k} is just the key`).not.toBe(k);
      }
    }
  });
});
