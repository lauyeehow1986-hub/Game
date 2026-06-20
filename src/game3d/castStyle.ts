/**
 * castStyle — deterministic per-instance look for the Quaternius cast.
 *
 * Quaternius characters carry 6 flat, texture-less materials (Skin, Face, Hair,
 * Main, Black, Brown), so a character's entire appearance is 6 colours. We use
 * that: a stable hash of the actor id seeds a per-figure palette (skin tone from
 * a believable Singapore distribution, hair, role-appropriate clothing) plus a
 * height jitter. Applied per clone (materials cloned first) so reused base meshes
 * never read as identical clones. Materials are also pushed matte for the
 * soft-clean look. Stable by id, so a recurring named patient looks the same in
 * every scene.
 */
import * as THREE from 'three';
import type { WalkthroughActor } from '../lib/walkthrough';

/** Believable SG skin-tone distribution (sRGB), light → deep. */
export const SKIN_TONES = [
  '#f1c9a5', '#e7b48d', '#d79e74', '#c0855a', '#a86b43', '#8d5732',
] as const;
/** Hair colours, mostly dark with a couple of greys for older actors. */
const HAIR = ['#14100c', '#221812', '#33241a', '#4a3422', '#9a9488', '#c9c4bc'] as const;

export interface CastStyle {
  skin: string; // Skin + Face
  hair: string; // Hair
  top: string; // Main (coat / scrub top / shirt)
  bottom: string; // Black (trousers / lower)
  accent: string; // Brown (shoes / belt)
  scale: number; // height jitter
}

/** FNV-1a hash → uint32. */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
/** Small deterministic RNG seeded from the hash (mulberry32). */
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = <T>(arr: readonly T[], r: number) => arr[Math.floor(r * arr.length)];

/** Role → clothing colours. Keyword match keeps it general across walkthroughs. */
function garment(actor: WalkthroughActor, r: () => number): { top: string; bottom: string; accent: string } {
  const hay = `${actor.id} ${actor.role ?? ''} ${actor.team ?? ''}`.toLowerCase();
  if (/nurse|\bhca\b|midwife/.test(hay)) return { top: '#3f9d8f', bottom: '#2f6f66', accent: '#2a2a2e' }; // teal scrubs
  if (/paramedic|ambulance|scdf|cfr|responder/.test(hay)) return { top: '#c5443b', bottom: '#2b2f36', accent: '#1f2228' }; // SCDF red
  if (/doctor|\bmo\b|consultant|registrar|surgeon|intensivist|cardio|radiolog|physio|therapist/.test(hay))
    return { top: '#f3f5f8', bottom: '#3a4654', accent: '#2a2f36' }; // white coat
  if (/pharm|coord|clerk|admin|counsel/.test(hay)) return { top: '#46618a', bottom: '#2c3a52', accent: '#23303f' }; // office
  if (/patient/.test(hay)) return { top: '#bcd3e6', bottom: '#9fb3c6', accent: '#7d8ea0' }; // gown
  // family / bystander → varied casual
  const casual = ['#6b8f5a', '#9a5b46', '#4d6b87', '#8a6f9c', '#b08a3e'];
  return { top: pick(casual, r()), bottom: '#3b4250', accent: '#2c2c30' };
}

export function styleForActor(actor: WalkthroughActor): CastStyle {
  const r = rng(hash(actor.id));
  const skin = pick(SKIN_TONES, r());
  const hair = pick(HAIR, r());
  const g = garment(actor, r);
  const scale = 0.94 + r() * 0.12; // 0.94 .. 1.06
  return { skin, hair, top: g.top, bottom: g.bottom, accent: g.accent, scale };
}

/** Quaternius material name → which CastStyle colour drives it. Covers every
 *  clothing material across all cast models (doctor / casual / oldclassy / suit /
 *  worker) so no model falls back to its built-in colours (e.g. the worker's
 *  construction hi-vis or the oldclassy patient's default suit). */
const SLOT: Record<string, keyof CastStyle> = {
  // skin
  Skin: 'skin', Face: 'skin',
  // hair
  Hair: 'hair',
  // primary garment — coat / shirt / scrub top
  Main: 'top', Shirt: 'top',
  // lower garment — trousers / scrub bottoms
  Black: 'bottom', Pants: 'bottom',
  // accents — belts, vests, trims, hats, shoes
  Brown: 'accent', Belt: 'accent', Vest: 'accent', Detail: 'accent', Details: 'accent', Hat: 'accent',
};

/**
 * Apply the style to a freshly-cloned figure root: clone every material (so this
 * instance owns its colours), recolour by slot, push matte for soft-clean, and
 * jitter height. No-op-safe on non-Quaternius rigs (unknown material names keep
 * their colour but still go matte).
 */
export function applyCastStyle(root: THREE.Object3D, actor: WalkthroughActor): CastStyle {
  const s = styleForActor(actor);
  root.scale.setScalar(s.scale);
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const wasArray = Array.isArray(mesh.material);
    const mats = (wasArray ? mesh.material : [mesh.material]) as THREE.Material[];
    const cloned = mats.map((m) => {
      const std = (m as THREE.MeshStandardMaterial).clone();
      const slot = SLOT[std.name];
      if (slot) std.color = new THREE.Color(s[slot] as string);
      std.roughness = 0.72; // matte, soft-clean
      std.metalness = 0.0;
      std.envMapIntensity = 0.7;
      std.needsUpdate = true;
      return std;
    });
    mesh.material = wasArray ? cloned : cloned[0];
  });
  return s;
}
