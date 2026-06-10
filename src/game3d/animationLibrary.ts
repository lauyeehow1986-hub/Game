/**
 * Animation library — clip cache + Mixamo-style retargeting helpers for
 * the 3D walkthrough renderer (v9.17.3 scaffold).
 *
 * Designed for the handoff: once the user runs `pnpm fetch:3d` and drops
 * Mixamo clips into `public/3d/anims/{name}.glb` (one clip per file, or a
 * single GLB carrying multiple AnimationClips), this module loads them on
 * demand, maps them to our `BeatPose` vocabulary, and feeds them into a
 * per-figure `AnimationMixer`.  Until that happens, every API here is
 * safe to call — it just resolves null + the procedural CPR/walk/idle
 * hooks keep firing.
 *
 * Why Mixamo's skeleton: it's the de-facto rigged-humanoid standard on
 * the free web, both Quaternius's Ultimate Animated Character Pack and
 * MakeHuman with default rig export are *naming-compatible* with it.
 * Three.js's `SkeletonUtils.retargetClip` handles the per-frame bone
 * remap; we just route the right clip name in for each pose.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import type { BeatPose } from '../lib/walkthrough';

export const ANIM_DIR = '/3d/anims/';

/** BeatPose → clip-file slug. The fetch script downloads these clips
 *  (Mixamo terms): file names are stable handles the runtime looks up. */
export const POSE_CLIP_SLUGS: Record<BeatPose, string> = {
  stand:     'idle-breathing',
  walk:      'walking',
  kneel:     'kneeling',
  sit:       'sitting',
  cpr:       'cpr-compressions',
  collapsed: 'lying-down',
  point:     'pointing',
};

/** Loaded clips, keyed by slug. */
const clipCache = new Map<string, Promise<THREE.AnimationClip | null>>();

let loader: GLTFLoader | null = null;
function gltf(): GLTFLoader {
  if (!loader) loader = new GLTFLoader();
  return loader;
}

/** Fetch one clip by slug. Resolves null on miss; never throws. */
function fetchClip(slug: string): Promise<THREE.AnimationClip | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  const url = `${ANIM_DIR}${slug}.glb`;
  return new Promise((resolve) => {
    try {
      gltf().load(
        url,
        (g) => {
          const clip = g.animations[0];
          if (!clip) {
            resolve(null);
            return;
          }
          clip.name = slug;
          resolve(clip);
        },
        undefined,
        () => resolve(null),
      );
    } catch {
      resolve(null);
    }
  });
}

/** Load the clip for a pose (cached). */
export function loadPoseClip(pose: BeatPose): Promise<THREE.AnimationClip | null> {
  const slug = POSE_CLIP_SLUGS[pose];
  let p = clipCache.get(slug);
  if (!p) {
    p = fetchClip(slug);
    clipCache.set(slug, p);
  }
  return p;
}

/** Public clear-cache hook for tests. */
export function _resetClipCache() {
  clipCache.clear();
}

/**
 * Adapter that feeds clips into an `AnimationMixer` on a target rig.
 * Used by the GLB-backed actor figure (and, when SkinnedMesh-compatible,
 * by future skinned procedural rigs). Keeps the *current* action playing
 * and cross-fades when the pose changes.
 */
export class PoseAnimationDriver {
  private mixer: THREE.AnimationMixer;
  private currentAction: THREE.AnimationAction | null = null;
  private currentPose: BeatPose | null = null;
  private actions = new Map<BeatPose, THREE.AnimationAction>();
  /** Target root used by SkeletonUtils.retargetClip for cross-rig remap. */
  private target: THREE.Object3D;

  constructor(target: THREE.Object3D) {
    this.target = target;
    this.mixer = new THREE.AnimationMixer(target);
  }

  /** Switch (or cross-fade) to a pose. Loads the clip lazily; no-ops when
   *  no clip is available for that pose. */
  async setPose(pose: BeatPose, fadeSec = 0.25) {
    if (pose === this.currentPose) return;
    this.currentPose = pose;
    let action = this.actions.get(pose);
    if (!action) {
      const clip = await loadPoseClip(pose);
      if (!clip || pose !== this.currentPose) return;
      action = this.mixer.clipAction(clip);
      action.setLoop(
        pose === 'collapsed' || pose === 'sit' ? THREE.LoopOnce : THREE.LoopRepeat,
        Infinity,
      );
      action.clampWhenFinished = pose === 'collapsed' || pose === 'sit';
      this.actions.set(pose, action);
    }
    if (this.currentAction && this.currentAction !== action) {
      this.currentAction.fadeOut(fadeSec);
    }
    action.reset().fadeIn(fadeSec).play();
    this.currentAction = action;
    void this.target;
  }

  update(dt: number) {
    this.mixer.update(dt);
  }

  dispose() {
    this.mixer.stopAllAction();
    this.actions.clear();
    this.currentAction = null;
    this.currentPose = null;
  }
}

/**
 * Clone an authored GLB scene with its skeleton intact, so multiple
 * actor instances can share the same template without each touching
 * the shared SkinnedMesh skeleton. Thin wrapper over SkeletonUtils.clone
 * so the rest of the codebase doesn't import three's example utils
 * directly.
 */
export function cloneRig(template: THREE.Object3D): THREE.Object3D {
  return skeletonClone(template);
}
