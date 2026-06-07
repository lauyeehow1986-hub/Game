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

/** Hair colour palette — short list, all plausible in Singapore. Last two
 *  entries are gray / white-streaked, reserved for elder characters so the
 *  cast reads visibly distinct across ages. */
export const HAIR_COLOURS = ['#1a1410', '#2c1f17', '#3d2e22', '#5c4a3a', '#9aa0a6', '#e5e7eb'] as const;

/** Age band drives gray hair, glasses probability, wrinkle hints, posture. */
export type AgeBand = 'young' | 'adult' | 'elder';

/** Parse an explicit age from a role string like "Mdm Lim, 72" or "Son, 28". */
function explicitAgeFromRole(role: string): number | null {
  const m = /,\s*(\d{1,3})\s*$/.exec(role);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) ? n : null;
}

/** Bucket an explicit age into a band. */
function bandFromAge(age: number): AgeBand {
  if (age >= 65) return 'elder';
  if (age >= 35) return 'adult';
  return 'young';
}

/** When no explicit age is given, infer a band from role keywords + a tiny
 *  hash jitter so peers look distinct rather than identical-aged. */
function inferAgeBand(role: string, h: number): AgeBand {
  const r = role.toLowerCase();
  if (r.includes('consultant') || r.includes('senior')) {
    return ((h >> 8) & 7) < 6 ? 'adult' : 'elder';
  }
  if (r.includes('registrar') || r.includes('case manager') || r.includes('coordinator')) return 'adult';
  if (r.includes('mo') || r.includes('hca') || r.includes('officer')) {
    return ((h >> 8) & 7) < 6 ? 'young' : 'adult';
  }
  return ((h >> 8) & 3) === 0 ? 'young' : 'adult';
}

/** Accessory kind drives the role-specific overlay. */
export type AccessoryKind =
  | 'gown' | 'casual' | 'high-vis' | 'cap'
  | 'stethoscope' | 'scrubs' | 'lead-apron' | 'sterile-gown'
  | 'headphones' | 'whitecoat' | 'chef-hat'
  | 'mop' | 'linen-cart' | 'clipboard' | 'ahp-polo';

/** Cardinal facing direction. */
export type Direction = 'N' | 'S' | 'E' | 'W';

/**
 * Body pose. `stand`/`walk` are the upright defaults; the rest stage the
 * figure for the cinematic — `kneel`/`cpr` for the bystander resuscitating,
 * `collapsed` for the patient on the floor, `sit` for seated counselling /
 * ward-chair beats, `point` for a directing gesture.
 */
export type Pose = 'stand' | 'walk' | 'kneel' | 'sit' | 'cpr' | 'collapsed' | 'point';

/**
 * Facial expression. Drives eyes / brows / mouth on front-facing sprites only
 * (back-facing N still suppresses the face entirely).
 */
export type Expression =
  | 'neutral'
  | 'alarmed'
  | 'distressed'
  | 'pained'
  | 'focused'
  | 'relieved'
  | 'unconscious';

/** Arm configuration, derived from pose. */
type ArmPose = 'rest' | 'point' | 'cpr' | 'reach';

/** Number of frames in the universal interaction loop. */
export const INTERACTION_FRAMES = 6;
/** Number of frames in the walk cycle. */
export const WALK_FRAMES = 4;

/** Maps a pose to an outer transform applied in the 48×64 local grid. */
export function poseTransform(pose: Pose): string {
  switch (pose) {
    case 'kneel': return 'translate(0,16) scale(0.98,0.70)';
    case 'sit': return 'translate(0,16) scale(1,0.68)';
    case 'cpr': return 'translate(2,16) rotate(20 24 58) scale(0.98,0.78)';
    case 'collapsed': return 'rotate(-74 24 60) translate(2,2)';
    case 'stand':
    case 'walk':
    case 'point':
    default: return '';
  }
}

/** Maps a pose to the arm configuration it implies. */
function armPoseFor(pose: Pose): ArmPose {
  switch (pose) {
    case 'point': return 'point';
    case 'cpr': return 'cpr';
    default: return 'rest';
  }
}

