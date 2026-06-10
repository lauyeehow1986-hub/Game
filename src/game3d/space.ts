/**
 * 3D stage space — pure mapping from the shared 480×270 stage-unit contract
 * (see `walkthrough-staging.ts` / `scenery.tsx`) into Three.js world metres.
 *
 * The 2D renderers fake depth with `depthScale` (0.7 back → 1.3 front);
 * in true 3D the perspective camera does that physically, so this module
 * only maps (x, y) → (X, Z) on the floor plane. Kept free of Three.js so
 * it unit-tests in node without a WebGL context.
 *
 * Contract:
 *  - stage x ∈ [0, 480]  →  world X ∈ [-13.3, +13.3]  (left → right)
 *  - stage y ∈ [80, 260] →  world Z ∈ [-15, 0]        (back → front)
 *  - the camera sits at +Z looking toward -Z; the floor is y=0.
 */

export const WORLD_X_PER_STAGE = 1 / 18;
export const WORLD_Z_PER_STAGE = 1 / 12;

/** Stage-unit x (0..480) → world X metres (centred). */
export function worldX(stageX: number): number {
  return (stageX - 240) * WORLD_X_PER_STAGE;
}

/** Stage-unit y (depth row, ~80 back .. ~260 front) → world Z metres. */
export function worldZ(stageY: number): number {
  return (stageY - 260) * WORLD_Z_PER_STAGE;
}

/** Facing direction → yaw (radians) for a character whose rest pose looks
 *  toward the camera (+Z). */
export function yawFor(direction: 'N' | 'S' | 'E' | 'W'): number {
  switch (direction) {
    case 'S': return 0;            // toward camera
    case 'N': return Math.PI;      // away
    case 'E': return -Math.PI / 2; // stage-right
    case 'W': return Math.PI / 2;  // stage-left
  }
}

/** Camera rig constants shared by the engine and tests. */
export const CAMERA = {
  fov: 38,
  pos: { x: 0, y: 4.6, z: 11.5 },
  lookAt: { x: 0, y: 1.1, z: -4.5 },
  near: 0.1,
  far: 120,
} as const;
