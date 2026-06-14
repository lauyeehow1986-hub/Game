/**
 * Actor loader — async cache for per-actor 3D meshes.
 *
 * Tries `public/3d/cast/{actorId}.glb` first; on miss (404 / fetch error)
 * falls back to the procedural `Humanoid` rig. The whole pipeline is
 * non-blocking: the procedural rig is mounted immediately and *swapped*
 * for the GLB when it finishes loading, so the offline-PWA shape and
 * empty-asset-folder dev experience both keep working.
 *
 * The loaded GLB is expected to follow the Mixamo / standard humanoid
 * convention so we can blend in Mixamo-retargeted clips later
 * (see `animationLibrary.ts`). We don't enforce the rig shape here —
 * if a clip can't be retargeted, the actor just stays in their bind
 * pose and the procedural CPR/walk/idle hooks fire as no-ops on the GLB.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Humanoid } from './humanoid';
import { PoseAnimationDriver, cloneRig } from './animationLibrary';
import { CAST_LIB_DIR, resolveLibFile } from './castManifest';
import { refineCastMaterials } from './castMaterials';
import { CastPoseController } from './castPose';
import type { BeatExpression, BeatPose, WalkthroughActor } from '../lib/walkthrough';

/** Public path where authored character GLBs live. Files are optional.
 *  Base-prefixed (`import.meta.env.BASE_URL`) so it resolves correctly when the
 *  app is hosted under a sub-path on GitHub Pages (`/Game/`) as well as at root
 *  (dev/tests, where BASE_URL is `/`). */
export const CAST_DIR = `${import.meta.env.BASE_URL}3d/cast/`;

/** Cache shape: per-url, the gltf scene used as a template (cloned per
 *  instance). Promise reuse prevents duplicate fetches when several copies
 *  of the same role/file appear on stage. */
const cache = new Map<string, Promise<THREE.Group | null>>();

let loader: GLTFLoader | null = null;
function gltf(): GLTFLoader {
  if (!loader) loader = new GLTFLoader();
  return loader;
}

/** Fetch + parse a GLB at a url. Resolves null when the file is missing or
 *  fails to parse (we *do not* throw — the caller falls back). Also resolves
 *  null in SSR / test environments where the URL has no origin. */
function fetchGlb(url: string): Promise<THREE.Group | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(null);
      return;
    }
    try {
      gltf().load(
        url,
        (g) => {
          // One-shot photoreal re-shade of the template (skin sheen, wet eyes,
          // fabric/hair nap). Clones share these upgraded materials, so it runs
          // once per file, not per actor instance.
          refineCastMaterials(g.scene);
          resolve(g.scene);
        },
        undefined,
        () => resolve(null),
      );
    } catch {
      resolve(null);
    }
  });
}

/** Per-url cached template load. */
function loadTemplateUrl(url: string): Promise<THREE.Group | null> {
  let p = cache.get(url);
  if (!p) {
    p = fetchGlb(url);
    cache.set(url, p);
  }
  return p;
}

/**
 * Returns a cached promise for an actor's GLB template, or null if none.
 * Two-tier: a per-actor authored override (`{actorId}.glb`) wins; otherwise
 * the shared Quaternius library file resolved from the actor's role/team.
 */
export function loadActorTemplate(actor: WalkthroughActor | string): Promise<THREE.Group | null> {
  // Back-compat: a bare id only resolves the authored override.
  if (typeof actor === 'string') {
    return loadTemplateUrl(`${CAST_DIR}${actor}.glb`);
  }
  return loadTemplateUrl(`${CAST_DIR}${actor.id}.glb`).then((override) => {
    if (override) return override;
    const lib = resolveLibFile(actor);
    if (!lib) return null;
    return loadTemplateUrl(`${CAST_LIB_DIR}${lib}.glb`);
  });
}

/** Public clear-cache hook for tests. */
export function _resetActorCache() {
  cache.clear();
}

/** The runtime adapter every Stage3D figure wraps. Both backends share the
 *  same interface so the engine doesn't care which one a figure is using. */
export interface ActorFigure {
  readonly root: THREE.Group;
  readonly actorId: string;
  setGoal(x: number, z: number): void;
  snapToGoal(): void;
  setState(next: Partial<{
    pose: BeatPose;
    expression: BeatExpression;
    walking: boolean;
    speaking: boolean;
    isLead: boolean;
  }>): void;
  update(t: number, dt: number): void;
  dispose(): void;
}

/** GLB-backed actor — a clone of the loaded template, with the procedural
 *  `Humanoid` driving position + lip-sync state for free. We apply the
 *  hips offset + walk-toward-goal motion to the cloned GLB root; pose
 *  blending is delegated to AnimationMixer clips when available
 *  (wired up in animationLibrary). When no clips are wired the figure
 *  rests in the bind pose — still physically lit and shadowed.
 */
