# SG Pathway — what's remaining on the roadmap

Snapshot as of `claude/healthcare-pathway-game-X7oRQ` @ v11.0 ·
**820 tests passing**, type-check clean, production build clean.

> **v11.0 (2026-06) — optional / out-of-scope sweep.** This pass closed the
> remaining optional and backlog items: zh case content to 100%, a fourth
> walkthrough (major trauma), the walkthrough-localisation mechanism + a
> machine-assisted sepsis pack, a PWA-safe "challenge a friend" share-code, a
> documented real-time-GI decision (+ IBL flatness fix), and a headless
> MakeHuman/MPFB photoreal-cast generator (Steps D/E). The ms/ta case track
> advanced to 5/38 and keeps ratcheting. See the per-section notes below.

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
| D. Photoreal humans (optional) | ✅ **Reproducible generator shipped** — `pnpm make:cast` (`scripts/make-cast.py`) drives MPFB/MakeHuman headless in Blender 5.x to build the recurring cast (Mr Tan, Mdm Lim, Mdm Devi, Mr Lim + staff) with Singapore-authentic phenotypes and the retargetable default rig → `public/3d/cast/{actorId}.glb`. Verified end-to-end (10/10 GLBs). Binaries stay gitignored; the recipe is committed. See `docs/CAST-PHOTOREAL.md`. |
| E. Custom medical attire (optional) | ✅ **Documented hero-refinement route** — the generator tints skin + an attire accent so roles read instantly; `docs/CAST-PHOTOREAL.md` covers the Marvelous Designer / Ready Player Me garment pass on the same override slots. |

---

## 2. Multilingual case content (track restarted in v9.18)

| Version | Deliverable | Status |
| --- | --- | --- |
| v9.12 | Locale translation of all walkthrough strings (zh, ms, ta) | 🔄 **Unheld — mechanism shipped.** `walkthrough-i18n.ts` overlays a per-pathway machine-assisted translation pack via the pure `localiseWalkthrough()`; the modal lazy-loads the pack and shows a "machine-assisted" badge. First pack: the **sepsis** pathway fully in zh/ms/ta. STEMI / stroke / trauma packs are drop-in next via the registry. Native review still gates "reviewed". |
| v10.1 | Case-content `ms` track — primary-care / public-health first | 🔄 **5/38 shipped**: `paeds-vaccine-hesitancy`, `agewell-hpc`, `stemi-acute`, `elective-knee-tkr`, `stemi-rural-thrombolysis` fully carry `ms` (machine-assisted, flagged). Coverage-floor test ratchets up only. |
| v10.2 | Case-content `ta` track — same ordering | 🔄 **5/38 shipped**: same five cases. |
| **v11.0** | Four-language parity capstone | 🔄 **Infrastructure shipped**: real per-locale coverage meter (`case-locale-coverage.ts`), per-locale case-% + machine-assisted flags in the language switcher, mother-tongue first-run suggestion from `navigator.languages`. **zh case content now 100%** (was 93.7%). Remaining: the other 33 cases ×2 locales + native review. |

**Parity bar (unchanged):** UI chrome 100% + critical keys + full case
content carrying the locale **and passing native-speaker review** before
a locale is advertised complete. Machine-assisted strings are flagged in
the switcher (and the walkthrough header) so learners are never misled.

**Honesty finding — now closed:** the coverage meter once showed `zh` at
~93.7% of case strings (the gap was `stemi-acute`'s later nodes using plain
English). That case now carries all four locales; **zh is floored at exactly
100%**.

---

## 3. Backlog

Shipped in v9.18: ~~ms/ta narration degradation check~~ · ~~Singlish
glossary toggle~~ · ~~third walkthrough (sepsis)~~ · ~~WebGPU opt-in~~.

Shipped in v11.0: ~~close the zh ~6% gap~~ (now 100%) · ~~fourth walkthrough
(major trauma)~~ · ~~real-time GI decision~~ (rejected + IBL flatness fix,
`docs/3D-RENDERER.md`) · ~~walkthrough-localisation mechanism + sepsis pack~~
(v9.12 unhold) · ~~Steps D/E photoreal-cast generator~~.

Still open (incremental):

- **Translate the remaining 33 cases** into ms + ta (the long tail of
  v10.1/v10.2). Track ratchets case-by-case; 5/38 done.
- **Walkthrough packs for STEMI / stroke / trauma** — drop-in via the
  `WALKTHROUGH_I18N_PACKS` registry now that the sepsis pack proves the shape.
- **Native-speaker clinical review** of every machine-assisted locale before
  it is advertised as reviewed (the one true gate, not an engineering one).

---

## 4. What's NOT remaining (confirmation)

| Item | Verdict | Why |
| --- | --- | --- |
| Switch from Three.js to Babylon.js | **Rejected** | Documented in `docs/3D-RENDERER.md`. |
| Switch from Phaser to Unity | **Rejected** | Documented in `ROADMAP.md` § "Renderer / engine decision". |
| Per-case audio assets (MP3/OGG) | **Out of scope** | PWA stays audio-asset-free; `sfx` indicators + Web Speech narration cover it. |
| Server-side state / multiplayer | **Out of scope (server)** — but the *spirit* shipped in v11.0 as a PWA-safe **"challenge a friend" share-code** (`challenge-code.ts`): a seeded paper + the challenger's score packed into a short offline token, replayed head-to-head with no server. |

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
pnpm test           # 820 tests, ~6 s
pnpm verify         # tests + tsc + production build
pnpm bake:scenes    # regenerate 12 HD scene PNGs (~15 MB) when SVG scenery changes
pnpm fetch:3d       # download CC0 HDRIs + Kenney pack into public/3d/
pnpm map:cast       # convert Quaternius pack → cast library + pose clips
pnpm make:cast      # generate photoreal recurring cast (needs Blender 5.x + MPFB)
```

---

*This file lives at `docs/REMAINING.md` and is intended as the
single-place answer to "what's left." Refresh it whenever a roadmap
item ships or a new one lands.*
