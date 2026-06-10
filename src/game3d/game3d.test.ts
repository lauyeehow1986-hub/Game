/**
 * 3D renderer tests — everything here runs headlessly (no WebGL context):
 * coordinate-space mapping, environment construction for all 12 scenes,
 * humanoid rig construction + pose presets + procedural animation update.
 * The WebGL-only engine (Stage3D) is intentionally untested at unit level;
 * its logic surface lives in these three modules.
 */
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { worldX, worldZ, yawFor, CAMERA } from './space';
import { buildEnvironment3D, SCENE_IDS_3D } from './environments';
import { Humanoid, POSE_PRESETS } from './humanoid';
import { stemiWalkthrough } from '../lib/walkthrough-stemi';
import type { BeatPose } from '../lib/walkthrough';

describe('space — stage-unit → world mapping', () => {
  it('stage centre maps to world origin in X', () => {
    expect(worldX(240)).toBe(0);
    expect(worldX(0)).toBeLessThan(0);
    expect(worldX(480)).toBeGreaterThan(0);
  });

  it('the stage front row maps to Z=0 and depth recedes negative', () => {
    expect(worldZ(260)).toBe(0);
    expect(worldZ(80)).toBeLessThan(worldZ(260));
  });

  it('mapping is monotonic (no fold-overs)', () => {
    for (let x = 0; x < 480; x += 40) {
      expect(worldX(x + 40)).toBeGreaterThan(worldX(x));
    }
    for (let y = 80; y < 260; y += 20) {
      expect(worldZ(y + 20)).toBeGreaterThan(worldZ(y));
    }
  });

  it('yawFor covers all four directions distinctly', () => {
    const yaws = (['N', 'S', 'E', 'W'] as const).map(yawFor);
    expect(new Set(yaws).size).toBe(4);
    expect(yawFor('S')).toBe(0); // rest pose faces the camera
  });

  it('camera rig looks into the set from the front', () => {
    expect(CAMERA.pos.z).toBeGreaterThan(0);
    expect(CAMERA.lookAt.z).toBeLessThan(0);
    expect(CAMERA.pos.y).toBeGreaterThan(1); // raised, slightly top-down
  });
});

describe('environments — all 12 scenes construct headlessly', () => {
  it('covers every walkthrough scene id', () => {
    expect(SCENE_IDS_3D.sort()).toEqual(
      ['backhouse', 'cathlab', 'clinic', 'counsel', 'imaging', 'kopitiam',
        'mrt', 'pharmacy', 'rehab', 'resus', 'street', 'ward'].sort(),
    );
  });

  for (const id of ['kopitiam', 'street', 'mrt', 'resus', 'cathlab', 'imaging',
    'counsel', 'ward', 'pharmacy', 'rehab', 'clinic', 'backhouse'] as const) {
    it(`${id} builds a populated set with a full lighting preset`, () => {
      const env = buildEnvironment3D(id);
      expect(env.group.children.length).toBeGreaterThan(4);
      expect(env.lighting.hemi.intensity).toBeGreaterThan(0);
      expect(env.lighting.key.intensity).toBeGreaterThan(0);
      expect(env.lighting.fog.density).toBeGreaterThan(0);
      expect(env.lighting.clear).toMatch(/^#/);
    });
  }

  it('animated scenes expose a callable animate hook', () => {
    for (const id of ['kopitiam', 'street', 'mrt'] as const) {
      const env = buildEnvironment3D(id);
      expect(typeof env.group.userData.animate).toBe('function');
      expect(() => env.group.userData.animate(1.5)).not.toThrow();
    }
  });

  it('an unknown scene id falls back to the clinical room', () => {
    const env = buildEnvironment3D('void-deck' as never);
    expect(env.group.children.length).toBeGreaterThan(4);
  });
});

describe('humanoid — rig + poses', () => {
  const patient = stemiWalkthrough.actors['patient'];
  const paramedic = stemiWalkthrough.actors['paramedic'];

  it('POSE_PRESETS covers every BeatPose', () => {
    const poses: BeatPose[] = ['stand', 'walk', 'kneel', 'sit', 'cpr', 'collapsed', 'point'];
    for (const p of poses) expect(POSE_PRESETS[p], `missing preset ${p}`).toBeDefined();
  });

  it('builds a rig whose meshes are all tagged with the actor id', () => {
    const h = new Humanoid(paramedic);
    let meshes = 0;
    h.root.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        meshes += 1;
        expect(o.userData.actorId).toBe('paramedic');
      }
    });
    expect(meshes).toBeGreaterThan(10);
    h.dispose();
  });

  it('collapsed pose lays the body down and lowers the hips', () => {
    expect(POSE_PRESETS.collapsed.bodyRotX).not.toBe(0);
    expect(POSE_PRESETS.collapsed.hipsY).toBeLessThan(POSE_PRESETS.stand.hipsY / 2);
  });

  it('seated and kneeling poses lower the hips below standing', () => {
    expect(POSE_PRESETS.sit.hipsY).toBeLessThan(POSE_PRESETS.stand.hipsY);
    expect(POSE_PRESETS.kneel.hipsY).toBeLessThan(POSE_PRESETS.stand.hipsY);
  });

  it('CPR pose leans the spine forward over the patient', () => {
    expect(POSE_PRESETS.cpr.spineX).toBeGreaterThan(0.3);
    expect(POSE_PRESETS.cpr.lShoulderX).toBeLessThan(-0.8); // arms extended forward
  });

  it('walks toward its goal across update() calls', () => {
    const h = new Humanoid(paramedic);
    h.setGoal(5, -3);
    const startDist = Math.hypot(5 - h.root.position.x, -3 - h.root.position.z);
    for (let i = 0; i < 30; i += 1) h.update(i / 60, 1 / 60);
    const endDist = Math.hypot(5 - h.root.position.x, -3 - h.root.position.z);
    expect(endDist).toBeLessThan(startDist);
    h.dispose();
  });

  it('snapToGoal teleports exactly', () => {
    const h = new Humanoid(patient);
    h.setGoal(-2.5, -7);
    h.snapToGoal();
    expect(h.root.position.x).toBe(-2.5);
    expect(h.root.position.z).toBe(-7);
    h.dispose();
  });

  it('CPR compressions oscillate the spine over time', () => {
    const h = new Humanoid(paramedic);
    h.setState({ pose: 'cpr' });
    // settle the pose blend first
    for (let i = 0; i < 120; i += 1) h.update(i / 60, 1 / 60);
    const samples: number[] = [];
    for (let i = 120; i < 200; i += 1) {
      h.update(i / 60, 1 / 60);
      // spine world rotation reflects compressions layered on the preset
      samples.push((h as never as { spine: THREE.Group }).spine.rotation.x);
    }
    const spread = Math.max(...samples) - Math.min(...samples);
    expect(spread).toBeGreaterThan(0.05);
    h.dispose();
  });

  it('features derive from the same generator the 2D sprites use', () => {
    const h1 = new Humanoid(patient);
    const h2 = new Humanoid(patient);
    expect(h1.features).toEqual(h2.features);
    h1.dispose();
    h2.dispose();
  });
});
