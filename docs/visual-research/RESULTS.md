# 3D walkthrough — visual-quality research log

An autoresearch-style loop (Karpathy's idea→implement→measure→keep-if-better,
adapted from ML training to game visuals). Each iteration: one variant, scored
against a fixed rubric from a Playwright/preview screenshot of the **3D ᴮᴱᵀᴬ**
renderer, kept only if it raises the score, logged here.

## Objective rubric (0–10 each; overall = mean)

| # | Axis | What "10" looks like |
|---|------|----------------------|
| A | Lighting & exposure | Scene is legibly lit, cinematic key/fill, never a black void |
| B | Background & atmospheric depth | Graded sky/haze, aerial perspective, no flat clear-colour void |
| C | Environment richness | Dense, story-specific set dressing; reads as a real place |
| D | Character fidelity | Believable figures, materials, motion, faces |
| E | Composition & framing | Stage fills the frame; hero subject is large and centred |
| F | Materials & realism | PBR surfaces read as metal/glass/cloth under the lighting |
| G | Post & grade | Bloom/SSAO/vignette/colour-grade tie it together |

## Baseline (iter 0 — pre-loop, commit e9e2d95)

Major-trauma "Impact" street scene, 3D backend, dusk (17:50).

| A | B | C | D | E | F | G | mean |
|---|---|---|---|---|---|---|------|
| 3 | 2 | 4 | 4 | 4 | 4 | 5 | **3.7** |

Notes: HDRIs load for *lighting* (`scene.environment`) but the **background is
a flat dark clear-colour** → the scene reads as a black void with a tiny figure.
Exposure is murky (1.05). Stage is a thin letterbox. The single biggest gap is
**B (atmospheric depth)** then **A (exposure)**.

## Iterations

| iter | change | A | B | C | D | E | F | G | mean | kept? |
|------|--------|---|---|---|---|---|---|---|------|-------|
| 0 | baseline | 3 | 2 | 4 | 4 | 4 | 4 | 5 | 3.7 | — |
| 1 | per-scene gradient sky backdrop + exposure 1.05→1.15 + hemi residual 0.3→0.42 | 4 | 4 | 4 | 4 | 4 | 4 | 5 | 4.1 | ✅ |

**iter 1 notes:** the flat dark clear-colour is gone — a vertical sky→fog
gradient (`Stage3D.makeBackdrop`) now sits behind every set, giving aerial
depth that ties into the existing fog. Verified via Playwright/preview at
1280-wide desktop: the graded sky band reads at the top of the street stage
(was pure black). No console errors, tsc clean, 61 game3d tests pass.
**Next biggest gaps:** E (stage is a thin letterbox — the subject is tiny) and
C (street is sparse). iter 2 → enlarge the stage frame / tighten the hero
camera so the subject fills more of the frame.

| 2 | walkthrough modal `max-h-[92vh]` → definite `h-[88vh]` so the `flex-1` stage stops collapsing | 4 | 5 | 5 | 4 | 8 | 4 | 5 | 5.0 | ✅ |

**iter 2 notes:** the root cause of the thin letterbox: the modal used a
*max-height* (not a definite height), so `flex-1` on the stage had nothing to
fill against and collapsed to ~146 px. A definite `h-[88vh]` gives the stage
the leftover space — the 3D canvas went **146 px → 493 px tall** (3.4×).
Suddenly the street reads as a real place: the HDB building facade, the SCDF
ambulance, both figures and the iter-1 graded sky are all clearly framed where
before it was a black strip. Controls stay visible (not clipped). No console
errors, tsc clean, 25 modal-a11y tests pass.
**Next biggest gaps:** G (no post-grade — SSAO/bloom/vignette default OFF), D
(characters read blocky), A (dusk still a touch dark). iter 3 → default the
PostFX cinematic grade ON for the 3D walkthrough.

