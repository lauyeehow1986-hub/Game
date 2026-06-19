# Per-Beat Supine Surface + Blocking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make a `collapsed` patient lie *on* the scene's trolley/table/stretcher (not float beside it or dump on the floor), driven by the beat — and orient clinicians to face the patient.

**Architecture:** Generalise the engine's per-scene `bed` into a `surface` with an `auto` flag, and add an `onSurface` opt-in on beats. A pure, unit-tested helper (`surfacePlacement`) decides, from `{surface, pose, onSurface}`, whether a figure snaps onto the surface and where. Indoor clinical scenes auto-snap any collapsed patient; ambiguous outdoor scenes (street) snap only when a beat opts in. Then a light blocking pass turns non-patient figures to face the casualty.

**Tech Stack:** TypeScript, three.js 0.184, Vitest, Vite, pnpm. Source repo `C:\Users\lauye\Documents\Game-source`, working branch `claude/healthcare-pathway-game-X7oRQ`.

**Scope note:** Plan 2 of the spec
`docs/superpowers/specs/2026-06-15-stylized-cast-staging-overhaul-design.md`
(workstream 5). The 12-scene environment audit (workstream 6) is Plan 3;
overlays (workstream 7) is Plan 4. Plan 1 (cast foundation) is shipped.

---

## Current state (verified)

- Patient beats already carry `pose: 'collapsed'` for every "on the
  table/trolley/stretcher" beat (STEMI lines 369/392/415/475/496/574/597/769/789…).
- `Environment3D.bed?: BedSpot { x, z, y, yaw }` is registered for **resus**
  (y0.85), **cathlab** (y1.02), **imaging** (y1.1). Missing for **ward** (CCU beds).
- `Stage3D.setFrame` snaps a `collapsed` figure to `env.bed` when present:
  `const onBed = !!bed && f.pose === 'collapsed';`
- `Walkthrough3DStage.tsx:84` derives `pose: fig.beat?.pose ?? 'stand'`.
- The `street` scene is ambiguous: STEMI uses it for the loaded-stretcher beat
  (wants surface); Trauma uses it for the ground-impact beat (wants floor). So a
  per-scene surface can't serve both — hence the per-beat `onSurface` opt-in.

## File structure

| File | Change |
|---|---|
| `src/game3d/space.ts` | add `SurfaceSpot` + pure `surfacePlacement()` helper (unit-tested) |
| `src/game3d/space.test.ts` (or existing test) | tests for `surfacePlacement` |
| `src/game3d/environments.ts` | rename `bed`→`surface`; add `auto` flag; add ward + street surfaces |
| `src/game3d/Stage3D.ts` | use `surfacePlacement`; thread `onSurface`; face-toward-patient blocking |
| `src/lib/walkthrough.ts` | add optional `onSurface?: boolean` to `WalkthroughBeat` |
| `src/ui/modals/Walkthrough3DStage.tsx` | pass `onSurface` into the `Figure3D` |
| `src/lib/walkthrough-stemi.ts` / `-trauma.ts` | set `onSurface: true` on street-scene stretcher beats |

---

## Task 1: `surfacePlacement` pure helper + `SurfaceSpot` type

**Files:**
- Modify: `src/game3d/space.ts`
- Test: `src/game3d/space.test.ts`

- [ ] **Step 1: Write the failing test**

Add to `src/game3d/space.test.ts` (create the file if it doesn't exist, with the
imports shown):

```ts
import { describe, it, expect } from 'vitest';
import { surfacePlacement, type SurfaceSpot } from './space';

const surf = (auto: boolean): SurfaceSpot => ({ x: 0, z: -7.5, y: 1.0, yaw: Math.PI / 2, auto });

describe('surfacePlacement', () => {
  it('returns null when the scene has no surface', () => {
    expect(surfacePlacement(undefined, 'collapsed', true)).toBeNull();
  });
  it('returns null for a non-collapsed pose', () => {
    expect(surfacePlacement(surf(true), 'stand', true)).toBeNull();
  });
  it('auto surface snaps any collapsed patient', () => {
    expect(surfacePlacement(surf(true), 'collapsed', false)).toEqual({ x: 0, z: -7.5, y: 1.0, yaw: Math.PI / 2 });
  });
  it('non-auto surface needs the beat to opt in', () => {
    expect(surfacePlacement(surf(false), 'collapsed', false)).toBeNull();
    expect(surfacePlacement(surf(false), 'collapsed', true)).toEqual({ x: 0, z: -7.5, y: 1.0, yaw: Math.PI / 2 });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/game3d/space.test.ts`
