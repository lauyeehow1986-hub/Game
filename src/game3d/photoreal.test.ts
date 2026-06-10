/**
 * Photoreal-asset pipeline tests (v9.17.2): actor loader fallback,
 * IBL slug registry, postFx pipeline shape.
 *
 * The actual GLB/HDR loading + postprocessing chain require a WebGL
 * context and are exercised in the browser. Here we cover the parts
 * that have a meaningful pure-data contract.
 */
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { _resetActorCache, loadActorTemplate, createActorFigure, CAST_DIR } from './actorLoader';
import { SCENE_HDRI_SLUGS, HDR_DIR } from './ibl';
import { SCENE_IDS_3D } from './environments';
import { stemiWalkthrough } from '../lib/walkthrough-stemi';

describe('actorLoader — fallback behaviour', () => {
  it('exposes the public CAST_DIR path', () => {
    expect(CAST_DIR).toBe('/3d/cast/');
  });

  it('mounts a procedural figure immediately even when the GLB is unreachable', () => {
    _resetActorCache();
    const parent = new THREE.Group();
    const actor = stemiWalkthrough.actors['paramedic'];
    const fig = createActorFigure(actor, parent);
    // The procedural rig is added synchronously — no need to await anything.
    expect(parent.children.length).toBe(1);
    expect(fig.actorId).toBe('paramedic');
    // Sanity: setting state + updating doesn't throw.
    fig.setState({ pose: 'cpr', expression: 'focused', speaking: true });
    fig.update(0, 1 / 60);
    fig.dispose();
  });

  it('loadActorTemplate resolves (returns either a Group or null) rather than rejecting', async () => {
    _resetActorCache();
    // No GLB at the path → the loader resolves null. Crucially, this must
    // NOT throw, so the offline-PWA / empty-asset-folder dev experience
    // stays clean.
    const result = await loadActorTemplate('paramedic');
    expect(result === null || result instanceof THREE.Group).toBe(true);
  });

  it('repeated loadActorTemplate calls reuse the same promise (no duplicate fetch)', () => {
    _resetActorCache();
    const p1 = loadActorTemplate('paramedic');
    const p2 = loadActorTemplate('paramedic');
    expect(p1).toBe(p2);
  });
});

describe('IBL — per-scene HDRI registry', () => {
  it('exposes the public HDR_DIR path', () => {
    expect(HDR_DIR).toBe('/3d/hdr/');
  });

  it('declares a slug for every walkthrough scene id', () => {
    for (const id of SCENE_IDS_3D) {
      expect(SCENE_HDRI_SLUGS[id], `missing HDRI slug for ${id}`).toBeTruthy();
      expect(SCENE_HDRI_SLUGS[id]).toMatch(/^[a-z0-9_]+$/);
    }
  });

  it('slugs are distinct enough to give scenes different moods', () => {
    const slugs = Object.values(SCENE_HDRI_SLUGS);
    // At least 6 of the 12 scenes should map to a distinct HDRI.
    expect(new Set(slugs).size).toBeGreaterThanOrEqual(6);
  });
});
