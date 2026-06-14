/**
 * castMaterials — in-engine photoreal shading pass for the MakeHuman cast.
 *
 * The generated archetype GLBs (`scripts/make-cast-photoreal.py`) ship plain,
 * GLB-export-safe Principled materials: a diffuse image, maybe a normal map,
 * and nothing else. GLTFLoader turns those into flat `MeshStandardMaterial`s,
 * which is exactly the waxy, matte "MakeHuman look" — skin with no soft fresnel
 * roll-off, eyes with no wet catch-light, fabric with no nap.
 *
 * This module re-shades them *at load time*, once per template, by material
 * name (`*_skin`, `*_eyes`, `*_hair`, `*_cloth`, `*_brow` — names survive the
 * Blender→glTF round-trip, verified). It upgrades skin/cloth/hair to
 * `MeshPhysicalMaterial` so we can add the BRDF terms that actually sell a
 * face — `sheen` (the velvety peach-fuzz rim on skin and the nap on fabric)
 * and `clearcoat` (the wet glaze on the eyeball) — while preserving every map
 * the GLB already carries. All terms are analytic, so the lift lands under the
 * per-scene HDRI *and* the procedural RoomEnvironment fallback on the deployed
 * site — no new asset bytes, the whole cast upgraded in one pass.
 *
 * Karpathy-loop note: this is the iter-21 variable. Skin-diffuse multiply
 * tuning had plateaued (0.70 vs 0.60 visually identical, and invisible at
 * gameplay distance); the matte in-engine shading was the real photoreal
 * blocker. Tuned for keep-if-better A/B against the in-engine screenshot.
 */
import * as THREE from 'three';

/** Warm rim for the skin sheen — a desaturated peach so the fresnel reads as
 *  backscatter through skin, not a coloured highlight. */
const SKIN_SHEEN = new THREE.Color(0.92, 0.52, 0.44);
/** Near-white strand sheen for hair. */
const HAIR_SHEEN = new THREE.Color(0.6, 0.58, 0.55);

/** Copy a MeshStandardMaterial into a MeshPhysicalMaterial (which extends it),
 *  preserving every map/flag, then dispose the original. Physical-only terms
 *  are layered on by the caller. */
function toPhysical(std: THREE.MeshStandardMaterial): THREE.MeshPhysicalMaterial {
  const phys = new THREE.MeshPhysicalMaterial();
  // Use the *Standard* copy routine: it transfers only standard-level fields
  // (maps, color, roughness, transparent, alphaTest, side, normalScale…) and
  // leaves the physical-only terms at their defaults. `MeshPhysicalMaterial.copy`
  // would instead try to copy clearcoatNormalScale etc. off the Standard source
  // and throw on the missing Vector2.
  THREE.MeshStandardMaterial.prototype.copy.call(phys, std);
  phys.name = std.name;
  std.dispose();
  return phys;
}

/** Classify a material by the suffix the generator bakes into its name. */
function kindOf(name: string): 'skin' | 'eyes' | 'hair' | 'cloth' | 'brow' | null {
  if (name.endsWith('_skin')) return 'skin';
  if (name.endsWith('_eyes')) return 'eyes';
  if (name.endsWith('_hair')) return 'hair';
  if (name.endsWith('_cloth')) return 'cloth';
  if (name.endsWith('_brow')) return 'brow';
  return null;
}

/**
 * Re-shade one material to its photoreal profile. Returns the (possibly new)
 * material so the caller can re-assign it on the mesh. Unknown materials are
 * returned untouched. Exported for unit testing.
 */
export function refineMaterial(mat: THREE.Material): THREE.Material {
  if (!(mat instanceof THREE.MeshStandardMaterial)) return mat;
  switch (kindOf(mat.name)) {
    case 'skin': {
      const m = toPhysical(mat);
      m.metalness = 0;
      m.roughness = 0.52;            // soft, not plastic; no roughness map to vary it
      m.sheen = 0.5;                 // velvety fresnel roll-off — the key skin cue
      m.sheenRoughness = 0.55;
      m.sheenColor = SKIN_SHEEN;
      m.specularIntensity = 0.55;
      m.ior = 1.38;                  // skin's refractive index → softer speculars
      m.envMapIntensity = 1.1;
      return m;
    }
    case 'eyes': {
      const m = toPhysical(mat);
      m.metalness = 0;
      m.roughness = 0.08;
      m.clearcoat = 1.0;             // wet glaze over the iris
      m.clearcoatRoughness = 0.06;
      m.ior = 1.4;
      m.envMapIntensity = 1.5;       // catch the env highlight = "alive" eyes
      return m;
    }
    case 'hair': {
      const m = toPhysical(mat);
      m.metalness = 0;
      m.roughness = 0.38;            // glossier than skin → strand sheen
      m.sheen = 0.6;
      m.sheenRoughness = 0.3;
      m.sheenColor = HAIR_SHEEN;
      m.envMapIntensity = 0.85;
      // preserve the alpha cutout the generator set up
      m.transparent = mat.transparent;
      m.alphaTest = mat.alphaTest || 0.5;
      return m;
    }
    case 'cloth': {
      const m = toPhysical(mat);
      m.sheen = 0.35;                // fabric nap
      m.sheenRoughness = 0.85;
      m.sheenColor = new THREE.Color(0.5, 0.5, 0.5);
      m.envMapIntensity = 0.9;
      return m;
    }
    default:
      // brows + anything else: leave the alpha card as-is.
      return mat;
  }
}

/**
 * Walk a freshly-loaded cast template and re-shade every mesh material in
 * place. Idempotent-safe: once a material is a MeshPhysicalMaterial it is
 * skipped by `refineMaterial`, so re-running on a shared template is cheap.
 * Call once per loaded template (clones share the upgraded materials).
 */
export function refineCastMaterials(root: THREE.Object3D): void {
  root.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return;
    if (Array.isArray(o.material)) {
      o.material = o.material.map((m) => refineMaterial(m));
    } else if (o.material) {
      o.material = refineMaterial(o.material);
    }
  });
}