export interface SpriteFeatures {
  skin: string;
  skinShade: string;
  hair: string;
  hairStyle: 0 | 1 | 2;
  uniform: string;
  /** A darker shade of the uniform colour, for volume shading. */
  uniformShade: string;
  accessory: AccessoryKind;
  /** Apparent age, derived from the role text ("Mdm Lim, 72") or hash. */
  ageBand: AgeBand;
  /** True when the actor wears glasses (rendered as a small frame overlay). */
  hasGlasses: boolean;
  /** Beard kind — 'none' (default), 'light' (stubble), 'full'. */
  beard: 'none' | 'light' | 'full';
}

/** Darken a #rrggbb colour by a 0..1 factor. */
export function darken(hex: string, factor = 0.7): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const r = Math.round(((n >> 16) & 0xff) * factor);
  const g = Math.round(((n >> 8) & 0xff) * factor);
  const b = Math.round((n & 0xff) * factor);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
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
  const uniform = actor.swatch ?? '#475569';

  // Age: parsed from the role text when explicit ("Mdm Lim, 72"); otherwise
  // inferred from role keywords + a small hash jitter so the cast spans ages.
  const explicit = explicitAgeFromRole(actor.role);
  const ageBand: AgeBand = explicit != null ? bandFromAge(explicit) : inferAgeBand(actor.role, h);

  // Elder: pick from the gray end of the palette (last 2 entries) with high
  // probability so silver hair tracks age. Younger bands pick from the dark
  // entries (first 4) so the look stays Singapore-realistic.
  const hairIdx =
    ageBand === 'elder'
      ? ((h >> 2) & 3) < 3
        ? 4 + ((h >> 5) & 1) // 4 or 5 (gray / white)
        : (h >> 2) & 3       // small chance of dyed dark
      : (h >> 2) & 3;        // young / adult: dark only
  const hair = HAIR_COLOURS[hairIdx];

  // Glasses: more common in elder + clinical-staff roles. Cardiologists,
  // neurologists, radiologists, consultants and Mdm Lim are common cases.
  const r = actor.role.toLowerCase();
  const role_hint_glasses =
    r.includes('consultant') || r.includes('cardiolog') || r.includes('neurolog') ||
    r.includes('radiolog') || r.includes('clerk') || r.includes('manager');
  const hasGlasses = ageBand === 'elder'
    ? ((h >> 6) & 3) > 0           // 75% of elders
    : role_hint_glasses
      ? ((h >> 6) & 3) > 1         // 50% of glasses-prone roles
      : ((h >> 6) & 7) === 0;      // ~12% otherwise

  // Beard — male-presenting cue inferred from role text, then hash gates the
  // intensity. We never beard hair-style 2 (tied-back / bun) to avoid mixed
  // signals; female-coded explicit roles (Mdm, Mrs) suppress beards entirely.
  const hairStyle = ((h >> 4) & 3) as 0 | 1 | 2;
  const female_coded = /^(mdm|mrs|ms\.?|miss|daughter|wife)\b/i.test(actor.role);
  const beard_roll = (h >> 9) & 7;
  const beard: 'none' | 'light' | 'full' =
    female_coded || hairStyle === 2
      ? 'none'
      : beard_roll < 1
        ? 'full'
        : beard_roll < 3
          ? 'light'
          : 'none';

  return {
    skin,
    skinShade: SKIN_SHADE[skin] ?? '#5a371f',
    hair,
    hairStyle,
    uniform,
    uniformShade: darken(uniform, 0.72),
    accessory: accessoryFor(actor),
    ageBand,
    hasGlasses,
    beard,
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
  /** Body pose. Defaults to 'stand'. */
  pose?: Pose;
  /** Facial expression. Defaults to 'neutral'. */
  expression?: Expression;
}

