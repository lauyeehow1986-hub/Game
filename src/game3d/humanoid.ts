/**
 * Humanoid — articulated 3D character built from Three.js primitives.
 *
 * Mirrors the 2D `ActorSprite` contract: every visual feature (skin, hair,
 * hair style, uniform colour, age band, glasses, beard, accessory) derives
 * deterministically from the actor id via the SAME `deriveFeatures` the SVG
 * sprites use, so the cast is recognisably the same people across renderers.
 *
 * The rig is a plain Group hierarchy (no SkinnedMesh — pose blending lerps
 * joint-group rotations each frame, which is cheap, deterministic and
 * node-testable without a WebGL context):
 *
 *   root → body → hips → { lHip→lKnee, rHip→rKnee, spine → { shoulders→elbows, neck→head } }
 *
 * Poses are target-angle presets (stand/walk/kneel/sit/cpr/collapsed/point);
 * `update()` lerps every joint toward its target and layers procedural
 * motion on top: walk cycle, CPR compressions at ~110/min, breathing,
 * lip-sync jaw, blink-free expression geometry.
 */
import * as THREE from 'three';
import { deriveFeatures, type SpriteFeatures } from '../lib/sprite-generator';
import type { WalkthroughActor, BeatPose, BeatExpression } from '../lib/walkthrough';

/* ── proportions (metres) ─────────────────────────────────────────────── */
const HIPS_Y = 0.92;
const THIGH = 0.44;
const SHIN = 0.42;
const TORSO = 0.50;
const ARM_UPPER = 0.30;
const ARM_FORE = 0.27;
const HEAD_R = 0.145;

interface JointTargets {
  hipsY: number;
  bodyRotX: number;
  lHipX: number; rHipX: number;
  lKneeX: number; rKneeX: number;
  lShoulderX: number; rShoulderX: number;
  lShoulderZ: number; rShoulderZ: number;
  lElbowX: number; rElbowX: number;
  spineX: number;
  headX: number;
}

const STAND: JointTargets = {
  hipsY: HIPS_Y, bodyRotX: 0,
  lHipX: 0, rHipX: 0, lKneeX: 0, rKneeX: 0,
  lShoulderX: 0, rShoulderX: 0, lShoulderZ: 0.07, rShoulderZ: -0.07,
  lElbowX: -0.22, rElbowX: -0.22,
  spineX: 0, headX: 0,
};

/** Joint-angle presets per beat pose. Sign convention: a limb hangs down
 *  (-Y); negative rotX swings it toward the camera-facing front (+Z). */
export const POSE_PRESETS: Record<BeatPose, JointTargets> = {
  stand: STAND,
  walk: STAND, // base — the walk cycle is layered procedurally
  sit: {
    ...STAND, hipsY: 0.50,
    lHipX: -1.45, rHipX: -1.45, lKneeX: 1.40, rKneeX: 1.40,
    lElbowX: -0.55, rElbowX: -0.55, spineX: -0.05,
  },
  kneel: {
    ...STAND, hipsY: 0.50,
    lHipX: -0.10, rHipX: -0.10, lKneeX: 1.50, rKneeX: 1.50,
    spineX: 0.08,
  },
  cpr: {
    ...STAND, hipsY: 0.52,
    lHipX: -0.20, rHipX: -0.20, lKneeX: 1.50, rKneeX: 1.50,
    spineX: 0.62,
    lShoulderX: -1.05, rShoulderX: -1.05, lShoulderZ: 0.02, rShoulderZ: -0.02,
    lElbowX: -0.05, rElbowX: -0.05,
    headX: 0.25,
  },
  collapsed: {
    ...STAND, hipsY: 0.18, bodyRotX: -Math.PI / 2,
    lShoulderZ: 0.55, rShoulderZ: -0.55,
    lElbowX: -0.10, rElbowX: -0.10,
    lKneeX: 0.25, rKneeX: 0.18, headX: -0.12,
  },
  point: {
    ...STAND,
    rShoulderX: -1.35, rElbowX: -0.10, rShoulderZ: -0.04,
    headX: -0.05,
  },
};

