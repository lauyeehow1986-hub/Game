/**
 * castPose — procedural idle for the photoreal MakeHuman cast.
 *
 * Why this exists: the CC0 motion clips in `public/3d/anims/*.glb` are
 * Quaternius-rigged (`UpperArm.L`, `Hips`, `Torso`…) but the generated cast
 * rig is MakeHuman-named (`upperarm01.L`, `spine0X`, `pelvis.L`…). The clips'
 * tracks bind to bones by name, so **none of them resolve** and every actor is
 * frozen in its A-pose bind (arms angled stiffly out) — the single most
 * unnatural thing about the cast at any distance.
 *
 * Rather than fight `SkeletonUtils.retargetClip` across two structurally very
 * different skeletons (a known source of twisted limbs), we drive the cast's
 * *own* bones directly — we know their exact names. Two things:
 *   1) a one-time **rest correction** that swings the upper arms down from the
 *      A-pose to a relaxed hang (+ a touch of elbow bend), so even a static
 *      frame reads as a person standing naturally, not a mannequin; and
 *   2) a subtle, per-figure-phased **breathing / weight-shift** idle so the
 *      standing cast is alive rather than frozen.
 *
 * Guaranteed to apply (we set the quaternions ourselves) and unit-testable.
 * Non-'stand' poses (kneel/cpr/collapsed) are out of scope here — they need
 * their own per-pose procedural work; this fixes the dominant standing case
 * the whole team spends most beats in.
 */
import * as THREE from 'three';
import type { BeatPose } from '../lib/walkthrough';

/** Degrees to swing each upper arm down from the MakeHuman A-pose toward a
 *  natural hang. Tuned against the in-engine trauma-bay screenshot. */
const ARM_DROP_DEG = 45;
/** A little inward elbow bend so the arms don't read as ramrod-straight. */
const ELBOW_BEND_DEG = 0;
/** Local axis the upper-arm swing happens around (MakeHuman arm bones roll so
 *  the coronal swing is about local Z). Mirrored by sign per side. */
const SWING_AXIS = new THREE.Vector3(1, 0, 0);
/** Elbow flex axis (local X bends the forearm forward). */
const ELBOW_AXIS = new THREE.Vector3(1, 0, 0);
/** Whole-body pitch for a `collapsed` actor. The GLB origin sits at the feet,
 *  so pitching the clone about local X lays it flat on the floor (head extends
 *  forward, feet stay at the actor's mark). Sign tuned in-engine. */
const COLLAPSE_PITCH = -Math.PI / 2;
const BODY_X = new THREE.Vector3(1, 0, 0);
/** Forward fold at the waist (lowest spine) for an actor tending a patient on
 *  the ground — `kneel` (pressing a wound / assessing) and `cpr` (compressions).
 *  A deep hinge with feet planted reads as "bent over the casualty" and avoids
 *  the floor-clipping a procedural leg-articulated kneel invites. Sign/axis
 *  tuned in-engine. */
const KNEEL_FOLD_DEG = 60;
const CPR_FOLD_DEG = 48;
/** Compression bob amplitude + rate (~1.5 Hz) layered on the CPR fold. */
const CPR_BOB_DEG = 8;
const CPR_BOB_RATE = 9;
const WAIST_AXIS = new THREE.Vector3(1, 0, 0);

interface Tracked {
  bone: THREE.Bone;
  rest: THREE.Quaternion;   // bind-local rotation we lerp around
}

/** Names we drive. Anything missing is simply skipped (a non-MakeHuman rig
 *  yields `active === false` and the caller keeps its old path). */
const ARM_L = 'upperarm01.L';
const ARM_R = 'upperarm01.R';
const FOREARM_L = 'lowerarm01.L';
const FOREARM_R = 'lowerarm01.R';
const CHEST = 'spine03';
const WAIST = 'spine05';
const ROOT = 'root';

export class CastPoseController {
  private armL?: Tracked;
  private armR?: Tracked;
  private foreL?: Tracked;
  private foreR?: Tracked;
  private chest?: Tracked;
  private waist?: Tracked;
  private rootBone?: Tracked;
  private waistFold = 0;
  private phase: number;
  /** The clone root — pitched as a whole for `collapsed` (and future supine
   *  poses), independent of the per-bone idle. */
  private body: THREE.Object3D;
  private bodyRest: THREE.Quaternion;
  private bodyPitch = 0;
  readonly active: boolean;

