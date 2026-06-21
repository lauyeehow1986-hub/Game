#!/usr/bin/env node
/**
 * map-quaternius-cast — turn the downloaded Quaternius Ultimate Animated
 * Character Pack into the assets the 3D walkthrough renderer consumes.
 * Automates REMAINING.md Steps B + C so you don't hand-rename GLBs or visit
 * Mixamo.
 *
 * Prereq (Step A): the pack's glTF folder at
 *   public/3d/cast/_quaternius/glTF/*.gltf
 * (download with gdown — see scripts/fetch-3d-assets.mjs header).
 *
 * Run:
 *   pnpm map:cast
 *
 * Produces (all CC0, all gitignored):
 *   public/3d/cast/_lib/{slug}.glb   — shared role characters, picked per
 *                                       actor by src/game3d/castManifest.ts
 *   public/3d/anims/{slug}.glb       — the 7 BeatPose clips, each a single
 *                                       Quaternius animation, loaded + cross-
 *                                       faded by PoseAnimationDriver.
 *
 * Everything degrades gracefully: when these files are missing the renderer
 * keeps the procedural Humanoid rig + its scripted CPR/walk/idle motion.
 */
import { NodeIO } from '@gltf-transform/core';
import { existsSync } from 'node:fs';
import { mkdir, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SRC = join(ROOT, 'public', '3d', 'cast', '_quaternius', 'glTF');
const LIB_OUT = join(ROOT, 'public', '3d', 'cast', '_lib');
const ANIM_OUT = join(ROOT, 'public', '3d', 'anims');

/* lib slug (see CAST_LIB_FILES in src/game3d/castManifest.ts) → Quaternius
 * character file basename. Keep both lists in sync. */
const CHARACTER_MAP = {
  'doctor-male-young': 'Doctor_Male_Young',
  'doctor-female-young': 'Doctor_Female_Young',
  'doctor-male-old': 'Doctor_Male_Old',
  'doctor-female-old': 'Doctor_Female_Old',
  'suit-male': 'Suit_Male',
  'suit-female': 'Suit_Female',
  'worker-male': 'Worker_Male',
  'worker-female': 'Worker_Female',
  'oldclassy-male': 'OldClassy_Male',
  'oldclassy-female': 'OldClassy_Female',
  'casual-male': 'Casual_Male',
  'casual-female': 'Casual_Female',
  'casual2-female': 'Casual2_Female',
  'casual3-male': 'Casual3_Male',
};

/* BeatPose clip slug (see POSE_CLIP_SLUGS in src/game3d/animationLibrary.ts)
 * → Quaternius animation name. The pack has no literal kneel / CPR clip, so we
 * pick the closest CC0 stand-in; the procedural rig still drives exact CPR. */
const POSE_MAP = {
  'idle-breathing': 'Idle',
  walking: 'Walk',
  kneeling: 'PickUp', // crouch/bend — closest to kneeling
  sitting: 'SitDown',
  // NB: cpr-compressions is NOT mapped here — the pack has no usable CPR/kneel
  // clip (PickUp holds the hands ~1 m apart → one lands on the pelvis). It is
  // hand-authored by `pnpm make:cpr` (scripts/make-cpr.py); do not re-add it
  // here or `map:cast` will clobber the authored clip with PickUp.
  'lying-down': 'Death', // lies down + stays (collapsed)
  pointing: 'Shoot_OneHanded', // arm extended forward
};

const io = new NodeIO();

async function pickSourceFile() {
  // Any character carries the full shared animation set; prefer a doctor.
  const preferred = join(SRC, 'Doctor_Male_Young.gltf');
  if (existsSync(preferred)) return preferred;
  const files = (await readdir(SRC)).filter((f) => f.endsWith('.gltf'));
  if (files.length === 0) return null;
  return join(SRC, files[0]);
}

async function buildLibrary() {
  await mkdir(LIB_OUT, { recursive: true });
  let n = 0;
  for (const [slug, base] of Object.entries(CHARACTER_MAP)) {
    const src = join(SRC, `${base}.gltf`);
    if (!existsSync(src)) {
      console.log(`   ⏭  ${base}.gltf missing — skipped ${slug}`);
      continue;
    }
    const doc = await io.read(src);
    await io.write(join(LIB_OUT, `${slug}.glb`), doc);
    n += 1;
    console.log(`   ✓ _lib/${slug}.glb  ← ${base}`);
  }
  console.log(`   ${n} library character(s) written.`);
}

async function buildAnimClips() {
  const srcPath = await pickSourceFile();
  if (!srcPath) {
    console.log('   ⏭  no Quaternius glTF found — anim clips skipped.');
    return;
  }
  await mkdir(ANIM_OUT, { recursive: true });
  let n = 0;
  for (const [slug, animName] of Object.entries(POSE_MAP)) {
    // Fresh read per clip so we can prune all-but-one animation safely.
    const doc = await io.read(srcPath);
    const root = doc.getRoot();
    const anims = root.listAnimations();
    const keep = anims.find((a) => a.getName() === animName);
    if (!keep) {
      console.log(`   ⏭  animation '${animName}' absent — skipped ${slug}`);
      continue;
    }
    for (const a of anims) if (a !== keep) a.dispose();
    keep.setName(slug);
    await io.write(join(ANIM_OUT, `${slug}.glb`), doc);
    n += 1;
    console.log(`   ✓ anims/${slug}.glb  ← ${animName}`);
  }
  console.log(`   ${n} pose clip(s) written.`);
}

async function main() {
  if (!existsSync(SRC)) {
    console.error(
      `Quaternius glTF folder not found:\n  ${SRC}\n\n` +
      'Download it first (CC0, ~110 MB):\n' +
      '  python -m gdown --folder ' +
      'https://drive.google.com/drive/folders/1sNi1AfenfPRrvRt5yfaj5QMMd6KKcUJ5 ' +
      '-O public/3d/cast/_quaternius\n',
    );
    process.exit(1);
  }
  console.log('map-quaternius-cast — building shared cast library');
  console.log('\n── Library characters (Step B) ──────────────────────────────');
  await buildLibrary();
  console.log('\n── Pose clips (Step C) ──────────────────────────────────────');
  await buildAnimClips();
  console.log('\nDone. Reload the dev server and open a walkthrough in 3D ᴮᴱᵀᴬ.\n');
}

main().catch((err) => {
  console.error('map-quaternius-cast failed:', err);
  process.exit(1);
});