/* ── materials / geometry helpers ─────────────────────────────────────── */

function mat(color: string, roughness = 0.8): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.02 });
}

/** A capsule whose group-origin is the TOP (the joint pivot). Rounder
 *  cross-section (14 radial / 4 cap segments) so limbs read smooth, not
 *  octagonal — the silhouette is the strongest tell at the figure's scale,
 *  and the IBL (iter 12) + soft shadows (iter 15) now reward the extra
 *  curvature. Still trivially cheap. */
function limb(radius: number, length: number, material: THREE.Material): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 4, 14), material);
  m.position.y = -(length / 2);
  m.castShadow = true;
  return m;
}

export interface HumanoidState {
  pose: BeatPose;
  expression: BeatExpression;
  walking: boolean;
  speaking: boolean;
  isLead: boolean;
}

export class Humanoid {
  readonly root = new THREE.Group();
  readonly features: SpriteFeatures;
  /** Pickable meshes carry the actor id for raycasting. */
  readonly actorId: string;

  private body = new THREE.Group();
  private hips = new THREE.Group();
  private spine = new THREE.Group();
  private headGrp = new THREE.Group();
  private lHip = new THREE.Group(); private rHip = new THREE.Group();
  private lKnee = new THREE.Group(); private rKnee = new THREE.Group();
  private lShoulder = new THREE.Group(); private rShoulder = new THREE.Group();
  private lElbow = new THREE.Group(); private rElbow = new THREE.Group();
  private mouth!: THREE.Mesh;
  private lBrow!: THREE.Mesh;
  private rBrow!: THREE.Mesh;
  private lEye!: THREE.Mesh;
  private rEye!: THREE.Mesh;
  private focusRing!: THREE.Mesh;

  private target: JointTargets = { ...STAND };
  private state: HumanoidState = {
    pose: 'stand', expression: 'neutral', walking: false, speaking: false, isLead: false,
  };
  /** Per-actor phase offset so crowds don't move in lockstep. */
  private phase: number;
  /** World-space XZ target the root glides toward. */
  private goal = new THREE.Vector2(0, 0);
  private moving = false;

  constructor(actor: WalkthroughActor) {
    this.actorId = actor.id;
    this.features = deriveFeatures(actor);
    this.phase = [...actor.id].reduce((h, c) => h + c.charCodeAt(0), 0) % 7;
    this.build();
    this.applyExpression('neutral');
    this.snapToTargets();
  }

  /* ── rig construction ─────────────────────────────────────────────── */

