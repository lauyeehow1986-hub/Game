# SG Pathway — Singapore Healthcare Pathway Sim

A browser-based educational simulator of patients moving through Singapore's healthcare network — public hospitals, specialty centres, community hospitals, polyclinics, GPs, telemed, VWO partners, and private hospitals — across elective, acute, and outpatient pathways, with toggleable **patient / caregiver / staff** perspectives.

Hosted as a static site on GitHub Pages. Fully offline-capable once installed (PWA). No accounts, no telemetry, no backend; everything lives in `localStorage`.

**Live**: <https://lauyeehow1986-hub.github.io/Game/>

## What's in it

### 28 clinical cases across every category
Acute STEMI · Acute ischaemic stroke (thrombectomy) · Severe sepsis · Major trauma · Febrile toddler (KKH PEWS) · Antenatal-to-delivery (KKH) · First-episode psychosis (IMH EPIP) · Paracetamol overdose + IMH C-L · Construction fall on a Work Permit (MOM WICA / FWMI) · Suspected IPV (KKH One Centre + HEARS) · Heart failure outpatient (NHCS GDMT) · CKD progression to dialysis (NKF) · Outpatient T2DM (SGLT2i, Healthier-SG) · URTI at a CHAS GP · Elective THR · Private cataract (SNEC vs Mt Elizabeth) · Cross-cluster breast cancer (NHG → SGH → NCCS) · Private-to-public handover (hand-carry CD) · End-of-life with home hospice (HCA + DPH) · Geriatric falls + AH@Home virtual ward · Disease X outbreak (NCID + DORSCON) · SARS 2003 historical · COVID-19 multi-cluster historical · Acute angle-closure glaucoma (SNEC) · Dental abscess + Ludwig screen (Healthway → NDCS) · Dengue with warning signs + dorm cluster (NTFGH + MOH/NEA/MOM) · Community-acquired pneumonia + CURB-65 + NAIS (Polyclinic → KTPH) · Exertional heat injury + SAF cool-first protocol + RTU rehab (TTSH)

### 91 facilities across the entire network
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
- 15 achievements

### Game modes
- **Case mode** — full pathway sim with patient sprite walking between departments
- **Hospital Ops mode** — 8-hour tycoon shift at TTSH: hire staff, set bed capacity, manage budget + DORSCON
- **Practice mode** — re-attempt a single decision in isolation (no score recorded)
- **Quick Quiz** — 5 random decisions in sequence with running score
- **Demo best-path** — walk through the highest-scoring choices for revision

### Exports + sharing (URL-encoded, no server)
- Run snapshot → share URL with journey + decisions + financing
- Custom case JSON → import / share
- Curriculum bundle JSON → embed cases inside
- Lesson plan → markdown (copy / download) and print/PDF — **locale-aware** (English / 中文 / Bahasa Melayu / தமிழ்)
- Reflection notes → markdown export
- Run history → CSV (one row per decision, RFC 4180-escaped)
- **Backup & restore** — Settings → Export / Import JSON moves your progress + streak + custom content between browsers

### Languages
4 locales scaffolded. **All 28 cases fully translated end-to-end into Chinese (中文)** — every prompt, option, rationale, outcome, framing line, guideline reference. UI chrome translated for English, Chinese, Malay, Tamil.

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

All clinical scenarios, guideline references, and Singapore healthcare-system mechanics are simplifications for educational use. The financing cascade (subsidy → MediShield Life → MediSave → CHAS → IP rider → cash) matches reality in shape, **not in number** — refer to the MOH website and your hospital's billing department for any real-world figure. Cases reflect a small set of named guidelines (MOH CPG, ESC, NCCN, NICE, KDIGO, ATLS, Surviving Sepsis, ESO) at the time of authoring — always defer to current local guidance.

Historical scenarios (SARS 2003, COVID-19) are reconstructions framed by post-outbreak reviews; outcomes are stylised. Sources are listed in each historical case.

## Privacy

Everything is local. No accounts, no analytics, no telemetry. `localStorage` holds your unlocked cases, best scores, run history, custom imports, language, audio, install-prompt + disclaimer-acknowledged flags. Clear via the browser or the Settings → Reset everything button at any time.
