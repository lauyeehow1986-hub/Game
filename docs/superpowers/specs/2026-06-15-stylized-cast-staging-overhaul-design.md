# Cohesive stylized cast & staging overhaul (soft-clean)

- Date: 2026-06-15
- Status: design — awaiting user review
- Area: `src/game3d/*`, `scripts/map-quaternius-cast.mjs`, `public/3d/cast`, `src/lib/walkthrough-staging.ts`

## Problem

Two in-game frames (STEMI "Ambulance on scene", ICU "rewarm") show the 3D
walkthrough is not good enough, and the cause is structural, not cosmetic:

1. **Duplicate avatars.** `castManifest.resolveLibFile` collapses every clinical
   actor into ~4 meshes (`doctor-{male,female}-{young,old}`) with **zero
   per-instance variation**, so a clinical team renders as identical clones in
   matching coats — same mesh, same face, same height.
2. **Broken actions.** The cast is MakeHuman-rigged; the 7 CC0 animation clips in
   `public/3d/anims/` are Quaternius-rigged, so **no clip binds**. Every figure
   falls back to a frozen A-pose or the procedural waist-fold hack in
   `castPose.ts`, which reads as a person "folded in half" rather than kneeling
   or doing CPR.
3. **Patients off their surface.** A `collapsed` patient only snaps onto a
   trolley for scenes whose surface is registered as a `bed`; most scenes aren't,
   so patients dump on the floor — even when the narration says "On the
   stretcher."
4. **Unclothed cast.** The MakeHuman `_lib` meshes render as bare skin-tone
   bodies (clothing generation effectively absent), a major immersion break.
5. **Undirected blocking.** Figures stand equidistant, front-facing, clumped
   center-frame — no read of a team working one casualty.

## Goal

Commit to a **cohesive soft-clean stylized** look (matte materials, soft studio
light, gentle rim light, smooth appealing shapes — "premium medical app" feel)
and rebuild the cast on a foundation where real animation, variety, clothing, and
direction all work. Reach "10/10 for its style," fully autonomously (no account
or credential steps).

### Non-goals

- Photorealism / the MakeHuman face-fidelity chase (explicitly retired here).
- Runtime cross-rig retargeting (rejected — see below).
- New downloaded asset packs requiring auth.

## Foundation decision: revert the cast to the Quaternius rig

Verified facts (grep of node names):

- Animation clips use the Quaternius rig: `CharacterArmature`, `Hips`,
  `UpperArm.L`, `LowerArm.L`, `UpperLeg.L`, `Torso`, `PoleTarget.L`, `Foot.L`…
- The Quaternius **source characters** (`public/3d/cast/_quaternius/glTF/*.gltf`,
  still on disk) share that **exact** skeleton.
- `scripts/map-quaternius-cast.mjs` already rebuilds `_lib/*.glb` (clothed,
  stylized, clip-compatible) and the 7 pose clips from that source via
  `@gltf-transform/core` (pure Node, no Blender).

Therefore rebuilding the cast from Quaternius makes **every clip bind natively**
(no retargeting), delivers **clothed** characters, and lands an **already
stylized** mesh — the soft-clean target. The animation system
(`animationLibrary.PoseAnimationDriver`) is already built and correct; it simply
needs the cast on a matching rig.

**Rejected alternative:** keep MakeHuman + `SkeletonUtils.retargetClip` at
runtime. This is the known "twisted limbs across mismatched skeletons" path, keeps
the nudity bug, and is more code for a worse result.

## Architecture / components touched

| Unit | Change |
|---|---|
| `scripts/map-quaternius-cast.mjs` | run it to regenerate Quaternius `_lib` + clips; possibly tune `POSE_MAP` |
| `public/3d/cast/_lib/*.glb` | replaced with Quaternius (committed; the deploy ships them) |
| `src/game3d/actorLoader.ts` | drop the `CastPoseController` branch; clones run through `PoseAnimationDriver`; apply variation at clone time |
| `src/game3d/animationLibrary.ts` | confirm clip binding; tune `BeatPose→clip` mapping; loop/clamp per pose |
| `src/game3d/castVariation.ts` (new) | deterministic per-actor variation (skin/hair/clothing/scale) |
| `src/game3d/castMaterials.ts` | rewrite for soft-clean matte look on Quaternius materials |
| `src/game3d/Stage3D.ts` | add rim/back light; per-beat supine-surface placement; blocking |
| `src/game3d/environments.ts` | register a `surface` (height) for each scene's trolley/table |
| `src/lib/walkthrough-staging.ts` | orient figures to the casualty/task; thin the crowd |
| `src/game3d/castPose.ts` | retire (or keep solely as procedural-fallback for the no-asset `Humanoid`) |
| tests | update `photoreal.test.ts` / `castManifest.test.ts`; add variation + surface tests |

