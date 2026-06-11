/**
 * Walkthrough localisation — overlay translation packs (v9.12 unhold).
 *
 * The Walkthrough data model stores plain English strings (titles, beat
 * actions, branch prompts, actor roles/bios) so the engine and all three
 * renderers stay string-agnostic. Localisation is therefore an *overlay*: a
 * per-walkthrough translation pack maps locales to replacement strings, and
 * `localiseWalkthrough` returns a new Walkthrough with the strings swapped.
 * Anything missing from the pack falls back to English — partial packs are
 * first-class, exactly like the case-content coverage model.
 *
 * Packs live in sibling modules (`walkthrough-{id}.i18n.ts`) so the English
 * pathway chunk stays lean; the pack is only fetched when the UI locale is
 * not English. Machine-assisted packs are flagged so learners are never
 * misled (same parity bar as docs/REMAINING.md §2).
 */
import type { Locale } from './i18n';
import type { Walkthrough, WalkthroughChapter } from './walkthrough';

export interface ChapterTranslation {
  title?: string;
  location?: string;
  /** Beat action strings, by beat index (must match the chapter's beat
   *  order; shape-parity is enforced by tests). Sparse entries fall back. */
  beats?: (string | undefined)[];
  branchPrompt?: string;
  /** Branch option label/hint, by option index. */
  branchOptions?: ({ label?: string; hint?: string } | undefined)[];
}

export interface WalkthroughTranslation {
  title?: string;
  chapters?: Record<string, ChapterTranslation>;
  /** Keyed by the actors-map key (e.g. 'patient'), not the sprite id. */
  actors?: Record<string, { role?: string; bio?: string }>;
}

export interface WalkthroughI18nPack {
  walkthroughId: string;
  /** True while the strings are machine-assisted pending native review. */
  machineAssisted: boolean;
  locales: Partial<Record<Exclude<Locale, 'en'>, WalkthroughTranslation>>;
}

/**
 * Return a copy of `w` with strings replaced from the pack for `locale`.
 * English (or a missing locale/pack) returns the input unchanged. Never
 * mutates the source walkthrough — renderers may hold references to it.
 */
export function localiseWalkthrough(
  w: Walkthrough,
  pack: WalkthroughI18nPack | null | undefined,
  locale: Locale,
): Walkthrough {
  if (locale === 'en' || !pack || pack.walkthroughId !== w.id) return w;
  const tr = pack.locales[locale as Exclude<Locale, 'en'>];
  if (!tr) return w;

  const actors: Walkthrough['actors'] = {};
  for (const [key, actor] of Object.entries(w.actors)) {
    const a = tr.actors?.[key];
    actors[key] = a ? { ...actor, role: a.role ?? actor.role, bio: a.bio ?? actor.bio } : actor;
  }

  const chapters: Walkthrough['chapters'] = {};
  for (const [id, c] of Object.entries(w.chapters)) {
    const ct = tr.chapters?.[id];
    if (!ct) {
      chapters[id] = c;
      continue;
    }
    const next: WalkthroughChapter = {
      ...c,
      title: ct.title ?? c.title,
      location: ct.location ?? c.location,
      beats: c.beats.map((b, i) => {
        const action = ct.beats?.[i];
        return action ? { ...b, action } : b;
      }),
    };
    if (c.branchPoint) {
      next.branchPoint = {
        prompt: ct.branchPrompt ?? c.branchPoint.prompt,
        options: c.branchPoint.options.map((opt, i) => {
          const o = ct.branchOptions?.[i];
          return o
            ? { ...opt, label: o.label ?? opt.label, hint: o.hint ?? opt.hint }
            : opt;
        }),
      };
    }
    chapters[id] = next;
  }

  return { ...w, title: tr.title ?? w.title, chapters, actors };
}

export interface WalkthroughI18nCoverage {
  /** Translated string count for the locale. */
  localised: number;
  /** Total translatable strings in the walkthrough. */
  total: number;
  ratio: number;
}

/** Measure how much of `w` the pack covers for `locale` (honesty meter). */
export function walkthroughI18nCoverage(
  w: Walkthrough,
  pack: WalkthroughI18nPack | null | undefined,
  locale: Locale,
): WalkthroughI18nCoverage {
  let total = 1; // walkthrough title
  let localised = 0;
  const tr =
    locale !== 'en' && pack && pack.walkthroughId === w.id
      ? pack.locales[locale as Exclude<Locale, 'en'>]
      : undefined;
  if (locale === 'en') {
    // English is the source of truth — always full.
    const count = countTranslatable(w);
    return { localised: count, total: count, ratio: 1 };
  }
  if (tr?.title) localised += 1;
  for (const [key, actor] of Object.entries(w.actors)) {
    total += 1; // role (always present)
    if (tr?.actors?.[key]?.role) localised += 1;
    if (actor.bio) {
      total += 1;
      if (tr?.actors?.[key]?.bio) localised += 1;
    }
  }
  for (const [id, c] of Object.entries(w.chapters)) {
    const ct = tr?.chapters?.[id];
    total += 1; // chapter title
    if (ct?.title) localised += 1;
    if (c.location) {
      total += 1;
      if (ct?.location) localised += 1;
    }
    for (let i = 0; i < c.beats.length; i += 1) {
      total += 1;
      if (ct?.beats?.[i]) localised += 1;
    }
    if (c.branchPoint) {
      total += 1;
      if (ct?.branchPrompt) localised += 1;
      for (let i = 0; i < c.branchPoint.options.length; i += 1) {
        total += 1; // label
        if (ct?.branchOptions?.[i]?.label) localised += 1;
        if (c.branchPoint.options[i].hint) {
          total += 1;
          if (ct?.branchOptions?.[i]?.hint) localised += 1;
        }
      }
    }
  }
  return { localised, total, ratio: total > 0 ? localised / total : 0 };
}

/**
 * Lazy translation-pack registry. Each pack lives in its own module so it is
 * fetched only when a non-English locale needs it — the English pathway chunk
 * never pays for translations. Packs land here as the v9.12 track advances.
 */
export const WALKTHROUGH_I18N_PACKS: Record<string, () => Promise<WalkthroughI18nPack>> = {
  'sepsis-pathway-v1': () => import('./walkthrough-sepsis.i18n').then((m) => m.sepsisI18nPack),
};

function countTranslatable(w: Walkthrough): number {
  let total = 1;
  for (const actor of Object.values(w.actors)) {
    total += 1; // role
    if (actor.bio) total += 1;
  }
  for (const c of Object.values(w.chapters)) {
    total += 1;
    if (c.location) total += 1;
    total += c.beats.length;
    if (c.branchPoint) {
      total += 1;
      for (const opt of c.branchPoint.options) {
        total += 1;
        if (opt.hint) total += 1;
      }
    }
  }
  return total;
}