class GlbFigure implements ActorFigure {
  readonly root: THREE.Group;
  readonly actorId: string;
  private goal = new THREE.Vector2(0, 0);
  private moving = false;
  private state = { pose: 'stand' as BeatPose, expression: 'neutral' as BeatExpression, walking: false, speaking: false, isLead: false };
  /** Mixamo-clip retargeting driver — auto-loads any pose clips that
   *  exist at public/3d/anims/ and cross-fades on pose change. */
  private driver: PoseAnimationDriver;
  /** Procedural idle for the MakeHuman cast (the CC0 clips are Quaternius-rigged
   *  and never bind). When this rig is recognised it drives the body and the
   *  clip `driver` is left idle. */
  private castPose: CastPoseController;
  private focusRing: THREE.Mesh;
  private phase: number;

  constructor(actor: WalkthroughActor, template: THREE.Group) {
    this.actorId = actor.id;
    this.root = new THREE.Group();
    // SkeletonUtils.clone preserves the skeleton + skinned binding so
    // multiple instances of the same template can pose independently.
    const clone = cloneRig(template);
    clone.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        o.userData.actorId = actor.id;
      }
    });
    this.root.add(clone);
    this.phase = [...actor.id].reduce((h, c) => h + c.charCodeAt(0), 0) % 7;
    // Procedural idle if this is the MakeHuman cast (arms-down + breathing);
    // otherwise fall back to the Mixamo-style clip driver.
    this.castPose = new CastPoseController(clone, this.phase);
    this.driver = new PoseAnimationDriver(clone);
    if (!this.castPose.active) void this.driver.setPose('stand');

    // speaker focus ring (same as procedural humanoid)
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.30, 0.42, 28),
      new THREE.MeshBasicMaterial({ color: '#fbbf24', transparent: true, opacity: 0, side: THREE.DoubleSide }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.012;
    this.focusRing = ring;
    this.root.add(ring);
  }

  setGoal(x: number, z: number) { this.goal.set(x, z); }

  snapToGoal() {
    this.root.position.x = this.goal.x;
    this.root.position.z = this.goal.y;
    this.moving = false;
  }

  setState(next: Partial<typeof this.state>) {
    const prevPose = this.state.pose;
    Object.assign(this.state, next);
    // Forward pose changes to the animation driver — when a clip exists
    // for the new pose, it cross-fades; when not, the no-op resolves
    // silently and the rig stays in its previous animation (or bind pose).
    if (next.pose && next.pose !== prevPose && !this.castPose.active) {
      void this.driver.setPose(next.pose);
    }
  }

  update(t: number, dt: number) {
    const dx = this.goal.x - this.root.position.x;
    const dz = this.goal.y - this.root.position.z;
    const dist = Math.hypot(dx, dz);
    this.moving = dist > 0.02;
    if (this.moving) {
      const speed = this.state.walking ? 1.9 : 3.2;
      const step = Math.min(dist, speed * dt);
      this.root.position.x += (dx / dist) * step;
      this.root.position.z += (dz / dist) * step;
      this.root.rotation.y = Math.atan2(dx, dz);
    }
    if (this.castPose.active) {
      this.castPose.update(t, { pose: this.state.pose, moving: this.moving });
    } else {
      this.driver.update(dt);
    }

    const want = this.state.isLead ? 0.55 + Math.sin(t * 4) * 0.18 : 0;
    const m = this.focusRing.material as THREE.MeshBasicMaterial;
    m.opacity += (want - m.opacity) * Math.min(1, dt * 10);
  }

  dispose() {
    this.driver.dispose();
    this.root.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose();
        const mat = o.material;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat.dispose();
      }
    });
  }
}

/** Procedural fallback — the v9.17 articulated rig wearing the
 *  ActorFigure hat. */
class ProceduralFigure implements ActorFigure {
  readonly root: THREE.Group;
  readonly actorId: string;
  private h: Humanoid;
  constructor(actor: WalkthroughActor) {
    this.h = new Humanoid(actor);
    this.root = this.h.root;
    this.actorId = this.h.actorId;
  }
  setGoal(x: number, z: number) { this.h.setGoal(x, z); }
  snapToGoal() { this.h.snapToGoal(); }
  setState(next: Parameters<ActorFigure['setState']>[0]) { this.h.setState(next); }
  update(t: number, dt: number) { this.h.update(t, dt); }
  dispose() { this.h.dispose(); }
}

/** Factory: starts as procedural, async-upgrades to GLB if a template
 *  exists. The returned figure swaps its root subtree *in place* so the
 *  parent scene doesn't need to know about the upgrade. */
export function createActorFigure(actor: WalkthroughActor, parent: THREE.Object3D): ActorFigure {
  const figure = new ProceduralFigure(actor);
  parent.add(figure.root);

  loadActorTemplate(actor).then((template) => {
    if (!template) return;
    // swap: remove the procedural figure, mount the GLB at the same world pos.
    const worldPos = figure.root.position.clone();
    parent.remove(figure.root);
    figure.dispose();
    const glb = new GlbFigure(actor, template);
    glb.root.position.copy(worldPos);
    parent.add(glb.root);
    // bolt the GLB onto the original handle so the engine's reference
    // keeps working — easier than rebroadcasting up to Stage3D.
    Object.assign(figure, {
      root: glb.root,
      setGoal: glb.setGoal.bind(glb),
      snapToGoal: glb.snapToGoal.bind(glb),
      setState: glb.setState.bind(glb),
      update: glb.update.bind(glb),
      dispose: glb.dispose.bind(glb),
    });
  });

  return figure;
}
