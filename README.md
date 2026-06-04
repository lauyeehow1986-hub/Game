# SG Pathway — Singapore Healthcare Pathway Sim

A browser-based educational simulator of patients moving through Singapore's healthcare network — public hospitals, specialty centres, community hospitals, polyclinics, GPs, telemed, VWO partners, and private hospitals — across elective, acute, and outpatient pathways, with toggleable **patient / caregiver / staff** perspectives.

Hosted as a static site on GitHub Pages. Fully offline-capable once installed (PWA). No accounts, no telemetry, no backend; everything lives in `localStorage`.

**Live**: <https://lauyeehow1986-hub.github.io/Game/>

**Quality rubric**: [`docs/RATING.md`](docs/RATING.md) defines a 10-axis pass-bar (content depth, curricula, i18n, engagement, tests, perf, a11y, authoring, PWA, code hygiene) and the project is currently audited at **10 / 10**. The audit is enforced by `src/content/rating-audit.test.ts` — CI fails if any axis regresses.

## What's in it

### 31 clinical cases across every category
Acute STEMI · Acute ischaemic stroke (thrombectomy) · Severe sepsis · Major trauma · Febrile toddler (KKH PEWS) · Antenatal-to-delivery (KKH) · First-episode psychosis (IMH EPIP) · Paracetamol overdose + IMH C-L · Construction fall on a Work Permit (MOM WICA / FWMI) · Suspected IPV (KKH One Centre + HEARS) · Heart failure outpatient (NHCS GDMT) · CKD progression to dialysis (NKF) · Outpatient T2DM (SGLT2i, Healthier-SG) · URTI at a CHAS GP · Elective THR · Private cataract (SNEC vs Mt Elizabeth) · Cross-cluster breast cancer (NHG → SGH → NCCS) · Private-to-public handover (hand-carry CD) · End-of-life with home hospice (HCA + DPH) · Geriatric falls + AH@Home virtual ward · Disease X outbreak (NCID + DORSCON) · SARS 2003 historical · COVID-19 multi-cluster historical · Acute angle-closure glaucoma (SNEC) · Dental abscess + Ludwig screen (Healthway → NDCS) · Dengue with warning signs + dorm cluster (NTFGH + MOH/NEA/MOM) · Community-acquired pneumonia + CURB-65 + NAIS (Polyclinic → KTPH) · Exertional heat injury + SAF cool-first protocol + RTU rehab (TTSH) · Young adult distress via Mindline 1771 + Tiered Care · Frailty + falls via Age Well SG / HPC+ ageing-in-place · Stage III breast cancer financed under the MediShield Life 2025 reform

### 94 facilities across the entire network
SingHealth · NUHS · NHG clusters: every acute hospital, specialty centre, community hospital, and polyclinic. VWO partners (SLH, Ren Ci, AMKH, SACH). Primary care (Healthway, Parkway Shenton, Raffles, NEMG, IHH-Parkway, MaNaDr, Doctor Anywhere, WhiteCoat, Speedoc). Private hospitals (Mt Elizabeth, Gleneagles, Raffles, Mt Alvernia, Thomson, Farrer Park, Crawfurd). Specialist nodes (Asia Medic, Camden, Novena Medical, SMG). Ancillary (SCDF, HSA, NKF/KDF/Fresenius dialysis, HCA/Dover Park/Assisi hospice, nursing homes, pharmacies, home).

### 7 curricula
Cardio · Acute Emergencies · Cross-Sector · End-of-Life · Pandemic · Primary care + Healthier SG · Paeds & Women's Health — each with learning objectives, progress tracking, and one-click Begin / Continue.

