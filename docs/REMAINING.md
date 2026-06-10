# SG Pathway — what's remaining on the roadmap

Snapshot as of `claude/healthcare-pathway-game-X7oRQ` @ v9.18 ·
**769 tests passing**, type-check clean, production build clean.

For the full version-by-version history of shipped work, see
[`ROADMAP.md`](./ROADMAP.md). For an at-a-glance summary of shipped
work, see [`SUMMARY.md`](./SUMMARY.md).

---

## 1. Asset-population handoff — ✅ DONE (v9.18)

The 3D asset folder is populated on this machine and the pipeline is
reproducible on any other machine:

```bash
pnpm fetch:3d       # 12/12 HDRIs (Poly Haven CC0) + Kenney pack
python -m gdown --folder \
  https://drive.google.com/drive/folders/1sNi1AfenfPRrvRt5yfaj5QMMd6KKcUJ5 \
  -O public/3d/cast/_quaternius      # Quaternius UACP (CC0, ~110 MB)
pnpm map:cast       # → cast/_lib/*.glb (14 role characters) + anims/*.glb (7 pose clips)
```

| Step | Status |
| --- | --- |
| A. Auto-fetch CC0 assets | ✅ All 12 HDRIs (counsel re-slugged to `hospital_room`); Kenney URL refreshed; Quaternius moved to Drive + `gdown` |
| B. Map character GLBs per actor | ✅ Superseded by `castManifest.ts` — every actor in all three walkthroughs resolves a role-appropriate shared character from `cast/_lib/`; an authored `cast/{actorId}.glb` still overrides; procedural rig is the final fallback |
| C. Animation clips | ✅ All 7 `BeatPose` clips extracted from the Quaternius pack's own animation set by `pnpm map:cast` — no Mixamo login needed. (Closest-equivalents: kneel←PickUp, CPR←Punch, point←Shoot_OneHanded; replace with Mixamo exports any time by overwriting `public/3d/anims/{slug}.glb`) |
| D. Photoreal humans (optional) | ⏳ Still yours: MakeHuman parametric humans for the recurring cast (Mr Tan, Mdm Lim, Mdm Devi…) → `public/3d/cast/{actorId}.glb` overrides |
| E. Custom medical attire (optional) | ⏳ Still yours: Marvelous Designer scrubs / SCDF jumpsuit / white coat on the MakeHuman bases, or Ready Player Me |

---

## 2. Multilingual case content (track restarted in v9.18)

| Version | Deliverable | Status |
| --- | --- | --- |
| v9.12 | Locale translation of all walkthrough strings (zh, ms, ta) | **Held** pending native-speaker clinical review (unchanged). |
| v10.1 | Case-content `ms` track — primary-care / public-health first | 🔄 **First slice shipped**: `paeds-vaccine-hesitancy`, `agewell-hpc` fully carry `ms` (machine-assisted, flagged). Coverage-floor test ratchets up only. |
| v10.2 | Case-content `ta` track — same ordering | 🔄 **First slice shipped**: same two cases. |
| **v11.0** | Four-language parity capstone | 🔄 **Infrastructure shipped**: real per-locale coverage meter (`case-locale-coverage.ts`), per-locale case-% + machine-assisted flags in the language switcher, mother-tongue first-run suggestion from `navigator.languages`. Remaining: translate the other ~36 cases ×2 locales + native review. |

**Parity bar (unchanged):** UI chrome 100% + critical keys + full case
content carrying the locale **and passing native-speaker review** before
a locale is advertised complete. Machine-assisted strings are flagged in
the switcher so learners are never misled.

**New honesty finding:** the coverage meter shows `zh` at ~93.7% of case
strings (long advertised as "every case"). Floored by test; closing the
gap is on the backlog.

---

## 3. Backlog

Shipped in v9.18: ~~ms/ta narration degradation check~~ · ~~Singlish
glossary toggle~~ · ~~third walkthrough (sepsis)~~ · ~~WebGPU opt-in~~.

Still open:

- **Translate the remaining ~36 cases** into ms + ta (the long tail of
  v10.1/v10.2) and close the zh ~6% gap.
- **Real-time GI (v9.19+ if needed).** Revisit only if PostFX-on still
  looks flat now that authored assets have landed.
- **Walkthrough ms/ta/zh strings** once native reviewers are confirmed
  (v9.12 unhold).
- **Fourth walkthrough — major trauma** would reuse the engine exactly as
  STEMI / stroke / sepsis do.

---

## 4. What's NOT remaining (confirmation)

| Item | Verdict | Why |
| --- | --- | --- |
| Switch from Three.js to Babylon.js | **Rejected** | Documented in `docs/3D-RENDERER.md`. |
| Switch from Phaser to Unity | **Rejected** | Documented in `ROADMAP.md` § "Renderer / engine decision". |
| Per-case audio assets (MP3/OGG) | **Out of scope** | PWA stays audio-asset-free; `sfx` indicators + Web Speech narration cover it. |
| Server-side state / multiplayer | **Out of scope** | Offline PWA; all progress is `localStorage`. |

---

## 5. Risk / loose-thread inventory

- ~~Three.js version pin~~ — ✅ pinned exact (`three@0.184.0`,
  `@types/three@0.184.1`, `postprocessing@6.39.1`) in v9.18.
- **Quaternius / Kenney URLs.** Kenney's URL hash rotates; Quaternius now
  comes from their Drive folder (`gdown`). If either 404s again, update
  `scripts/fetch-3d-assets.mjs` / the README in `public/3d/`.
- **Resvg dependency for `pnpm bake:scenes`.** `@resvg/resvg-js` is a
  native binary (prebuilt for win32/linux/mac via npm optional deps). CI
  runners on unusual platforms can't bake scenes — but baked PNGs are
  committed, so CI never *needs* to run it. Document-only risk.
- **pnpm ≥ 10 build-script allowlist.** `pnpm-workspace.yaml` carries
  `allowBuilds` (esbuild: true; sharp: false — sharp is an unused
  optional of gltf-transform). New native deps must be added there.
- **WebGPU path is β.** No PostFX / PMREM IBL on WebGPU by design; falls
  back to WebGL automatically. Revisit when three's TSL post-processing
  matures.
- **The `claude/healthcare-pathway-game-X7oRQ` branch** remains the
  long-lived development branch; merge to `main` when ready.

---

## Quick command reference

```bash
pnpm dev            # serves at http://localhost:5173
pnpm test           # 769 tests, ~7 s
pnpm verify         # tests + tsc + production build
pnpm bake:scenes    # regenerate 12 HD scene PNGs (~15 MB) when SVG scenery changes
pnpm fetch:3d       # download CC0 HDRIs + Kenney pack into public/3d/
pnpm map:cast       # convert Quaternius pack → cast library + pose clips
```

---

*This file lives at `docs/REMAINING.md` and is intended as the
single-place answer to "what's left." Refresh it whenever a roadmap
item ships or a new one lands.*
