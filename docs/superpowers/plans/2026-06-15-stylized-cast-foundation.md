# Stylized Cast Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the cloned, unclothed, fold-hacked MakeHuman cast with a Quaternius-rigged cast that plays real animation clips, varies per instance, and wears a cohesive soft-clean matte look.

**Architecture:** Revert the shared `_lib` cast to the Quaternius source (its rig matches the existing CC0 clips, so animation binds natively and characters are clothed). Add one per-instance styling pass (`castStyle.ts`) that clones each figure's 6 named materials and assigns deterministic SG-appropriate skin/hair/clothing colors + matte settings + a scale jitter — killing clones. Retire the procedural `castPose` fold-hack and the photoreal `castMaterials` reshade.

**Tech Stack:** TypeScript, three.js 0.184, `@gltf-transform/core` (asset build), Vitest, Vite, pnpm. This is the source repo at `C:\Users\lauye\Documents\Game-source` (working branch `claude/healthcare-pathway-game-X7oRQ`).

**Scope note:** This is Plan 1 of 3 from the spec
`docs/superpowers/specs/2026-06-15-stylized-cast-staging-overhaul-design.md`
(workstreams 1–4). Per-beat supine surface + blocking + environments (Plan 2) and
overlays/showpieces (Plan 3) follow. This plan is shippable on its own.

---

## File structure

| File | Responsibility |
|---|---|
| `scripts/map-quaternius-cast.mjs` | (run only) regenerates `_lib/*.glb` from Quaternius source |
| `public/3d/cast/_lib/*.glb` | replaced with Quaternius characters (tracked assets, committed) |
| `src/game3d/castStyle.ts` (new) | deterministic per-instance soft-clean + variation: 6-slot recolour, matte, scale |
| `src/game3d/castStyle.test.ts` (new) | unit tests for the deterministic styling |
| `src/game3d/actorLoader.ts` | drop `castPose`; apply `castStyle` per instance; keep `surfaceY` lift in `update()` |
| `src/game3d/Stage3D.ts` | add a soft rim/back light to the lighting rig |
| `src/game3d/castPose.ts` | DELETE (fold-hack retired) |
| `src/game3d/castMaterials.ts` | DELETE (photoreal reshade superseded by `castStyle`) |
| `src/game3d/photoreal.test.ts` | remove `castMaterials`/`castPose` blocks; keep the rest |

---

## Task 1: Regenerate the Quaternius cast and confirm it animates + is clothed

**Files:**
- Run: `scripts/map-quaternius-cast.mjs`
- Modify (regenerated): `public/3d/cast/_lib/*.glb`

- [ ] **Step 1: Regenerate the cast library + clips from the Quaternius source**

Run: `pnpm map:cast`
Expected: prints `✓ _lib/doctor-male-young.glb ← Doctor_Male_Young` (×14) and
`✓ anims/idle-breathing.glb ← Idle` (×7), ending `Done.`

- [ ] **Step 2: Confirm the regenerated _lib is Quaternius-rigged**

Run: `node -e "const{NodeIO}=require('@gltf-transform/core');(async()=>{const d=await new NodeIO().read('public/3d/cast/_lib/doctor-male-young.glb');const bones=d.getRoot().listNodes().map(n=>n.getName());console.log('CharacterArmature:',bones.includes('CharacterArmature'),'UpperArm.L:',bones.includes('UpperArm.L'),'upperarm01.L:',bones.includes('upperarm01.L'));})()"`
Expected: `CharacterArmature: true UpperArm.L: true upperarm01.L: false`

- [ ] **Step 3: Start the dev server and open a walkthrough in 3D**

Run: `preview_start` (dev server), then in the app open the STEMI walkthrough, switch the renderer toggle to `3D`, and seek to the "Ambulance on scene" beat.

- [ ] **Step 4: Screenshot and verify the foundation visually**