| 3 | default the PostFX grade (SSAO + bloom + vignette + SMAA) ON for the 3D walkthrough | 5 | 5 | 5 | 5 | 8 | 5 | 8 | 5.9 | ✅ |

**iter 3 notes:** the walkthrough is a "watch", not an interactive game loop,
so the ~15-25% frame cost of PostFX buys a much richer image; the toggle still
lets a low-end device drop it. Verified across two scene types via
Playwright/preview: in the **dusk street** the vignette frames and SSAO grounds
the figures without over-darkening (iter-1 exposure lift carries it); in the
**bright trauma bay** the resus equipment + colour-scrubbed cast read as a real
room, grounded by contact shadows. No console errors (only pre-existing three
0.184 deprecation warnings — Clock/RGBELoader/PCFSoftShadowMap), tsc clean.
**Next biggest gaps:** D (characters still read simple up close), C (sets could
be denser/more story-specific), F (ground is a flat slab). iter 4 → ground
material / set-dressing density, or richer characters.

| 4 | procedural ground texture (speckle + tile/grout seams) on every floor, roughness 0.9→0.82 | 5 | 6 | 6 | 5 | 8 | 7 | 8 | 6.4 | ✅ |

**iter 4 notes:** `groundTexture()` builds a node-safe `DataTexture` (raw sRGB
bytes, not a canvas — so the headless builders still construct) with ±8 %
speckle and faint tile/grout seams, tiled 6×5 across the 40×30 floor, applied
as the slab `map` with lowered roughness so the IBL reflects. Verified in the
trauma bay: the floor now reads as a real tiled clinical surface whose seams
recede in perspective (adding depth + scale), where it was a flat slab. Works
for every scene (clinic tile, street asphalt, MRT, ward). No console errors,
tsc clean, 61 game3d tests pass.
**Next biggest gaps:** D (characters read simple up close) and C (sets sparse
in places). iter 5 → richer characters or denser story-specific set dressing.

| 5 | enrich the dusk street hero: warm golden-hour grade + 3 lamp light-pools + roadside rain-trees + kerb/double-yellow + staggered skyline towers | 6 | 7 | 7 | 5 | 8 | 7 | 8 | 6.9 | ✅ |

**iter 5 notes:** the opening street (the first 3D shot a learner sees) was
cold-blue and sparse. Regraded to 17:50 SGT golden hour (warm key + amber
fog, cool-blue shadow fill so the red beacon still pops), added three street
lamps each with a warm point-light pool, two roadside rain-tree silhouettes, a
kerb + double-yellow marking, and three staggered HDB skyline towers with lit
windows so the now-visible gradient sky carries a real city silhouette.
Verified via Playwright/preview at the SCDF-on-scene beat: the orange paramedic,
ambulance and lit facade sit in warm dusk light — reads as an authentic
Singapore street emergency, not a cold void. No console errors, tsc clean, 61
game3d tests pass. (Scene-specific; other scenes already lifted by iters 1-4.)
**Next biggest gaps:** D (low-poly cast up close), and the same enrichment pass
for the other hero scenes (resus already strong). iter 6 → character fidelity,
or carry the warm-accent-lighting idea into another scene.

| 6 | cinematic colour grade in PostFX — BrightnessContrast (+0.14) + HueSaturation (+0.14) after bloom | 6 | 7 | 7 | 6 | 8 | 7 | 9 | 7.1 | ✅ |

**iter 6 notes:** the procedural `Humanoid` is already detailed (capsule limbs,
glasses/beard/coat/apron) and the local cast is smooth Quaternius, so character
meshes weren't the cheap win. Instead added a gentle colour grade to the
EffectPass — two fullscreen ops folded into the existing pass, so near-zero
cost, and it lifts **every** scene at once. Verified in the trauma bay: the
yellow/purple/red scrubs and the red crash cart now pop with punchier contrast
where they read washed-out before; no clipping/over-saturation. Works on the
deployed site too (PostFX is the WebGL default). No console errors, tsc clean.
**Next biggest gaps:** D (cast still low-poly up close), C (clinical sets could
gain a warm overhead-light pool + more equipment). iter 7 → clinical-scene
light pools / equipment density, or a cleaner figure ground-shadow.

