/**
 * Postprocessing pipeline — SSAO + bloom + vignette via the `postprocessing`
 * package, lazy-loaded alongside the 3D renderer.
 *
 * Cheap configuration tuned for the walkthrough's set scale (~20 m × 13 m
 * world): bloom only on bright emissives (stall signs, ambulance beacon,
 * MRT LED), gentle SSAO to ground figures into the floor, light vignette
 * for the cinematic letterbox feel that pairs with v9.16's letterbox bars.
 *
 * Toggle: a single boolean on the Stage3D engine. When off, we render
 * straight to canvas (faster on low-end devices / Suspense fallback).
 */
import * as THREE from 'three';
import {
  EffectComposer,
  RenderPass,
  EffectPass,
  BloomEffect,
  SSAOEffect,
  VignetteEffect,
  SMAAEffect,
  NormalPass,
} from 'postprocessing';

export interface PostFxPipeline {
  composer: EffectComposer;
  render(dt: number): void;
  setSize(w: number, h: number, pixelRatio: number): void;
  dispose(): void;
}

export function buildPostFx(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
): PostFxPipeline {
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // depth/normal pass feeds SSAO
  const normalPass = new NormalPass(scene, camera);
  composer.addPass(normalPass);

  const ssao = new SSAOEffect(camera, normalPass.texture, {
    samples: 12,
    radius: 0.18,
    intensity: 1.4,
    bias: 0.05,
    fade: 0.05,
    resolutionScale: 0.5,
  });
  const bloom = new BloomEffect({
    intensity: 0.45,
    luminanceThreshold: 0.85,
    luminanceSmoothing: 0.3,
    mipmapBlur: true,
  });
  const vignette = new VignetteEffect({
    offset: 0.35,
    darkness: 0.55,
  });
  const smaa = new SMAAEffect();

  composer.addPass(new EffectPass(camera, ssao, bloom, vignette, smaa));

  return {
    composer,
    render(dt: number) {
      composer.render(dt);
    },
    setSize(w, h, pixelRatio) {
      // EffectComposer reads pixel ratio off the wrapped renderer.
      composer.setSize(w * pixelRatio, h * pixelRatio, true);
    },
    dispose() {
      composer.dispose();
    },
  };
}
