# SG Pathway — Progress Summary

A concise snapshot of where the project stands. See `ROADMAP.md` for the
full version-by-version log.

---

## At a glance

The project is a Singapore healthcare-pathway training game with two main
arcs running in parallel:

1. **Multilingual case content** (en + zh at parity; ms + ta UI chrome
   complete, case content awaiting native review).
2. **Visual pathway walkthrough** — a Bandersnatch-style scrubbable
   cinematic of full patient journeys, started v9.4, now spans 14 minor
   versions through v9.14.1.

Current branch: `claude/healthcare-pathway-game-X7oRQ` ·
**656 tests passing**, type-check clean, production build clean.

---

## Shipped

### Foundation arcs (v2.0 → v9.0)
Pre-walkthrough product: campaigns, case authoring, exams/OSCE, branching
cases, vitals, scenario generator, analytics, timeline scrubber, peer
review, competency tier, weekly goals, flashcards, mastery ladder, case
journal, smart debrief. English + Chinese at 100% parity throughout.

### Multilingual parity (v9.1 → v9.3) ✅
| Version | What landed |
| - | - |
| v9.1 | Locale coverage metadata, "partial" switcher hint, CI parity floor enforcement, README claim qualified |
| v9.2 | Malay (`ms`) UI chrome → full parity (627/627 keys, enforced) |
| v9.3 | Tamil (`ta`) UI chrome → full parity (627/627 keys, native-review-flagged) |

### Visual pathway walkthrough (v9.4 → v9.14.1) ✅

**Engine**
- v9.4 — Data model + traversal + React/SVG renderer + scrubbable timeline + branch-decision overlay + i18n keys
- v9.9 — Phaser canvas renderer (beta), behind a 2D / Cinematic toggle, lazy-loaded with error-boundary fallback to SVG
- v9.10 — Phaser figure fidelity: real `<ActorSprite>` art baked to per-pose textures + walk-in / walk-out paths between beats
- v9.13.1 — SVG renderer motion parity: figures glide between beat positions with the same easing curve as Phaser

**STEMI walkthrough**
- v9.5 — 18 canonical chapters + 3 off-canonical (private A&E, secondary transfer, surgeon-decline). 30+ Singapore-grounded actors covering pre-hospital, ED, cath lab, ward, AHP team, support staff, outpatient
- v9.8.1 — Speech-bubble moved to top broadcast band so it never occludes figures; speaker focus halo + pulsing ring
- v9.8.2 — Mr Tan staged in every clinical scene (resus trolley → cath table → CT/MRI bore → CCU/ward bed → treadmill → clinic couch)

**Stroke (LVO) walkthrough** — second pathway
- v9.13 — 12 chapters, 18 actors, Mdm Lim, 72: stroke bypass → NNI@TTSH → CT/CTA/CTP → bridging tPA ↔ primary thrombectomy decision branch → endovascular thrombectomy → neuro-ICU → MDT stroke ward → community-rehab ↔ home decision branch → 6-week clinic review
- v9.14 — Opening location moved off the void deck onto the MRT East-West Line between Bedok and Tampines; new `bystander` (fellow commuter) and `smrt-staff` (Tampines station manager) actors

**Sprites**
- v9.6 — SpriteForge Claude Skill: deterministic per-actor SVG sprites (hash-derived skin/hair/style + 15 accessory kinds)
- v9.7 — HD pixel-art on integer grid, 4-direction (N/S/E/W), 6-frame interaction loop, 4-frame walk cycle
- v9.8 — 7 poses (stand/walk/kneel/sit/cpr/collapsed/point) + 7 expressions (neutral/alarmed/distressed/pained/focused/relieved/unconscious)

**Scenery**
- v9.8 — 11 hand-built environments (kopitiam, street, resus, cathlab, imaging, counsel, ward, pharmacy, rehab, clinic, backhouse) with perspective floors, props, ambient crowds, vignettes, SMIL micro-animation
- v9.14 — New `mrt` scene (Singapore MRT carriage interior): EWL route diagram, trilingual "NEXT: TAMPINES" LED, SMRT sliding doors with SOS plunger, red/blue priority seats, brushed-aluminium grab poles, swaying hand straps, motion-blurred tunnel windows

**Showpieces (procedural b-roll)**
- v9.11 — Beat-level `showpiece` hook supporting inline SVG or external MP4. Three inline showpieces: `stent-deployment`, `mri-bore-slide`, `aed-shock`. Wired into PCI / MRI / AED beats.
- v9.13 — Fourth showpiece `thrombectomy-pass` (MCA with M1 clot; stent retriever + clot withdraw together)

**Assets-heavy pivot (v9.14 → v9.14.1)** ✅
- v9.14 — Retired the asset-free PWA constraint. `pnpm bake:scenes` (resvg + vite-node) pre-renders every scene as a 1440×810 HD PNG into `public/walkthrough/scenes/{id}.png` (~15 MB committed). Both renderers load the PNG by default with inline-SVG fallback. New `<CinematicOverlay>` adds feTurbulence film grain + corner vignette + colour grading to every scene.
- v9.14.1 — Per-scene cinematographic mood: warm (kopitiam, counsel), daylight (street, rehab), sterile (resus, ward, pharmacy, clinic), surgical (cathlab, imaging), transit (mrt), industrial (backhouse). Re-baked all 12 PNGs.

---

## Held / not shipped

| Version | Why it's not shipped |
| - | - |
| v9.12 — clinical-content locale translation for the walkthrough (`zh`, `ms`, `ta`) | **Held pending native-speaker clinical review** per the project's documented quality bar. Plumbing is in place; the gating issue is content correctness, not engineering. Will resume once native reviewers are confirmed. |

---

## Planned (post-walkthrough arc)

| Version | Deliverable |
| - | - |
| v10.1 | Case-content `ms` translation track (primary-care / public-health cases first) |
| v10.2 | Case-content `ta` translation track (same case ordering) |
| **v11.0** | Capstone: all four official languages at full UI + case parity; mother-tongue first-run suggestion from `navigator.languages`; "end-to-end translation" claim restored for all locales |

### Backlog (unscheduled)
- Per-case audio narration for `ms` / `ta` (Web Speech API availability varies)
- Singlish-aware glossary toggle for informal patient-perspective framing

### Renderer decision (locked)
- Phaser, not Unity. Reasons: Unity WebGL breaks the offline PWA shape, no path into the React/Vitest/i18n surface, and no Unity MCP available in this environment anyway. If photoreal 3D is wanted later, Three.js behind the same renderer toggle is the lighter path.

---

## Testing locally

```bash
git clone <your-repo-url> Game && cd Game
git checkout claude/healthcare-pathway-game-X7oRQ
pnpm install
pnpm dev                # serves at http://localhost:5173

# regenerate the HD scene PNGs if you tweak the SVG scenery
pnpm bake:scenes

# full verify (tests + tsc + production build)
pnpm verify
```

No fork required, and no local Claude session needed for browser
verification — any browser at `localhost:5173` works.

---

## Health metrics

- **Tests**: 656 passing (`pnpm test`)
- **Type-check**: clean (`pnpm exec tsc --noEmit`)
- **Production build**: clean. Bundle chunks split correctly — Phaser is a separately-lazy 1.48 MB chunk loaded only when the Cinematic renderer is selected; each walkthrough (STEMI / Stroke) is its own lazy chunk (~29 kB / ~19 kB).
- **HD scene assets**: ~15 MB across 12 PNGs in `public/walkthrough/scenes/`, served at `/walkthrough/scenes/{id}.png`, cached by the existing service worker on first fetch (offline-capable from the second visit onward).
