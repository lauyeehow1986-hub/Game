# Photoreal cast — Steps D & E

This closes Steps **D** (parametric humans for the recurring cast) and **E**
(custom medical attire) of `docs/REMAINING.md` §1. The 3D walkthrough renderer
already resolves an actor's mesh in three tiers
(`src/game3d/actorLoader.ts`):

```
public/3d/cast/{actorId}.glb   ← authored override   (Steps D/E live here)
public/3d/cast/_lib/*.glb      ← Quaternius shared cast (pnpm map:cast)
procedural Humanoid rig         ← always-present fallback
```

So nothing in the app needs changing to adopt photoreal humans — drop a GLB in
the top slot and the loader prefers it automatically. `public/3d/cast/` is
gitignored (binary assets), exactly like the HDRIs and the Quaternius library;
the **reproducible recipe is committed**, the output is generated per machine.

## Step D — generate the cast (one command)

Requires **Blender 5.x** with the **MPFB** (MakeHuman Plugin for Blender)
extension installed from the Blender extensions platform.

```bash
blender --background --python scripts/make-cast.py
# subset:
blender --background --python scripts/make-cast.py -- --only patient,sepsis-patient
```

`scripts/make-cast.py` drives MPFB's `HumanService` headlessly: for each
recurring character it builds a parametric MakeHuman, picks a phenotype tuned
for Singaporean authenticity (age / sex / ethnicity matched to the role — see
the SG-authenticity note), adds the **default rig** (its bone names retarget
cleanly onto the pose clips — `animationLibrary.ts` already routes MakeHuman /
Quaternius default rigs through `SkeletonUtils.retargetClip`), applies a skin
tint + a flat attire-accent material, and exports
`public/3d/cast/{actorId}.glb` (≈0.9 MB, ~14.5 k verts, 163-bone rig).

The recurring cast and the slot each lands in (the `actorId` matches the
`id:` of the corresponding `WalkthroughActor`):

| actorId | Character | Ethnicity | Attire accent |
| --- | --- | --- | --- |
| `patient` | Mr Tan, 58 (STEMI) | Chinese | hospital gown |
| `stroke-patient` | Mdm Lim, 72 (stroke) | Chinese | hospital gown |
| `sepsis-patient` | Mdm Devi, 68 (sepsis) | Indian | hospital gown |
| `trauma-patient` | Mr Lim, 28 (trauma) | Chinese | hospital gown |
| `paramedic` | SCDF paramedic | Malay | SCDF orange |
| `sepsis-ed-doctor` | ED registrar | Indian | white coat |
| `trauma-team-leader` | Trauma lead | Chinese | white coat |
| `urologist` | Urologist | Indian | theatre green |
| `trauma-surgeon` | Trauma surgeon | Malay | theatre green |
| `icu-nurse` | ICU nurse | Malay | scrubs blue |

Extend `CAST` in `scripts/make-cast.py` to cover more actors — any `actorId`
that has a GLB override wins over the shared `_lib` cast.

## Step E — custom medical attire (hero refinement)

The flat attire-accent material makes roles legible immediately, but for hero
shots refine the same override slot by hand. Two CC0-friendly routes:

1. **Marvelous Designer** — drape scrubs / white coat / SCDF jumpsuit on the
   exported MakeHuman base, simulate, bake to a low-poly garment, re-attach to
   the rig, re-export over `public/3d/cast/{actorId}.glb`.
2. **Ready Player Me** — generate a clothed avatar with their scrubs catalogue,
   download the GLB, and drop it in the same slot. (RPM rigs are also default /
   Mixamo-naming-compatible, so the pose clips still retarget.)

Either way the file path is the contract: overwrite the slot, reload the 3D
walkthrough, and the photoreal cast member appears with the pose clips driving
it. No code change.

## Notes / gotchas

- **MPFB socket warning.** On launch MPFB logs `Could not read mh_user_dir.
  Maybe socket server is down?` — harmless in headless mode; it only affects the
  optional live MakeHuman socket link and the export still succeeds.
- **Skin only, by default.** The script assigns the skin tint to the mesh and
  carries an attire accent material; full garment meshes come from Step E.
- **Retargeting.** If a hand-made GLB uses a non-default rig, add a bone-name
  map in `animationLibrary.ts` rather than re-rigging the mesh.