Use `preview_screenshot`. Verify, and note in the commit message:
- figures are **clothed** (not bare bodies) — record their actual colours,
- the kneeling/lying/walking figures are in **real articulated poses** (bent
  knees / lying flat), NOT folded-in-half at the waist or frozen in an A-pose,
- no console errors from clip binding (`preview_console_logs`).

If clips still don't play: confirm `castPose.active` is now `false` for this rig
(it checks `upperarm01.L`, absent in Quaternius) so `PoseAnimationDriver` drives
the figure — this is the expected path and needs no code yet.

- [ ] **Step 5: Commit the regenerated cast**

```bash
git add public/3d/cast/_lib public/3d/anims
git commit -m "3d(cast): revert _lib to Quaternius rig — clips bind, cast clothed"
```

---

## Task 2: `castStyle.ts` — deterministic per-instance soft-clean + variation

**Files:**
- Create: `src/game3d/castStyle.ts`
- Test: `src/game3d/castStyle.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { styleForActor, SKIN_TONES } from './castStyle';
import type { WalkthroughActor } from '../lib/walkthrough';

const actor = (id: string, role = '', team = ''): WalkthroughActor =>
  ({ id, name: id, role, team } as WalkthroughActor);

describe('castStyle.styleForActor', () => {
  it('is deterministic for the same id', () => {
    expect(styleForActor(actor('mr-tan'))).toEqual(styleForActor(actor('mr-tan')));
  });
  it('varies across different ids', () => {
    const a = styleForActor(actor('mr-tan'));
    const b = styleForActor(actor('mdm-lim'));
    // at least one visible attribute differs (skin, hair, top, or scale)
    expect(a.skin !== b.skin || a.hair !== b.hair || a.top !== b.top || a.scale !== b.scale).toBe(true);
  });
  it('draws skin from the SG palette', () => {
    expect(SKIN_TONES).toContain(styleForActor(actor('x')).skin);
  });
  it('keeps height scale within a believable band', () => {
    const s = styleForActor(actor('whoever'));
    expect(s.scale).toBeGreaterThanOrEqual(0.94);
    expect(s.scale).toBeLessThanOrEqual(1.06);
  });
  it('gives nurses a scrub top distinct from a doctor white coat', () => {
    const nurse = styleForActor(actor('icu-nurse', 'ICU nurse', 'icu'));
    const doc = styleForActor(actor('ed-doctor', 'ED doctor', 'ed'));
    expect(nurse.top).not.toBe(doc.top);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/game3d/castStyle.test.ts`
Expected: FAIL — `Cannot find module './castStyle'`.

- [ ] **Step 3: Implement `castStyle.ts`**

