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

export const LOCALES: Array<{ code: Locale; nativeName: string; englishName: string }> = [
  { code: 'en', nativeName: 'English', englishName: 'English' },
  { code: 'zh', nativeName: '中文', englishName: 'Chinese (Simplified)' },
  { code: 'ms', nativeName: 'Bahasa Melayu', englishName: 'Malay' },
  { code: 'ta', nativeName: 'தமிழ்', englishName: 'Tamil' },
];

import { en } from './i18n/en';
import { zh } from './i18n/zh';
import { ms } from './i18n/ms';
import { ta } from './i18n/ta';

export type Dictionary = Record<string, string>;
const DICTS: Record<Locale, Dictionary> = { en, zh, ms, ta };

interface LocaleState {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

export const useLocale = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'en',
      setLocale: (l) => set({ locale: l }),
    }),
    { name: 'sg-pathway-locale-v1' },
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
  const raw = DICTS[locale]?.[key] ?? DICTS.en[key] ?? key;
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
    const raw = DICTS[locale]?.[key] ?? DICTS.en[key] ?? key;
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
