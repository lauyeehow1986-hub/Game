/**
 * SpriteForge — high-definition pixel-art character sprites for the
 * walkthrough cinematic.
 *
 * v9.7 upgrade from v9.6 SVG flat illustration:
 *  - Integer-grid construction (all rectangles, no curves) so the result
 *    reads as crisp "HD pixel art" at any display scale via
 *    `image-rendering: pixelated` on the parent SVG.
 *  - 4-direction support (S default, N back, E/W profile via transform).
 *  - 6-frame universal interaction loop (arm raise → peak → lower → rest).
 *  - 4-frame walk cycle (leg-stride alternation).
 *  - Same deterministic feature derivation from FNV-1a id hash: callers
 *    don't have to pick palettes per actor.
 *  - Same SpriteForge SKILL contract; accessory rules unchanged.
 */

import type { JSX } from 'react';
import type { ActorTeam, WalkthroughActor } from './walkthrough';

/** FNV-1a 32-bit hash of a short ASCII string. */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Skin tone palette — four bands spanning the Singapore workforce. */
export const SKIN_TONES = ['#f5d6b8', '#e0b48a', '#b8895d', '#7e5235'] as const;
/** Slightly darker shade derived per skin tone for shading edges. */
const SKIN_SHADE: Record<string, string> = {
  '#f5d6b8': '#d9b88e',
  '#e0b48a': '#b88c5e',
  '#b8895d': '#8e6238',
  '#7e5235': '#5a371f',
};

/** Hair colour palette — short list, all plausible in Singapore. */
export const HAIR_COLOURS = ['#1a1410', '#2c1f17', '#3d2e22', '#5c4a3a'] as const;

/** Accessory kind drives the role-specific overlay. */
export type AccessoryKind =
  | 'gown' | 'casual' | 'high-vis' | 'cap'
  | 'stethoscope' | 'scrubs' | 'lead-apron' | 'sterile-gown'
  | 'headphones' | 'whitecoat' | 'chef-hat'
  | 'mop' | 'linen-cart' | 'clipboard' | 'ahp-polo';

/** Cardinal facing direction. */
export type Direction = 'N' | 'S' | 'E' | 'W';

/** Number of frames in the universal interaction loop. */
export const INTERACTION_FRAMES = 6;
/** Number of frames in the walk cycle. */
export const WALK_FRAMES = 4;

export interface SpriteFeatures {
  skin: string;
  skinShade: string;
  hair: string;
  hairStyle: 0 | 1 | 2;
  uniform: string;
  accessory: AccessoryKind;
}

/* ── feature derivation (pure) ───────────────────────────────────────── */

export function accessoryFor(actor: { id: string; role: string; team: ActorTeam }): AccessoryKind {
  const r = actor.role.toLowerCase();
  const id = actor.id;
  const t = actor.team;
  if (id === 'patient') return 'gown';
  if (r.includes('cook')) return 'chef-hat';
  if (r.includes('cleaner')) return 'mop';
  if (r.includes('laundry')) return 'linen-cart';
  if (r.includes('clerk') || r.includes('billing') || r.includes('case manager') || r.includes('discharge')) return 'clipboard';
  if (r.includes('attendant')) return 'casual';
  if (r.includes('driver')) return 'cap';
  if (r.includes('paramedic') || r.includes('cfr') || r.includes('responder')) return 'high-vis';
  if (r.includes('radiograph')) return 'lead-apron';
  if (r.includes('imaging') && r.includes('nurse')) return 'headphones';
  if (r.includes('(ahp)') || r.includes('physio') || r.includes('therapist') || r.includes('dietitian') || r.includes('pharmacist') || r.includes('rehab')) return 'ahp-polo';
  if (r.includes('consultant') || r.includes('clinic')) return 'whitecoat';
  if (r.includes('interventional') || r.includes('surgeon')) return 'sterile-gown';
  if (r.includes('hca')) return 'scrubs';
  if (r.includes('nurse')) return 'scrubs';
  if (r.includes('doctor') || r.includes('registrar') || r.includes('officer') || r.includes(' mo')) return 'stethoscope';
  if (t === 'bystander') return 'casual';
  if (t === 'patient') return 'casual';
  if (t === 'ed' || t === 'ward') return 'scrubs';
  if (t === 'cath') return 'sterile-gown';
  if (t === 'ambulance') return 'high-vis';
  if (t === 'support') return 'clipboard';
  return 'casual';
}

export function deriveFeatures(actor: WalkthroughActor): SpriteFeatures {
  const h = hash(actor.id);
  const skin = SKIN_TONES[h & 3];
  return {
    skin,
    skinShade: SKIN_SHADE[skin] ?? '#5a371f',
    hair: HAIR_COLOURS[(h >> 2) & 3],
    hairStyle: ((h >> 4) & 3) as 0 | 1 | 2,
    uniform: actor.swatch ?? '#475569',
    accessory: accessoryFor(actor),
  };
}

