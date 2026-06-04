/**
 * Walkthrough — data model for the Bandersnatch-style scrubbable cinematic.
 *
 * A Walkthrough is a directed graph of Chapters. Each Chapter plays for a
 * fixed duration; during play, ordered Beats fire at their declared offsets
 * (each beat positions an Actor doing an Action). At the end of a Chapter,
 * if a BranchPoint is set, the learner is prompted to pick; their choice
 * selects the nextChapterId. Without a branch point, the Chapter advances
 * to its `defaultNextChapterId`.
 *
 * The renderer is intentionally pluggable — v9.4 ships an SVG/React renderer
 * so the model is end-to-end testable; v9.5 swaps in a Phaser canvas + MP4
 * clip support without changing this module.
 */

export type ActorTeam =
  | 'patient'
  | 'bystander'
  | 'first-responder'
  | 'ambulance'
  | 'ed'
  | 'cath'
  | 'ward'
  | 'rehab'
  | 'outpatient'
  | 'support';

export interface WalkthroughActor {
  id: string;
  /** Display name (i18n key OR literal English string). */
  role: string;
  team: ActorTeam;
  /** Long-form role description (i18n key OR literal English). */
  bio: string;
  /** Optional colour swatch for the SVG/Phaser sprite. */
  swatch?: string;
}

/** Body pose for a beat — staged figure (kneeling, CPR, collapsed, …). */
export type BeatPose = 'stand' | 'walk' | 'kneel' | 'sit' | 'cpr' | 'collapsed' | 'point';

/** Facial expression for a beat. */
export type BeatExpression =
  | 'neutral'
  | 'alarmed'
  | 'distressed'
  | 'pained'
  | 'focused'
  | 'relieved'
  | 'unconscious';

export interface WalkthroughBeat {
  /** Seconds from the start of the containing Chapter. */
  at: number;
  actorId: string;
  /** Short prose of what they do at this beat (i18n key or literal). */
  action: string;
  /** Scene-relative camera focus (0..1 normalised). */
  focus?: { x: number; y: number };
  /** Optional facing direction (default 'S' = facing camera). */
  direction?: 'N' | 'S' | 'E' | 'W';
  /** When true, the sprite plays the walk cycle in addition to the
   *  interaction loop. Use for beats where the actor moves between
   *  stations (e.g., paramedic wheeling the trolley). */
  walking?: boolean;
  /** Explicit stage position (480×270 stage units). When omitted the
   *  renderer falls back to a deterministic staging arc. Lets a chapter
   *  choreograph exactly where each figure stands in the scene. */
  pos?: { x: number; y: number };
  /** Body pose for this beat (default 'stand'). */
  pose?: BeatPose;
  /** Facial expression for this beat (default 'neutral'). */
  expression?: BeatExpression;
}

export interface WalkthroughBranchOption {
  /** Label for the choice (i18n key or literal). */
  label: string;
  /** Optional rationale text shown beneath the label. */
  hint?: string;
  nextChapterId: string;
}

export interface WalkthroughChapter {
  id: string;
  /** Display title (i18n key or literal). */
  title: string;
  /** Environment to stage this chapter in. Drives the SceneBackground.
   *  When omitted the renderer falls back to a neutral clinical room. */
  scene?:
    | 'kopitiam'
    | 'street'
    | 'resus'
    | 'cathlab'
    | 'imaging'
    | 'counsel'
    | 'ward'
    | 'pharmacy'
    | 'rehab'
    | 'clinic'
    | 'backhouse';
  /** How long the chapter plays (in seconds, before any branch decision). */
  durationSec: number;
  /** Optional chyron string shown top-left, e.g. '08:15 SGT'. */
  timeOfDay?: string;
  /** Optional location label shown top-right, e.g. 'Bras Basah coffee shop'. */
  location?: string;
  beats: WalkthroughBeat[];
  /** Optional decision presented at chapter end. When `branchPoint` is set,
   *  the runtime pauses for a learner pick. `defaultNextChapterId` may be
   *  set alongside it — the runtime still pauses for the branch, but the
   *  canonical-path helpers (canonicalChapterIds, canonicalDurationSec) use
   *  the default to surface the recommended sequence in the chapter strip. */
  branchPoint?: {
    prompt: string;
    options: WalkthroughBranchOption[];
  };
  /** Chapter to play next when no branch point fires. Also used by the
   *  canonical-path helpers to render the recommended chapter sequence
   *  even on chapters that carry a branchPoint. */
  defaultNextChapterId?: string;
}

