// List animations in the authored clips and show the first animation's channels,
// to see why lying-down.glb plays as prone in-game (wrong animations[0]?).
import { NodeIO } from '@gltf-transform/core';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ANIM = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', '3d', 'anims');
const io = new NodeIO();

for (const file of ['cpr-compressions.glb', 'lying-down.glb']) {
  const doc = await io.read(join(ANIM, file));
  const anims = doc.getRoot().listAnimations();
  console.log(`\n=== ${file} : ${anims.length} animation(s) ===`);
  anims.forEach((a, i) => {
    const chans = a.listChannels();
    console.log(`  [${i}] name="${a.getName()}" channels=${chans.length}`);
  });
  // First animation: which nodes does it drive, and the root's first rotation sample.
  const a0 = anims[0];
  if (a0) {
    const targets = new Set();
    for (const ch of a0.listChannels()) {
      const n = ch.getTargetNode();
      targets.add((n && n.getName()) + ':' + ch.getTargetPath());
    }
    console.log(`  [0] targets:`, [...targets].slice(0, 12).join(', '));
  }
}
