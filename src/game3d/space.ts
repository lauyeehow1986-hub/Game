/**
 * 3D stage space — pure mapping from the shared 480×270 stage-unit contract
 * (see `walkthrough-staging.ts` / `scenery.tsx`) into Three.js world metres.
 *
 * The 2D renderers fake depth with `depthScale` (0.7 back → 1.3 front);
 * in true 3D the perspective camera does that physically, so this module
 * only maps (x, y) → (X, Z) on the floor plane. Kept free of Three.js so
 * it unit-tests in node without a WebGL context.
 *
 * Contract (v9.17.1, tightened so figures fill the frame at FOV 32°):
 *  - stage x ∈ [0, 480]  →  world X ∈ [-10, +10]      (left → right)
 *  - stage y ∈ [80, 260] →  world Z ∈ [-12.9, 0]      (back → front)
 *  - camera at (0, 3.6, 8.5) looks toward (0, 1.1, -3) — closer, narrower
 *    FOV than v9.17.0 to bring figures up to a cinematic two-shot scale.
 */

export const WORLD_X_PER_STAGE = 1 / 24;
export const WORLD_Z_PER_STAGE = 1 / 14;

/** Stage-unit x (0..480) → world X metres (centred). */
export function worldX(stageX: number): number {
  return (stageX - 240) * WORLD_X_PER_STAGE;
}

/** Stage-unit y (depth row, ~80 back .. ~260 front) → world Z metres. */
export function worldZ(stageY: number): number {
  return (stageY - 260) * WORLD_Z_PER_STAGE;
}

/** Facing direction → yaw (radians) for a character whose rest pose looks
 *  toward the camera (+Z). In three.js, rotating around +Y by +θ maps the
 *  rest-forward vector (0,0,1) to (sin θ, 0, cos θ), so:
 *   - S (toward camera, +Z)   → yaw 0
 *   - N (away, −Z)            → yaw π
 *   - E (stage-right, +X)     → yaw +π/2
 *   - W (stage-left, −X)      → yaw −π/2  */
export function yawFor(direction: 'N' | 'S' | 'E' | 'W'): number {
  switch (direction) {
    case 'S': return 0;
    case 'N': return Math.PI;
    case 'E': return Math.PI / 2;
    case 'W': return -Math.PI / 2;
  }
}

/** Camera rig constants shared by the engine and tests. */
export const CAMERA = {
  fov: 29,
  pos: { x: 0, y: 3.5, z: 8.2 },
  lookAt: { x: 0, y: 1.15, z: -3.0 },
  near: 0.1,
  far: 80,
} as const;