export function ActorSprite({
  actor,
  size = 64,
  direction = 'S',
  interactionFrame,
  walkFrame,
  pose = 'stand',
  expression = 'neutral',
}: SpriteProps): JSX.Element {
  const f = deriveFeatures(actor);
  const scale = size / 64;
  // E/W use the S sprite mirrored horizontally; N hides facial features.
  const flipX = direction === 'W';
  const isBack = direction === 'N';
  const armDy = interactionFrame == null ? 0 : armRaiseFor(interactionFrame);
  const stride = walkFrame == null ? { leftDx: 0, rightDx: 0 } : strideFor(walkFrame);
  const armPose = armPoseFor(pose);
  const pt = poseTransform(pose);
  return (
    <g transform={`scale(${scale}) translate(-24,-32)${flipX ? ' translate(48,0) scale(-1,1)' : ''}`}>
      <g transform={pt || undefined}>
        <SpriteBody features={f} stride={stride} pose={pose} />
        <SpriteAccessory features={f} armDy={armDy} />
        <SpriteHead features={f} isBack={isBack} expression={expression} />
        <SpriteHair features={f} isBack={isBack} />
        <SpriteArms
          features={f}
          armDy={armDy}
          isProfile={direction === 'E' || direction === 'W'}
          armPose={armPose}
        />
      </g>
    </g>
  );
}

/* All sprite parts work on an integer pixel grid (48×64). No curves —
 * every shape is a <rect> with integer coordinates, giving the HD-pixel-art
 * look that renders cleanly under `image-rendering: pixelated`. */

function SpriteBody({
  features,
  stride,
  pose = 'stand',
}: {
  features: SpriteFeatures;
  stride: { leftDx: number; rightDx: number };
  pose?: Pose;
}): JSX.Element {
  const { uniform, skin, uniformShade } = features;
  // Seated / kneeling poses fold the lower legs forward instead of straight
  // down, so the figure doesn't read as standing-but-shrunk.
  const folded = pose === 'sit' || pose === 'kneel' || pose === 'cpr';
  return (
    <g>
      {/* Neck */}
      <rect x={21} y={20} width={6} height={6} fill={skin} />
      {/* Torso (rounded shoulders via stepped corners) */}
      <rect x={13} y={26} width={22} height={28} fill={uniform} />
      <rect x={14} y={25} width={20} height={1} fill={uniform} />
      <rect x={15} y={24} width={18} height={1} fill={uniform} />
      {/* Torso side-shading for a touch of volume */}
      <rect x={13} y={26} width={3} height={28} fill={uniformShade} opacity={0.55} />
      {folded ? (
        <>
          {/* Thighs forward + shins down (seated/kneeling silhouette) */}
          <rect x={15} y={52} width={20} height={6} fill={uniform} />
          <rect x={15} y={56} width={6} height={9} fill={uniformShade} />
          <rect x={29} y={56} width={6} height={9} fill={uniformShade} />
          <rect x={14} y={64} width={8} height={1} fill="#1a1a1a" />
          <rect x={28} y={64} width={8} height={1} fill="#1a1a1a" />
        </>
      ) : (
        <>
          {/* Legs */}
          <rect x={15 + stride.leftDx} y={54} width={6} height={10} fill={uniform} />
          <rect x={27 + stride.rightDx} y={54} width={6} height={10} fill={uniform} />
          {/* Feet */}
          <rect x={14 + stride.leftDx} y={63} width={8} height={1} fill="#1a1a1a" />
          <rect x={26 + stride.rightDx} y={63} width={8} height={1} fill="#1a1a1a" />
        </>
      )}
    </g>
  );
}

