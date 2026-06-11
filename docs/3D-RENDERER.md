# 3D walkthrough renderer — engineering decisions

Living doc for the v9.17 Three.js renderer. Covers the engine choice
(Three.js vs Babylon.js), the photorealism upgrade path (CC0 / free
rigged characters + PBR assets), and the framing/correctness fixes
made in v9.17.1.

## Engine choice — Three.js, not Babylon.js

We considered switching to Babylon.js for v9.17. Verdict: **stay on
Three.js.** The reasoning, plainly:

**Where Babylon would beat us.** Babylon ships a more batteries-included
PBR pipeline — `PBRMaterial` has clearcoat, sheen, anisotropy, subsurface,
and iridescence wired in with first-class `KHR_materials_*` extension
support maintained in lockstep with the glTF spec. Its
`DefaultRenderingPipeline` bundles SSAO2, SSR, bloom, tone-mapping, DoF,
and grain as a configured chain rather than a kit-of-parts. IBL is more
turnkey (HDR cubemap → prefiltered environment via built-in tools), and
it has real-time GI prototypes (voxel-based GI, SSGI). Three.js can match
most of this but requires assembling `EffectComposer` passes, third-party
SSR/SSGI, and manual KHR loaders.

**Why we stayed.** Babylon's minified+gzipped core is roughly 900 kB – 1.2 MB
versus Three.js's ~150 kB; switching would roughly double our already-large
536 kB lazy chunk and worsen TTI on the educational-game audience's
mid-tier devices. React integration via `@react-three/fiber` and `drei`
is dramatically more mature than Babylon's React story, and our existing
renderer code (Stage3D, humanoid, environments, space mapping) is sunk
cost that pays off only on Three.js. For photoreal humans the bottleneck
is **assets, skin shading, and IBL setup — not the engine.** Spend the
effort on `KHR_materials_transmission`/`clearcoat` material work, a proper
prefiltered HDR environment, and SSAO+bloom via `postprocessing.js`.
Revisit Babylon only if we later need its node-material editor or
real-time GI as a hard requirement.

## CC0 / free-for-commercial-use asset sources

Quick reference for upgrading the cast from procedural primitives to
authored rigged models. **Drop new GLB/glTF files in `public/3d/` and
load them via `THREE.GLTFLoader`** — the existing `Humanoid` class is the
adapter we'd replace.

