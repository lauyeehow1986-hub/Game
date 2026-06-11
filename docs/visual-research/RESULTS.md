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
