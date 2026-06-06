# SG Pathway — Roadmap

This file records what has shipped and what is scheduled. Until now the project
tracked quality (`RATING.md`) but never published a forward plan, which is part
of why two official-language locales were never explicitly scheduled to parity
(see `REVIEW.md`, Severity 1).

## Shipped

| Version | Theme |
| - | - |
| v2.0 | Campaigns, voice narration, smart suggestions |
| v2.1–2.5 | Spaced retrieval, exam/OSCE, case builder, educator tools |
| v3.0 | Exams, authoring studio, educator cohort tools |
| v4.0 | Branching cases, vitals, scenario generator, analytics, sandbox |
| v5.0 | Today's plan, duel mode, specialty cases, high-contrast |
| v6.0 | Timeline scrubber, coach micro-curricula, peer-review threads |
| v7.0 | Competency tier, Brier calibration, handoff tokens, study sets, cheatsheet |
| v8.0 | Weekly goals, bookmarks, flashcards, mastery ladder, printable portfolio |
| v9.0 | Case journal, freeze tokens, calibration trend, best-case certificate, smart debrief |

Throughout, **English and Chinese** were maintained at 100% parity (UI chrome
and all case content), enforced by tests.

## In progress — Official-language parity (Malay + Tamil)

Singapore has four official languages. Malay (the national language) and Tamil
were scaffolded as UI-chrome stubs early on but never built to parity, and the
gap widened with every English/Chinese feature arc. This track closes it.

| Version | Deliverable | Status |
| - | - | - |
| **v9.1** | Honesty + tracking: locale coverage metadata, "partial" switcher hint, CI parity metric with enforced floor, expanded critical-key set, review + this roadmap, README claim qualified | ✅ shipped |
| **v9.2** | **Malay (`ms`) UI chrome → full parity** with English (627/627, enforced) | ✅ shipped |
| **v9.3** | **Tamil (`ta`) UI chrome → full parity** with English (627/627, enforced; native-review-flagged) | ✅ shipped |

(The `ms`/`ta` case-content translation track is paused — see the
Walkthrough arc below, which the user prioritised next. Resume after v10.0.)

## In progress — Visual pathway walkthrough (Bandersnatch-style cinematic)

Scrubbable + branching cinematic of the full STEMI patient journey: 995
collapse → ambulance → ED → cath lab → ward → discharge → rehab → outpatient
review. Hybrid Phaser + embedded MP4 clips for showpiece moments. Includes
atmospheric support staff (AHP, cooks, cleaners, laundry, admin) throughout
plus one dedicated "Back of house" chapter. Lives as a new standalone mode.

