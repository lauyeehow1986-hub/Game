/**
 * Bakes the real `ActorSprite` (full posed / expressive / accessorised SVG art)
 * to a data URI so the Phaser renderer can show the *same* characters as the
 * SVG stage — detail for detail — instead of simplified Graphics avatars.
 *
 * Coordinate contract (so feet land exactly where the SVG `<Stage>` puts them):
 *   - The sprite is drawn at `SPRITE_BASE` (64) grid units, centred in a
 *     `SPRITE_TEX` (128) px square. The ActorSprite's own origin (grid 24,32)
 *     therefore sits at the texture centre.
 *   - On stage, place the image at (x, y − figPx/2) with origin (0.5, 0.5) and
 *     scale `figPx / SPRITE_BASE`, where `figPx` is the on-stage figure size
 *     (34 × depthScale). The sprite's feet (grid 24,64) then resolve to (x, y).
 *   - The generous 128px box leaves headroom for the poses that rotate or lean
 *     beyond the upright bounding box (collapsed, cpr).
 */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  ActorSprite,
  type Direction,
  type Expression,
  type Pose,
} from '../../lib/sprite-generator';
import type { WalkthroughActor } from '../../lib/walkthrough';

export const SPRITE_TEX = 128;
export const SPRITE_BASE = 64;

export interface SpriteTextureOpts {
  pose: Pose;
  expression: Expression;
  direction: Direction;
  /** Optional walk-cycle frame (0..3) to bake a mid-stride pose. */
  walkFrame?: number;
  /** Bakes the lip-sync overlay (speaker mouth-open frame) so Phaser figures
   *  read as actively talking on stage. */
  speaking?: boolean;
}

/** Stable cache key for a baked sprite texture. */
export function spriteTextureKey(actorId: string, o: SpriteTextureOpts): string {
  return `wt-spr-${actorId}|${o.pose}|${o.expression}|${o.direction}|${o.walkFrame ?? '-'}|${o.speaking ? 's' : '-'}`;
}

export function spriteToDataUri(actor: WalkthroughActor, o: SpriteTextureOpts): string {
  const markup = renderToStaticMarkup(
    createElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        width: SPRITE_TEX,
        height: SPRITE_TEX,
        viewBox: `0 0 ${SPRITE_TEX} ${SPRITE_TEX}`,
      },
      createElement(
        'g',
        { transform: `translate(${SPRITE_TEX / 2},${SPRITE_TEX / 2})` },
        createElement(ActorSprite, {
          actor,
          size: SPRITE_BASE,
          pose: o.pose,
          expression: o.expression,
          direction: o.direction,
          walkFrame: o.walkFrame,
          speaking: o.speaking,
        }),
      ),
    ),
  );
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
}