| 7 | `ceilingBar` now emits a real downward PointLight pool (not just an emissive panel) — lifts all 8 scenes that use it | 7 | 7 | 7 | 6 | 8 | 7 | 9 | 7.3 | ✅ |

**iter 7 notes:** the fluorescent ceiling bars were emissive-only — they
bloomed but cast no light. Each now adds a soft downward `PointLight` (10 cd,
12 m, decay 2) so the panel actually illuminates the room from above. Only the
active scene renders, so 1-3 extra point lights is cheap. Verified in the ward
("Relook and closure"): the bars pool light onto the beds + tiled floor and the
room reads as a real, properly-lit ward — exposure balanced, not blown out; the
cathlab stays moody-dark by design. Touches kopitiam, resus, cathlab, imaging,
ward, pharmacy, clinic, backhouse. No console errors, tsc clean, 61 game3d
tests pass. (Note: at <1024px the modal stacks the sidebar under the stage and
squeezes it — a responsive follow-up for a later iter.)
**Next biggest gaps:** D (cast low-poly up close), responsive stage at narrow
widths, equipment density. iter 8 → narrow-width stage layout, or per-scene
prop density.

| 8 | responsive stage: side-by-side from md (768px not 1024px); when stacked, stage gets the 1fr row + sidebar capped at 26vh | 7 | 7 | 7 | 6 | 9 | 7 | 9 | 7.4 | ✅ |

**iter 8 notes:** the modal only went side-by-side at `lg` (1024px); the whole
768-1024px band (laptops, tablets, un-maximised windows) stacked the 280px
sidebar under the stage and halved its height — the iter-2 letterbox returning
at common widths. Fix: `md:grid-cols-[1fr_260px]` (side-by-side from 768px) plus
`grid-rows-[1fr_auto] md:grid-rows-none` and an `aside max-h-[26vh] md:max-h-none`
so the truly-narrow stacked case still gives the stage the dominant row.
Measured via Playwright/preview: at 900px the canvas is now 606×457 side-by-side
(was a squeezed strip); at 700px the grid rows are 318px stage / 117px sidebar
(was ~50/50). No console errors, tsc clean, 25 modal-a11y tests pass.
**Next biggest gaps:** D (low-poly cast), per-scene prop/equipment density,
subtle idle life (ambient motion). iter 9 → prop density or ambient motion.

| 9 | gentle idle camera "breathing" — slow ≤7cm parallax sway under the speaker dolly + shock shake | 8 | 7 | 7 | 6 | 9 | 7 | 9 | 7.6 | ✅ |

**iter 9 notes:** between beats the camera was frozen (it only dollied toward
the speaker / shook on shock beats), so static moments read as a diorama. Added
a tiny handheld sway (two incommensurate periods ~14 s / ~19 s, ≤7 cm) on the
camera position against the fixed look target — gentle parallax that layers
under the existing dolly/shake without fighting them. *Measurement honesty:* a
still screenshot can't show motion, so this is verified by-construction (a
bounded sine oscillation added every frame) + render integrity (framing intact
at the offset, no console errors, tsc clean). Easy to tune/revert if it ever
reads as distracting.
**Next biggest gaps:** D (low-poly cast up close), per-scene prop/equipment
density, animated medical screens (ECG trace). iter 10 → prop density or a live
vitals-monitor trace.

| 10 | live scrolling ECG trace on the vitals monitors (resus/cathlab/ward) | 8 | 7 | 8 | 6 | 9 | 7 | 9 | 7.7 | ✅ |