export interface Walkthrough {
  id: string;
  /** Human title (i18n key or literal). */
  title: string;
  startChapterId: string;
  chapters: Record<string, WalkthroughChapter>;
  actors: Record<string, WalkthroughActor>;
}

/* ── traversal helpers (pure) ──────────────────────────────────────────── */

export function chapterOf(w: Walkthrough, id: string): WalkthroughChapter | null {
  return w.chapters[id] ?? null;
}

/**
 * Return the next chapter id given the current chapter and (optionally) the
 * index of the branch option the learner picked. Returns null when the
 * walkthrough ends (no default and no branch, or a branch option with no
 * resolvable nextChapterId).
 */
export function nextChapterId(
  w: Walkthrough,
  currentId: string,
  pickedBranchIndex?: number,
): string | null {
  const c = chapterOf(w, currentId);
  if (!c) return null;
  if (c.branchPoint && pickedBranchIndex != null) {
    const opt = c.branchPoint.options[pickedBranchIndex];
    if (!opt) return null;
    return w.chapters[opt.nextChapterId] ? opt.nextChapterId : null;
  }
  if (c.defaultNextChapterId && w.chapters[c.defaultNextChapterId]) {
    return c.defaultNextChapterId;
  }
  return null;
}

/**
 * Beats that should be "active" at time `t` seconds into the chapter.
 * A beat is active from its declared `at` time until the next beat for the
 * same actor (or the chapter ends). This lets the renderer paint each actor
 * in a single state at any scrubbed time.
 */
export function beatsAt(c: WalkthroughChapter, t: number): WalkthroughBeat[] {
  const clamped = Math.max(0, Math.min(t, c.durationSec));
  // Group beats by actor; within each group, find the latest beat at or before t.
  const byActor = new Map<string, WalkthroughBeat[]>();
  for (const b of c.beats) {
    const list = byActor.get(b.actorId) ?? [];
    list.push(b);
    byActor.set(b.actorId, list);
  }
  const active: WalkthroughBeat[] = [];
  for (const list of byActor.values()) {
    const sorted = [...list].sort((a, b) => a.at - b.at);
    let chosen: WalkthroughBeat | null = null;
    for (const b of sorted) {
      if (b.at <= clamped) chosen = b;
      else break;
    }
    if (chosen) active.push(chosen);
  }
  return active;
}

/**
 * Linearise a walkthrough into a flat list of chapter ids reachable from the
 * start, following defaultNextChapterId only (branch points are ignored
 * because they're learner-driven). Used by the timeline scrubber to render
 * chapter markers for the canonical linear path.
 */
export function canonicalChapterIds(w: Walkthrough): string[] {
  const ids: string[] = [];
  const seen = new Set<string>();
  let cursor: string | null = w.startChapterId;
  while (cursor && !seen.has(cursor)) {
    seen.add(cursor);
    ids.push(cursor);
    const c = chapterOf(w, cursor);
    cursor = c?.defaultNextChapterId ?? null;
  }
  return ids;
}

/** Total canonical duration in seconds (sum of canonical chapters' durations). */
export function canonicalDurationSec(w: Walkthrough): number {
  let total = 0;
  for (const id of canonicalChapterIds(w)) {
    const c = w.chapters[id];
    if (c) total += c.durationSec;
  }
  return total;
}

/** Indexes into the canonical timeline at a global second-offset. */
export function locateInCanonical(
  w: Walkthrough,
  globalSec: number,
): { chapterId: string; localSec: number } | null {
  const ids = canonicalChapterIds(w);
  let remaining = Math.max(0, globalSec);
  for (const id of ids) {
    const c = w.chapters[id];
    if (!c) continue;
    if (remaining <= c.durationSec) return { chapterId: id, localSec: remaining };
    remaining -= c.durationSec;
  }
  // Past the canonical end — clamp to last chapter's end.
  const last = ids[ids.length - 1];
  const lc = last ? w.chapters[last] : null;
  return last && lc ? { chapterId: last, localSec: lc.durationSec } : null;
}