Expected: FAIL — `surfacePlacement` is not exported.

- [ ] **Step 3: Implement in `space.ts`**

Add to `src/game3d/space.ts` (it already imports/exports camera + world helpers;
add the `BeatPose` import at the top if not present):

```ts
import type { BeatPose } from '../lib/walkthrough';

/** A clinical surface a collapsed patient lies on (world metres + facing).
 *  `auto`: indoor clinical scenes (resus/cath/CT/ward) snap any collapsed
 *  patient; ambiguous outdoor scenes set `auto: false` and require the beat to
 *  opt in via `onSurface`. */
export interface SurfaceSpot {
  x: number;
  z: number;
  y: number;
  yaw: number;
  auto: boolean;
}

/** Where (if anywhere) a figure lies on the scene surface this beat. Returns
 *  null to keep the figure at its authored floor mark. */
export function surfacePlacement(
  surface: SurfaceSpot | undefined,
  pose: BeatPose,
  onSurface: boolean,
): { x: number; z: number; y: number; yaw: number } | null {
  if (!surface || pose !== 'collapsed') return null;
  if (!surface.auto && !onSurface) return null;
  return { x: surface.x, z: surface.z, y: surface.y, yaw: surface.yaw };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/game3d/space.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/game3d/space.ts src/game3d/space.test.ts
git commit -m "3d(surface): surfacePlacement helper + SurfaceSpot type"
```

---

## Task 2: Rename `bed`→`surface` in environments; add `auto`, ward, street

**Files:**
- Modify: `src/game3d/environments.ts`

- [ ] **Step 1: Replace the `BedSpot` interface with `SurfaceSpot`**

In `src/game3d/environments.ts`, find the `BedSpot` interface and the
`bed?: BedSpot` field on `Environment3D`. Remove the local `BedSpot` interface,
import the shared type, and rename the field:

```ts
import { CAMERA, /* …existing… */ type SurfaceSpot } from './space';
```

Change the `Environment3D` field:

```ts
  surface?: SurfaceSpot;
```

(Delete the old `bed?: BedSpot;` field and the `BedSpot` interface declaration.)

- [ ] **Step 2: Convert the three existing beds to `surface` with `auto: true`**

Replace each existing `bed:` line:

```ts
    surface: { x: 0, z: -7.5, y: 0.85, yaw: Math.PI / 2, auto: true }, // resus trolley
```
```ts
    surface: { x: 0, z: -7.5, y: 1.02, yaw: Math.PI / 2, auto: true }, // cath table
```
```ts
    surface: { x: 0, z: -7.4, y: 1.1, yaw: 0, auto: true }, // CT/MRI table
```

- [ ] **Step 3: Add a ward/CCU bed surface**

In `buildWard()`, before the `return { group: g, lighting: { … } }`, ensure a bed
mesh exists at the head of the room and register its surface. If `buildWard`
already adds a bed prop, reuse its coordinates; otherwise add one using the
existing `bed(...)` prop helper (the trolley/bed builder at environments.ts:194)
and register:

```ts
    surface: { x: 0, z: -7.4, y: 0.6, yaw: 0, auto: true }, // ward / CCU bed
```

(If `buildWard` has no bed mesh, add `g.add(bed(0, 0.0, -7.4, 0));` — match the
existing `bed()` helper signature in this file — so the patient lies on a visible
bed, then register the surface at the mattress height that helper produces.)

- [ ] **Step 4: Add a street stretcher surface with `auto: false`**

In `buildStreet()`, register a stretcher surface that only applies when a beat
opts in (so a ground-collapse beat in the same scene stays on the floor):

```ts
    surface: { x: 0, z: -7.0, y: 0.8, yaw: Math.PI / 2, auto: false }, // SCDF stretcher (opt-in)
```

If `buildStreet` has no stretcher mesh near `(0, -7.0)`, add one with the `bed()`
helper so the opted-in patient has something to lie on:
`g.add(bed(0, 0.0, -7.0, Math.PI / 2));`