### Learning analytics
- Personal trends panel: sparklines, category strengths, three-track recommendations (Practice / Continue curriculum / Discover something new)
- Decision-level weakness analytics — aggregates your runHistory log per `(caseId | decisionId)` and points at the specific decisions you keep getting wrong
- Compare runs matrix — side-by-side decision-by-decision view of every attempt on a case
- Persistent reflection notes per decision — survive sessions, embed into lesson plan exports, browsable in Trends
- Daily learning streak (🔥) — 12-week heatmap in Trends, 3 / 7 / 30-day achievements
- Today's challenge — same case for every player on the same date
- **Suggested next case badge** *(new in v2.0)* — surfaces the personalised pick (weak spot / unfinished curriculum / discovery) in the case list
- **Voice narration** *(new in v2.0)* — 🔊 Speak + 🎙 Auto-narrate buttons read each scene's framing in the active locale via Web Speech API
- 15 achievements

### Game modes
- **Case mode** — full pathway sim with patient sprite walking between departments
- **Campaign mode** *(v2.0)* — shift-themed sequences (TTSH ED Friday night, cross-cluster oncology week, outbreak week, polyclinic morning, geriatric step-down, reform week) with cumulative pass-ratio targets
- **Exam / OSCE mode** *(v3.0)* — timed papers (8/15/20 questions), no feedback until the end, pass/fail + printable certificate
- **Sandbox** *(v4.0)* — pick a patient profile + clinical condition (or leave random) and generate a bespoke encounter; analytics dashboard surfaces score-distribution + 8-week activity
- **Today's plan** *(v5.0)* — adaptive 5-item daily list composing spaced retrieval, weakest practice, curriculum continuity, daily challenge, discovery
- **Duel mode** *(v5.0)* — two players, one device, alternating questions, head-to-head verdict
- **Timeline scrubber + peer review** *(v6.0)* — walk a finished run step-by-step with cumulative score + stability; shared runs carry peer-review threads with compact review tokens
- **Handoff + competency + Brier** *(v7.0)* — SGH1.* pause/resume tokens; confidence-rated exam scoring with calibration verdict; Dreyfus competency tier in Trends; my study sets; printable cheatsheet
- **Goals + bookmarks + flashcards + mastery + portfolio** *(v8.0)* — weekly learning targets with progress bars; star decisions for later; deck of decision-rationale flashcards seeded per day; 5-tier per-case mastery ladder (untouched → consolidated); printable single-page learner portfolio aggregating competency, mastery, weekly progress, top cases, reflections, bookmarks
- **Case journal + freeze tokens + calibration trend + best-case certificate + smart debrief** *(v9.0)* — whole-case reflection notes; ❄ streak-freeze tokens minted from weekly-goal completion that shield missed days; persisted exam calibration trend (sparkline + delta) feeding the Dreyfus calibration bonus across sessions; printable personal-best certificate per case; printable post-run debrief listing misses + best-answer rationales + concrete next steps + cited guidelines
- **Hospital Ops mode** — 8-hour tycoon shift at TTSH: hire staff, set bed capacity, manage budget + DORSCON
- **Practice mode** — re-attempt a single decision in isolation (no score recorded)
- **Quick Quiz** — 5 random decisions in sequence with running score
- **Spaced retrieval** *(v2.1)* — missed decisions resurface at expanding intervals (1/3/7/21/60 days)
- **Demo best-path** — walk through the highest-scoring choices for revision

### Authoring & teaching *(v2.3–v3.0)*
- **Case Authoring Studio** — a guided form (✎ Build) that assembles a valid case without writing JSON; save locally or export
- **Educator tools** — create an assignment link (exam or curriculum + pass mark), share with a cohort, collect completion tokens into a roster with CSV export. No server, no accounts.

### Exports + sharing (URL-encoded, no server)
- Run snapshot → share URL with journey + decisions + financing
- Custom case JSON → import / share
- Curriculum bundle JSON → embed cases inside
- Lesson plan → markdown (copy / download) and print/PDF — **locale-aware** (English / 中文 / Bahasa Melayu / தமிழ்)
- Reflection notes → markdown export
- Run history → CSV (one row per decision, RFC 4180-escaped)
- **Backup & restore** — Settings → Export / Import JSON moves your progress + streak + custom content between browsers

