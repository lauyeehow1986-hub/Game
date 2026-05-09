import { afterEach, describe, it, expect } from 'vitest';
import { t, useLocale, type Locale } from './i18n';

function setLocale(l: Locale) {
  useLocale.setState({ locale: l });
}

afterEach(() => setLocale('en'));

describe('t()', () => {
  it('returns the English string by default', () => {
    expect(t('common.start')).toBe('Start');
  });

  it('switches to Chinese when the locale is zh', () => {
    setLocale('zh');
    expect(t('common.start')).toBe('开始');
  });

  it('falls back to English when the key is missing in the active locale', () => {
    setLocale('ta');
    // Tamil dict doesn't define every key — pick one we know is en-only.
    expect(t('about.financing.body')).toContain('stylised heuristics');
  });

  it('returns the bare key when truly unknown', () => {
    setLocale('en');
    expect(t('definitely.not.a.key')).toBe('definitely.not.a.key');
  });

  it('interpolates {{var}} placeholders', () => {
    setLocale('en');
    const out = t('cases.shareToast.urlImported', { title: 'Demo' });
    expect(out).toContain('Demo');
    expect(out).not.toContain('{{title}}');
  });

  it('interpolation preserves missing var as a placeholder', () => {
    setLocale('en');
    const out = t('cases.shareToast.urlImported');
    expect(out).toContain('{{title}}');
  });

  it('all common.* keys present in every shipped locale', () => {
    const required = ['common.start', 'common.cancel', 'common.confirm'];
    const locales: Locale[] = ['en', 'zh', 'ms', 'ta'];
    for (const l of locales) {
      setLocale(l);
      for (const key of required) {
        expect(t(key), `${l}:${key}`).not.toBe(key);
      }
    }
  });
});