## Workstreams

### 1. Cast → Quaternius
Run `pnpm map:cast` to regenerate `_lib/*.glb` from the Quaternius source. Commit
the GLBs (un-gitignore as the photoreal cast did) so the live site upgrades.
Outcome: clothed, stylized, clip-ready cast; nudity fixed.

### 2. Real actions
Route all poses through `PoseAnimationDriver`; delete the `castPose.active` branch
in `actorLoader`. Tune `POSE_MAP` for the most believable clinical read and A/B
each via screenshots. Acceptance bar (non-negotiable):

| Action | Target |
|---|---|
| Lying patient | flat & supine on the correct surface, settled, subtle motion |
| Kneel / tend | real bent knees, torso upright, hands toward patient |
| Stand / idle | weight on both feet, arms relaxed, small gesture when speaking |
| Blocking | figures face & cluster around the casualty |
| Walk | feet plant, no glide |

Caveat: the pack has no literal CPR/kneel clip (`PickUp`→kneel, `Death`→lying,
`Punch`→CPR are stand-ins). They are real, properly-articulated motions; if
`Punch`→CPR reads wrong, pick a better base from the pack's full animation set.

### 3. Kill the clones — `castVariation.ts`
Deterministic from a hash of `actor.id` (stable across scenes, so recurring named
patients stay consistent):

- **Skin tone** — sampled from a believable Singapore distribution (Chinese,
  Malay, Indian, Eurasian), **matched plausibly to role** (per standing memory:
  SG character authenticity).
- **Hair** tint, **clothing/scrub** hue (lets nurses read as scrubs vs doctors in
  coats even when sharing a base mesh).
- **Height/build** scale jitter (~0.94–1.06) and per-figure idle phase.

Applied to the cloned mesh in the `GlbFigure` constructor. Three doctors become
three distinct people.

### 4. Soft-clean look
Rewrite `castMaterials.ts`: matte (raise roughness, metalness 0, drop the
photoreal clearcoat/sheen/physical), gentle saturation, clean. Add a subtle
**rim/back light** to the Stage3D lighting rig for the premium studio wrap; retune
exposure/IBL toward soft & clean.

### 5. Direction & per-beat supine surface
Generalize `bed` → a per-scene **surface** (height + position + yaw) for the
trolley/table/stretcher/ICU-bed. A `collapsed` patient lies on the surface the
**beat** calls for:

- Outside at the moment of collapse → **the ground** (height 0), posed flat (no
  forced bed).
- Once the narration/staging puts them on a stretcher/trolley/table → snap onto
  that surface at its real height.

Register surfaces for the street/ambulance, resus, cath, imaging, ICU scenes.
Then orient figures to face the casualty/task and thin/spread the crowd so a scene
reads as a team, not a clump.

### 6. Verify + ship
Update/extend tests. Playwright/preview screenshots of the **same two scenes**
(STEMI ambulance + ICU) as before/after proof. `pnpm verify`, commit, push,
confirm the GitHub Pages deploy is green.

## Risks

- **CPR fidelity** — `Punch`-as-CPR may not satisfy; mitigated by A/B picking
  from the full pack and, if needed, a light compression bob layered on a real
  base pose (kept minimal).
- **Quaternius role coverage** — no dedicated "nurse" mesh; nurses use the
  doctor-young base differentiated by scrub-hue variation.
- **Material-name coupling** — soft-clean reshade must key off Quaternius material
  names, not the old MakeHuman suffixes; verify against an actual loaded GLB.

## Rollout / phasing

1. Foundation: regenerate + commit Quaternius cast; confirm clips bind (biggest
   single visible jump — clothed + animated + no fold-hack).
2. Variation (kill clones).
3. Soft-clean materials + rim light.
4. Per-beat surface + blocking.
5. Tests, before/after screenshots, ship.

Each phase is independently verifiable and independently shippable.
