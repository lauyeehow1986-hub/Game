/**
 * Renders a walkthrough `SceneBackground` to a self-contained SVG data URI so
 * the Phaser renderer can load the *same* hand-built environment art as a
 * single canvas texture — no duplication of the scenery in Phaser Graphics.
 *
 * UTF-8 safe (the kopitiam signage contains CJK characters), so we URL-encode
 * rather than base64 (which would choke on non-Latin1 codepoints).
 */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SceneBackground, STAGE_W, STAGE_H, type SceneId } from '../../lib/scenery';

export function sceneToDataUri(scene: SceneId): string {
  const markup = renderToStaticMarkup(
    createElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: `0 0 ${STAGE_W} ${STAGE_H}`,
        width: STAGE_W,
        height: STAGE_H,
      },
      createElement(SceneBackground, { scene }),
    ),
  );
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
}
