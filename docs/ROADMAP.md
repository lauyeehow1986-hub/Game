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
| **v9.4** | **Foundation**: data model (`walkthrough.ts`), traversal helpers, sample STEMI walkthrough (collapse + ambulance chapters + branch-point demo), React/SVG renderer with scrubbable timeline, clickable actor cards, branch-decision overlay, top-level launcher in Trends, i18n keys in all four locales. Renderer is SVG primitives this version so the pipeline is end-to-end testable. | ✅ shipped |
| v9.5 | Phaser canvas renderer (swap in for the SVG `<Stage>`) + ED chapter (ECG, troponin, cath activation) | ▶ next |
| v9.6 | Cath lab chapter + CABG-rejected → PCI branch with real content | planned |
| v9.7 | Ward stay + complications + daily ward rounds + discharge | planned |
| v9.8 | Cardiac rehab + outpatient specialist review + first embedded MP4 clips | planned |
| v9.9 | Back-of-house chapter — AHP / cooks / cleaners / laundry / admin day-in-the-life | planned |

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
