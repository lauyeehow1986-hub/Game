---
name: spriteforge
description: Generate stylised SVG character sprites for the SG Pathway visual walkthrough. Use when the user asks to add a new actor to a walkthrough, regenerate sprites, change the sprite style or palette, or audit which actors map to which accessory. Inspired by marcelontime/spriteforge but adapted to this project's no-asset-bundle constraint — every sprite is pure SVG, deterministic from the actor id, committed alongside the actor it represents.
---

# SpriteForge — SG Pathway walkthrough sprite generator

A Claude Skill that wraps the project's deterministic SVG sprite generator
(`src/lib/sprite-generator.tsx`). When invoked, it:

1. Reads the WalkthroughActor spec (`id`, `role`, `team`, optional `swatch`).
2. Calls `deriveFeatures()` to project the spec onto a `SpriteFeatures` shape
   (skin tone, hair, hair style, uniform colour, accessory kind).
3. Renders the `ActorSprite` component to verify the result.
4. Reports any unresolved accessory (falls back to `casual`) so the developer
   can teach the mapping a new role keyword.

## When to use this skill

- The user says "add a new actor to the walkthrough" or names a new role.
- The user asks "what would the sprite for X look like" or "audit the sprites".
- The user requests a palette change ("Singapore skin tones don't include
  enough variation"), a new accessory ("add a stethoscope to the AHP polo"),
  or a new uniform style.
- A test failure in `src/lib/sprite-generator.test.tsx` indicates a regression
  in the accessory map.

## Constraints honoured

- **No image assets**. Every sprite is inline SVG primitives; the bundle stays
  asset-free and the PWA works offline without binary downloads.
- **Deterministic**. Same actor id → same sprite, always. No PRNG drift, no
  build-time generation. This also means the diff for a new sprite is small
  and reviewable.
- **Singapore-aware**. The skin-tone palette spans four bands; uniform colours
  use the existing actor swatches (Singapore healthcare practice).
- **i18n-safe**. Sprites carry no embedded text other than the `Pb` marker on
  the lead apron (a universal radiology label); role names render as separate
  `<text>` elements that the i18n layer translates.

## Workflow for adding a new actor

1. Add the actor to the relevant walkthrough file (e.g.
   `src/lib/walkthrough-stemi.ts`). Required fields: `id`, `role`, `team`,
   `bio`. Optional: `swatch` (defaults to neutral slate if omitted).
2. Confirm the auto-mapped accessory:
   - Run `pnpm test --run src/lib/sprite-generator.test.tsx`.
   - The walkthrough.test.ts content tests will already ensure the new actor
     is referenced by at least one beat.
3. If the auto-mapped accessory is wrong, edit `accessoryFor()` in
   `src/lib/sprite-generator.tsx` to teach it the new role keyword. Add a row
   to the `cases` table in `src/lib/sprite-generator.test.tsx` so the
   mapping is locked.
4. The Stage component (`src/ui/modals/WalkthroughModal.tsx`) auto-renders
   the new sprite — no rendering changes needed.

## Sprite anatomy (HD pixel art, v9.7+)

Each sprite is composed entirely of **integer-aligned `<rect>` primitives** on
a 48×64 viewBox. No curves — `image-rendering: pixelated` on the parent SVG
keeps the look crisp at any display scale. Parts:

- **Body**: stepped-shoulder torso in the uniform colour, integer-grid limbs.
- **Head**: 16×16 skin-tone rectangle with stepped corner pixels (squared
  with one-pixel notches), eye dots and a one-pixel mouth.
- **Hair**: one of three styles (short / medium / tied-back), colour from a
  four-band palette. Tied-back style shows a bun on the back of the head
  (centred when facing away, side-offset when facing camera).
- **Arms**: 5px wide; in profile (E/W) only the front arm is drawn.
- **Accessory**: role-specific overlay — see table below.

## Direction + animation params

`<ActorSprite>` accepts:

| Prop | Type | Default | Effect |
| - | - | - | - |
| `direction` | `'N' \| 'S' \| 'E' \| 'W'` | `'S'` | S = facing camera, N = back-facing (face suppressed), E/W = profile (horizontal mirror) |
| `interactionFrame` | `0..5` or `undefined` | `undefined` | 6-frame universal interaction loop (arm raise → peak → lower → rest). `undefined` = arms at rest. |
| `walkFrame` | `0..3` or `undefined` | `undefined` | 4-frame walk cycle (leg-stride alternation). `undefined` = legs at rest. |
| `size` | number | `64` | viewBox unit size |

The Walkthrough Stage ticks at 6 fps (150 ms interval). Active actors play
the interaction loop; beats marked `walking: true` also play the walk cycle.

| Accessory kind | Used by | Visual cue |
| - | - | - |
| `gown` | Patient (by id) | Pale gown over the body, tie ribbon |
| `casual` | Bystander, family, attendant | T-shirt collar line |
| `high-vis` | SCDF paramedic, myResponder CFR | Yellow vest with reflective stripes |
| `cap` | Ambulance driver | Black forage cap |
| `stethoscope` | ED doctor, registrar, MO | Black tubing over the shoulders |
| `scrubs` | Ward / ED nurse, HCA | Teal V-neck line |
| `lead-apron` | Cath / imaging radiographer | Grey trapezoid with `Pb` marker |
| `sterile-gown` | Interventional cardiologist, CT surgeon | Long blue gown + mask line |
| `headphones` | Imaging nurse | Over-ear arc |
| `whitecoat` | Consultant cardiologist, clinic cardiologist | White coat + lapel V |
| `chef-hat` | Hospital cook | Tall toque |
| `mop` | Cath / ward cleaner | Apron + mop handle in hand |
| `linen-cart` | Laundry coordinator | Apron + side cart with wheels |
| `clipboard` | Billing clerk, case manager, registration clerk | Clipboard tucked under the arm |
| `ahp-polo` | Physio, OT, dietitian, clinical pharmacist, rehab physio | Polo collar + name tag |

## Tests

`src/lib/sprite-generator.test.tsx` (33 tests):

- Feature derivation determinism (same id → same features).
- Skin / hair palette membership (no rogue colours).
- Uniform colour comes from swatch with a neutral fallback.
- Every role in the STEMI catalogue maps to its expected accessory.
- Every actor in `stemiWalkthrough.actors` renders to a valid SVG `<g>`.
- The same actor renders identical markup twice in a row.

## Verifying a single actor

```sh
pnpm test --run src/lib/sprite-generator.test.tsx
```

Or in a Vitest watch session, edit the `cases` table and the matching test
will name the actor whose mapping is in doubt.

## Future extensions (planned, not yet shipped)

- Phaser canvas renderer (v9.6 / v9.7): same sprite data, animated via
  Phaser. The accessory-derivation rules stay; only the renderer changes.
- Mid-fi raster fallback for users who want photographic feel: opt-in per
  walkthrough, hosted in a lazy chunk so the asset-free default still ships.
- Locale-aware accessories where it matters (e.g. tudung for some staff
  uniforms in Malay / Indonesian Muslim healthcare contexts — gated on
  native review).
