# 3D assets — runtime-loaded by the Three.js renderer (v9.17.x)

Everything in this folder is **optional**. The 3D renderer detects missing
files at runtime and falls back to the procedural rig + per-scene
`LightingPreset` lighting. So an empty `public/3d/` is a valid state and
the renderer still works.

To populate this folder, run on your local machine:

```bash
pnpm fetch:3d           # everything (HDRIs + character packs + props)
pnpm fetch:3d hdris     # just HDRIs (~25 MB, biggest realism upgrade per kB)
pnpm fetch:3d quaternius
pnpm fetch:3d kenney
```

## Layout

- `hdr/{sceneId}.hdr` — Poly Haven HDRI (CC0). One per walkthrough
  scene id (kopitiam, street, mrt, resus, cathlab, imaging, counsel,
  ward, pharmacy, rehab, clinic, backhouse). Used by `PMREMGenerator`
  for image-based lighting (the prefiltered envmap is set as
  `scene.environment` so every PBR material picks up realistic specular
  + ambient response).
- `cast/{actorId}.glb` — per-actor 3D mesh (any rigged GLB works). When
  present, `actorLoader.ts` swaps the procedural humanoid for the GLB
  template; the procedural rig keeps driving position + lip-sync state.
  Suggested file ids: `patient`, `paramedic`, `consultant`, `mo`,
  `nurse`, `bystander`, `smrt-staff`, etc. (anything in the
  walkthrough's `actors` map).
- `props/` — environment props (gurneys, monitors, IV poles) sourced
  from CC0 packs. Wired in scene-by-scene as you replace procedural
  primitives.
- `_quaternius/`, `_kenney/` — staging dirs for the raw downloaded zips
  before you cherry-pick GLBs into `cast/` and `props/`.

## License

Every asset reachable via `pnpm fetch:3d` is **CC0 or royalty-free for
commercial use**. Source URLs and per-pack notes are in
`scripts/fetch-3d-assets.mjs`. For details on the renderer's engine
choice (Three.js vs Babylon.js) and the full list of recommended sources
including ones that need a desktop GUI (MakeHuman, Mixamo, Ready Player
Me, Marvelous Designer), see `docs/3D-RENDERER.md`.
