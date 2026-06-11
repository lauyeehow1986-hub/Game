/**
 * IBL (image-based lighting) — per-scene HDR environment maps.
 *
 * Each walkthrough scene id can have a matching `public/3d/hdr/{id}.hdr`
 * file. When present we prefilter it via `PMREMGenerator` and set it as
 * `scene.environment` so every PBR material picks up realistic specular
 * reflections + ambient response — the single biggest realism upgrade
 * per kB and the reason photoreal renders look "lit" instead of "shaded".
 *
 * When absent the scene falls back to the per-scene `LightingPreset`
 * `HemisphereLight` + `DirectionalLight` from `environments.ts`. No
 * behaviour change for users who don't run `pnpm fetch:3d`.
 */
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import type { SceneId } from '../lib/scenery';

export const HDR_DIR = '/3d/hdr/';

/** Per-scene-id → HDRI slug suggestion. Used by `scripts/fetch-3d-assets.mjs`
 *  to pick which Poly Haven HDRI to download for each scene, and at runtime
 *  to know which file to look up. Slugs are HDRI ids on Poly Haven. */
export const SCENE_HDRI_SLUGS: Record<SceneId, string> = {
  kopitiam: 'kloppenheim_06',         // warm interior, evening tungsten
  street:   'venice_sunset',          // overcast street lighting
  mrt:      'studio_small_03',        // sterile fluorescent interior
  resus:    'studio_small_09',        // bright sterile clinical
  cathlab:  'photo_studio_01',        // dim cool surgical
  imaging:  'studio_small_08',        // even soft clinical
  counsel:  'hospital_room',          // warm consultation room
  ward:     'studio_country_hall',    // soft daylight ward
  pharmacy: 'studio_small_04',        // cool fluorescent
  rehab:    'autumn_park',            // daylight through windows
  clinic:   'studio_small_07',        // sterile clinical
  backhouse:'machine_shop_01',        // industrial cool
};

interface CacheEntry {
  envMap: THREE.Texture;
  rt: THREE.WebGLRenderTarget;
}

const cache = new Map<SceneId, Promise<CacheEntry | null>>();

function fetchHdr(slug: string, scene: SceneId, renderer: THREE.WebGLRenderer): Promise<CacheEntry | null> {
  return new Promise((resolve) => {
    new RGBELoader().load(
      `${HDR_DIR}${scene}.hdr`,
      (hdr) => {
        const pmrem = new THREE.PMREMGenerator(renderer);
        pmrem.compileEquirectangularShader();
        const rt = pmrem.fromEquirectangular(hdr);
        hdr.dispose();
        pmrem.dispose();
        resolve({ envMap: rt.texture, rt });
      },
      undefined,
      () => {
        void slug;
        resolve(null);
      },
    );
  });
}

/** Load (or return cached) prefiltered envmap for a scene. */
export function loadSceneEnvironment(
  scene: SceneId,
  renderer: THREE.WebGLRenderer,
): Promise<CacheEntry | null> {
  let p = cache.get(scene);
  if (!p) {
    p = fetchHdr(SCENE_HDRI_SLUGS[scene] ?? 'studio_small_03', scene, renderer);
    cache.set(scene, p);
  }
  return p;
}

/** Strength of the image-based indirect term when an HDRI is present. The
 *  PMREM environment supplies *directional* diffuse irradiance (form-giving),
 *  unlike a constant hemisphere fill (flat). Driving the ambient through this
 *  — rather than doubling it with the preset hemisphere — is what stops IBL
 *  scenes looking flat, at zero extra GPU cost (it scales an existing term,
 *  not a new pass). Art-directable; 1.0 is a faithful exposure. */
export const ENVIRONMENT_INTENSITY = 1.0;

/** Apply (or remove) an envmap to a Three.js Scene. Pass null to detach.
 *  Also sets `scene.environmentIntensity` so callers get the tuned indirect
 *  strength (three r163+; harmless when unset on the active scene). */
export function applyEnvironment(scene: THREE.Scene, entry: CacheEntry | null) {
  scene.environment = entry?.envMap ?? null;
  // `environmentIntensity` exists on Scene in three r163+ (our pin is 0.184).
  scene.environmentIntensity = entry ? ENVIRONMENT_INTENSITY : 1.0;
}

/** Public clear-cache hook for tests. */
export function _resetIblCache() {
  for (const p of cache.values()) {
    p.then((e) => e?.rt.dispose());
  }
  cache.clear();
}