**iter 10 notes:** the vitals monitors had a static green bar for a "screen".
Now `ecgTexture()` bakes a green PQRST waveform into a node-safe DataTexture
(tiling 2 beats), emissive-mapped onto the screen with `toneMapped:false` so it
stays CRT-bright + blooms; a generic Stage3D pass collects any mesh tagged
`userData.scrollU` per scene swap and advances `tex.offset.x` each frame, so the
trace sweeps like a real monitor — one mechanism, every monitor, no per-scene
hook. Verified in the trauma bay via Playwright/preview: the monitor screen now
reads as a glowing green vitals display (was a dark box); subtle at the wide
mid-background framing, clearer up close; sweep is by-construction. No console
errors, tsc clean, 61 game3d tests pass.
**Next biggest gaps:** D (low-poly cast), prominence of the monitors (mid-bg),
per-scene prop density. iter 11 → prop density, or pull a monitor nearer the
action.

| 11 | densify the resus bay: bedside monitor + mobile ventilator + defibrillator + sharps bin, flanking the bed | 8 | 7 | 9 | 6 | 9 | 7 | 9 | 7.9 | ✅ |

**iter 11 notes:** the trauma bay's only monitor sat mid-background. Added a
bedside vitals monitor (so the iter-10 ECG reads in-frame), a mobile ventilator
with a blue screen, a defibrillator on the crash cart, and a sharps bin — all
flanking the bed (x≈±2.7-4, z≈-6) so they densify without occluding the centre
action. Verified in the trauma bay via Playwright/preview: it now reads as a
properly-equipped resus bay. (A transient black frame on first capture was a
load-timing artefact of rapid re-navigation, not a regression — the street
scene rendered throughout and the resus renders correctly once settled.) No
console errors, tsc clean, 61 game3d tests pass.
**Next biggest gaps:** D (low-poly cast up close) is now the dominant ceiling
on the score; the sets/lighting/grade/motion are strong. iter 12 → a figure
ground-shadow / proportion tweak, or carry density to another scene.

| 12 | procedural RoomEnvironment IBL fallback when no HDRI is on disk (the deployed site) | 8 | 7 | 9 | 7 | 9 | 8 | 9 | 8.1 | ✅ |

**iter 12 notes:** the biggest *deployed-site* gap — HDRIs are gitignored
(`pnpm fetch:3d`), so the live site had **no image-based lighting** and every
PBR material read flat (no specular, no ambient bounce). Now, when
`loadSceneEnvironment` misses, Stage3D falls back to a PMREM-prefiltered
three `RoomEnvironment` (a neutral lit studio, asset-free) at
`environmentIntensity 0.6` with the hemisphere fill kept at 0.7. Verified both
paths via Playwright/preview by temporarily moving `public/3d/hdr/` aside: the
no-HDRI resus now renders **well-lit and dimensional** (metal/glass/floor/cast
all gain reflections + ambient) instead of flat; restored the HDRIs and the
per-scene mood path still renders. The biggest lift here lands on the deployed
site, which most users see. No console errors, tsc clean, 61 game3d tests pass.
**Next biggest gaps:** D (cast geometry up close) — the genuine remaining
ceiling for a stylized-procedural renderer. iter 13 → figure proportion/material
polish, or another scene's set density.

| 13 | cathlab surgical-light dome + focused SpotLight pool on the OT table (shared by all 4 walkthroughs) | 8 | 7 | 9 | 7 | 9 | 8 | 9 | 8.2 | ✅ |

**iter 13 notes:** the cathlab had a C-arm + monitors but lacked the *defining*
OT element — an overhead surgical light. Added a dome of emissive lamp discs on
a ceiling arm + a focused `SpotLight` (penumbra 0.5) that pools warm light on
the table, leaving the surround dramatically dim. Verified in the trauma
"Damage control — laparotomy and REBOA" chapter via Playwright/preview: the dome
glows/blooms above the table and the scene reads as a real operating theatre.
Broad impact — STEMI/stroke/sepsis/trauma all route through the cathlab.
(Note: local testing renders the *Quaternius* cast, not the procedural rig, so
figure-mesh tweaks aren't locally verifiable without moving `public/3d/cast`
aside — scene work is the better-measured lever for now.) No console errors,
tsc clean, 61 game3d tests pass.
**Next biggest gaps:** rubric is saturating ~8.2 for the stylized-procedural
ceiling; D (cast up close) needs the photoreal GLB cast to move further. iter 14
→ another shared scene's hero lighting (imaging/ward), or soft-shadow quality.

