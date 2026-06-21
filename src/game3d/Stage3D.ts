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
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
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
import { CAMERA, worldX, worldZ, yawFor, surfacePlacement } from './space';
import { DustMotes } from './atmosphere';

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
  /** This beat lays a collapsed patient on the scene's opt-in surface. */
  onSurface: boolean;
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
  private rim: THREE.DirectionalLight;
  private env: Environment3D | null = null;
  private envId: SceneId | null = null;
  /** Scrolling emissive screens (live ECG monitors), advanced each tick. */
  private scrollScreens: { tex: THREE.Texture; speed: number }[] = [];
  /** Procedural studio IBL used when no per-scene HDRI is on disk (the
   *  deployed site / pre-`fetch:3d`). Built once, reused across scenes. */
  private fallbackEnv: THREE.Texture | null = null;
  /** Graded sky-backdrop texture for the current scene (disposed on swap). */
  private backdrop: THREE.Texture | null = null;
  /** Global drifting dust-mote layer — cinematic air across every scene. */
  private dust: DustMotes | null = null;
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
    // VSM (variance) shadows give a real blur radius — three downgrades the
    // deprecated PCFSoftShadowMap to hard PCF, so figures/props were cast with
    // crisp edges. VSM softens every contact shadow across all scenes.
    this.renderer.shadowMap.type = THREE.VSMShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // Slightly lifted exposure — ACES rolls off the highlights, so the dusk
    // and clinical scenes both read brighter without clipping. Tuned in the
    // visual-research loop (docs/visual-research/RESULTS.md, iter 1).
    this.renderer.toneMappingExposure = 1.15;
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
    // VSM: a soft penumbra (radius + blur samples), tight near/far for depth
    // precision, and normalBias to kill the peter-panning VSM is prone to.
    this.key.shadow.camera.near = 1;
    this.key.shadow.camera.far = 42;
    this.key.shadow.radius = 4;
    this.key.shadow.blurSamples = 16;
    this.key.shadow.bias = -0.0004;
    this.key.shadow.normalBias = 0.03;
    // Soft rim/back light — a low, cool back-light that wraps a bright edge
    // around the cast so they separate from the set (the "premium studio" read
    // of the soft-clean look). Fill only (no shadow), low intensity; its
    // per-scene intensity/colour are set in swapEnvironment.
    this.rim = new THREE.DirectionalLight('#cfe0ff', 0.5);
    this.rim.position.set(-4, 5, -8);
    this.scene.add(this.hemi, this.key, this.key.target, this.rim);

    // Cinematic air: a global drifting dust-mote layer (one draw call) so the
    // light shafts read as real beams and the room never looks vacuum-empty.
    this.dust = new DustMotes();
    this.scene.add(this.dust.points);

    this.resize();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);

    this.renderer.domElement.addEventListener('pointerdown', this.handlePointer);
    this.renderer.setAnimationLoop(() => this.tick());

    // __VERIFY_HOOK__ (temporary, reverted after verification): expose the
    // internals the headless Playwright harness needs to orbit the camera and
    // measure figure bounding boxes. Maps the internal FigureEntry view to the
    // { figure: { root } } shape the harness reads.
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this;
      (window as unknown as { __stage3d: unknown }).__stage3d = {
        get camera() { return self.camera; },
        get renderer() { return self.renderer; },
        get scene() { return self.scene; },
        get postFx() { return self.postFx; },
        get postFxEnabled() { return self.postFxEnabled; },
        get figures() {
          const m = new Map<string, { figure: { root: unknown } }>();
          for (const [id, entry] of self.figures) {
            m.set(id, { figure: { root: (entry.figure as { root: unknown }).root } });
          }
          return m;
        },
        tick: () => self.tick(),
      };
    }
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
    const surface = this.env?.surface;
    // Blocking focus: if a patient is actually on the scene's surface this frame,
    // find their world spot so clinicians turn to face the casualty (a team
    // around one patient) instead of facing the camera. Stays null when no
    // patient is on a surface (e.g. a street ground-casualty), so authored
    // facings are kept there.
    let focusX: number | null = null;
    let focusZ = 0;
    for (const ff of frame.figures) {
      const p = surfacePlacement(surface, ff.pose, ff.onSurface);
      if (p) { focusX = p.x; focusZ = p.z; break; }
    }
    for (const f of frame.figures) {
      seen.add(f.id);
      // A `collapsed` patient lies *on* the scene's surface (trolley / table /
      // stretcher): snap to its centre, face along its length, and lift to its
      // height. surfacePlacement decides whether to snap (auto indoor surfaces
      // always; opt-in outdoor stretchers only when the beat says so). Everyone
      // else keeps their authored mark.
      const place = surfacePlacement(surface, f.pose, f.onSurface);
      const gx = place ? place.x : worldX(f.x);
      const gz = place ? place.z : worldZ(f.y);
      const yaw = place ? place.yaw : yawFor(f.facing);
      let entry = this.figures.get(f.id);
      if (!entry) {
        const figure = createActorFigure(f.actor, this.scene);
        entry = { figure, yawTarget: yaw };
        this.figures.set(f.id, entry);
        figure.setGoal(gx, gz);
        figure.snapToGoal();
        // walk-in: new figures during a chapter enter from their off-side
        // (skip for a bed patient — they're already on the table).
        if (!sceneChanged && !place) {
          figure.root.position.x += f.x < 240 ? -4 : 4;
        }
      }
      entry.figure.setGoal(gx, gz);
      if (sceneChanged) entry.figure.snapToGoal();
      entry.yawTarget = yaw;
      // Turn non-patient figures to face the casualty on the surface.
      if (focusX !== null && f.pose !== 'collapsed') {
        const fdx = focusX - gx;
        const fdz = focusZ - gz;
        if (fdx * fdx + fdz * fdz > 0.25) entry.yawTarget = Math.atan2(fdx, fdz);
      }
      entry.figure.setState({
        pose: f.pose,
        expression: f.expression,
        walking: f.walking,
        speaking: f.speaking,
        isLead: f.isLead,
        surfaceY: place ? place.y : 0,
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

  /** Build a vertical sky→horizon gradient texture for the scene background.
   *  Cheap (16×256 canvas), sRGB, regenerated only on scene change. */
  private makeBackdrop(topHex: string, bottomHex: string): THREE.Texture {
    const c = document.createElement('canvas');
    c.width = 16;
    c.height = 256;
    const ctx = c.getContext('2d');
    if (ctx) {
      const g = ctx.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, topHex);
      g.addColorStop(0.6, bottomHex);
      g.addColorStop(1, bottomHex);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 16, 256);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
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

    // Collect scrolling screens (live ECG monitors) tagged by the builders, so
    // tick() can advance their texture offset — a single generic pass that
    // animates every monitor regardless of whether its scene has an animate
    // hook. Re-collected per scene swap.
    this.scrollScreens = [];
    env.group.traverse((o) => {
      const u = (o as THREE.Mesh).userData;
      const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (u?.scrollU && m?.emissiveMap) {
        this.scrollScreens.push({ tex: m.emissiveMap, speed: u.scrollU as number });
      }
    });

    const L = env.lighting;
    this.hemi.color.set(L.hemi.sky);
    this.hemi.groundColor.set(L.hemi.ground);
    this.hemi.intensity = L.hemi.intensity;
    this.key.color.set(L.key.color);
    this.key.intensity = L.key.intensity;
    this.key.position.set(...L.key.pos);
    this.key.target.position.set(0, 0, -7);
    // Rim follows the key — subtle, cool, keyed off the scene's sky tone.
    this.rim.intensity = L.key.intensity * 0.28;
    this.rim.color.set(L.hemi.sky);
    // Tint the dust to this scene's key light so the air reads warm (kopitiam)
    // or cool (clinical) — dust is lit by the key, so it takes its colour.
    this.dust?.setTint(L.key.color);
    this.scene.fog = new THREE.FogExp2(L.fog.color, L.fog.density);
    this.renderer.setClearColor(new THREE.Color(L.clear));

    // Graded sky backdrop. The HDRI lights the set (scene.environment) but
    // leaves the background a flat dark clear-colour — reading as a black
    // void. A cheap vertical gradient (sky tone up top → fog tone at the
    // horizon) restores aerial depth and ties into the fog seamlessly, with
    // no asset reliance. Rebuilt per scene change (infrequent), disposed on
    // swap. Browser-only (canvas), so it lives here, not in the headless
    // environment builders.
    if (this.backdrop) this.backdrop.dispose();
    this.backdrop = this.makeBackdrop(L.hemi.sky, L.fog.color);
    this.scene.background = this.backdrop;

    // async IBL upgrade: when public/3d/hdr/{id}.hdr is present, the
    // prefiltered envmap takes over PBR specular + ambient response.
    // On miss the per-scene preset lights stay in charge — no behaviour
    // change for users who haven't run `pnpm fetch:3d`. PMREM prefiltering
    // is WebGL-bound, so the WebGPU backend keeps the preset lights.
    if (this.backend === 'webgl') {
      const presetHemiIntensity = L.hemi.intensity;
      loadSceneEnvironment(id, this.renderer).then((entry) => {
        if (this.disposed || this.envId !== id) return;
        if (entry) {
          // Per-scene HDRI present: it supplies directional diffuse irradiance,
          // so fade the now-redundant constant hemisphere fill for contrast.
          applyEnvironment(this.scene, entry);
          this.hemi.intensity = presetHemiIntensity * 0.42;
        } else {
          // No HDRI on disk (deployed site / pre-`fetch:3d`). Rather than leave
          // materials with no image-based lighting (flat, no specular), fall
          // back to a procedural studio environment so metal/glass/floors get
          // real reflections + ambient everywhere — asset-free.
          this.scene.environment = this.fallbackEnvironment();
          this.scene.environmentIntensity = 0.6;
          this.hemi.intensity = presetHemiIntensity * 0.7;
        }
      });
    }
  }

  /** Build (once) a PMREM-prefiltered procedural studio IBL from three's
   *  RoomEnvironment — a neutral lit room that gives PBR materials specular
   *  reflections + ambient response without any downloaded HDRI. */
  private fallbackEnvironment(): THREE.Texture {
    if (!this.fallbackEnv) {
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      const room = new RoomEnvironment();
      this.fallbackEnv = pmrem.fromScene(room, 0.04).texture;
      pmrem.dispose();
    }
    return this.fallbackEnv;
  }

  private tick() {
    if (this.disposed) return;
    const dt = Math.min(this.clock.getDelta(), 0.1);
    const t = this.clock.elapsedTime;

    this.env?.group.userData.animate?.(t);
    this.dust?.update(dt);

    // Advance any live ECG monitor traces (scroll the waveform leftward).
    for (const s of this.scrollScreens) {
      s.tex.offset.x = (s.tex.offset.x + s.speed * dt) % 1;
    }

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
    // Idle "breathing" — a tiny, slow handheld sway against the fixed look
    // target adds gentle parallax so every shot reads alive instead of a
    // frozen diorama. Sub-frame amplitude (≤7 cm), two incommensurate
    // periods (~14 s / ~19 s) so it never visibly repeats; layers under the
    // speaker dolly and the shock shake without fighting them.
    const breath = t * 0.45;
    camX += Math.sin(breath) * 0.07;
    camY += Math.sin(breath * 0.73 + 1.1) * 0.05;
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
    this.backdrop?.dispose();
    this.fallbackEnv?.dispose();
    this.dust?.dispose();
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