```ts
/**
 * castStyle — deterministic per-instance look for the Quaternius cast.
 *
 * Quaternius characters carry 6 flat, texture-less materials (Skin, Face, Hair,
 * Main, Black, Brown), so a character's entire appearance is 6 colours. We use
 * that: a stable hash of the actor id seeds a per-figure palette (skin tone from
 * a believable Singapore distribution, hair, role-appropriate clothing) plus a
 * height jitter. Applied per clone (materials cloned first) so reused base meshes
 * never read as identical clones. Materials are also pushed matte for the
 * soft-clean look. Stable by id, so a recurring named patient looks the same in
 * every scene.
 */
import * as THREE from 'three';
import type { WalkthroughActor } from '../lib/walkthrough';

/** Believable SG skin-tone distribution (sRGB), light → deep. */
export const SKIN_TONES = [
  '#f1c9a5', '#e7b48d', '#d79e74', '#c0855a', '#a86b43', '#8d5732',
] as const;
/** Hair colours, mostly dark with a couple of greys for older actors. */
const HAIR = ['#14100c', '#221812', '#33241a', '#4a3422', '#9a9488', '#c9c4bc'] as const;

export interface CastStyle {
  skin: string;   // Skin + Face
  hair: string;   // Hair
  top: string;    // Main (coat / scrub top / shirt)
  bottom: string; // Black (trousers / lower)
  accent: string; // Brown (shoes / belt)
  scale: number;  // height jitter
}

/** FNV-1a hash → uint32. */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
/** Small deterministic RNG seeded from the hash (mulberry32). */
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = <T>(arr: readonly T[], r: number) => arr[Math.floor(r * arr.length)];

/** Role → clothing colours. Keyword match keeps it general across walkthroughs. */
function garment(actor: WalkthroughActor, r: () => number): { top: string; bottom: string; accent: string } {
  const hay = `${actor.id} ${actor.role ?? ''} ${actor.team ?? ''}`.toLowerCase();
  if (/nurse|\bhca\b|midwife/.test(hay)) return { top: '#3f9d8f', bottom: '#2f6f66', accent: '#2a2a2e' }; // teal scrubs
  if (/paramedic|ambulance|scdf|cfr|responder/.test(hay)) return { top: '#c5443b', bottom: '#2b2f36', accent: '#1f2228' }; // SCDF red
  if (/doctor|\bmo\b|consultant|registrar|surgeon|intensivist|cardio|radiolog|physio|therapist/.test(hay))
    return { top: '#f3f5f8', bottom: '#3a4654', accent: '#2a2f36' }; // white coat
  if (/pharm|coord|clerk|admin|counsel/.test(hay)) return { top: '#46618a', bottom: '#2c3a52', accent: '#23303f' }; // office
  if (/patient/.test(hay)) return { top: '#bcd3e6', bottom: '#9fb3c6', accent: '#7d8ea0' }; // gown
  // family / bystander → varied casual
  const casual = ['#6b8f5a', '#9a5b46', '#4d6b87', '#8a6f9c', '#b08a3e'];
  return { top: pick(casual, r()), bottom: '#3b4250', accent: '#2c2c30' };
}

export function styleForActor(actor: WalkthroughActor): CastStyle {
  const r = rng(hash(actor.id));
  const skin = pick(SKIN_TONES, r());
  const hair = pick(HAIR, r());
  const g = garment(actor, r);
  const scale = 0.94 + r() * 0.12; // 0.94 .. 1.06
  return { skin, hair, top: g.top, bottom: g.bottom, accent: g.accent, scale };
}

/** Quaternius material name → which CastStyle colour drives it. */
const SLOT: Record<string, keyof CastStyle> = {
  Skin: 'skin', Face: 'skin', Hair: 'hair', Main: 'top', Black: 'bottom', Brown: 'accent',
};

/**
 * Apply the style to a freshly-cloned figure root: clone every material (so this
 * instance owns its colours), recolour by slot, push matte for soft-clean, and
 * jitter height. No-op-safe on non-Quaternius rigs (unknown material names keep
 * their colour but still go matte).
 */
export function applyCastStyle(root: THREE.Object3D, actor: WalkthroughActor): CastStyle {
  const s = styleForActor(actor);
  root.scale.setScalar(s.scale);
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mesh.material = mats.map((m) => {
      const std = (m as THREE.MeshStandardMaterial).clone();
      const slot = SLOT[std.name];
      if (slot) std.color = new THREE.Color(s[slot] as string);
      std.roughness = 0.72;   // matte, soft-clean
      std.metalness = 0.0;
      std.envMapIntensity = 0.7;
      std.needsUpdate = true;
      return std;
    });
    if (!Array.isArray(mesh.material)) mesh.material = mesh.material[0] ?? mesh.material;
  });
  return s;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/game3d/castStyle.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/game3d/castStyle.ts src/game3d/castStyle.test.ts
git commit -m "3d(cast): castStyle — deterministic per-instance soft-clean variation"
```

---

## Task 3: Wire `castStyle` into the figure; retire `castPose`; keep the surface lift

**Files:**
- Modify: `src/game3d/actorLoader.ts`