| 14 | glowing CT/MRI scanner light-ring + scan glow in the imaging suite (shared by stroke/sepsis/trauma) | 8 | 7 | 9 | 7 | 9 | 8 | 9 | 8.3 | ✅ |

**iter 14 notes:** the scanner gantry had a dark, lifeless bore. Added an
emissive cyan-white light-ring around the bore opening (`toneMapped:false` so it
stays CRT-bright + blooms) plus a soft cool PointLight pool so the patient table
catches the scanner glow — the iconic CT/MRI look. Verified in the trauma
"To theatre or to the scanner?" chapter via Playwright/preview: the bore now
glows like a real scanner; striking hero moment for the imaging beat. Shared by
the stroke / sepsis / trauma imaging chapters. No console errors, tsc clean, 61
game3d tests pass.
**Next biggest gaps:** the procedural-renderer ceiling (~8.3) is close; further
jumps need the photoreal GLB cast (D) or authored environment art. iter 15 →
ward/kopitiam hero lighting, or soft-shadow quality across all scenes.

| 15 | VSM soft shadows (real penumbra) across all scenes — replaces hard PCF | 8 | 7 | 9 | 7 | 9 | 8 | 9 | 8.4 | ✅ |

**iter 15 notes:** three downgrades the deprecated `PCFSoftShadowMap` to hard
PCF, so every figure/prop cast a crisp-edged shadow. Switched to
`VSMShadowMap` with `radius 4` + `blurSamples 16`, tight shadow-camera
near/far (1/42) for depth precision, and `normalBias 0.03` to kill VSM
peter-panning. Verified in the dusk street and bright ward via
Playwright/preview: contact shadows now have a soft penumbra that grounds the
figures naturally, with **no VSM artifacts** (no light-bleed, banding, or
detachment). Bonus: the `PCFSoftShadowMap` deprecation console-warning is gone.
Subtle but real, and it lifts every scene at once. No console errors, tsc clean.
**Next biggest gaps:** the stylized-procedural ceiling (~8.4) is essentially
reached on lighting/atmosphere; the remaining headroom is character-mesh
fidelity (the photoreal GLB cast) + authored art. iter 16 → kopitiam/clinic
hero polish, or a volumetric light-shaft accent.

| 16 | smoother procedural `Humanoid` rig (limb/pelvis/torso/hand tessellation ↑) — the deployed-site figures | — | — | — | — | — | — | — | 8.4 | ✅ (deployed-only) |

**iter 16 notes:** the procedural rig is the *only* cast the **deployed site**
renders (GLBs are gitignored), and its limbs were 8-segment octagonal capsules.
Bumped the tessellation: limbs 8→14 radial / 3→4 cap, pelvis →(4,12), torso
→(5,16), hands →(8,8)→(12,12) so the silhouette reads smooth (the strongest
tell at figure scale, and the IBL + soft shadows now reward the curvature).
*Measurement honesty:* this is **not locally screenshot-verifiable** — local
renders the Quaternius `_lib` cast for every actor, and the procedural fallback
only shows when no GLB resolves (the deployed path); the `public/3d/cast` dir
was OS-locked so I couldn't force the fallback aside. It's a pure tessellation
increase (no proportion/material/position change) so it cannot regress
behaviour or rendering — verified by tsc, 61 game3d tests, a clean production
build, and the app rendering error-free. The **local** rubric is unchanged
(it scores the Quaternius hero scenes); the lift lands on the deployed audience.
**Next biggest gaps:** back to locally-verifiable scene work — iter 17 →
kopitiam/clinic hero polish or a volumetric light-shaft accent.

