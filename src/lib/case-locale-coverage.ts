/**
 * Case-content locale coverage — the honesty meter behind the language
 * switcher (v11.0 official-language track).
 *
 * UI-chrome parity is enforced separately (src/lib/i18n/parity.test.ts).
 * This module measures the *case content* axis: what fraction of each
 * case's learner-facing strings (title, blurb, node framing, decision
 * prompts, option labels, rationales, outcomes, guideline refs) actually
 * carry a given locale. The switcher uses it to flag partially-translated
 * locales so learners are never misled, per the parity bar in
 * docs/REMAINING.md §2.
 */
import type { CaseDefinition, LocalisedString } from './types';
import type { Locale } from './i18n';

export interface LocaleStringStats {
  /** Translatable strings in the case (non-empty English source). */
  total: number;
  /** Strings carrying a non-empty value for the locale. */
  localised: number;
}

/** A single case counts as localised when every translatable string carries
 *  the locale. The threshold is deliberately strict — "mostly translated"
 *  still falls back to English mid-case, which is what we want to surface. */
export function caseHasLocale(c: CaseDefinition, locale: Locale): boolean {
  const s = caseLocaleStats(c, locale);
  return s.total === 0 || s.localised === s.total;
}

/** Count translatable vs locale-carrying strings across a case. */
export function caseLocaleStats(c: CaseDefinition, locale: Locale): LocaleStringStats {
  const stats: LocaleStringStats = { total: 0, localised: 0 };
  const visit = (v: LocalisedString | undefined) => {
    if (v == null) return;
    if (typeof v === 'string') {
      if (v.length === 0) return;
      stats.total += 1;
      if (locale === 'en') stats.localised += 1;
      return;
    }
    if (!v.en) return; // intentionally blank field — not translatable
    stats.total += 1;
    if (v[locale]) stats.localised += 1;
  };

  visit(c.title);
  visit(c.blurb);
  for (const g of c.guidelines ?? []) {
    visit(g.label);
    visit(g.body);
  }
  for (const node of c.pathway) {
    if (node.framing) for (const f of Object.values(node.framing)) visit(f);
    const d = node.decision;
    if (!d) continue;
    visit(d.prompt);
    visit(d.reference?.label);
    visit(d.reference?.body);
    for (const o of d.options) {
      visit(o.label);
      visit(o.rationale);
      if (o.outcome) for (const out of Object.values(o.outcome)) visit(out);
    }
  }
  return stats;
}

export interface ContentCoverage {
  /** Total shipped cases. */
  cases: number;
  /** Cases fully carrying the locale. */
  localisedCases: number;
  /** localisedCases / cases (1 when there are no cases). */
  caseRatio: number;
  /** Aggregate per-string ratio across all cases. */
  stringRatio: number;
}

export function contentCoverage(cases: CaseDefinition[], locale: Locale): ContentCoverage {
  let localisedCases = 0;
  let total = 0;
  let localised = 0;
  for (const c of cases) {
    const s = caseLocaleStats(c, locale);
    total += s.total;
    localised += s.localised;
    if (s.total === 0 || s.localised === s.total) localisedCases += 1;
  }
  return {
    cases: cases.length,
    localisedCases,
    caseRatio: cases.length === 0 ? 1 : localisedCases / cases.length,
    stringRatio: total === 0 ? 1 : localised / total,
  };
}

/**
 * First-run mother-tongue suggestion: map the browser's preferred languages
 * to a supported non-English locale. Returns null when English (or nothing
 * recognisable) wins — no banner in that case. Pure for testability.
 */
export function suggestLocale(navLanguages: readonly string[]): Exclude<Locale, 'en'> | null {
  for (const tag of navLanguages) {
    const primary = (tag ?? '').toLowerCase().split('-')[0];
    if (primary === 'en') return null; // English preferred — stop looking
    if (primary === 'zh' || primary === 'ms' || primary === 'ta') return primary;
  }
  return null;
}
