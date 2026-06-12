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