function SpriteHead({
  features,
  isBack,
  expression = 'neutral',
}: {
  features: SpriteFeatures;
  isBack: boolean;
  expression?: Expression;
}): JSX.Element {
  const { skin, skinShade, ageBand, hasGlasses, beard } = features;
  return (
    <g>
      {/* Head — square with corner pixels removed for stepped roundness */}
      <rect x={16} y={5} width={16} height={16} fill={skin} />
      <rect x={16} y={5} width={1} height={1} fill="transparent" />
      <rect x={31} y={5} width={1} height={1} fill="transparent" />
      <rect x={16} y={20} width={1} height={1} fill={skinShade} />
      <rect x={31} y={20} width={1} height={1} fill={skinShade} />
      {/* Cheek shading for a hint of volume */}
      <rect x={16} y={11} width={1} height={7} fill={skinShade} opacity={0.6} />
      {/* Chin shading */}
      <rect x={18} y={20} width={12} height={1} fill={skinShade} />
      {/* Face features on front-facing only */}
      {!isBack && (
        <>
          <FaceFeatures expression={expression} />
          {/* Elder wrinkles — short cheek-line + temple line beside the eyes */}
          {ageBand === 'elder' && (
            <g opacity={0.55}>
              <rect x={17} y={15} width={2} height={1} fill={skinShade} />
              <rect x={29} y={15} width={2} height={1} fill={skinShade} />
              <rect x={18} y={17} width={1} height={1} fill={skinShade} />
              <rect x={29} y={17} width={1} height={1} fill={skinShade} />
            </g>
          )}
          {/* Glasses overlay — rounded twin frames bridging at the nose */}
          {hasGlasses && (
            <g>
              <rect x={18} y={11} width={5} height={5} rx={1.5} fill="none" stroke="#1a1410" strokeWidth={0.9} />
              <rect x={25} y={11} width={5} height={5} rx={1.5} fill="none" stroke="#1a1410" strokeWidth={0.9} />
              <line x1={23} y1={13} x2={25} y2={13} stroke="#1a1410" strokeWidth={0.9} />
              {/* lens reflection sheen */}
              <line x1={19} y1={12} x2={21} y2={14} stroke="#fff" strokeWidth={0.5} opacity={0.7} />
              <line x1={26} y1={12} x2={28} y2={14} stroke="#fff" strokeWidth={0.5} opacity={0.7} />
              {/* temple arms (to the hair line) */}
              <line x1={18} y1={13.5} x2={16} y2={13} stroke="#1a1410" strokeWidth={0.7} />
              <line x1={30} y1={13.5} x2={32} y2={13} stroke="#1a1410" strokeWidth={0.7} />
            </g>
          )}
          {/* Beard — light stubble vs full beard around the jaw */}
          {beard !== 'none' && (
            <g>
              {beard === 'light' ? (
                <>
                  <rect x={18} y={19} width={12} height={2} fill={skinShade} opacity={0.55} />
                  <rect x={19} y={18} width={10} height={1} fill={skinShade} opacity={0.35} />
                </>
              ) : (
                <>
                  <rect x={17} y={17} width={14} height={4} fill="#2c1f17" opacity={0.85} />
                  <rect x={18} y={16} width={12} height={1} fill="#2c1f17" opacity={0.7} />
                  {/* moustache implied above the lip */}
                  <rect x={20} y={17} width={8} height={1} fill="#2c1f17" />
                </>
              )}
            </g>
          )}
        </>
      )}
    </g>
  );
}

