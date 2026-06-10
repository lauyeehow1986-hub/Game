#!/usr/bin/env node
/**
 * fetch-3d-assets — download CC0 / royalty-free 3D assets for the v9.17
 * Three.js walkthrough renderer.
 *
 * Run on your local machine (Node 18+ with built-in fetch):
 *   pnpm fetch:3d                 # everything
 *   pnpm fetch:3d hdris           # just HDRIs (Poly Haven, ~25 MB total)
 *   pnpm fetch:3d quaternius      # just the stylized CC0 character pack
 *   pnpm fetch:3d kenney          # CC0 prop packs
 *
 * Sandboxed Claude sessions can't reach external CDNs, so this script
 * lives in the repo for *you* to run. Output goes to:
 *   public/3d/hdr/{sceneId}.hdr        — per-scene HDR cubemap
 *   public/3d/cast/{actorId}.glb       — per-actor character mesh
 *   public/3d/props/                   — environment props
 *
 * Everything in `public/3d/` is optional — the 3D renderer detects them at
 * runtime and falls back to the procedural rig + per-scene LightingPreset
 * when files are missing. So you can run any single chunk and see the
 * upgrade immediately.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const OUT = join(ROOT, 'public', '3d');

/* ────────────────────────────────────────────────────────────────────────── *
 * Per-scene → Poly Haven HDRI slug.  Keep in sync with src/game3d/ibl.ts.
 * Picks were chosen for lighting mood, not literal location accuracy.
 * Poly Haven serves at https://dl.polyhaven.org/file/ph-assets/.
 * ────────────────────────────────────────────────────────────────────────── */
const HDRIS = {
  kopitiam:  'kloppenheim_06',
  street:    'venice_sunset',
  mrt:       'studio_small_03',
  resus:     'studio_small_09',
  cathlab:   'photo_studio_01',
  imaging:   'studio_small_08',
  counsel:   'industrial_room',
  ward:      'studio_country_hall',
  pharmacy:  'studio_small_04',
  rehab:     'autumn_park',
  clinic:    'studio_small_07',
  backhouse: 'machine_shop_01',
};

/** Poly Haven resolution; 1k is plenty for IBL (8 MB → ~250 kB prefiltered). */
const HDR_RES = '1k';

/* ────────────────────────────────────────────────────────────────────────── *
 * Direct-download character/prop packs.  License notes per source:
 *   Quaternius — CC0,    https://quaternius.com
 *   Kenney    — CC0,    https://kenney.nl
 * ────────────────────────────────────────────────────────────────────────── */
const PACKS = [
  {
    id: 'quaternius-ultimate-animated-characters',
    license: 'CC0',
    url: 'https://quaternius.com/packs/ultimateanimatedcharacterpack.zip',
    dest: 'cast/_quaternius/',
    note:
      'CC0 rigged stylized characters from Quaternius. Use these to seed ' +
      'public/3d/cast/{actorId}.glb — rename the relevant GLBs to the ' +
      'actor ids you want them to back (e.g. paramedic.glb, bystander.glb).',
  },
  {
    id: 'quaternius-medical-pack',
    license: 'CC0',
    url: 'https://quaternius.com/packs/medicalpack.zip',
    dest: 'props/_quaternius-medical/',
    note: 'CC0 medical props: gurney, monitor, IV pole, syringe, pill bottle.',
  },
  {
    id: 'kenney-platformer-characters',
    license: 'CC0',
    url: 'https://kenney.nl/media/pages/assets/platformer-characters/45ac1a8a01-1748861875/kenney_platformer-characters.zip',
    dest: 'cast/_kenney/',
    note: 'Stylized but rigged; useful as bystander/onlooker stand-ins.',
  },
];

/* ────────────────────────────────────────────────────────────────────────── *
 * Helpers.
 * ────────────────────────────────────────────────────────────────────────── */

async function ensureDir(p) {
  await mkdir(p, { recursive: true });
}

async function download(url, outPath, { skipIfPresent = true } = {}) {
  if (skipIfPresent && existsSync(outPath)) {
    console.log(`   ⏭  ${outPath.replace(ROOT + '/', '')} (already present)`);
    return false;
  }
  await ensureDir(dirname(outPath));
  process.stdout.write(`   ⬇  ${url}\n      → ${outPath.replace(ROOT + '/', '')} `);
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) {
    process.stdout.write(`✗ HTTP ${res.status}\n`);
    return false;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(outPath, buf);
  const kb = (buf.byteLength / 1024).toFixed(0);
  process.stdout.write(`✓ ${kb} kB\n`);
  return true;
}

async function fetchHdris() {
  console.log('\n── HDRIs (Poly Haven · CC0) ─────────────────────────────────');
  const dir = join(OUT, 'hdr');
  await ensureDir(dir);
  let count = 0;
  for (const [sceneId, slug] of Object.entries(HDRIS)) {
    const url = `https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/${HDR_RES}/${slug}_${HDR_RES}.hdr`;
    const outPath = join(dir, `${sceneId}.hdr`);
    if (await download(url, outPath)) count += 1;
  }
  console.log(`   ${count} HDRI(s) downloaded.`);
}

async function fetchPacks(filter) {
  console.log('\n── Character + prop packs ───────────────────────────────────');
  let count = 0;
  for (const pack of PACKS) {
    if (filter && !pack.id.startsWith(filter)) continue;
    const dest = join(OUT, pack.dest);
    await ensureDir(dest);
    const zipPath = join(dest, `${pack.id}.zip`);
    if (await download(pack.url, zipPath)) count += 1;
    console.log(`      ${pack.note}`);
  }
  if (count > 0) {
    console.log(
      '\n   Next step (manual): unzip the downloaded files inside their dest ' +
      'folder, then rename the GLBs you want to use into ' +
      'public/3d/cast/{actorId}.glb (one per role).',
    );
  }
}

/* ────────────────────────────────────────────────────────────────────────── *
 * Entry point.
 * ────────────────────────────────────────────────────────────────────────── */

async function main() {
  const [mode = 'all'] = process.argv.slice(2);
  console.log(`fetch-3d-assets — output: ${OUT}`);
  await ensureDir(OUT);

  if (mode === 'all' || mode === 'hdris') await fetchHdris();
  if (mode === 'all') await fetchPacks();
  else if (mode === 'quaternius') await fetchPacks('quaternius');
  else if (mode === 'kenney') await fetchPacks('kenney');

  console.log('\nDone.\n');
  console.log('Next steps:');
  console.log('  1. Reload the dev server (vite picks up public/3d/ automatically).');
  console.log('  2. Open a walkthrough; switch to 3D ᴮᴱᵀᴬ; toggle PostFX on.');
  console.log('  3. To replace procedural characters with authored GLBs, drop a');
  console.log('     <actorId>.glb file at public/3d/cast/.  The procedural rig');
  console.log('     stays as the fallback when a file is missing.\n');
}

main().catch((err) => {
  console.error('fetch-3d-assets failed:', err);
  process.exit(1);
});
