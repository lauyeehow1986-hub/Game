import { useEffect, useState } from 'react';
import { useT, useLocale, LOCALES, type Locale } from '../lib/i18n';
import { suggestLocale } from '../lib/case-locale-coverage';

const DISMISS_KEY = 'sg-pathway-lang-suggest-dismissed-v1';
/** The locale store's persist key — presence means the user already chose. */
const LOCALE_PERSIST_KEY = 'sg-pathway-locale-v1';

/**
 * First-run mother-tongue suggestion (v11.0 official-language track).
 * When the browser's preferred languages put a supported mother tongue
 * (zh / ms / ta) ahead of English AND the user has never picked a language,
 * offer a one-tap switch. Never nags: dismissing or choosing any language
 * silences it permanently.
 */
export function LanguageSuggestion() {
  const t = useT();
  const setLocale = useLocale((s) => s.setLocale);
  const [suggested, setSuggested] = useState<Locale | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(DISMISS_KEY) === '1') return;
    if (localStorage.getItem(LOCALE_PERSIST_KEY) !== null) return;
    const langs = navigator.languages ?? [navigator.language];
    setSuggested(suggestLocale(langs));
  }, []);

  if (!suggested) return null;

  const meta = LOCALES.find((l) => l.code === suggested);
  if (!meta) return null;

  const accept = () => {
    setLocale(suggested);
    localStorage.setItem(DISMISS_KEY, '1');
    setSuggested(null);
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setSuggested(null);
  };

  return (
    <div className="bg-clinical-accent/10 border-b border-clinical-accent/40 px-4 py-1.5 text-[11px] text-clinical-accent flex items-center gap-3">
      <span className="font-semibold uppercase tracking-wider text-[10px]">
        {t('langSuggest.tag')}
      </span>
      <span className="flex-1 text-white/85">
        {t('langSuggest.body', { language: meta.nativeName })}
      </span>
      <button
        onClick={accept}
        className="px-2 py-0.5 rounded bg-clinical-accent text-white font-semibold hover:brightness-110 text-[10px]"
      >
        {meta.nativeName}
      </button>
      <button
        onClick={dismiss}
        className="px-2 py-0.5 rounded border border-clinical-accent/40 text-clinical-accent hover:text-white text-[10px]"
      >
        {t('langSuggest.dismiss')}
      </button>
    </div>
  );
}