| Source | License | What's there | Format | Notes / gotchas |
| --- | --- | --- | --- | --- |
| **Mixamo** ([mixamo.com](https://www.mixamo.com)) | Free for commercial use; Adobe acct required | ~80 rigged humans + 2,500+ animations + auto-rigger | FBX, Collada (no native glTF) | Best as the **animation library**, not the character library. Limited ethnic diversity. Service is on cruise control — no updates. |
| **Ready Player Me** ([readyplayer.me](https://readyplayer.me)) | Free for commercial use (custom TOS) | Half/full-body avatars; skin tones, hair, outfits incl. **scrubs / medical attire** | glTF / GLB native | Stylized-realistic (not full photoreal). Standard humanoid skeleton + viseme morphs. SDK/API integration nudges branding. |
| **Quaternius** ([quaternius.com](https://quaternius.com)) | **CC0** | "Ultimate Character Pack" — rigged low-poly humans with modular clothing | GLB / FBX | Stylized only — won't get you to photoreal, but great for prototyping. |
| **Kenney** ([kenney.nl](https://kenney.nl)) | **CC0** | Mostly props + blocky characters | OBJ / GLB | Few rigged photoreal-capable humans. Skip for this cast. |
| **MakeHuman** ([makehumancommunity.org](http://www.makehumancommunity.org)) | **CC0** on generated meshes | Full **parametric** humans across ethnicities / ages, auto-rigged | FBX / Collada / glTF (via plugin) | Best bet for a **diverse Singapore-grounded cast**. Clothing library is thin — source scrubs separately. |
| **MB-Lab** ([github.com/animate1978/MB-Lab](https://github.com/animate1978/MB-Lab)) | AGPL plugin / CC0 output | Blender addon — maintained successor to MakeHuman, better topology and PBR-ready skin | Blender → export to glTF | Steeper Blender learning curve; output quality higher than MakeHuman. |
| **Sketchfab — CC0 filter** ([sketchfab.com/3d-models/categories/characters-creatures?features=downloadable&licenses=322a749bcfa841b29dff1e8a1bb74b0b](https://sketchfab.com/3d-models/categories/characters-creatures?features=downloadable&licenses=322a749bcfa841b29dff1e8a1bb74b0b)) | **CC0** (per asset) | Mixed quality — occasional rigged humans, medical-attire models | glTF / GLB | **Verify license per-asset** (CC-BY often mislabeled), rig quality varies wildly. |
| **Poly Haven** ([polyhaven.com](https://polyhaven.com)) | **CC0** | HDRIs + PBR textures + props (no rigged characters) | HDR / EXR / glTF | Use for **IBL lighting** of our sets and for scrub-fabric textures. The biggest realism upgrade per kB. |
| **VRoid Studio** ([vroid.com](https://vroid.com)) | Free, commercial output OK (check per-item) | Anime-stylized VRM avatars | VRM | Wrong aesthetic for photoreal healthcare — skip. |
| **CGTrader / TurboSquid (Free section)** | Per-asset, often royalty-free | Medical models (gurneys, monitors, ambulances) | Various | Cherry-pick props; verify each license. |
| **Open3DLab** ([open3dlab.com](https://open3dlab.com)) | Mostly Source/SFM ports — license varies | Background-character ports | SMD / GLB | Niche; license per asset. |

**Medical attire specifically** — no CC0 source ships rigged scrubs out of
the box. Realistic path: MakeHuman/MB-Lab base + Marvelous Designer or
Blender cloth-sim scrubs (or RPM's scrub outfits if their style is
acceptable). For props (otoscope, BP cuff, IV pole, defibrillator) —
Sketchfab CC0 + Poly Haven props get most of the way.

**Recommended starter set** for the SG-pathway cast upgrade:

1. **Patient** Mr Tan + Mdm Lim → MakeHuman parametric (age, ethnicity)
2. **Doctors / cardiologist / neurologist** → MakeHuman base + Marvelous
   Designer white-coat OR Ready Player Me with their lab-coat outfit
3. **Paramedics / SCDF** → MakeHuman + custom Singapore SCDF orange jumpsuit
4. **Nurses / AHP** → Ready Player Me with scrubs outfits
5. **Bystanders / family / commuters** → Mix of RPM avatars for variety
6. **Animations** → All from Mixamo (kneel, CPR, walk, wave, point — all
   exist in the library)
7. **HDRIs** → Poly Haven `studio_small_03`, `hospital_room`,
   `street_lamp_evening` for per-scene IBL

## v9.17.1 — framing + correctness fix

Two bugs were caught by a live-screen photo of the v9.17.0 release:

1. **E / W facing was swapped.** `yawFor` returned `+π/2` for W and
   `-π/2` for E, but in three.js a +Y rotation by `+θ` rotates the
   rest-forward vector `(0, 0, 1)` to `(sin θ, 0, cos θ)` — so E
   (stage-right, +X) should be `+π/2` and W (stage-left, −X) should be
   `−π/2`. The screenshot showed the attendant and CFR facing the
   wrong way. **Fixed in `space.ts`** with a dedicated regression test
   that asserts `sin(yawFor('E')) === 1` and `sin(yawFor('W')) === −1`.

2. **World was too wide for the camera.** v9.17.0 used `WORLD_X_PER_STAGE
   = 1/18` (480 stage units → 26.7 m world width) with FOV 38° and camera
   z=11.5. That left figures at ~5% of frame height and split across the
   screen edges. **Fixed in `space.ts` + `Stage3D.ts`**: tighter scale
   (`1/24` X, `1/14` Z → 20 m × 12.9 m world), narrower FOV (32°), closer
   camera (z=8.5, y=3.6), wider speaker-pan amplitude (0.55× lead-X).
   Shadow frustum tightened to ±11 m. Kopitiam + street props re-positioned
   so the action sits in the camera's effective field of view.

Diff in numbers: a 1.8 m figure at the staging front-row (stage y=228)
now occupies ~33% of frame height (was ~5% in v9.17.0).

## Future work (post-v9.17.1)

- **Photoreal asset swap-in** behind a sub-toggle inside the 3D renderer:
  load a CC0 GLB cast when available (`public/3d/cast/{actorId}.glb`),
  fall back to the procedural `Humanoid` rig when not. Keeps the offline
  PWA shape working even without the asset bundle.
- **IBL lighting** from Poly Haven HDRIs, one per scene mood — already
  has natural fall-through with the per-scene `LightingPreset`.
- **`postprocessing` package** for SSAO, bloom, vignette tied to the v9.14.1
  scene moods. Lazy-loaded only when 3D is selected.
- **glTF skinning + animation clips** from Mixamo as a replacement for the
  procedural CPR / walk cycles, gated on a sub-toggle.

## Decision — real-time GI is rejected; IBL + SSAO is the GI we ship

The backlog asked us to revisit real-time global illumination "only if
PostFX-on still looks flat now that authored assets have landed". Having
landed the HDRIs and the GLB cast, the verdict is **rejected**, for
concrete reasons:

- **We already ship the standard approximate-GI stack.** The PMREM
  environment (`ibl.ts`) gives every PBR material *directional* diffuse
  irradiance **and** prefiltered specular reflections — image-based diffuse
  + specular GI. SSAO (`postFx.ts`) adds the contact-occlusion / indirect
  darkening that a one-bounce GI pass would contribute. IBL + SSAO under
  ACES tone mapping is exactly the "fake GI" combination real-time GI would
  otherwise approximate, at a fraction of the cost.
- **True real-time GI is not in the stable toolset.** SSGI / voxel / LPV GI
  is not in the `postprocessing` package's stable set; rolling our own would
  be a large, fragile pass that the WebGPU β path (no PostFX by design)
  could not share, and would blow the lean-chunk budget the PWA depends on.
- **The flatness cause was double-counting, not missing GI.** A constant
  `HemisphereLight` fill is the *flattest* possible ambient. When an HDRI is
  present we now (a) set `scene.environmentIntensity` so the image-based
  indirect drives the ambient, and (b) fade the preset hemisphere to a 30 %
  residual so it stops washing out the env's directional diffuse. This is a
  zero-extra-pass change (it scales existing terms) and is the real
  anti-flatness uplift — shipped, not deferred.

If a future scene still reads flat, the lever is per-scene
`environmentIntensity` / exposure tuning and stronger authored HDRIs, **not**
a real-time GI pass. Revisit only if three's TSL post-processing brings a
maintained SSGI effect that also works on the WebGPU backend.
