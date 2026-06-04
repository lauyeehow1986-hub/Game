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
| v9.7 | Phaser canvas renderer (swap in for the SVG `<Stage>`); sprites stay the same data shape | ▶ next |
| v9.8 | Embedded MP4 showpiece clips (cath stent deployment, MRI tube) — first hybrid content | planned |
| v9.9 | Locale translation for the walkthrough strings (`zh`, then `ms`, then `ta`) | planned |
| v9.10 | Second walkthrough — stroke pathway (thrombolysis vs thrombectomy) | planned |

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