- [ ] **Step 5: Type-check**

Run: `pnpm tsc --noEmit`
Expected: PASS (no remaining `bed` / `BedSpot` references — see Task 3 for the
Stage3D consumer; if tsc flags `Stage3D.ts`, proceed to Task 3 which updates it).

If tsc only fails inside `Stage3D.ts` referencing `env.bed`, that's expected and
fixed in Task 3 — you may commit this task together with Task 3. Otherwise fix any
stray `bed` references in `environments.ts` now.

- [ ] **Step 6: Commit**

```bash
git add src/game3d/environments.ts
git commit -m "3d(surface): bed->surface with auto flag; add ward + street stretcher"
```

---

## Task 3: Thread `onSurface` and use `surfacePlacement` in Stage3D

**Files:**
- Modify: `src/lib/walkthrough.ts`
- Modify: `src/ui/modals/Walkthrough3DStage.tsx`
- Modify: `src/game3d/Stage3D.ts`

- [ ] **Step 1: Add `onSurface` to the beat type**

In `src/lib/walkthrough.ts`, find the `WalkthroughBeat` interface and add an
optional field (place it near `pose`):

```ts
  /** Lay a collapsed patient on the scene's surface even when the scene's
   *  surface is opt-in (outdoor stretcher). Ignored for `auto` surfaces. */
  onSurface?: boolean;
```

- [ ] **Step 2: Add `onSurface` to the 3D `Figure3D` and pass it through**

In `src/game3d/Stage3D.ts`, add to the `Figure3D` interface:

```ts
  onSurface: boolean;
```

In `src/ui/modals/Walkthrough3DStage.tsx`, where the figure object is built
(the line with `pose: fig.beat?.pose ?? 'stand'`), add:

```ts
      onSurface: fig.beat?.onSurface ?? false,
```

- [ ] **Step 3: Use `surfacePlacement` in `Stage3D.setFrame`**

In `src/game3d/Stage3D.ts`, update the import:

```ts
import { CAMERA, worldX, worldZ, yawFor, surfacePlacement } from './space';
```

Replace the existing bed-snap block in `setFrame`:

```ts
    const bed = this.env?.bed;
    for (const f of frame.figures) {
      seen.add(f.id);
      const onBed = !!bed && f.pose === 'collapsed';
      const gx = onBed ? bed!.x : worldX(f.x);
      const gz = onBed ? bed!.z : worldZ(f.y);
      const yaw = onBed ? bed!.yaw : yawFor(f.facing);
```

with:

```ts
    const surface = this.env?.surface;
    for (const f of frame.figures) {
      seen.add(f.id);
      const place = surfacePlacement(surface, f.pose, f.onSurface);
      const gx = place ? place.x : worldX(f.x);
      const gz = place ? place.z : worldZ(f.y);
      const yaw = place ? place.yaw : yawFor(f.facing);
```

Then update the two later references in the same loop that used `onBed`/`bed`:

```ts
        if (!sceneChanged && !place) {
          figure.root.position.x += f.x < 240 ? -4 : 4;
        }
```
```ts
        surfaceY: place ? place.y : 0,
```

- [ ] **Step 4: Type-check + full tests**

Run: `pnpm tsc --noEmit && pnpm vitest run`
Expected: PASS — no `env.bed` references remain; all tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/walkthrough.ts src/ui/modals/Walkthrough3DStage.tsx src/game3d/Stage3D.ts src/game3d/environments.ts
git commit -m "3d(surface): thread onSurface; Stage3D uses surfacePlacement"
```

---

## Task 4: Opt the outdoor stretcher beats into the surface

**Files:**
- Modify: `src/lib/walkthrough-stemi.ts`
- Modify: `src/lib/walkthrough-trauma.ts`

- [ ] **Step 1: Mark STEMI street stretcher beats**

In `src/lib/walkthrough-stemi.ts`, find the `scene: 'street'` chapters whose
`patient` beat says "On the stretcher" (the "Ambulance on scene" beat at ~line
369 and the "secondary transfer to SGH" stretcher beat at ~line 789). Add
`onSurface: true` to each such patient beat object, e.g.:

```ts
        { at: 0, actorId: 'patient', action: 'On the stretcher — pale, post-arrest, responding to voice.', pos: { x: 170, y: 244 }, pose: 'collapsed', expression: 'pained', onSurface: true },
