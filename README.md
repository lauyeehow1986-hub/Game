# SG Pathway — Singapore Healthcare Pathway Sim

A browser-based educational game showing patients moving through Singapore's healthcare network — public hospitals, specialty centres, community hospitals, polyclinics, GPs, telemed, and private hospitals — across elective, acute, and outpatient pathways, with toggleable patient / caregiver / staff perspectives.

Hosted as a static site on GitHub Pages.

## Stack
- **Phaser 3** — top-down hospital map and patient sprite movement.
- **React 18 + TypeScript + Vite** — UI overlay (HUD, dashboards, decision dialogs, results).
- **Zustand** — state management; `persist` middleware writes progress to `localStorage`.
- **Tailwind CSS** — UI styling.

## v0.1 — Vertical slice

What's playable now:

- **One hospital**: Tan Tock Seng Hospital (TTSH).
- **One case**: Acute STEMI from SCDF arrival → triage → ED resus → cath lab → CICU → ward → pharmacy → discharge → SOC review → cardiac rehab.
- **Eight decision points** with score, rationale, and references to MOH CPG / ESC / Healthier SG.
- **Perspective toggle** (patient / caregiver / staff) — same event, three different framings.
- **Tycoon-style HUD** — bed occupancy, ED wait, staff fatigue, DORSCON, running patient bill.
- **Save/progress** to `localStorage` — best score per case persists across reloads.

Subsequent phases (per `/root/.claude/plans/i-want-to-create-mossy-bentley.md`) add the rest of NHG, then SingHealth, NUHS, VWO, primary care (polyclinics + GPs + CHAS + telemed), and private hospitals, with bidirectional cross-sector referrals via NEHR / HealthHub / hand-carry CDs.

## Develop

```sh
pnpm install
pnpm dev          # http://localhost:5173
pnpm build        # outputs to dist/ with base /Game/
pnpm preview
```

## Deploy

GitHub Actions (`.github/workflows/deploy.yml`) builds and deploys to GitHub Pages on push to the dev or `main` branch. Final URL: `https://lauyeehow1986-hub.github.io/Game/`.

## Educational disclaimer

All clinical scenarios, guidelines references, and Singapore healthcare-system mechanics are simplifications for educational use. They are not a substitute for clinical judgement or current local protocols. Cited references are the source frameworks; always defer to up-to-date guidance.
