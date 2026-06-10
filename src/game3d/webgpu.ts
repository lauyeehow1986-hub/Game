/**
 * WebGPU renderer path — capability check + persisted opt-in flag
 * (REMAINING.md backlog item, v9.18).
 *
 * Three.js r170+ ships a WebGPURenderer (`three/webgpu`). On supported
 * devices it can render the 3D walkthrough through the WebGPU API instead
 * of WebGL2. It stays strictly opt-in:
 *
 *  - WebGL remains the default and the fallback on any init failure.
 *  - The toggle only appears when `navigator.gpu` exists.
 *  - Known degradations on the WebGPU path (both by design):
 *      · the `postprocessing` SSAO/bloom chain is WebGL-only → PostFX off;
 *      · PMREM-prefiltered HDR IBL is WebGL-bound → per-scene
 *        LightingPreset lights stay in charge.
 */

const KEY = 'sg-pathway-webgpu-v1';

export type RendererBackend = 'webgl' | 'webgpu';

/** The DOM lib doesn't ship WebGPU types; this is the sliver we touch. */
interface NavigatorGPU {
  gpu?: { requestAdapter(): Promise<unknown> } | null;
}

/** Cheap synchronous capability check — does the browser expose WebGPU at
 *  all? (Adapter acquisition can still fail later; Stage3D.create falls
 *  back to WebGL when it does.) */
export function isWebGPUSupported(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (navigator as NavigatorGPU).gpu != null;
}

/** Deep asynchronous probe — actually asks for an adapter. */
export async function probeWebGPU(): Promise<boolean> {
  if (!isWebGPUSupported()) return false;
  try {
    const adapter = await (navigator as NavigatorGPU).gpu!.requestAdapter();
    return adapter != null;
  } catch {
    return false;
  }
}

export function isWebGPUOptedIn(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function setWebGPUOptedIn(v: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, v ? '1' : '0');
  } catch {
    /* private mode — the preference just doesn't persist */
  }
}

/** Pure preference resolution: WebGPU only when the user opted in AND the
 *  platform exposes it; everything else stays WebGL. */
export function resolveBackend(optedIn: boolean, supported: boolean): RendererBackend {
  return optedIn && supported ? 'webgpu' : 'webgl';
}