```

- [ ] **Step 2: Mark trauma street stretcher beats (loaded, not impact)**

In `src/lib/walkthrough-trauma.ts`, find `scene: 'street'` patient beats. Add
`onSurface: true` ONLY to beats where the casualty is loaded onto the
stretcher/ambulance (text mentions stretcher / scoop / loaded), NOT the initial
on-the-road impact beat. If every street beat is a ground casualty, make no
change here.

- [ ] **Step 3: Type-check + tests**

Run: `pnpm tsc --noEmit && pnpm vitest run`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/lib/walkthrough-stemi.ts src/lib/walkthrough-trauma.ts
git commit -m "3d(surface): opt street stretcher beats onto the surface"
```

---

## Task 5: Face clinicians toward the patient (light blocking)

**Files:**
- Modify: `src/game3d/Stage3D.ts`

- [ ] **Step 1: Aim non-lead figures at the active surface/lead**

In `Stage3D.setFrame`, after computing each figure's `yaw`, override the yaw for
non-patient figures in a scene that has an active surface so they face the
casualty. Add, right after `entry.yawTarget = yaw;`:

```ts
      // Blocking: in a scene with a patient on a surface, clinicians turn to
      // face the casualty rather than the camera, so the group reads as a team
      // working one patient. The patient (on the surface) keeps the surface yaw.
      if (surface && f.pose !== 'collapsed') {
        const dx = (surface.x) - (place ? place.x : worldX(f.x));
        const dz = (surface.z) - (place ? place.z : worldZ(f.y));
        if (dx * dx + dz * dz > 0.04) entry.yawTarget = Math.atan2(dx, dz);
      }
```

- [ ] **Step 2: Type-check + visual check**

Run: `pnpm tsc --noEmit` → PASS.
Reload the preview, open STEMI 3D → cath lab / resus, screenshot: the patient
lies on the trolley and the clinicians face inward toward them, not the camera.

- [ ] **Step 3: Commit**

```bash
git add src/game3d/Stage3D.ts
git commit -m "3d(blocking): clinicians face the patient on the surface"
```

---

## Task 6: Verify across walkthroughs + ship

**Files:**
- Modify (record): `docs/visual-research/RESULTS.md`

- [ ] **Step 1: Full verify**

Run: `pnpm verify`
Expected: tests + tsc + build all PASS.

- [ ] **Step 2: Screenshot the surface fix in every walkthrough**

With the dev server running, for each walkthrough capture a clinical "on the
table/bed" beat: STEMI (cath lab, CT/MRI, CCU/ward), stroke (CT), sepsis (CT),
trauma (resus/ICU bed) AND the trauma street impact (must stay on the GROUND).
Confirm via `preview_screenshot`: patient lies flat ON the surface indoors;
opted-in stretcher patients on the stretcher; trauma road casualty still on the
floor; clinicians facing inward; no console errors.

- [ ] **Step 3: Record + ship**

Append a dated entry to `docs/visual-research/RESULTS.md` summarising the per-beat
surface model + blocking, then:

```bash
git add docs/visual-research/RESULTS.md
git commit -m "3d(surface): per-beat surface + blocking verified; log results"
git push
```

Confirm deploy: `gh run list --branch claude/healthcare-pathway-game-X7oRQ --limit 1`
Expected: latest run `completed  success`.

---

## Self-review checklist (completed at plan-write time)

- Spec workstream 5 covered: per-beat supine surface (Tasks 1–4), directed
  blocking (Task 5), verification incl. the ground-collapse counter-case (Task 6).
- No placeholders: every code step shows real code; the one conditional ("if
  buildWard has no bed mesh…") gives the exact fallback line to add.
- Type consistency: `SurfaceSpot`, `surfacePlacement`, `onSurface`, and the
  `place`/`surface` locals match across `space.ts`, `environments.ts`,
  `Stage3D.ts`, `walkthrough.ts`, and `Walkthrough3DStage.tsx`. `surfaceY` matches
  the existing `ActorFigure.setState` field used by Plan 1's lift.
