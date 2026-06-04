# SG Pathway — Critical Review (v9.0)

A deliberately critical audit, weighted toward the **Singapore context**. The
rating rubric in `RATING.md` measures whether the build holds together; this
document measures whether it is *true to its setting* and where it under-serves
its users. Findings are ordered by severity.

## Severity 1 — Language equity (the headline gap)

Singapore has **four official languages**: English, Malay, Mandarin, Tamil.
Malay is the **national language** under Article 153A of the Constitution;
Tamil and Malay are mother tongues for large communities and are taught
through the school MTL system. A Singapore health-system *civic* simulator that
is not navigable in all four falls short of its own premise.

Measured state (see `src/lib/i18n/parity.test.ts`):

| Locale | UI-chrome keys | Coverage | Case content |
| - | - | - | - |
| English (`en`) | 625 / 625 | 100% | 38 / 38 cases |
| Chinese (`zh`) | 625 / 625 | 100% | 38 / 38 cases |
| **Malay (`ms`)** | **108 / 625** | **17.3%** | **0 / 38** |
| **Tamil (`ta`)** | **101 / 625** | **16.2%** | **0 / 38** |

**Why this happened (honest account):** `ms` and `ta` were scaffolded early as
UI-chrome stubs (HUD, panel headers, a handful of buttons) to prove the i18n
plumbing handled non-Latin scripts and the fallback chain. Every feature arc
since (v2 → v9) translated its new keys into `en` + `zh` only, so the two
official-language stubs drifted from ~17% of a 300-key app to ~17% of a 625-key
app — the gap *widened in absolute terms* with every release.

**Specific defects this produces:**

1. **Misleading switcher.** `LOCALES` presents all four languages identically.
   A user selecting *Bahasa Melayu* gets an English HUD with a few Malay labels
   and fully-English clinical cases, with no signal that the locale is partial.
2. **Untracked drift.** Nothing measured `ms`/`ta` coverage, so each release
   silently regressed the *relative* completeness of two official languages.
3. **README over-claim.** The README's "fully translated end-to-end" applies to
   `zh` only; `ms`/`ta` are UI stubs. The claim should be locale-qualified.
4. **No roadmap commitment.** `ms`/`ta` parity was never scheduled — there was
   no roadmap document at all.

**Changes required (now scheduled — see `ROADMAP.md`):**

- **v9.1** — Make the gap *honest and tracked*: coverage metadata on each
  locale, a "partial" hint in the switcher, a CI parity metric with an
  enforced floor, and the expanded critical-key set so newer surfaces are
  protected. Plus this review + a roadmap.
- **v9.2** — Raise **Malay UI chrome to full parity** (Malay is well-resourced
  and the national language; highest priority).
- **v9.3** — Raise **Tamil UI chrome to full parity** (flagged for native
  review; clinical register matters).
- **v9.4+** — Case-content translation track for `ms` then `ta`, starting with
  the primary-care and public-health cases most relevant to the communities
  these languages serve (URTI/CHAS GP, Healthier SG diabetes, dengue, mental
  health via Mindline). Clinical strings must pass native-speaker review before
  the "end-to-end" claim extends to them.

## Severity 2 — "End-to-end translation" claim is locale-specific

The README markets full translation as a headline feature. It is true for
Chinese and must be **qualified per locale** until `ms`/`ta` catch up, otherwise
the product over-promises to exactly the communities it most wants to include.
Fixed in v9.1 (README wording) and tracked to resolution by the v9.4 content
track.

## Severity 3 — Mother-tongue framing opportunity (SG-specific polish)

Singapore's MTL policy pairs communities with languages. Two low-cost wins once
`ms`/`ta` reach parity:

- Offer a one-tap "mother tongue" suggestion on first run based on the
  browser's `navigator.languages` (e.g. surface Tamil/Malay/Chinese alongside
  English) rather than defaulting silently to English.
- The lesson-plan export already advertises four locales; ensure the exported
  headings actually localise for `ms`/`ta` (depends on chrome parity from v9.2–3).

## What is already strong (so the review is balanced)

- **Clinical breadth and currency**: 38 cases spanning acute/elective/
  outpatient, with 2025 MediShield Life reform, CHAS, Healthier SG, Mindline
  1771, Age Well SG, dengue 2026 guideline, DORSCON — genuinely Singapore-
  specific and current.
- **Financing cascade** (subsidy → MediShield Life → MediSave → CHAS → cash) is
  modelled in shape, with honest disclaimers that numbers are illustrative.
- **Chinese parity** is real and maintained by a parity test — the exact
  discipline that `ms`/`ta` now inherit.

## Summary of committed changes

| # | Change | Version |
| - | - | - |
| 1 | Locale coverage metadata + honest "partial" switcher hint | v9.1 |
| 2 | CI parity metric (`parity.test.ts`) with enforced floor + missing-key report | v9.1 |
| 3 | Expanded critical-key coverage set (v3–v9 entry points) | v9.1 |
| 4 | README localisation-claim qualified per locale | v9.1 |
| 5 | This review + `ROADMAP.md` with `ms`/`ta` parity scheduled | v9.1 |
| 6 | Malay UI chrome → full parity | v9.2 |
| 7 | Tamil UI chrome → full parity (native-review-flagged) | v9.3 |
| 8 | Case-content translation track (`ms`, then `ta`) | v9.4+ |
