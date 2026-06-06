#!/usr/bin/env node
/**
 * Pre-bake every walkthrough scene as a high-resolution PNG asset.
 *
 * Run via `pnpm bake:scenes`. Output → public/walkthrough/scenes/*.png at
 * 3× the logical 480×270 stage (= 1440×810). The Phaser renderer (and the
 * SVG `<Stage>` ultra path) load these binary backgrounds instead of the
 * inline SVG for a sharper, gradient-rich look.
 *
 * Assets-heavy pivot (v9.14): the PNGs ARE committed to the repo so the PWA
 * remains offline-capable — they enter the cache via the service worker on
 * first install.
 */
import { writeFileSync, mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';

const ALL_SCENES = [
  'kopitiam', 'street', 'mrt', 'resus', 'cathlab', 'imaging',
  'counsel', 'ward', 'pharmacy', 'rehab', 'clinic', 'backhouse',
];

async function main() {
  const { SceneBackground, STAGE_W, STAGE_H } = await import('../src/lib/scenery.tsx');

  const outDir = join(process.cwd(), 'public/walkthrough/scenes');
  mkdirSync(outDir, { recursive: true });

  const SCALE = 3;
  for (const scene of ALL_SCENES) {
    const markup = renderToStaticMarkup(
      createElement(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          width: STAGE_W,
          height: STAGE_H,
          viewBox: `0 0 ${STAGE_W} ${STAGE_H}`,
        },
        createElement(SceneBackground, { scene, cinematic: true }),
      ),
    );
    const r = new Resvg(markup, { fitTo: { mode: 'width', value: STAGE_W * SCALE } });
    const png = r.render().asPng();
    const out = join(outDir, `${scene}.png`);
    writeFileSync(out, png);
    const kb = (statSync(out).size / 1024).toFixed(0);
    console.log(`  ${scene.padEnd(12)} → ${out}  (${kb} kB)`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