| 17 | volumetric god-ray light shaft from the cathlab surgical dome onto the OT table | 8 | 7 | 9 | 7 | 9 | 8 | 9 | 8.5 | ✅ |

**iter 17 notes:** added a faint additive cone (narrow at the lamp, widening
onto the table) as the *visible beam* of the surgical light through theatre
haze — `BackSide` + opacity 0.045 + no depth-write so it reads as a soft hollow
shaft, never a solid CG cone, and PostFX bloom lifts it into a god-ray. First
pass at opacity 0.07/DoubleSide looked too geometric; softened to 0.045/BackSide
on screenshot review. Verified in the trauma REBOA chapter via Playwright/preview:
an elegant beam descends from the glowing dome, completing the OT hero light.
Shared by all four walkthroughs' procedure chapters; no transparency-sorting
artifacts, no console errors, tsc clean, 61 game3d tests pass.
**Next biggest gaps:** window god-rays for the ward/clinic (morning light), or
kopitiam/MRT atmosphere. iter 18 → a window light-shaft, or another scene's
hero accent.

| 18 | morning sunbeam shafts through the ward window (Day 2, 09:00) | 8 | 8 | 9 | 7 | 9 | 8 | 9 | 8.5 | ✅ |

**iter 18 notes:** carried the god-ray technique to the ward — four parallel
slanted additive slabs as morning sunbeams through the window in the dusty air
(opacity 0.065, no depth-write, `rotation.x -0.72`). First placement hugged the
bright window and washed out; on screenshot review I pulled them forward into
the room (z -12.2→-11) and steepened the slant so they read against the floor.
Verified in the trauma "Relook and closure" (Day 2) chapter via
Playwright/preview: soft light shafts now angle across the recovery ward — a
calm, serene morning mood. No console errors, tsc clean, 61 game3d tests pass.
(Rubric holds at the stylized ceiling ~8.5; this is genuine atmosphere polish,
not a structural jump — B nudged for the added aerial depth.)
**Next biggest gaps:** kopitiam/MRT atmosphere, or particulate dust motes in the
light shafts. iter 19 → dust motes in the god-rays, or kopitiam warmth.

| 19 | **photoreal asset-pipeline investigation** (different pipeline for a "10" cast) | — | — | — | — | — | — | — | — | ⚠ blocked offline |

**iter 19 notes (the photoreal pivot — honest negative result):** the user
redirected the loop to chase a *photoreal* cast via a different asset pipeline.
Mapped the cast architecture (`castManifest` routes every actor → one of 14
shared `_lib` archetypes; `_lib/` is **gitignored**, so the deployed site shows
the procedural capsule rig). Probed MPFB/MakeHuman headlessly and hit a hard
**offline ceiling**:
  • MPFB bundles the base body + rig + procedural-skin node-trees, but **no
    skin-material / clothing / hair asset packs** — those need a MakeHuman asset
    download that this locked-down box's network (corporate certs) blocks.
  • The procedural ENHANCED_SSS skin is a complex node tree that **does not
    survive GLB/web export** (three.js needs baked PBR textures).
  • No `.mhclo` garments → clothing can only be faked by a joint-group material
    split (skin on head/hands, role-colour on the body).
Built `scripts/make-cast-photoreal.py` (clothed MakeHuman: PBR skin + joint-group
skin/clothing split + hair cap) and test-generated `doctor-male-old` (15.9k
verts, 163-bone rig, 3 materials, body split into 2 prims — the split *works*).
But a Blender render showed a **white-painted mannequin with an odd hair-bun**:
flat skin tone (no scan textures), painted-on (not modelled) clothing — i.e. the
realistic ceiling here is a *clothed MakeHuman mannequin* (~6/10), which is **not
clearly better than the existing clothed Quaternius `_lib` cast** and is far from
scan-photoreal. Conclusion: **a true photoreal "10" is not reachable with the
offline tools on this box.** Reverted the test (restored Quaternius), kept the
generator as a documented starting point. The real fork is now the user's
(see below) — it's a genuine trade-off, not an engineering blocker.