  private build() {
    const f = this.features;
    const skin = mat(f.skin, 0.65);
    const uniform = mat(f.uniform, 0.85);
    const uniformDark = mat(f.uniformShade, 0.9);
    const hair = mat(f.hair, 0.55);

    this.root.add(this.body);
    this.body.add(this.hips);
    this.hips.position.y = HIPS_Y;

    // pelvis
    const pelvis = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.10, 4, 12), uniformDark);
    pelvis.castShadow = true;
    this.hips.add(pelvis);

    // legs
    for (const [side, hipGrp, kneeGrp] of [
      [-1, this.lHip, this.lKnee],
      [1, this.rHip, this.rKnee],
    ] as const) {
      hipGrp.position.set(0.095 * side, -0.02, 0);
      hipGrp.add(limb(0.075, THIGH, uniformDark));
      kneeGrp.position.y = -(THIGH + 0.02);
      kneeGrp.add(limb(0.065, SHIN, uniformDark));
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.07, 0.22), mat('#23262e', 0.6));
      shoe.position.set(0, -(SHIN + 0.02), 0.05);
      shoe.castShadow = true;
      kneeGrp.add(shoe);
      hipGrp.add(kneeGrp);
      this.hips.add(hipGrp);
    }

    // spine + torso
    this.spine.position.y = 0.10;
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.185, TORSO - 0.18, 5, 16), uniform);
    torso.position.y = TORSO / 2;
    torso.castShadow = true;
    this.spine.add(torso);
    this.hips.add(this.spine);

    // arms
    for (const [side, shoulderGrp, elbowGrp] of [
      [-1, this.lShoulder, this.lElbow],
      [1, this.rShoulder, this.rElbow],
    ] as const) {
      shoulderGrp.position.set(0.245 * side, TORSO - 0.06, 0);
      shoulderGrp.add(limb(0.06, ARM_UPPER, uniform));
      elbowGrp.position.y = -(ARM_UPPER + 0.02);
      elbowGrp.add(limb(0.052, ARM_FORE, skin));
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.058, 12, 12), skin);
      hand.position.y = -(ARM_FORE + 0.03);
      hand.castShadow = true;
      elbowGrp.add(hand);
      shoulderGrp.add(elbowGrp);
      this.spine.add(shoulderGrp);
    }

    // head
    this.headGrp.position.y = TORSO + 0.10;
    const skull = new THREE.Mesh(new THREE.SphereGeometry(HEAD_R, 14, 12), skin);
    skull.position.y = HEAD_R * 0.85;
    skull.castShadow = true;
    this.headGrp.add(skull);
    this.buildFace(skull.position.y);
    this.buildHair(skull.position.y, hair);
    this.buildExtras(skull.position.y);
    this.spine.add(this.headGrp);

    // soft contact shadow + speaker focus ring at the feet
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.30, 0.42, 28),
      new THREE.MeshBasicMaterial({ color: '#fbbf24', transparent: true, opacity: 0, side: THREE.DoubleSide }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.012;
    this.focusRing = ring;
    this.root.add(ring);

    // tag every mesh for raycast-picking
    this.root.traverse((o) => { o.userData.actorId = this.actorId; });
  }

  private buildFace(headY: number) {
    const dark = mat('#181410', 0.4);
    const z = HEAD_R * 0.92;
    for (const side of [-1, 1] as const) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 6), dark);
      eye.position.set(0.052 * side, headY + 0.02, z);
      const brow = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.012, 0.012), dark);
      brow.position.set(0.052 * side, headY + 0.062, z);
      this.headGrp.add(eye, brow);
      if (side === -1) { this.lEye = eye; this.lBrow = brow; }
      else { this.rEye = eye; this.rBrow = brow; }
    }
    this.mouth = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.018, 0.012), mat('#5a2e1a', 0.5));
    this.mouth.position.set(0, headY - 0.055, z);
    this.headGrp.add(this.mouth);
  }

  private buildHair(headY: number, hair: THREE.Material) {
    const f = this.features;
    // crop cap — slightly larger upper hemisphere for every style
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(HEAD_R * 1.06, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.52),
      hair,
    );
    cap.position.y = headY + 0.012;
    cap.castShadow = true;
    this.headGrp.add(cap);
    if (f.hairStyle === 1) {
      // side-part fringe
      const fringe = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.045, 0.05), hair);
      fringe.position.set(0.03, headY + 0.105, HEAD_R * 0.72);
      this.headGrp.add(fringe);
    } else if (f.hairStyle === 2) {
      // tied back — bun behind
      const bun = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), hair);
      bun.position.set(0, headY + 0.04, -HEAD_R * 0.95);
      this.headGrp.add(bun);
    }
  }

  private buildExtras(headY: number) {
    const f = this.features;
    if (f.hasGlasses) {
      const frame = mat('#2c3540', 0.3);
      for (const side of [-1, 1] as const) {
        const lens = new THREE.Mesh(new THREE.TorusGeometry(0.034, 0.006, 6, 14), frame);
        lens.position.set(0.052 * side, headY + 0.02, HEAD_R * 0.95);
        this.headGrp.add(lens);
      }
      const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.007, 0.007), frame);
      bridge.position.set(0, headY + 0.02, HEAD_R * 0.95);
      this.headGrp.add(bridge);
    }
    if (f.beard !== 'none') {
      const depth = f.beard === 'full' ? 0.045 : 0.02;
      const beard = new THREE.Mesh(
        new THREE.BoxGeometry(0.13, f.beard === 'full' ? 0.07 : 0.04, depth),
        mat(f.hair, 0.7),
      );
      beard.position.set(0, headY - 0.075, HEAD_R * 0.82);
      this.headGrp.add(beard);
    }
    // wearable accessory hints, so roles read at a glance in 3D
    if (f.accessory === 'stethoscope') {
      const tube = new THREE.Mesh(
        new THREE.TorusGeometry(0.13, 0.014, 6, 16, Math.PI),
        mat('#1f2937', 0.4),
      );
      tube.position.y = TORSO - 0.04;
      tube.rotation.x = Math.PI / 2.4;
      this.spine.add(tube);
    } else if (f.accessory === 'chef-hat') {
      const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.085, 0.16, 12), mat('#f5f5f4', 0.9));
      hat.position.y = headY + HEAD_R + 0.07;
      this.headGrp.add(hat);
    } else if (f.accessory === 'cap') {
      const capTop = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.05, 12), mat(this.features.uniform, 0.85));
      capTop.position.y = headY + HEAD_R * 0.92;
      const brim = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.012, 0.09), mat(this.features.uniformShade, 0.85));
      brim.position.set(0, headY + HEAD_R * 0.72, HEAD_R + 0.02);
      this.headGrp.add(capTop, brim);
    } else if (f.accessory === 'high-vis') {
      const vest = new THREE.Mesh(new THREE.CapsuleGeometry(0.20, TORSO - 0.26, 4, 10), mat('#f59e0b', 0.7));
      vest.position.y = TORSO / 2;
      this.spine.add(vest);
    } else if (f.accessory === 'whitecoat') {
      const coat = new THREE.Mesh(new THREE.CapsuleGeometry(0.20, TORSO - 0.20, 4, 10), mat('#f8fafc', 0.9));
      coat.position.set(0, TORSO / 2 - 0.05, -0.012);
      this.spine.add(coat);
    } else if (f.accessory === 'lead-apron') {
      const apron = new THREE.Mesh(new THREE.BoxGeometry(0.30, TORSO + 0.18, 0.06), mat('#3b4252', 0.95));
      apron.position.set(0, TORSO / 2 - 0.12, 0.16);
      this.spine.add(apron);
    }
  }

  /* ── per-frame state ──────────────────────────────────────────────── */

  setState(next: Partial<HumanoidState>) {
    const prev = this.state;
    this.state = { ...prev, ...next };
    if (this.state.pose !== prev.pose) this.target = { ...POSE_PRESETS[this.state.pose] };
    if (this.state.expression !== prev.expression) this.applyExpression(this.state.expression);
  }

  getState(): HumanoidState { return this.state; }

  /** Set the world-space XZ goal the figure glides/walks toward. */
  setGoal(x: number, z: number) { this.goal.set(x, z); }

  /** Teleport to the goal (chapter entry — no cross-scene gliding). */
  snapToGoal() {
    this.root.position.x = this.goal.x;
    this.root.position.z = this.goal.y;
    this.moving = false;
  }

  private applyExpression(e: BeatExpression) {
    // geometry-only "FACS": brow angle/height + mouth scale + eye openness
    const browY = 0.062;
    const set = (browTilt: number, browLift: number, mouthW: number, mouthH: number, eyeOpen: number) => {
      this.lBrow.rotation.z = browTilt;
      this.rBrow.rotation.z = -browTilt;
      this.lBrow.position.y = this.rBrow.position.y = this.mouth.position.y + 0.117 + browLift;
      this.mouth.scale.set(mouthW, mouthH, 1);
      this.lEye.scale.y = this.rEye.scale.y = eyeOpen;
    };
    void browY;
    switch (e) {
      case 'alarmed': set(0.15, 0.022, 0.9, 2.6, 1.3); break;
      case 'distressed': set(-0.35, 0.012, 1.3, 1.6, 1); break;
      case 'pained': set(-0.45, -0.004, 1.4, 0.8, 0.55); break;
      case 'focused': set(-0.18, -0.012, 0.8, 0.7, 0.9); break;
      case 'relieved': set(0.10, 0.008, 1.5, 1.0, 1); break;
      case 'unconscious': set(0, -0.006, 1.0, 0.5, 0.12); break;
      default: set(0, 0, 1, 1, 1);
    }
  }

  private snapToTargets() {
    this.applyTargets(1);
  }

  private applyTargets(k: number) {
    const t = this.target;
    const L = (cur: number, to: number) => cur + (to - cur) * k;
    this.hips.position.y = L(this.hips.position.y, t.hipsY);
    this.body.rotation.x = L(this.body.rotation.x, t.bodyRotX);
    this.lHip.rotation.x = L(this.lHip.rotation.x, t.lHipX);
    this.rHip.rotation.x = L(this.rHip.rotation.x, t.rHipX);
    this.lKnee.rotation.x = L(this.lKnee.rotation.x, t.lKneeX);
    this.rKnee.rotation.x = L(this.rKnee.rotation.x, t.rKneeX);
    this.lShoulder.rotation.x = L(this.lShoulder.rotation.x, t.lShoulderX);
    this.rShoulder.rotation.x = L(this.rShoulder.rotation.x, t.rShoulderX);
    this.lShoulder.rotation.z = L(this.lShoulder.rotation.z, t.lShoulderZ);
    this.rShoulder.rotation.z = L(this.rShoulder.rotation.z, t.rShoulderZ);
    this.lElbow.rotation.x = L(this.lElbow.rotation.x, t.lElbowX);
    this.rElbow.rotation.x = L(this.rElbow.rotation.x, t.rElbowX);
    this.spine.rotation.x = L(this.spine.rotation.x, t.spineX);
    this.headGrp.rotation.x = L(this.headGrp.rotation.x, t.headX);
  }

  /** Advance animation. `t` is elapsed seconds, `dt` the frame delta. */
  update(t: number, dt: number) {
    const s = this.state;
    const tp = t + this.phase;

    // glide / walk toward the goal
    const dx = this.goal.x - this.root.position.x;
    const dz = this.goal.y - this.root.position.z;
    const dist = Math.hypot(dx, dz);
    this.moving = dist > 0.02;
    if (this.moving) {
      const speed = s.walking ? 1.9 : 3.2; // m/s — walk beats stroll, glides are brisk
      const step = Math.min(dist, speed * dt);
      this.root.position.x += (dx / dist) * step;
      this.root.position.z += (dz / dist) * step;
    }

    // pose blending
    this.applyTargets(1 - Math.exp(-dt * 9));

    // layered procedural motion
    const inWalk = s.pose !== 'collapsed' && (this.moving || (s.walking && s.pose === 'walk'));
    if (inWalk) {
      const w = Math.sin(tp * 7.5);
      this.lHip.rotation.x += w * 0.5;
      this.rHip.rotation.x += -w * 0.5;
      this.lKnee.rotation.x += Math.max(0, -w) * 0.7;
      this.rKnee.rotation.x += Math.max(0, w) * 0.7;
      this.lShoulder.rotation.x += -w * 0.32;
      this.rShoulder.rotation.x += w * 0.32;
      this.hips.position.y += Math.abs(Math.sin(tp * 7.5)) * 0.035;
    } else if (s.pose === 'cpr') {
      // hands-only compressions at ~110/min, driven from the spine
      const c = Math.max(0, Math.sin(tp * 2 * Math.PI * 1.83));
      this.spine.rotation.x += c * 0.16;
      this.lShoulder.rotation.x += c * 0.10;
      this.rShoulder.rotation.x += c * 0.10;
    } else if (s.pose !== 'collapsed') {
      // idle breathing
      this.spine.rotation.x += Math.sin(tp * 1.7) * 0.012;
    }

    // lip-sync
    if (s.speaking && s.expression !== 'unconscious') {
      this.mouth.scale.y = 1.1 + Math.abs(Math.sin(tp * 9.5)) * 1.6;
    }

    // speaker focus ring
    const ringMat = this.focusRing.material as THREE.MeshBasicMaterial;
    const want = s.isLead ? 0.55 + Math.sin(t * 4) * 0.18 : 0;
    ringMat.opacity += (want - ringMat.opacity) * Math.min(1, dt * 10);
  }

  dispose() {
    this.root.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose();
        const m = o.material;
        if (Array.isArray(m)) m.forEach((x) => x.dispose());
        else m.dispose();
      }
    });
  }
}