  constructor(root: THREE.Object3D, phase = 0) {
    this.phase = phase;
    this.body = root;
    this.bodyRest = root.quaternion.clone();
    // GLTFLoader sanitises node names — it strips `.` (and whitespace) — so the
    // MakeHuman bone `upperarm01.L` arrives as `upperarm01L`. Match on the
    // normalised name so we resolve regardless of the loader's munging.
    const norm = (s: string) => s.replace(/[.\s]/g, '').toLowerCase();
    const byName = new Map<string, THREE.Bone>();
    root.traverse((o) => {
      const b = o as THREE.Bone;
      if (b.isBone) byName.set(norm(b.name), b);
    });
    const track = (name: string): Tracked | undefined => {
      const bone = byName.get(norm(name));
      return bone ? { bone, rest: bone.quaternion.clone() } : undefined;
    };
    this.armL = track(ARM_L);
    this.armR = track(ARM_R);
    this.foreL = track(FOREARM_L);
    this.foreR = track(FOREARM_R);
    this.chest = track(CHEST);
    this.waist = track(WAIST);
    this.rootBone = track(ROOT);
    this.active = !!(this.armL && this.armR);
    if (this.active) this.applyRestCorrection();
  }

  /** Swing the arms down + bend the elbows once, folding the correction into
   *  `rest` so the breathing idle oscillates around the corrected pose. */
  private applyRestCorrection() {
    const drop = THREE.MathUtils.degToRad(ARM_DROP_DEG);
    const bend = THREE.MathUtils.degToRad(ELBOW_BEND_DEG);
    const swing = (t: Tracked | undefined, sign: number) => {
      if (!t) return;
      t.rest.multiply(new THREE.Quaternion().setFromAxisAngle(SWING_AXIS, drop * sign));
      t.bone.quaternion.copy(t.rest);
    };
    const flex = (t: Tracked | undefined) => {
      if (!t) return;
      t.rest.multiply(new THREE.Quaternion().setFromAxisAngle(ELBOW_AXIS, bend));
      t.bone.quaternion.copy(t.rest);
    };
    swing(this.armL, +1);
    swing(this.armR, -1);
    flex(this.foreL);
    flex(this.foreR);
  }

  /** Subtle life: breathing on the chest + a slow arm sway. Only meaningful
   *  for the standing idle; callers can skip it while a figure is walking. */
  update(t: number, dt: number, opts: { pose: BeatPose; moving: boolean; surfaceY?: number }) {
    if (!this.active) return;
    // Whole-body pose: lay a `collapsed` actor flat (smoothed so the beat
    // transition reads as falling/settling rather than a snap). When the scene
    // gives a bed height, lift the body onto it *in sync* with the pitch so it
    // settles onto the trolley/table rather than the floor.
    const collapsed = opts.pose === 'collapsed';
    const targetPitch = collapsed ? COLLAPSE_PITCH : 0;
    this.bodyPitch += (targetPitch - this.bodyPitch) * Math.min(1, dt * 6);
    this.body.quaternion.copy(this.bodyRest)
      .multiply(new THREE.Quaternion().setFromAxisAngle(BODY_X, this.bodyPitch));
    const targetLift = collapsed ? (opts.surfaceY ?? 0) : 0;
    this.body.position.y += (targetLift - this.body.position.y) * Math.min(1, dt * 6);
    // Waist fold: bend over a patient for `kneel` (assess / press a wound) and
    // `cpr` (compressions, with a chest-compression bob). Feet stay planted.
    let foldTarget = 0;
    if (opts.pose === 'kneel') foldTarget = THREE.MathUtils.degToRad(KNEEL_FOLD_DEG);
    else if (opts.pose === 'cpr') foldTarget = THREE.MathUtils.degToRad(CPR_FOLD_DEG);
    this.waistFold += (foldTarget - this.waistFold) * Math.min(1, dt * 6);
    if (this.waist) {
      let fold = this.waistFold;
      if (opts.pose === 'cpr') {
        fold += THREE.MathUtils.degToRad(CPR_BOB_DEG) * Math.abs(Math.sin(t * CPR_BOB_RATE));
      }
      this.waist.bone.quaternion.copy(this.waist.rest)
        .multiply(new THREE.Quaternion().setFromAxisAngle(WAIST_AXIS, fold));
    }
    const breathe = Math.sin(t * 1.5 + this.phase) * 0.5 + 0.5; // 0..1, ~0.24Hz
    // Chest rises a hair on the in-breath.
    if (this.chest) {
      const q = new THREE.Quaternion().setFromAxisAngle(ELBOW_AXIS, THREE.MathUtils.degToRad(-1.4) * breathe);
      this.chest.bone.quaternion.copy(this.chest.rest).multiply(q);
    }
    // Arms sway very slightly with the breath unless mid-stride (the walk
    // handler owns the body then).
    if (!opts.moving) {
      const sway = THREE.MathUtils.degToRad(1.6) * (breathe - 0.5);
      if (this.armL) this.armL.bone.quaternion.copy(this.armL.rest)
        .multiply(new THREE.Quaternion().setFromAxisAngle(SWING_AXIS, sway));
      if (this.armR) this.armR.bone.quaternion.copy(this.armR.rest)
        .multiply(new THREE.Quaternion().setFromAxisAngle(SWING_AXIS, -sway));
    }
    void this.rootBone;
  }
}