- [ ] **Step 1: Apply variation + drop the castPose branch in `GlbFigure`**

In `src/game3d/actorLoader.ts`, change the imports — remove the `CastPoseController` import and add:

```ts
import { applyCastStyle } from './castStyle';
```

In the `GlbFigure` constructor, after `this.root.add(clone);`, apply the style and
remove the `castPose` field/branch. The constructor's driver setup becomes:

```ts
    this.root.add(clone);
    applyCastStyle(clone, actor);
    this.phase = [...actor.id].reduce((h, c) => h + c.charCodeAt(0), 0) % 7;
    this.driver = new PoseAnimationDriver(clone);
    void this.driver.setPose('stand');
```

Delete the `private castPose: CastPoseController;` field and its construction.

- [ ] **Step 2: Always route pose changes through the driver**

In `setState`, simplify the guard (no more `castPose.active`):

```ts
    if (next.pose && next.pose !== prevPose) {
      void this.driver.setPose(next.pose);
    }
```

- [ ] **Step 3: Preserve the supine-surface lift in `update()`**

The `castPose` controller used to lerp the body onto a bed surface; keep that
behaviour directly on the figure. Replace the `if (this.castPose.active) … else …`
block in `update()` with:

```ts
    this.driver.update(dt);
    // Lift a collapsed patient onto the scene's surface (trolley/table) when one
    // is given; settle back to the floor otherwise. Smoothed so it reads as
    // settling, not snapping.
    const targetY = this.state.pose === 'collapsed' ? this.state.surfaceY : 0;
    this.root.position.y += (targetY - this.root.position.y) * Math.min(1, dt * 6);
```

- [ ] **Step 4: Type-check**

Run: `pnpm tsc --noEmit`
Expected: PASS (no references to the removed `castPose`/`CastPoseController`).

- [ ] **Step 5: Reload the app and verify variation + animation together**

`preview_eval` `window.location.reload()`, open STEMI 3D, seek to the ICU/resus
team beat, `preview_screenshot`. Verify: the clinical team now shows **distinct
skin tones / hair / scrub-vs-coat colours** (no clones), figures **animate**, the
collapsed patient **lies flat**. `preview_console_logs` shows no errors.

- [ ] **Step 6: Commit**

```bash
git add src/game3d/actorLoader.ts
git commit -m "3d(cast): apply per-instance castStyle; retire castPose; keep surface lift"
```

---

## Task 4: Add a soft rim/back light for the premium studio wrap

**Files:**
- Modify: `src/game3d/Stage3D.ts`

- [ ] **Step 1: Add a rim light field + construction**

In `Stage3D`, alongside `private key: THREE.DirectionalLight;` add:

```ts
  private rim: THREE.DirectionalLight;
```

In the constructor, after the `this.key` block and before `this.scene.add(...)`:

```ts
    // Soft rim/back light — a low, cool back-light that wraps a bright edge
    // around the cast so they separate from the set (the "premium studio" read
    // of the soft-clean look). No shadow (fill only), low intensity.
    this.rim = new THREE.DirectionalLight('#cfe0ff', 0.5);
    this.rim.position.set(-4, 5, -8);
```

Add it to the scene in the existing `this.scene.add(...)` call:

```ts
    this.scene.add(this.hemi, this.key, this.key.target, this.rim);
```

- [ ] **Step 2: Track rim intensity per scene (subtle, follows the key)**

In `swapEnvironment`, after the `this.key.*` assignments, add:

```ts
    this.rim.intensity = L.key.intensity * 0.28;
    this.rim.color.set(L.hemi.sky);
```

- [ ] **Step 3: Type-check + visual check**

Run: `pnpm tsc --noEmit` → PASS.
Reload, screenshot a clinical scene; verify a gentle bright edge now separates
the cast from the background without blowing out highlights.

- [ ] **Step 4: Commit**

