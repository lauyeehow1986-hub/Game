/**
 * Tiny dependency-free i18n. Strings keyed by dot-separated paths;
 * the active locale falls back to English when a key is missing.
 *
 * Singapore is officially multi-lingual; this layer covers the UI
 * shell (HUD, panels, buttons, modal headers). Case content remains
 * English-authored — cases that want to ship translations can carry
 * per-locale framing in their own JSON shape (future work).
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LocalisedString } from './types';

export type Locale = 'en' | 'zh' | 'ms' | 'ta';

/**
 * `coverage` flags how complete a locale is so the UI can be honest about it.
 * Singapore has four official languages; English and Chinese are at full
 * parity (UI chrome + every case), while Malay and Tamil are being brought up
 * to parity on the official-language track (see docs/ROADMAP.md). 'full' means
 * UI chrome + case content; 'partial' means UI chrome is still being completed
 * and case content falls back to English.
 */
export type LocaleCoverage = 'full' | 'partial';

export interface LocaleMeta {
  code: Locale;
  nativeName: string;
  englishName: string;
  coverage: LocaleCoverage;
}

export const LOCALES: LocaleMeta[] = [
  { code: 'en', nativeName: 'English', englishName: 'English', coverage: 'full' },
  { code: 'zh', nativeName: '中文', englishName: 'Chinese (Simplified)', coverage: 'full' },
  { code: 'ms', nativeName: 'Bahasa Melayu', englishName: 'Malay', coverage: 'full' },
  { code: 'ta', nativeName: 'தமிழ்', englishName: 'Tamil', coverage: 'full' },
];

// English is the fallback chain and is always needed, so it stays in the
// main bundle. The other locales' catalogues are lazy — they only get
// fetched when the user actually switches (or rehydrates a non-en preference).
import { en } from './i18n/en';

export type Dictionary = Record<string, string>;
const DICTS: Partial<Record<Locale, Dictionary>> = { en };

const LOADERS: Record<Exclude<Locale, 'en'>, () => Promise<{ default?: Dictionary } & Record<string, Dictionary>>> = {
  zh: () => import('./i18n/zh'),
  ms: () => import('./i18n/ms'),
  ta: () => import('./i18n/ta'),
};

/**
 * Async-loads a locale catalogue and parks it in DICTS. Returns once the
 * dict is available so subsequent t() calls hit the new locale.
 *
 * Subscribers re-render via useLocale changing — after the dict lands we
 * nudge useLocale to trigger that re-render even though the value is the
 * same (zustand bails on === so we round-trip through a stale object).
 */
export async function loadLocale(l: Locale): Promise<void> {
  if (l === 'en' || DICTS[l]) return;
  const mod = await LOADERS[l]();
  // The catalogues are exported as named bindings whose name matches the locale.
  DICTS[l] = (mod as Record<string, Dictionary>)[l];
  // Force a re-render of components subscribing to useLocale.
  useLocale.setState({ locale: useLocale.getState().locale });
}

interface LocaleState {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

export const useLocale = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'en',
      setLocale: (l) => {
        set({ locale: l });
        // Fire and forget — t() falls back to English until the chunk arrives.
        void loadLocale(l);
      },
    }),
    {
      name: 'sg-pathway-locale-v1',
      onRehydrateStorage: () => (state) => {
        if (state && state.locale !== 'en') void loadLocale(state.locale);
      },
    },
  ),
);

/**
 * Lookup a translation. Falls back to English, then to the key string itself.
 *
 * Supports {{var}} interpolation:
 *   t('hud.cashOop', { value: 1234 })  // "Cash OOP so far: S$1234"
 */
export function t(key: string, vars?: Record<string, string | number>): string {
  const locale = useLocale.getState().locale;
  const raw = DICTS[locale]?.[key] ?? DICTS.en?.[key] ?? key;
  return interpolate(raw, vars);
}

/**
 * React hook that re-renders when the locale changes. Components should
 * pull `t` (the translator function) from this hook rather than calling
 * the bare `t` so they update on language switch.
 */
export function useT(): (key: string, vars?: Record<string, string | number>) => string {
  const locale = useLocale((s) => s.locale);
  return (key: string, vars?: Record<string, string | number>) => {
    const raw = DICTS[locale]?.[key] ?? DICTS.en?.[key] ?? key;
    return interpolate(raw, vars);
  };
}

function interpolate(s: string, vars?: Record<string, string | number>): string {
  if (!vars) return s;
  return s.replace(/\{\{(\w+)\}\}/g, (_, k: string) =>
    String(vars[k] ?? `{{${k}}}`),
  );
}

/**
 * Resolve a LocalisedString to a plain string for rendering.
 *  - Plain string passes through.
 *  - Object form: picks the current locale, falls back to English, then to
 *    the first non-empty value, then to ''.
 */
export function tr(value: LocalisedString | undefined, locale?: Locale): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  const loc = locale ?? useLocale.getState().locale;
  if (value[loc]) return value[loc] as string;
  if (value.en) return value.en;
  const first = Object.values(value).find((v) => typeof v === 'string' && v.length > 0);
  return (first as string) ?? '';
}

/**
 * React hook returning a translator that reactively re-renders on locale
 * change. Use this inside components for LocalisedString fields on cases.
 */
export function useTr(): (value: LocalisedString | undefined) => string {
  const locale = useLocale((s) => s.locale);
  return (value) => tr(value, locale);
}
