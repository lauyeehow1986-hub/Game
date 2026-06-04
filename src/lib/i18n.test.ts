import { afterEach, beforeAll, describe, it, expect } from 'vitest';
import { loadLocale, t, tr, useLocale, type Locale } from './i18n';

// Non-en catalogues are lazy in production. Preload them here so the
// synchronous t() assertions below see the dicts immediately.
beforeAll(async () => {
  await Promise.all([loadLocale('zh'), loadLocale('ms'), loadLocale('ta')]);
});

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

  it('falls back to English when the key is missing in the active locale', async () => {
    // Now that every shipped locale is at full parity (v9.3), exercising the
    // en-fallback path requires temporarily removing a key from the target
    // dict. The fallback chain is locale → en → bare key.
    const { ta } = await import('./i18n/ta');
    const key = 'common.start';
    const original = ta[key];
    delete (ta as Record<string, string>)[key];
    try {
      setLocale('ta');
      expect(t(key)).toBe('Start'); // English value
    } finally {
      (ta as Record<string, string>)[key] = original;
    }
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

describe('tr() LocalisedString resolver', () => {
  it('passes a plain string through unchanged', () => {
    expect(tr('hello', 'en')).toBe('hello');
    expect(tr('hello', 'zh')).toBe('hello');
  });

  it('returns the chosen locale when present', () => {
    expect(tr({ en: 'cat', zh: '猫' }, 'zh')).toBe('猫');
    expect(tr({ en: 'cat', zh: '猫' }, 'en')).toBe('cat');
  });

  it('falls back to English when the chosen locale is missing', () => {
    expect(tr({ en: 'cat' }, 'ta')).toBe('cat');
  });

  it('falls back to the first available string when English missing', () => {
    expect(tr({ zh: '猫' }, 'ta')).toBe('猫');
  });

  it('returns empty string for undefined / empty object', () => {
    expect(tr(undefined, 'en')).toBe('');
    expect(tr({}, 'en')).toBe('');
  });
});
