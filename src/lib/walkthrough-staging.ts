/**
 * Walkthrough staging — pure geometry shared by every renderer.
 *
 * Both the SVG `<Stage>` (default) and the Phaser canvas renderer (v9.9, beta)
 * position figures identically: this module is the single source of truth for
 * where each present actor stands, how big they are (depth scale), who is the
 * current speaker, and the painter's-order in which they should be drawn.
 *
 * Kept free of React and Phaser so it can be unit-tested directly and imported
 * by either renderer without pulling a UI runtime along.
 */

import { defaultStagePos, depthScale } from './scenery';
import type {
  Walkthrough,
  WalkthroughActor,
  WalkthroughBeat,
  WalkthroughChapter,
} from './walkthrough';

export interface StagedFigure {
  actor: WalkthroughActor;
  beat: WalkthroughBeat | undefined;
  x: number;
  y: number;
  /** Depth scale at this y (0.7 back → 1.3 front). */
  scale: number;
  isActive: boolean;
  isSelected: boolean;
  isLead: boolean;
}

export interface Staging {
  figures: StagedFigure[];
  /** Actor id of the current speaker (latest-fired active beat), or null. */
  leadId: string | null;
}

/** Stable per-chapter ordering: actor ids by their first appearance time. */
export function chapterActorOrder(chapter: WalkthroughChapter): string[] {
  const firstAt = new Map<string, number>();
  for (const b of chapter.beats) {
    const cur = firstAt.get(b.actorId);
    if (cur == null || b.at < cur) firstAt.set(b.actorId, b.at);
  }
  return [...firstAt.entries()]
    .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))
    .map(([id]) => id);
}

/**
 * Compute the staged figures for a chapter at a given active-beat snapshot.
 * `activeByActor` maps actorId → the beat currently active for that actor
 * (as produced by `beatsAt` + grouping). `selectedActorId` keeps a clicked
 * actor on stage even when they have no active beat.
 */
export function stageFigures(
  walkthrough: Walkthrough,
  chapter: WalkthroughChapter,
  activeByActor: Map<string, WalkthroughBeat>,
  selectedActorId: string | null,
): Staging {
  const order = chapterActorOrder(chapter);
  const total = order.length;

  // Lead = the most-recently-fired active beat (highest `at`).
  let leadId: string | null = null;
  let leadAt = -Infinity;
  for (const [id, beat] of activeByActor) {
    if (beat.at > leadAt) {
      leadAt = beat.at;
      leadId = id;
    }
  }

  const figures: StagedFigure[] = [];
  for (let i = 0; i < order.length; i += 1) {
    const id = order[i];
    const actor = walkthrough.actors[id];
    if (!actor) continue;
    const beat = activeByActor.get(id);
    const isActive = !!beat;
    const isSelected = id === selectedActorId;
    if (!isActive && !isSelected) continue;
    const fallback = defaultStagePos(i, total);
    const x = beat?.pos?.x ?? fallback.x;
    const y = beat?.pos?.y ?? fallback.y;
    figures.push({
      actor,
      beat,
      x,
      y,
      scale: depthScale(y),
      isActive,
      isSelected,
      isLead: id === leadId,
    });
  }
  // Painter's algorithm: figures further back (smaller y) drawn first.
  figures.sort((a, b) => a.y - b.y);
  return { figures, leadId };
}