### Languages
Singapore has four official languages, and all four are selectable. Coverage is **honest and tracked** (see [`docs/REVIEW.md`](docs/REVIEW.md) and [`docs/ROADMAP.md`](docs/ROADMAP.md)):

- **English** — full (UI + all 38 cases).
- **Chinese (中文)** — full: every case translated end-to-end (prompt, option, rationale, outcome, framing, guideline reference) plus complete UI chrome.
- **Malay (Bahasa Melayu)** and **Tamil (தமிழ்)** — *in progress on the official-language parity track*. UI chrome is being raised to full parity (v9.2 Malay, v9.3 Tamil); case content follows (v9.4+). The language switcher marks these as partial and falls back to English for any untranslated string, so a learner is never misled. A CI parity metric (`src/lib/i18n/parity.test.ts`) prevents silent regression.

### Quality
- 286 unit tests, build clean
- Lazy-loaded Phaser, Practice modal, Quiz modal, About / Settings / Import / Builder modals
- Bundle: ~213 KB index (65 KB gzip), content chunk 325 KB (143 KB gzip), Phaser 1.48 MB on demand
- Top-level ErrorBoundary catches crashes with recoverable fallback
- A11y: focus traps in every modal, aria-live announcer, skip-to-content link, `prefers-reduced-motion` honoured, keyboard help (`?`)
- Mobile-friendly tap targets (44px minimum on primary CTAs)
- PWA: service worker network-first nav + cache-first assets, install prompt, offline indicator

## Stack
- **Phaser 3** — map + patient sprite
- **React 18 + TypeScript + Vite** — UI overlay
- **Zustand** — state with `persist` middleware
- **Tailwind CSS** — styling
- **Vitest** — unit tests
- No image assets — every sprite is drawn with primitives so the bundle stays lean

## Develop

```sh
pnpm install
pnpm dev          # http://localhost:5173
pnpm test         # vitest
pnpm exec tsc --noEmit
pnpm build        # outputs to dist/ with base /Game/
pnpm preview
```

## Deploy

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on push to the dev or `main` branch.

## Authoring your own content

- **Cases**: paste JSON into Cases → Import JSON. The validator points at any broken field. Built-in cases live in `src/content/cases/` for shape reference.
- **Curricula**: same flow from the Curricula panel. Bundles can embed custom cases inline so caseIds resolve without prior import.
- **Share**: every imported case becomes a URL via the Share button. Open the URL elsewhere and the receiver auto-imports.

## Educational disclaimer

All clinical scenarios, guideline references, and Singapore healthcare-system mechanics are simplifications for educational use. The financing cascade (subsidy → MediShield Life → MediSave → CHAS → IP rider → cash) matches reality in shape, **not in number** — refer to the MOH website and your hospital's billing department for any real-world figure. MediShield Life modelling reflects the 2025 reform in shape (tiered 3–10% co-insurance, refreshed Cancer Drug List, CTGTP coverage) but the bands are illustrative. Cases reflect a small set of named guidelines (ESC 2023 ACS, ESC HF 2021/2023, ATLS 11, KDIGO 2024, NICE, Surviving Sepsis 2021, ESO/ESMINT, EGS 6th ed., Singapore National Dengue Guideline 2026, MHCTA as amended 2025) at the time of authoring — always defer to current local guidance.

Historical scenarios (SARS 2003, COVID-19) are reconstructions framed by post-outbreak reviews; outcomes are stylised. Sources are listed in each historical case.

## Privacy

Everything is local. No accounts, no analytics, no telemetry. `localStorage` holds your unlocked cases, best scores, run history, custom imports, language, audio, install-prompt + disclaimer-acknowledged flags. Clear via the browser or the Settings → Reset everything button at any time.
