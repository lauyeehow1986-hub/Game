import { scanGlossary } from '../lib/glossary';
import { useLocale } from '../lib/i18n';

/**
 * Render a plain string with glossary terms wrapped as dotted-underline
 * <abbr> spans whose title attribute carries the definition. Native
 * browser tooltip — no extra JS, accessible by default, doesn't fight the
 * keyboard nav we have elsewhere.
 *
 * Only activates when the active locale is English; glossary entries are
 * English-only and matching Chinese / Malay / Tamil prose for English
 * terms would produce noise.
 */
export function GlossaryText({ children }: { children: string | undefined | null }) {
  const locale = useLocale((s) => s.locale);
  if (!children) return null;
  if (locale !== 'en') return <>{children}</>;
  const tokens = scanGlossary(children);
  if (tokens.length === 0) return null;
  return (
    <>
      {tokens.map((tok, i) =>
        tok.kind === 'term' && tok.def ? (
          <abbr
            key={i}
            title={tok.def}
            className="cursor-help underline decoration-dotted decoration-clinical-accent/70 underline-offset-2"
            style={{ textDecorationStyle: 'dotted' }}
          >
            {tok.text}
          </abbr>
        ) : (
          <span key={i}>{tok.text}</span>
        ),
      )}
    </>
  );
}