/* ── interaction / walk frame math (pure) ────────────────────────────── */

/**
 * Vertical offset of the active arm during the interaction loop.
 * Returns a negative number (px) — arms move up when raised.
 * 6-frame cycle: rest → raise → peak → lower → rest → pause.
 */
export function armRaiseFor(frame: number): number {
  const f = ((frame % INTERACTION_FRAMES) + INTERACTION_FRAMES) % INTERACTION_FRAMES;
  switch (f) {
    case 0: return 0;
    case 1: return -2;
    case 2: return -4;
    case 3: return -2;
    case 4: return 0;
    default: return 0;
  }
}

/**
 * Horizontal stride delta for the walk cycle (alternates left foot forward,
 * right foot forward). Returns px from neutral.
 */
export function strideFor(frame: number): { leftDx: number; rightDx: number } {
  const f = ((frame % WALK_FRAMES) + WALK_FRAMES) % WALK_FRAMES;
  switch (f) {
    case 0: return { leftDx: 0, rightDx: 0 };
    case 1: return { leftDx: 2, rightDx: -2 };
    case 2: return { leftDx: 0, rightDx: 0 };
    default: return { leftDx: -2, rightDx: 2 };
  }
}

/* ── JSX rendering ───────────────────────────────────────────────────── */

interface SpriteProps {
  actor: WalkthroughActor;
  /** Render size in viewBox units. Defaults to 64 (native). */
  size?: number;
  /** Facing direction. S = facing camera (default), N = away, E/W = profile. */
  direction?: Direction;
  /** 0..5; active when the actor is currently in a beat. Undefined = static rest. */
  interactionFrame?: number;
  /** 0..3; active only when the beat marks the actor as walking. */
  walkFrame?: number;
}

export function ActorSprite({
  actor,
  size = 64,
  direction = 'S',
  interactionFrame,
  walkFrame,
}: SpriteProps): JSX.Element {
  const f = deriveFeatures(actor);
  const scale = size / 64;
  // E/W use the S sprite mirrored horizontally; N hides facial features.
  const flipX = direction === 'W';
  const isBack = direction === 'N';
  const armDy = interactionFrame == null ? 0 : armRaiseFor(interactionFrame);
  const stride = walkFrame == null ? { leftDx: 0, rightDx: 0 } : strideFor(walkFrame);
  return (
    <g transform={`scale(${scale}) translate(-24,-32)${flipX ? ' translate(48,0) scale(-1,1)' : ''}`}>
      <SpriteBody features={f} stride={stride} />
      <SpriteAccessory features={f} armDy={armDy} />
      <SpriteHead features={f} isBack={isBack} />
      <SpriteHair features={f} isBack={isBack} />
      <SpriteArms features={f} armDy={armDy} isProfile={direction === 'E' || direction === 'W'} />
    </g>
  );
}

/* All sprite parts work on an integer pixel grid (48×64). No curves —
 * every shape is a <rect> with integer coordinates, giving the HD-pixel-art
 * look that renders cleanly under `image-rendering: pixelated`. */

function SpriteBody({
  features,
  stride,
}: {
  features: SpriteFeatures;
  stride: { leftDx: number; rightDx: number };
}): JSX.Element {
  const { uniform, skin } = features;
  return (
    <g>
      {/* Neck */}
      <rect x={21} y={20} width={6} height={6} fill={skin} />
      {/* Torso (rounded shoulders via stepped corners) */}
      <rect x={13} y={26} width={22} height={28} fill={uniform} />
      <rect x={14} y={25} width={20} height={1} fill={uniform} />
      <rect x={15} y={24} width={18} height={1} fill={uniform} />
      {/* Legs */}
      <rect x={15 + stride.leftDx} y={54} width={6} height={10} fill={uniform} />
      <rect x={27 + stride.rightDx} y={54} width={6} height={10} fill={uniform} />
      {/* Feet */}
      <rect x={14 + stride.leftDx} y={63} width={8} height={1} fill="#1a1a1a" />
      <rect x={26 + stride.rightDx} y={63} width={8} height={1} fill="#1a1a1a" />
    </g>
  );
}

