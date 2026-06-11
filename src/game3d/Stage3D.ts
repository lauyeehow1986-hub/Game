/**
 * Stage3D — the Three.js walkthrough engine (v9.17).
 *
 * Third renderer behind the modal toggle (2D / Cinematic / 3D). Consumes the
 * SAME staging frames as the SVG and Phaser renderers (stage-unit positions
 * from `walkthrough-staging.ts`), maps them into world metres via `space.ts`,
 * and renders a physically-lit 3D set with articulated characters:
 *
 *  - per-scene procedural environments + lighting moods (environments.ts)
 *  - ACES filmic tone mapping, PCF-soft shadow maps, exponential fog
 *  - figures glide / walk between beats, blend poses, perform CPR
 *    compressions at ~110/min, breathe at idle, lip-sync when speaking
 *  - the camera slowly tracks the current speaker (subtle dolly), and
 *    shakes on shock beats — same film grammar as the Phaser renderer
 *  - raycast picking keeps the click-an-actor card behaviour
 *
 * Pure browser module: instantiate only behind a lazy import. Everything
 * that can be tested headlessly lives in space.ts / humanoid.ts /
 * environments.ts instead.
 */
import * as THREE from 'three';
import type { SceneId } from '../lib/scenery';
import type {
  BeatExpression,
  BeatPose,
  WalkthroughActor,
} from '../lib/walkthrough';
import { buildEnvironment3D, type Environment3D } from './environments';
import { createActorFigure, type ActorFigure } from './actorLoader';
import { loadSceneEnvironment, applyEnvironment } from './ibl';
import type { PostFxPipeline } from './postFx';
import type { RendererBackend } from './webgpu';
import { CAMERA, worldX, worldZ, yawFor } from './space';

export interface Figure3D {
  id: string;
  actor: WalkthroughActor;
  /** Stage-unit position (480×270 contract). */
  x: number;
  y: number;
  pose: BeatPose;
  expression: BeatExpression;
  facing: 'N' | 'S' | 'E' | 'W';
  walking: boolean;
  speaking: boolean;
  isActive: boolean;
  isLead: boolean;
  isSelected: boolean;
}

export interface Frame3D {
  scene: SceneId;
  figures: Figure3D[];
  /** One-shot camera shake (e.g. AED shock beat). */
  shake: boolean;
}

interface FigureEntry {
  figure: ActorFigure;
  yawTarget: number;
}

export class Stage3D {
  /** Typed as WebGLRenderer for the WebGL-only call sites (PostFX, PMREM
   *  IBL); on the 'webgpu' backend this actually holds a WebGPURenderer —
   *  API-compatible for everything Stage3D calls — and those WebGL-only
   *  paths are guarded by `this.backend`. */
  private renderer: THREE.WebGLRenderer;
  /** Which rendering backend this stage runs on. */
  readonly backend: RendererBackend;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private hemi: THREE.HemisphereLight;
  private key: THREE.DirectionalLight;
  private env: Environment3D | null = null;
  private envId: SceneId | null = null;
  private figures = new Map<string, FigureEntry>();
  private clock = new THREE.Clock();
  private raycaster = new THREE.Raycaster();
  private onPick: (id: string) => void = () => {};
  private lookX = CAMERA.lookAt.x;
  private leadWorldX = 0;
  private shakeT = 0;
  private host: HTMLElement;
  private resizeObserver: ResizeObserver;
  private disposed = false;
  private postFx: PostFxPipeline | null = null;
  /** Whether to use the postprocessing pipeline (SSAO/bloom/vignette/SMAA).
   *  Set via setPostFxEnabled(); off by default so low-end devices stay
   *  on the fast direct-render path. */
  private postFxEnabled = false;

  /**
   * Async factory — the only way to request the WebGPU backend, because
   * WebGPURenderer needs an awaited `init()` before first render. Falls
   * back to WebGL whenever the import, adapter acquisition or init fails,
   * so callers can request 'webgpu' unconditionally after the opt-in.
   */
  static async create(
    host: HTMLElement,
    opts: { backend?: RendererBackend } = {},
  ): Promise<Stage3D> {
    if (opts.backend === 'webgpu') {
      try {
        const { WebGPURenderer } = await import('three/webgpu');
        const r = new WebGPURenderer({ antialias: true });
        await r.init();
        return new Stage3D(host, r as unknown as THREE.WebGLRenderer, 'webgpu');
      } catch {
        // No adapter / import failure / init failure → standard WebGL path.
      }
    }
    return new Stage3D(host);
  }