| Version | Deliverable | Status |
| - | - | - |
| **v9.4** | **Foundation**: data model, traversal helpers, two starter chapters + branch-point demo, React/SVG renderer with scrubbable timeline, clickable actor cards, branch-decision overlay, top-level launcher, i18n keys in all four locales. | ✅ shipped |
| **v9.5** | **Full STEMI clinical journey + back-of-house chapter**: arrive-SGH (door-to-cath fast-track), cath-activation, diagnostic cath, cardiac CTA (with MRI-yes/no branch), cardiac MRI, family conference (with PCI/CABG branch), surgeon-decline (CABG declined → PCI), PCI procedure, CCU transfer, ward stay with morning round + AHP team, complications + escalation, discharge with case manager + billing, outpatient pharmacy, NHCS Phase II cardiac rehab, specialist outpatient review, and the back-of-house epilogue (cath cleaner, ward cleaner, hospital cook, laundry coordinator, billing clerk, HCA day-in-the-life). 18 canonical chapters + 3 off-canonical (private A&E, secondary transfer, surgeon-decline) wired into the v9.4 engine without engine changes. 30+ Singapore-grounded actors. | ✅ shipped |
| **v9.6** | **Generated character sprites via SpriteForge Claude Skill**. Per-actor stylised SVG sprites replace the bare colour circles in the Stage. Skin tone, hair colour, hair style and accessory are derived deterministically from the actor id (FNV-1a hash). 15 accessory kinds (stethoscope, scrubs, lead apron with `Pb` marker, sterile gown, white coat, chef's hat, mop, linen cart, clipboard, AHP polo, hospital gown, high-vis vest, forage cap, headphones, casual). Singapore-aware: 4-band skin palette. Claude Skill at `.claude/skills/spriteforge/SKILL.md` documents the workflow for adding a new actor without leaving the editor. | ✅ shipped |
| **v9.7** | **High-definition pixel-art sprites + 4-direction + 6-frame interaction loop + 4-frame walk cycle**. Integer-grid construction (rect-only primitives) with `image-rendering: pixelated` and `shapeRendering: crispEdges`. Direction-aware: N hides facial features, E/W mirror via SVG transform. Animation loops are universal (same 6-frame breath / 4-frame stride for every actor) so authoring stays cheap; beats can opt-in to walking. Stage ticks at 6 fps (150 ms). All 30+ STEMI actors animate when active. | ✅ shipped |
| **v9.8** | **Cinematic scene staging + posed/expressive characters (realism pass)**. Replaces the team-row grid with composed *environments* (`src/lib/scenery.tsx`): 11 hand-built scenes — hero `kopitiam` (three hawker stalls with signage, ceiling fans, fluorescent tubes, marble tables + red stools, seated patrons, drink-stall queue, gathering onlooker ring, shophouse pillars, warm morning light) plus `street`, `resus`, `cathlab`, `imaging`, `counsel`, `ward`, `pharmacy`, `rehab`, `clinic`, `backhouse` — each with a perspective floor, props, lighting, ambient crowd, vignette and SMIL micro-animation (fans, steam, monitor traces, light flicker). Sprites gain **7 poses** (stand/walk/kneel/sit/cpr/collapsed/point) and **7 expressions** (neutral/alarmed/distressed/pained/focused/relieved/unconscious) with volume shading. The collapse chapter is fully choreographed — Mr Tan collapses, a bystander kneels into hands-only CPR, the attendant waves the crowd back, the myResponder CFR sprints in and delivers an AED shock. Beats carry `scene` / `pos` / `pose` / `expression`; figures depth-scale (0.7→1.3) and cast ground shadows; a single "current line" speech bubble tracks the lead beat. Size deliberately not optimised. | ✅ shipped |
| **v9.8.1** | **Readability + composition refinement** (live-device feedback). Speech bubble moved off the figures into a top "broadcast" band — it can no longer occlude characters — linked to the speaker by a faint dashed stem + head marker; the speaker is emphasised with a soft focus halo and a pulsing ring, and their floor name-tag is dropped (named in the bubble). Figures enlarged (base 30→34) for mobile legibility; default staging moved into the clear front band, centred right-of-middle to clear left-side fixtures. Street scene gains a wheeled stretcher so the patient isn't on bare tarmac; ambulance beats re-blocked (patient + paramedic action left-centre, driver bridging to the EA). | ✅ shipped |
| **v9.8.2** | **Patient staged in every clinical scene.** Mr Tan was missing as a visible figure in most clinical chapters (only collapse / ambulance / complications showed him). He's now placed in-scene throughout: lying on the resus trolley (arrive-SGH, private A&E), on the cath table under the C-arm (activation, diagnostic, PCI), sliding into the CT/MRI bore (CTA, MRI), settled in the CCU bed, propped up in the ward bed (day-2 round), on the secondary-transfer stretcher, on the treadmill (rehab), and on the clinic exam couch — with pose + expression tracking his condition (pained → neutral → relieved). | ✅ shipped |
| **v9.9** | **Phaser canvas renderer (beta)** — behind a `2D / Cinematic` toggle in the modal header; the default SVG stage is untouched. Reuses the hand-built SVG environments as a single full-stage canvas texture (so the backdrop is pixel-identical), then adds what a game loop does best: figures tween smoothly between beats, idle-bob at 60 fps, the speaker gets a pulsing focus ring, particle ambience drifts through the scene, and the camera shakes on the AED shock. Figures use the same hash-derived skin/uniform colours as the SVG sprites. A new pure module (`walkthrough-staging.ts`) is the single source of staging geometry for **both** renderers. Lazy-loaded (Phaser stays out of the default bundle) and wrapped in an error boundary that falls back to 2D. | ✅ shipped (beta) |
| **v9.10** | **Cinematic figure fidelity + walk-in paths.** The Phaser canvas now renders the *real* `ActorSprite` art — exact accessories, poses, expressions — instead of simplified Graphics avatars. New `spriteTexture.ts` bakes each (actor, pose, expression, direction) combination to a UTF-8 SVG data URI on first appearance, then Phaser caches it as a texture; the coordinate contract guarantees feet land exactly where the SVG stage places them (verified by ground-line overlay). Figures now **walk in** from the edge they face away from when the beat marks them walking (450ms glide for non-walking position changes; 850ms walk between beats; 950ms entry walk-in), with a brisker bob + slight tilt during motion. The figure label is suppressed on the speaker (already named in the bubble); exit animation slides departed actors off-screen. Pose textures are swapped seamlessly when a beat changes the pose. | ✅ shipped |
| v9.11 | Embedded MP4 showpiece clips (cath stent deployment, MRI tube) — first hybrid content | ▶ next |
| v9.12 | Locale translation for the walkthrough strings (`zh`, then `ms`, then `ta`) | planned |
| v9.13 | Second walkthrough — stroke pathway (thrombolysis vs thrombectomy) | planned |

### Renderer / engine decision (why Phaser, not Unity)

A Unity MCP server (`unity-mcp-server`) was evaluated for driving the cinematic.
Decision: **stay on Phaser, within the web stack.** Reasons:

- **Offline, asset-free PWA is a hard product constraint.** A Unity WebGL build
  ships a multi-MB WASM + data bundle and an external player; the whole project
  is deliberately inline-SVG / procedural so it installs and runs offline with
  no binary downloads. Unity breaks that promise.
- **One stack, one test surface.** The renderer shares React state, i18n, the
  Vitest suite, and the `walkthrough-staging.ts` geometry. Phaser is already a
  dependency (the ops/hospital canvas). Unity would be a parallel C#/editor
  toolchain with no path into the existing tests or CI.
- **No Unity MCP is connected to this environment** in any case (only a generic
  Three.js scene tool is available). If photoreal 3D is wanted later, the
  lighter path is a Three.js/WebGL layer behind the same renderer toggle —
  same data, same constraints — rather than Unity.

## Resumed after Walkthrough — Multilingual case content

| Version | Deliverable | Status |
| - | - | - |
| v10.1 | Case-content translation track — `ms` for primary-care / public-health cases first | planned |
| v10.2 | Case-content translation track — `ta`, same case ordering | planned |
| **v11.0** | Capstone: all four official languages at full UI + case parity; mother-tongue first-run suggestion from `navigator.languages`; "end-to-end translation" claim restored for all locales | planned |

### Parity definition (the bar each locale must clear)

1. **UI chrome**: 100% of `en` keys present (measured by `parity.test.ts`).
2. **Critical keys**: every navigation / entry-point / verdict key present
   (measured by `coverage.test.ts`).
3. **Case content**: every case's `title`, `blurb`, node framing, decision
   prompts, option labels, rationales, outcomes, and guideline references carry
   the locale, **and have passed native-speaker review** before the locale is
   advertised as complete.

### Quality / responsibility note

Malay and Tamil clinical strings added by this track are machine-assisted and
**must be reviewed by native clinical speakers** before the "fully translated"
claim is extended to them. The roadmap advertises *coverage*, not *certified
translation quality*, until that review lands. This is called out in the
language switcher (partial-coverage hint) so learners are never misled.

## Backlog (post-v10, unscheduled)

- Per-case audio narration for `ms`/`ta` (Web Speech API voice availability
  varies by platform — needs a graceful-degradation check).
- Singlish-aware glossary toggle for informal patient-perspective framing.