function SpriteHead({
  features,
  isBack,
}: {
  features: SpriteFeatures;
  isBack: boolean;
}): JSX.Element {
  const { skin, skinShade } = features;
  return (
    <g>
      {/* Head — square with corner pixels removed for stepped roundness */}
      <rect x={16} y={5} width={16} height={16} fill={skin} />
      <rect x={16} y={5} width={1} height={1} fill="transparent" />
      <rect x={31} y={5} width={1} height={1} fill="transparent" />
      <rect x={16} y={20} width={1} height={1} fill={skinShade} />
      <rect x={31} y={20} width={1} height={1} fill={skinShade} />
      {/* Chin shading */}
      <rect x={18} y={20} width={12} height={1} fill={skinShade} />
      {/* Eyes + mouth on front-facing only */}
      {!isBack && (
        <>
          <rect x={20} y={13} width={2} height={2} fill="#1a1410" />
          <rect x={26} y={13} width={2} height={2} fill="#1a1410" />
          <rect x={22} y={18} width={4} height={1} fill="#7a4a2a" />
        </>
      )}
    </g>
  );
}

function SpriteHair({
  features,
  isBack,
}: {
  features: SpriteFeatures;
  isBack: boolean;
}): JSX.Element {
  const { hair, hairStyle } = features;
  // Common: cap of hair across the top of the head
  switch (hairStyle) {
    case 0:
      // Short cropped
      return (
        <g>
          <rect x={16} y={5} width={16} height={3} fill={hair} />
          <rect x={17} y={4} width={14} height={1} fill={hair} />
        </g>
      );
    case 1:
      // Medium — fringe over forehead, side covers
      return (
        <g>
          <rect x={16} y={5} width={16} height={5} fill={hair} />
          <rect x={17} y={4} width={14} height={1} fill={hair} />
          {/* Side flaps */}
          <rect x={16} y={10} width={2} height={5} fill={hair} />
          <rect x={30} y={10} width={2} height={5} fill={hair} />
        </g>
      );
    case 2:
      // Tied back — top cap + visible bun behind
      return (
        <g>
          <rect x={16} y={5} width={16} height={3} fill={hair} />
          <rect x={17} y={4} width={14} height={1} fill={hair} />
          {/* Bun behind (offset right unless back-facing, when it goes centred) */}
          {isBack ? (
            <rect x={20} y={6} width={8} height={4} fill={hair} />
          ) : (
            <rect x={32} y={11} width={4} height={5} fill={hair} />
          )}
        </g>
      );
  }
}

function SpriteArms({
  features,
  armDy,
  isProfile,
}: {
  features: SpriteFeatures;
  armDy: number;
  isProfile: boolean;
}): JSX.Element {
  const { uniform, skin } = features;
  // In profile (E/W) only one arm is visible at the front.
  if (isProfile) {
    return (
      <g>
        <rect x={28} y={28 + armDy} width={5} height={16} fill={uniform} />
        <rect x={28} y={43 + armDy} width={5} height={3} fill={skin} />
      </g>
    );
  }
  return (
    <g>
      {/* Left arm */}
      <rect x={9} y={28 + armDy} width={5} height={16} fill={uniform} />
      <rect x={9} y={43 + armDy} width={5} height={3} fill={skin} />
      {/* Right arm */}
      <rect x={34} y={28 + armDy} width={5} height={16} fill={uniform} />
      <rect x={34} y={43 + armDy} width={5} height={3} fill={skin} />
    </g>
  );
}

