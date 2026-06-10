# SG Pathway — what's remaining on the roadmap

Snapshot as of `claude/healthcare-pathway-game-X7oRQ` @ v9.17.3 ·
**710 tests passing**, type-check clean, production build clean.

For the full version-by-version history of shipped work, see
[`ROADMAP.md`](./ROADMAP.md). For an at-a-glance summary of shipped
work, see [`SUMMARY.md`](./SUMMARY.md).

---

## 1. Asset-population handoff — **blocks photoreal 3D**

The v9.17.x photoreal pipeline (infrastructure shipped through v9.17.3)
is wired end-to-end but the asset folder is empty because Claude's
sandbox can't reach external CDNs. **One command on your machine
unblocks the visible upgrade:**

```bash
git pull
pnpm install        # picks up `postprocessing` + `three` types
pnpm fetch:3d       # downloads HDRIs + character/prop packs into public/3d/
pnpm dev            # reload, switch to 3D ᴮᴱᵀᴬ, toggle PostFX on
```

| Step | Who | Effort | What lands |
| --- | --- | --- | --- |
| **A. Auto-fetch CC0 assets** | You | 10 min | HDRIs (Poly Haven CC0) for all 12 scenes → IBL specular/ambient kicks in. Quaternius CC0 character pack + medical prop pack downloaded. Kenney CC0 props downloaded. |
| **B. Rename Quaternius GLBs** | You | 1 hr | Unzip `public/3d/cast/_quaternius/`; rename per-actor: `patient.glb`, `paramedic.glb`, `consultant.glb`, `mo.glb`, `nurse.glb`, `bystander.glb`, `smrt-staff.glb`, etc. The procedural rig stays as the fallback for any actor without a GLB. |
| **C. Mixamo animation clips** | You | 30 min | At [mixamo.com](https://www.mixamo.com), download these 7 clips applied to ANY rigged character as separate GLBs into `public/3d/anims/`: `idle-breathing.glb`, `walking.glb`, `kneeling.glb`, `sitting.glb`, `cpr-compressions.glb`, `lying-down.glb`, `pointing.glb`. The `PoseAnimationDriver` (v9.17.3, already shipped) auto-loads them and cross-fades on pose change. |
| **D. Photoreal humans (optional)** | You | One evening | [MakeHuman](https://www.makehumancommunity.org) parametric humans for the recurring cast (Mr Tan, Mdm Lim, etc.); export as GLB; drop in `public/3d/cast/{actorId}.glb` to override Quaternius. |
| **E. Custom medical attire (optional)** | You | A few hours | Marvelous Designer scrubs / SCDF orange jumpsuit / white coat draped on the MakeHuman bases. Or use Ready Player Me with their scrubs catalog. |

**Smallest meaningful first slice = Step A alone.** Run it, screenshot
the result, and we iterate from there.

After Step A: I can iterate on per-scene PBR tweaks, Stage3D camera
choreography, and animation retargeting fixes if any of the Mixamo
clips need bone-name remapping for your downloaded characters.

---

## 2. Multilingual case content (paused, awaiting native review)

These are content-track items, not engineering blockers. The walkthrough
arc was prioritised over them.

| Version | Deliverable | Status |
| --- | --- | --- |
| v9.12 | Locale translation of all walkthrough strings (zh, ms, ta) | **Held** pending native-speaker clinical review. Plumbing in place; the gating issue is content correctness, not engineering. |
| v10.1 | Case-content `ms` (Malay) translation track — primary-care / public-health cases first | Planned, post-walkthrough arc |
| v10.2 | Case-content `ta` (Tamil) translation track — same case ordering | Planned, post-walkthrough arc |
| **v11.0** | Capstone: all four official languages at full UI + case parity; mother-tongue first-run suggestion from `navigator.languages`; "end-to-end translation" claim restored | Planned |

**Parity bar:** UI chrome 100% of `en` keys + critical-key coverage +
case content (title, blurb, node framing, decision prompts, option
labels, rationales, outcomes, guideline refs) all carrying the locale
**and passing native-speaker review** before the locale is advertised
as complete. Per-locale machine-assisted strings are flagged as
partial-coverage in the language switcher so learners are never misled.

---

## 3. Backlog (unscheduled)

- **Per-case audio narration for `ms` / `ta`.** Web Speech API voice
  availability varies wildly by platform — needs a graceful-degradation
  check before shipping. Likely a v10.x+ item once locale content is in.
- **Singlish-aware glossary toggle** for informal patient-perspective
  framing. Niche but high-impact for authenticity.
- **Third walkthrough — sepsis or major trauma pathway.** Would reuse
  the existing engine + showpiece + achievement infrastructure exactly
  as STEMI and stroke do.
- **Real-time GI (v9.18+ if needed).** Not currently required — IBL +
  SSAO + bloom already covers ~90% of what feels photoreal. Would
  revisit only if PostFX-on still looks flat after authored assets land.
- **WebGPU renderer path.** Three.js has WebGPU support in `r170+`. A
  capability check + opt-in flag would let modern devices render the 3D
  walkthrough with compute-shader-driven shadows/GI. Speculative.

---

## 4. What's NOT remaining (confirmation)

These were considered and deliberately deferred or rejected:

| Item | Verdict | Why |
| --- | --- | --- |
| Switch from Three.js to Babylon.js | **Rejected** | Babylon's 900 kB-1.2 MB core would roughly double our chunk; the photoreal bottleneck is assets, not the engine. Documented in `docs/3D-RENDERER.md`. |
| Switch from Phaser to Unity for the canvas renderer | **Rejected** | Unity WebGL breaks offline PWA shape; no path into React/Vitest/i18n surface. Documented in `ROADMAP.md` § "Renderer / engine decision". |
| Per-case audio assets (MP3/OGG) | **Out of scope** | PWA stays audio-asset-free; the v9.16 `sfx` indicators give the action a sound dimension without binary audio files. |
| Server-side state / multiplayer | **Out of scope** | This is an offline PWA. All progress is `localStorage`. |

---

## 5. Risk / loose-thread inventory

Items that aren't formal roadmap entries but could bite later:

- **Three.js version pin.** Currently `^0.184.0`. Three's API has
  semver-violating breaks at minor versions (their `r1xx` releases are
  effectively major). Pin to an exact version before declaring v10
  stable.
- **`postprocessing` package compat.** Pinned to `^6.39.1`. Coupled to
  the Three.js version above; check both together when upgrading.
- **Quaternius / Kenney pack URLs.** The `pnpm fetch:3d` script hardcodes
  download URLs that they occasionally rotate. If a 404 lands, the URL
  list at the top of `scripts/fetch-3d-assets.mjs` needs an update.
- **Resvg dependency for `pnpm bake:scenes`.** Native binary; CI runners
  without it can't bake scenes. Document or bundle.
- **The `claude/healthcare-pathway-game-X7oRQ` branch** is the long-lived
  development branch. At some point it merges to `main` and the project
  goes back to short-lived feature branches.

---

## Quick command reference

```bash
pnpm dev            # serves at http://localhost:5173
pnpm test           # 710 tests, ~9 s
pnpm verify         # tests + tsc + production build
pnpm bake:scenes    # regenerate 12 HD scene PNGs (~15 MB) when SVG scenery changes
pnpm fetch:3d       # download CC0 3D assets into public/3d/ (one-off per machine)
```

---

*This file lives at `docs/REMAINING.md` and is intended as the
single-place answer to "what's left." Refresh it whenever a roadmap
item ships or a new one lands.*
