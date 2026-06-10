# 3D assets — runtime-loaded by the Three.js renderer (v9.17.x)

Everything in this folder is **optional**. The 3D renderer detects missing
files at runtime and falls back to the procedural rig + per-scene
`LightingPreset` lighting. So an empty `public/3d/` is a valid state and
the renderer still works.

To populate this folder, run on your local machine:

```bash
pnpm fetch:3d           # HDRIs (Poly Haven CC0) + Kenney prop pack
pnpm fetch:3d hdris     # just HDRIs (~18 MB, biggest realism upgrade per kB)

# Quaternius characters moved off direct zips to a CC0 Google Drive folder.
# Grab the pack (≈110 MB) with gdown, then convert + map it in one command:
python -m gdown --folder \
  https://drive.google.com/drive/folders/1sNi1AfenfPRrvRt5yfaj5QMMd6KKcUJ5 \
  -O public/3d/cast/_quaternius
pnpm map:cast           # → _lib/*.glb cast + anims/*.glb pose clips
```

`pnpm map:cast` (see `scripts/map-quaternius-cast.mjs`) converts the
downloaded glTFs to GLB, writes one shared character per clinical role into
`cast/_lib/`, and extracts the 7 `BeatPose` animation clips into `anims/`.
The per-actor → library mapping lives in `src/game3d/castManifest.ts`.

## Layout

- `hdr/{sceneId}.hdr` — Poly Haven HDRI (CC0). One per walkthrough
  scene id (kopitiam, street, mrt, resus, cathlab, imaging, counsel,
  ward, pharmacy, rehab, clinic, backhouse). Used by `PMREMGenerator`
  for image-based lighting (the prefiltered envmap is set as
  `scene.environment` so every PBR material picks up realistic specular
  + ambient response).
- `cast/{actorId}.glb` — **per-actor override** (any rigged GLB). Highest
  priority: an authored MakeHuman / Ready Player Me export for a named
  recurring character drops in here and wins. File id = the actor id in the
  walkthrough's `actors` map (`patient`, `paramedic`, `ed-nurse`, …).
- `cast/_lib/{slug}.glb` — **shared role library** produced by `pnpm map:cast`.
  One Quaternius character per clinical role (doctor, nurse, worker, suit,
  casual, …); `castManifest.ts` picks the right one for any actor without a
  per-actor override, so we don't ship 55 duplicate blobs. `actorLoader.ts`
  tries the override first, then this library, then the procedural rig.
- `anims/{slug}.glb` — the 7 `BeatPose` clips (`idle-breathing`, `walking`,
  `kneeling`, `sitting`, `cpr-compressions`, `lying-down`, `pointing`), each a
  single Quaternius animation. `PoseAnimationDriver` cross-fades them on pose
  change; missing clips just leave the rig in its scripted motion.
- `props/` — environment props (gurneys, monitors, IV poles) sourced
  from CC0 packs. Wired in scene-by-scene as you replace procedural
  primitives.
- `_quaternius/`, `_kenney/` — staging dirs for the raw downloaded packs
  before `pnpm map:cast` cherry-picks GLBs into `cast/_lib/` and `anims/`.

## License

Every asset reachable via `pnpm fetch:3d` is **CC0 or royalty-free for
commercial use**. Source URLs and per-pack notes are in
`scripts/fetch-3d-assets.mjs`. For details on the renderer's engine
choice (Three.js vs Babylon.js) and the full list of recommended sources
including ones that need a desktop GUI (MakeHuman, Mixamo, Ready Player
Me, Marvelous Designer), see `docs/3D-RENDERER.md`.