```bash
git add src/game3d/Stage3D.ts
git commit -m "3d(light): soft rim/back light for the soft-clean studio wrap"
```

---

## Task 5: Delete the retired modules and prune their tests

**Files:**
- Delete: `src/game3d/castPose.ts`
- Delete: `src/game3d/castMaterials.ts`
- Modify: `src/game3d/actorLoader.ts` (remove the `refineCastMaterials` import + call)
- Modify: `src/game3d/photoreal.test.ts` (remove castPose/castMaterials blocks)

- [ ] **Step 1: Remove the `refineCastMaterials` usage in `actorLoader.ts`**

Delete the import `import { refineCastMaterials } from './castMaterials';` and, in
`fetchGlb`, delete the `refineCastMaterials(g.scene);` line and its comment so the
`onLoad` callback is just:

```ts
        (g) => {
          resolve(g.scene);
        },
```

- [ ] **Step 2: Delete the two retired files**

```bash
git rm src/game3d/castPose.ts src/game3d/castMaterials.ts
```

- [ ] **Step 3: Remove their test blocks from `photoreal.test.ts`**

Open `src/game3d/photoreal.test.ts` and delete every `describe`/`it` block and
`import` that references `castMaterials` (`refineMaterial`, `refineCastMaterials`)
or `castPose` (`CastPoseController`). Leave the remaining blocks (floors,
lighting, atmosphere, space) untouched.

- [ ] **Step 4: Run the full test + type suite**

Run: `pnpm tsc --noEmit && pnpm vitest run`
Expected: PASS, no references to the deleted modules. (`castStyle.test.ts` green.)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "3d(cast): delete retired castPose fold-hack + castMaterials reshade"
```

---

## Task 6: Full cast verification across every walkthrough + ship

**Files:**
- Modify (record): `docs/visual-research/RESULTS.md`

- [ ] **Step 1: Run the full local verification**

Run: `pnpm verify`
Expected: lint + types + unit tests + build all PASS. (If `verify` is not a
script, run `pnpm lint && pnpm tsc --noEmit && pnpm vitest run && pnpm build`.)

- [ ] **Step 2: Screenshot the cast in every walkthrough**

With the dev server running, for each of the 4 walkthroughs (STEMI, stroke,
trauma, sepsis): open it, switch to `3D`, and capture one beat that has a clinical
team + one that has a lying patient. For each `preview_screenshot`, confirm the
checklist: no clones, real poses, clothed, patient flat (on the floor for now —
surface snapping is Plan 2), soft-clean matte look, rim separation. Log any scene
that fails for Plan 2.

- [ ] **Step 3: Record the before/after in the research log**

Append a dated entry to `docs/visual-research/RESULTS.md` summarising the pivot
(MakeHuman photoreal → Quaternius soft-clean stylized), the foundation fix, and
the per-walkthrough screenshot results.

- [ ] **Step 4: Commit + push + confirm deploy**

```bash
git add docs/visual-research/RESULTS.md
git commit -m "3d(cast): foundation verified across all 4 walkthroughs; log results"
git push
```

Then confirm the GitHub Pages deploy is green:
Run: `gh run list --branch claude/healthcare-pathway-game-X7oRQ --limit 1`
Expected: latest run `completed  success`.

---

## Self-review checklist (completed at plan-write time)

- Spec workstreams 1–4 covered: 1 (Task 1), 2 (Tasks 1+3), 3 (Tasks 2+3), 4
  (Tasks 2+4). Workstreams 5–8 are Plans 2–3 (noted in the scope note).
- No placeholders: every code step shows real code; the rim-light hex typo is
  shown being corrected inline so the engineer doesn't ship the bad literal.
- Type consistency: `styleForActor`/`applyCastStyle`/`CastStyle`/`SKIN_TONES`
  names match across `castStyle.ts`, its test, and `actorLoader.ts`. `surfaceY`
  matches the existing `ActorFigure.setState` field.