/** Eyes / brows / mouth driven by expression (front-facing only). */
function FaceFeatures({ expression }: { expression: Expression }): JSX.Element {
  const EYE = '#1a1410';
  const MOUTH = '#7a4a2a';
  switch (expression) {
    case 'alarmed':
      return (
        <>
          {/* raised brows */}
          <rect x={19} y={10} width={3} height={1} fill={EYE} />
          <rect x={26} y={10} width={3} height={1} fill={EYE} />
          {/* wide eyes */}
          <rect x={19} y={12} width={3} height={3} fill={EYE} />
          <rect x={26} y={12} width={3} height={3} fill={EYE} />
          {/* open shouting mouth */}
          <rect x={22} y={17} width={4} height={3} fill="#5a2e1a" />
          <rect x={23} y={17} width={2} height={1} fill="#d98c6a" />
        </>
      );
    case 'distressed':
      return (
        <>
          {/* inner-up worried brows (slant up toward the nose) */}
          <line x1={19} y1={12} x2={22} y2={10} stroke={EYE} strokeWidth={1} />
          <line x1={29} y1={12} x2={26} y2={10} stroke={EYE} strokeWidth={1} />
          <rect x={20} y={13} width={2} height={2} fill={EYE} />
          <rect x={26} y={13} width={2} height={2} fill={EYE} />
          {/* frown */}
          <path d="M 22 19 Q 24 17 26 19" stroke={MOUTH} strokeWidth={1} fill="none" />
        </>
      );
    case 'pained':
      return (
        <>
          {/* furrowed brows (slant down toward the nose) */}
          <line x1={19} y1={10} x2={22} y2={12} stroke={EYE} strokeWidth={1} />
          <line x1={29} y1={10} x2={26} y2={12} stroke={EYE} strokeWidth={1} />
          {/* squeezed-shut eyes */}
          <rect x={20} y={14} width={3} height={1} fill={EYE} />
          <rect x={25} y={14} width={3} height={1} fill={EYE} />
          {/* gritted grimace */}
          <rect x={21} y={18} width={6} height={2} fill="#5a2e1a" />
          <line x1={24} y1={18} x2={24} y2={20} stroke="#d98c6a" strokeWidth={0.5} />
        </>
      );
    case 'focused':
      return (
        <>
          {/* level brows */}
          <rect x={19} y={11} width={3} height={1} fill={EYE} />
          <rect x={26} y={11} width={3} height={1} fill={EYE} />
          {/* narrowed eyes */}
          <rect x={20} y={13} width={3} height={1} fill={EYE} />
          <rect x={25} y={13} width={3} height={1} fill={EYE} />
          <rect x={22} y={18} width={4} height={1} fill={MOUTH} />
        </>
      );
    case 'relieved':
      return (
        <>
          {/* soft eyes */}
          <rect x={20} y={13} width={2} height={1} fill={EYE} />
          <rect x={26} y={13} width={2} height={1} fill={EYE} />
          {/* slight smile */}
          <path d="M 22 18 Q 24 20 26 18" stroke={MOUTH} strokeWidth={1} fill="none" />
        </>
      );
    case 'unconscious':
      return (
        <>
          {/* closed eyes */}
          <rect x={20} y={14} width={3} height={1} fill={EYE} />
          <rect x={25} y={14} width={3} height={1} fill={EYE} />
          {/* slack mouth */}
          <rect x={22} y={18} width={3} height={2} fill="#5a2e1a" />
        </>
      );
    case 'neutral':
    default:
      return (
        <>
          <rect x={20} y={13} width={2} height={2} fill={EYE} />
          <rect x={26} y={13} width={2} height={2} fill={EYE} />
          <rect x={22} y={18} width={4} height={1} fill={MOUTH} />
        </>
      );
  }
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
  armPose = 'rest',
}: {
  features: SpriteFeatures;
  armDy: number;
  isProfile: boolean;
  armPose?: ArmPose;
}): JSX.Element {
  const { uniform, skin } = features;

  // CPR: both arms locked straight, dropping vertically from the shoulders to
  // stacked hands in front of the chest. Combined with the forward lean in the
  // pose transform this reads as the iconic compression posture.
  if (armPose === 'cpr') {
    return (
      <g>
        <rect x={18} y={26} width={5} height={24} fill={uniform} />
        <rect x={25} y={26} width={5} height={24} fill={uniform} />
        {/* near-arm shading so the two arms read as separate */}
        <rect x={18} y={26} width={1.5} height={24} fill={features.uniformShade} opacity={0.6} />
        {/* stacked hands at the bottom */}
        <rect x={18} y={49} width={12} height={5} rx={1.5} fill={skin} />
      </g>
    );
  }

  // Point: right arm extended outward (directing / hailing gesture).
  if (armPose === 'point') {
    return (
      <g>
        <rect x={9} y={28 + armDy} width={5} height={16} fill={uniform} />
        <rect x={9} y={43 + armDy} width={5} height={3} fill={skin} />
        <rect x={34} y={26} width={16} height={5} fill={uniform} transform="rotate(-12 34 28)" />
        <rect x={48} y={23} width={4} height={4} fill={skin} transform="rotate(-12 48 25)" />
      </g>
    );
  }

  // Reach (seated / handing-over): both forearms angled forward.
  if (armPose === 'reach') {
    return (
      <g>
        <rect x={11} y={28} width={5} height={12} fill={uniform} transform="rotate(18 13 30)" />
        <rect x={32} y={28} width={5} height={12} fill={uniform} transform="rotate(-18 35 30)" />
        <rect x={14} y={38} width={4} height={3} fill={skin} />
        <rect x={30} y={38} width={4} height={3} fill={skin} />
      </g>
    );
  }

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