function SpriteAccessory({
  features,
  armDy,
}: {
  features: SpriteFeatures;
  armDy: number;
}): JSX.Element | null {
  switch (features.accessory) {
    case 'gown':
      return (
        <g>
          <rect x={12} y={26} width={24} height={28} fill="#e0e7f2" opacity={0.9} />
          {/* Tie ribbon */}
          <rect x={20} y={30} width={1} height={3} fill="#9aa6b8" />
          <rect x={27} y={30} width={1} height={3} fill="#9aa6b8" />
        </g>
      );
    case 'casual':
      // T-shirt neckline
      return (
        <g>
          <rect x={22} y={26} width={4} height={3} fill="#1a1410" />
        </g>
      );
    case 'high-vis':
      return (
        <g>
          <rect x={13} y={26} width={22} height={28} fill="#facc15" />
          {/* Reflective stripes */}
          <rect x={13} y={36} width={22} height={2} fill="#e8e8e8" />
          <rect x={13} y={44} width={22} height={2} fill="#e8e8e8" />
        </g>
      );
    case 'cap':
      return (
        <g>
          <rect x={16} y={4} width={16} height={3} fill="#1f2937" />
          <rect x={14} y={7} width={20} height={1} fill="#1f2937" />
        </g>
      );
    case 'stethoscope':
      return (
        <g>
          {/* Tubing as stepped rectangles */}
          <rect x={18} y={26} width={2} height={2} fill="#1a1410" />
          <rect x={18} y={28} width={1} height={4} fill="#1a1410" />
          <rect x={19} y={32} width={6} height={1} fill="#1a1410" />
          <rect x={25} y={28} width={1} height={4} fill="#1a1410" />
          <rect x={24} y={26} width={2} height={2} fill="#1a1410" />
          <rect x={22} y={34} width={4} height={2} fill="#1a1410" />
        </g>
      );
    case 'scrubs':
      // V-neck on the uniform
      return (
        <g>
          <rect x={22} y={26} width={2} height={3} fill="#0c4a6e" />
          <rect x={24} y={26} width={2} height={3} fill="#0c4a6e" />
        </g>
      );
    case 'lead-apron':
      return (
        <g>
          <rect x={13} y={28} width={22} height={26} fill="#475569" />
          {/* Pb marker */}
          <rect x={22} y={40} width={2} height={1} fill="#cbd5f5" />
          <rect x={24} y={40} width={2} height={1} fill="#cbd5f5" />
          <rect x={22} y={42} width={4} height={1} fill="#cbd5f5" />
        </g>
      );
    case 'sterile-gown':
      return (
        <g>
          <rect x={12} y={26} width={24} height={28} fill="#1e3a8a" />
          {/* Mask line */}
          <rect x={18} y={17} width={12} height={2} fill="#e0f2fe" />
        </g>
      );
    case 'headphones':
      return (
        <g>
          {/* Headband as stepped arc */}
          <rect x={14} y={5} width={20} height={2} fill="#1f2937" />
          <rect x={12} y={7} width={2} height={4} fill="#1f2937" />
          <rect x={34} y={7} width={2} height={4} fill="#1f2937" />
        </g>
      );
    case 'whitecoat':
      return (
        <g>
          <rect x={11} y={26} width={26} height={28} fill="#f8fafc" />
          {/* Lapel V */}
          <rect x={22} y={26} width={2} height={3} fill="#cbd5f5" />
          <rect x={24} y={26} width={2} height={3} fill="#cbd5f5" />
          {/* Pocket */}
          <rect x={14} y={42} width={6} height={6} fill="none" stroke="#cbd5f5" strokeWidth={0.4} />
          {/* Stethoscope cameo */}
          <rect x={19} y={32} width={1} height={4} fill="#1a1410" />
          <rect x={28} y={32} width={1} height={4} fill="#1a1410" />
          <rect x={20} y={36} width={8} height={1} fill="#1a1410" />
        </g>
      );
    case 'chef-hat':
      return (
        <g>
          {/* Toque body */}
          <rect x={14} y={1} width={20} height={5} fill="#f8fafc" />
          <rect x={15} y={0} width={18} height={1} fill="#f8fafc" />
          {/* Band */}
          <rect x={14} y={6} width={20} height={2} fill="#f8fafc" />
        </g>
      );
    case 'mop':
      return (
        <g>
          {/* Apron */}
          <rect x={14} y={28} width={20} height={26} fill="#0ea5e9" opacity={0.65} />
          {/* Mop handle */}
          <rect x={38} y={20 + armDy} width={2} height={32 - armDy} fill="#7a5a3a" />
          {/* Mop head */}
          <rect x={36} y={54} width={6} height={3} fill="#e7e5e4" />
          <rect x={37} y={57} width={4} height={2} fill="#cbd5f5" />
        </g>
      );
    case 'linen-cart':
      return (
        <g>
          <rect x={14} y={28} width={20} height={26} fill="#e7e5e4" />
          {/* Side cart */}
          <rect x={38} y={42} width={9} height={12} fill="#94a3b8" />
          <rect x={38} y={41} width={9} height={1} fill="#cbd5f5" />
          {/* Wheels */}
          <rect x={39} y={56} width={2} height={2} fill="#1a1410" />
          <rect x={44} y={56} width={2} height={2} fill="#1a1410" />
        </g>
      );
    case 'clipboard':
      return (
        <g>
          <rect x={36} y={34 + armDy} width={8} height={11} fill="#fafaf9" />
          <rect x={38} y={33 + armDy} width={4} height={2} fill="#94a3b8" />
          <rect x={37} y={38 + armDy} width={6} height={1} fill="#94a3b8" />
          <rect x={37} y={40 + armDy} width={6} height={1} fill="#94a3b8" />
          <rect x={37} y={42 + armDy} width={6} height={1} fill="#94a3b8" />
        </g>
      );
    case 'ahp-polo':
      return (
        <g>
          {/* Polo collar */}
          <rect x={22} y={26} width={2} height={3} fill="#0c4a6e" />
          <rect x={24} y={26} width={2} height={3} fill="#0c4a6e" />
          {/* Name tag */}
          <rect x={18} y={32} width={5} height={2} fill="#f8fafc" />
        </g>
      );
  }
}