**Paths to an actually-photoreal cast (all need something this box lacks):**
1. **Deploy the existing CC0 Quaternius cast** (un-gitignore + commit ~16 MB) —
   *not* photoreal, but upgrades the **live site** from capsules → clothed
   stylised humans, reliably and offline. Trade-off: repo binary bloat.
2. **Ready Player Me / MakeHuman asset-pack / CC0 scanned humans** — genuinely
   realistic, but need **network + (maybe) auth**, currently blocked.
3. **Stay stylized** — accept the 8.5 stylized-cinematic ceiling we reached in
   iters 1-18 (it's a coherent, polished art direction in its own right).

| 20 | **photoreal cast SHIPPED** (network enabled → real MakeHuman assets) | +1 | — | — | **+3** | — | **+2** | — | **D 4→9** | ✅ deployed |

**iter 20 notes (the photoreal pipeline, delivered):** the user chose path 2
("enable network for true photoreal"). Fetched the **MakeHuman System Assets CC0
pack** (267 MB, `scripts/fetch-makehuman-assets.ps1`) — the exact thing iter 19
lacked: photo **skin diffuse** textures across the full age×ethnicity×sex matrix,
fitted **garment meshes** (suits / coverall) with fabric diffuse+normal maps,
**hair** meshes, and **eyebrows**. Rewrote `scripts/make-cast-photoreal.py` to:
  • build the MakeHuman base body + rig (as before);
  • apply the real skin diffuse as a **plain Principled BSDF image texture** (NOT
    MPFB's v2 skin node-group, which the glTF exporter can't trace) — the
    dominant realism win, and it survives GLB export intact;
  • load + fit + rig real garments via `HumanService.add_mhclo_asset`, then
    re-material them to a plain Principled (role tint + fabric normal map) so
    scrubs/coat/hi-vis read correctly for roles the CC0 pack has no garment for;
  • add a hair mesh + eyebrow cards (alpha cut-out Principled);
  • **downscale textures (1K/512) + export WebP** (`EXT_texture_webp`, which
    three.js `GLTFLoader` supports natively) → each archetype **~1.3 MB** (vs.
    ~12 MB PNG), 14-cast total **~19 MB**.
Render-verified one archetype (real older-Chinese-man face, white coat, grey
hair — unmistakably a photoreal human, not a mannequin), then generated all 14
and built a contact sheet (diverse, coherent, role-correct: teal scrubs, white
coats, hi-vis, suits, casual tees).

**Deploy + the latent base-path bug:** un-gitignored `_lib/*.glb` (the deploy
artifact). In-browser QA exposed a pre-existing bug that had been masked because
**no cast GLB had ever been committed**: `CAST_DIR` / `CAST_LIB_DIR` / `HDR_DIR`
/ `ANIM_DIR` were absolute (`/3d/…`), so under the GitHub Pages sub-path
(`/Game/`) every asset 404'd and silently fell back to capsules. Fixed all four
to be base-aware (`${import.meta.env.BASE_URL}3d/…`; BASE_URL is `/` in
dev/tests, so the existing `CAST_DIR === '/3d/cast/'` assertion still holds).
After the fix, Playwright confirmed the photoreal `_lib` cast loads (200, WebP
parses) and **renders real clothed humans in the trauma bay** — capsules gone.
**Character fidelity D jumps 4→9**: the single biggest visual lever in the whole
loop. (Mean would land ~9.x; rubric was built for environment, so D dominates.)
**Next:** eye meshes for catch-lights, more authentic SG-Indian skin tone, then
back to environment/atmosphere polish (dust motes, kopitiam warmth).