  constructor(host: HTMLElement, renderer?: THREE.WebGLRenderer, backend: RendererBackend = 'webgl') {
    this.host = host;
    this.backend = backend;
    this.renderer = renderer ?? new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';

    this.camera = new THREE.PerspectiveCamera(CAMERA.fov, 16 / 9, CAMERA.near, CAMERA.far);
    this.camera.position.set(CAMERA.pos.x, CAMERA.pos.y, CAMERA.pos.z);

    this.hemi = new THREE.HemisphereLight('#ffffff', '#404040', 1);
    this.key = new THREE.DirectionalLight('#ffffff', 1);
    this.key.castShadow = true;
    this.key.shadow.mapSize.set(2048, 2048);
    this.key.shadow.camera.left = -11;
    this.key.shadow.camera.right = 11;
    this.key.shadow.camera.top = 11;
    this.key.shadow.camera.bottom = -11;
    this.key.shadow.bias = -0.0008;
    this.scene.add(this.hemi, this.key, this.key.target);

    this.resize();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);

    this.renderer.domElement.addEventListener('pointerdown', this.handlePointer);
    this.renderer.setAnimationLoop(() => this.tick());
  }

  setPick(cb: (id: string) => void) {
    this.onPick = cb;
  }

  /** Toggle the SSAO/bloom/vignette/SMAA pipeline. Off keeps the fast
   *  direct-render path; on costs ~15-25% of the frame budget at 1080p.
   *  The whole `postprocessing` package is lazy-imported on first enable
   *  so the default 3D chunk stays lean. */
  async setPostFxEnabled(on: boolean) {
    // The `postprocessing` package is WebGL-only — on the WebGPU backend
    // the toggle is a no-op (the host UI hides it there too).
    if (this.backend === 'webgpu') return;
    if (on === this.postFxEnabled) return;
    this.postFxEnabled = on;
    if (on && !this.postFx) {
      const { buildPostFx } = await import('./postFx');
      if (this.disposed || !this.postFxEnabled) return;
      this.postFx = buildPostFx(this.renderer, this.scene, this.camera);
      const w = this.host.clientWidth || 640;
      const h = this.host.clientHeight || 360;
      this.postFx.setSize(w, h, Math.min(window.devicePixelRatio, 2));
    } else if (!on && this.postFx) {
      this.postFx.dispose();
      this.postFx = null;
    }
  }

  setFrame(frame: Frame3D) {
    if (this.disposed) return;
    const sceneChanged = frame.scene !== this.envId;
    if (sceneChanged) this.swapEnvironment(frame.scene);

    const seen = new Set<string>();
    for (const f of frame.figures) {
      seen.add(f.id);
      let entry = this.figures.get(f.id);
      if (!entry) {
        const figure = createActorFigure(f.actor, this.scene);
        entry = { figure, yawTarget: yawFor(f.facing) };
        this.figures.set(f.id, entry);
        figure.setGoal(worldX(f.x), worldZ(f.y));
        figure.snapToGoal();
        // walk-in: new figures during a chapter enter from their off-side
        if (!sceneChanged) {
          figure.root.position.x += f.x < 240 ? -4 : 4;
        }
      }
      entry.figure.setGoal(worldX(f.x), worldZ(f.y));
      if (sceneChanged) entry.figure.snapToGoal();
      entry.yawTarget = yawFor(f.facing);
      entry.figure.setState({
        pose: f.pose,
        expression: f.expression,
        walking: f.walking,
        speaking: f.speaking,
        isLead: f.isLead,
      });
      if (f.isLead) this.leadWorldX = worldX(f.x);
    }
    // remove departed figures
    for (const [id, entry] of this.figures) {
      if (!seen.has(id)) {
        this.scene.remove(entry.figure.root);
        entry.figure.dispose();
        this.figures.delete(id);
      }
    }
    if (frame.shake) this.shakeT = 0.45;
  }

  private swapEnvironment(id: SceneId) {
    if (this.env) {
      this.scene.remove(this.env.group);
      disposeGroup(this.env.group);
    }
    const env = buildEnvironment3D(id);
    this.env = env;
    this.envId = id;
    this.scene.add(env.group);

    const L = env.lighting;
    this.hemi.color.set(L.hemi.sky);
    this.hemi.groundColor.set(L.hemi.ground);
    this.hemi.intensity = L.hemi.intensity;
    this.key.color.set(L.key.color);
    this.key.intensity = L.key.intensity;
    this.key.position.set(...L.key.pos);
    this.key.target.position.set(0, 0, -7);
    this.scene.fog = new THREE.FogExp2(L.fog.color, L.fog.density);
    this.renderer.setClearColor(new THREE.Color(L.clear));

    // async IBL upgrade: when public/3d/hdr/{id}.hdr is present, the
    // prefiltered envmap takes over PBR specular + ambient response.
    // On miss the per-scene preset lights stay in charge — no behaviour
    // change for users who haven't run `pnpm fetch:3d`. PMREM prefiltering
    // is WebGL-bound, so the WebGPU backend keeps the preset lights.
    if (this.backend === 'webgl') {
      const presetHemiIntensity = L.hemi.intensity;
      loadSceneEnvironment(id, this.renderer).then((entry) => {
        if (this.disposed || this.envId !== id) return;
        applyEnvironment(this.scene, entry);
        // With an HDRI present the PMREM env supplies directional diffuse
        // irradiance, so the constant hemisphere fill is now redundant and
        // would only flatten contrast. Fade it to a small residual; restore
        // the full preset value on a miss (preset lights stay in charge).
        this.hemi.intensity = entry ? presetHemiIntensity * 0.3 : presetHemiIntensity;
      });
    }
  }

  private tick() {
    if (this.disposed) return;
    const dt = Math.min(this.clock.getDelta(), 0.1);
    const t = this.clock.elapsedTime;

    this.env?.group.userData.animate?.(t);

    for (const entry of this.figures.values()) {
      entry.figure.update(t, dt);
      // smooth yaw toward facing
      const root = entry.figure.root;
      let dy = entry.yawTarget - root.rotation.y;
      while (dy > Math.PI) dy -= Math.PI * 2;
      while (dy < -Math.PI) dy += Math.PI * 2;
      root.rotation.y += dy * Math.min(1, dt * 8);
    }

    // cinematic camera: drift the look-at gently toward the speaker
    this.lookX += (this.leadWorldX * 0.45 - this.lookX) * Math.min(1, dt * 1.2);
    let camX = CAMERA.pos.x + this.lookX * 0.55;
    let camY = CAMERA.pos.y;
    if (this.shakeT > 0) {
      this.shakeT -= dt;
      const a = Math.max(0, this.shakeT) * 0.35;
      camX += (Math.random() - 0.5) * a;
      camY += (Math.random() - 0.5) * a;
    }
    this.camera.position.set(camX, camY, CAMERA.pos.z);
    this.camera.lookAt(this.lookX, CAMERA.lookAt.y, CAMERA.lookAt.z);

    if (this.postFx) this.postFx.render(dt);
    else this.renderer.render(this.scene, this.camera);
  }

  private resize() {
    const w = this.host.clientWidth || 640;
    const h = this.host.clientHeight || 360;
    const pr = Math.min(window.devicePixelRatio, 2);
    this.renderer.setSize(w, h, false);
    this.renderer.setPixelRatio(pr);
    if (this.postFx) this.postFx.setSize(w, h, pr);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private handlePointer = (ev: PointerEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((ev.clientX - rect.left) / rect.width) * 2 - 1,
      -((ev.clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.raycaster.setFromCamera(ndc, this.camera);
    const hits = this.raycaster.intersectObjects(
      [...this.figures.values()].map((f) => f.figure.root),
      true,
    );
    const id = hits[0]?.object.userData.actorId as string | undefined;
    if (id) this.onPick(id);
  };

  dispose() {
    this.disposed = true;
    this.renderer.setAnimationLoop(null);
    this.resizeObserver.disconnect();
    this.renderer.domElement.removeEventListener('pointerdown', this.handlePointer);
    for (const entry of this.figures.values()) entry.figure.dispose();
    this.figures.clear();
    if (this.env) disposeGroup(this.env.group);
    this.postFx?.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

function disposeGroup(group: THREE.Group) {
  group.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.geometry.dispose();
      const m = o.material;
      if (Array.isArray(m)) m.forEach((x) => x.dispose());
      else m.dispose();
    }
  });
}
