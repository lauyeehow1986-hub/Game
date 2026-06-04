/**
 * Sprite generator — pure SVG character sprites for walkthrough actors.
 *
 * Design goals:
 *  - Deterministic: same actor (id + team + swatch) → same sprite every time.
 *  - No asset bundle: everything is inline SVG primitives, no PNG/PDF/MP4.
 *  - Composable: features (skin tone, hair, accessory) are derived from a
 *    small FNV-1a hash of the actor id so the catalogue has visible diversity
 *    without anyone having to hand-author 30+ sprites.
 *  - Singapore-aware: skin tones span four bands so the resulting cast
 *    actually looks like the Singapore healthcare workforce.
 *
 * The .claude/skills/spriteforge SKILL.md wraps this file as a developer
 * tool: when adding a new walkthrough actor, Claude Code can verify the
 * sprite output without leaving the editor.
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

/** Hair colour palette — short list, all plausible in Singapore. */
export const HAIR_COLOURS = ['#1a1410', '#2c1f17', '#3d2e22', '#5c4a3a'] as const;

/** Accessory kind drives the role-specific overlay. */
export type AccessoryKind =
  | 'gown'           // patient
  | 'casual'         // bystander, family
  | 'high-vis'       // first-responder, ambulance
  | 'cap'            // ambulance driver
  | 'stethoscope'    // doctor / clinician
  | 'scrubs'         // ward / ED nurse / HCA
  | 'lead-apron'     // cath team
  | 'sterile-gown'   // cath cardiologist
  | 'headphones'     // imaging
  | 'whitecoat'      // consultant
  | 'chef-hat'       // cook
  | 'mop'            // cleaner
  | 'linen-cart'     // laundry
  | 'clipboard'      // admin / registration / billing
  | 'ahp-polo';      // ward AHP team

export interface SpriteFeatures {
  skin: string;
  hair: string;
  /** 0 = short, 1 = medium, 2 = tied-back. */
  hairStyle: 0 | 1 | 2;
  /** Body uniform colour (from the actor's swatch). */
  uniform: string;
  accessory: AccessoryKind;
}

/* ── feature derivation (pure) ───────────────────────────────────────── */

/** Map an actor's role text + team to a sensible accessory. */
export function accessoryFor(actor: { id: string; role: string; team: ActorTeam }): AccessoryKind {
  const r = actor.role.toLowerCase();
  const id = actor.id;
  const t = actor.team;
  // The patient is identified by id (the role text is "Mr Tan, 58").
  if (id === 'patient') return 'gown';
  // Specific role keywords first (most specific wins). Order matters:
  // AHP roles must be checked before "clinic"-like keywords because
  // "Clinical pharmacist (AHP)" contains the substring "clinic".
  if (r.includes('cook')) return 'chef-hat';
  if (r.includes('cleaner')) return 'mop';
  if (r.includes('laundry')) return 'linen-cart';
  if (r.includes('clerk') || r.includes('billing') || r.includes('case manager') || r.includes('discharge')) return 'clipboard';
  if (r.includes('attendant')) return 'casual';
  if (r.includes('driver')) return 'cap';
  if (r.includes('paramedic') || r.includes('cfr') || r.includes('responder')) return 'high-vis';
  if (r.includes('radiograph')) return 'lead-apron';
  if (r.includes('imaging') && r.includes('nurse')) return 'headphones';
  // AHP team — check BEFORE the clinic/consultant fallback so "Clinical
  // pharmacist (AHP)" doesn't get matched by the "clinic" substring.
  if (r.includes('(ahp)') || r.includes('physio') || r.includes('therapist') || r.includes('dietitian') || r.includes('pharmacist') || r.includes('rehab')) return 'ahp-polo';
  if (r.includes('consultant') || r.includes('clinic')) return 'whitecoat';
  if (r.includes('interventional') || r.includes('surgeon')) return 'sterile-gown';
  if (r.includes('hca')) return 'scrubs';
  if (r.includes('nurse')) return 'scrubs';
  if (r.includes('doctor') || r.includes('registrar') || r.includes('officer') || r.includes(' mo')) return 'stethoscope';
  // Family / bystander defaults.
  if (t === 'bystander') return 'casual';
  if (t === 'patient') return 'casual';
  // Team-level fallback.
  if (t === 'ed' || t === 'ward') return 'scrubs';
  if (t === 'cath') return 'sterile-gown';
  if (t === 'ambulance') return 'high-vis';
  if (t === 'support') return 'clipboard';
  return 'casual';
}

export function deriveFeatures(actor: WalkthroughActor): SpriteFeatures {
  const h = hash(actor.id);
  return {
    skin: SKIN_TONES[h & 3],
    hair: HAIR_COLOURS[(h >> 2) & 3],
    hairStyle: ((h >> 4) & 3) as 0 | 1 | 2,
    uniform: actor.swatch ?? '#475569',
    accessory: accessoryFor(actor),
  };
}

/* ── JSX rendering ───────────────────────────────────────────────────── */

/**
 * Render a single actor sprite as an SVG <g> group. The caller wraps it in a
 * <g transform="translate(x,y)"> at the stage layout coords. The viewBox is
 * 48×64 (portrait); origin is top-left.
 */
export function ActorSprite({ actor, size = 64 }: { actor: WalkthroughActor; size?: number }): JSX.Element {
  const f = deriveFeatures(actor);
  // Scale: native is 48×64. We translate so the centre lands at the caller's
  // origin (-24, -32 from the requested centre).
  const scale = size / 64;
  return (
    <g transform={`scale(${scale}) translate(-24,-32)`}>
      <SpriteBody features={f} />
      <SpriteAccessory features={f} />
      <SpriteHead features={f} />
      <SpriteHair features={f} />
    </g>
  );
}

function SpriteBody({ features }: { features: SpriteFeatures }): JSX.Element {
  // Shoulders + torso + slight neck.
  const { uniform } = features;
  return (
    <g>
      {/* Neck */}
      <rect x="21" y="20" width="6" height="6" fill={features.skin} />
      {/* Torso */}
      <path
        d={`M 12 28
            Q 12 24, 16 24
            L 32 24
            Q 36 24, 36 28
            L 36 56
            L 12 56 Z`}
        fill={uniform}
      />
      {/* Arms */}
      <rect x="9" y="28" width="5" height="18" rx="2" fill={uniform} />
      <rect x="34" y="28" width="5" height="18" rx="2" fill={uniform} />
      {/* Hands */}
      <circle cx="11" cy="48" r="2.5" fill={features.skin} />
      <circle cx="37" cy="48" r="2.5" fill={features.skin} />
    </g>
  );
}

function SpriteHead({ features }: { features: SpriteFeatures }): JSX.Element {
  return (
    <g>
      <circle cx="24" cy="14" r="9" fill={features.skin} />
      {/* Eyes */}
      <circle cx="21" cy="14" r="0.9" fill="#1a1410" />
      <circle cx="27" cy="14" r="0.9" fill="#1a1410" />
      {/* Subtle mouth */}
      <path d="M 22 18 Q 24 19, 26 18" stroke="#7a4a2a" strokeWidth="0.6" fill="none" strokeLinecap="round" />
    </g>
  );
}

function SpriteHair({ features }: { features: SpriteFeatures }): JSX.Element {
  const { hair, hairStyle } = features;
  switch (hairStyle) {
    case 0:
      // Short cropped — small dome.
      return <path d="M 16 12 Q 16 5, 24 5 Q 32 5, 32 12 L 32 9 L 16 9 Z" fill={hair} />;
    case 1:
      // Medium — covers more of the forehead.
      return (
        <g>
          <path d="M 15 13 Q 15 4, 24 4 Q 33 4, 33 13 L 33 10 Q 28 11, 24 11 Q 20 11, 15 10 Z" fill={hair} />
        </g>
      );
    case 2:
      // Tied back — visible bun behind the head.
      return (
        <g>
          <path d="M 16 11 Q 16 5, 24 5 Q 32 5, 32 11 L 32 9 L 16 9 Z" fill={hair} />
          <circle cx="34" cy="13" r="3" fill={hair} />
        </g>
      );
  }
}

function SpriteAccessory({ features }: { features: SpriteFeatures }): JSX.Element | null {
  switch (features.accessory) {
    case 'gown':
      // Hospital gown — lighter overlay + tie ribbon.
      return (
        <g>
          <rect x="12" y="28" width="24" height="28" fill="#e0e7f2" opacity="0.85" />
          <path d="M 14 30 L 16 32 M 32 30 L 34 32" stroke="#9aa6b8" strokeWidth="0.6" />
        </g>
      );
    case 'casual':
      // T-shirt collar.
      return <path d="M 21 24 L 24 28 L 27 24" stroke="#1a1410" strokeWidth="0.6" fill="none" />;
    case 'high-vis':
      // Vivid yellow vest with reflective stripes.
      return (
        <g>
          <path d="M 13 28 L 16 24 L 32 24 L 35 28 L 35 56 L 13 56 Z" fill="#facc15" />
          <rect x="13" y="38" width="22" height="2" fill="#e8e8e8" />
          <rect x="13" y="46" width="22" height="2" fill="#e8e8e8" />
        </g>
      );
    case 'cap':
      // Forage cap over the head.
      return (
        <g>
          <rect x="16" y="6" width="16" height="3" fill="#1f2937" />
          <rect x="14" y="9" width="20" height="2" fill="#1f2937" />
        </g>
      );
    case 'stethoscope':
      // Black tubing draped over the shoulders.
      return (
        <g>
          <path d="M 18 26 Q 24 30, 30 26 L 30 36 L 27 38" stroke="#1a1410" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <circle cx="27" cy="38" r="1.6" fill="#1a1410" />
        </g>
      );
    case 'scrubs':
      // V-neck line on the uniform.
      return <path d="M 21 24 L 24 30 L 27 24" stroke="#0c4a6e" strokeWidth="0.7" fill="none" />;
    case 'lead-apron':
      // Heavy trapezoid over the torso.
      return (
        <g>
          <path d="M 14 28 L 34 28 L 36 56 L 12 56 Z" fill="#475569" />
          <text x="24" y="44" textAnchor="middle" fontSize="6" fill="#cbd5f5">
            Pb
          </text>
        </g>
      );
    case 'sterile-gown':
      // Long blue gown + mask line.
      return (
        <g>
          <path d="M 12 26 L 36 26 L 36 56 L 12 56 Z" fill="#1e3a8a" />
          <path d="M 18 18 Q 24 21, 30 18" stroke="#e0f2fe" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'headphones':
      // Over-ear arc.
      return (
        <g>
          <path d="M 14 12 Q 24 4, 34 12" stroke="#1f2937" strokeWidth="1.4" fill="none" />
          <rect x="12" y="11" width="3" height="5" rx="1" fill="#1f2937" />
          <rect x="33" y="11" width="3" height="5" rx="1" fill="#1f2937" />
        </g>
      );
    case 'whitecoat':
      // White coat over the uniform.
      return (
        <g>
          <path d="M 11 26 L 16 24 L 32 24 L 37 26 L 37 56 L 11 56 Z" fill="#f8fafc" />
          {/* Lapel V */}
          <path d="M 19 24 L 24 32 L 29 24" stroke="#94a3b8" strokeWidth="0.6" fill="none" />
          {/* Pocket */}
          <rect x="14" y="42" width="6" height="6" fill="none" stroke="#cbd5f5" strokeWidth="0.4" />
          {/* Stethoscope cameo */}
          <path d="M 19 32 Q 24 36, 29 32 L 29 40 L 27 41" stroke="#1a1410" strokeWidth="0.8" fill="none" />
        </g>
      );
    case 'chef-hat':
      // Tall white toque.
      return (
        <g>
          <ellipse cx="24" cy="4" rx="9" ry="4" fill="#f8fafc" />
          <rect x="15" y="4" width="18" height="4" fill="#f8fafc" />
          <rect x="14" y="8" width="20" height="2" fill="#f8fafc" />
        </g>
      );
    case 'mop':
      // Apron + mop handle in hand.
      return (
        <g>
          <path d="M 14 30 L 34 30 L 34 56 L 14 56 Z" fill="#0ea5e9" opacity="0.6" />
          <rect x="38" y="20" width="1.6" height="36" fill="#7a5a3a" />
          <ellipse cx="38.8" cy="58" rx="4" ry="2.5" fill="#e7e5e4" />
        </g>
      );
    case 'linen-cart':
      // Apron + a small cart at the side.
      return (
        <g>
          <path d="M 14 30 L 34 30 L 34 56 L 14 56 Z" fill="#e7e5e4" />
          <rect x="38" y="44" width="9" height="12" fill="#94a3b8" />
          <rect x="38" y="42" width="9" height="3" fill="#cbd5f5" />
          <circle cx="40" cy="58" r="1.4" fill="#1a1410" />
          <circle cx="45" cy="58" r="1.4" fill="#1a1410" />
        </g>
      );
    case 'clipboard':
      // Clipboard tucked under the arm.
      return (
        <g>
          <rect x="36" y="34" width="8" height="11" fill="#fafaf9" stroke="#94a3b8" strokeWidth="0.4" />
          <rect x="38" y="33" width="4" height="2" fill="#94a3b8" />
          <line x1="37" y1="38" x2="43" y2="38" stroke="#94a3b8" strokeWidth="0.4" />
          <line x1="37" y1="40" x2="43" y2="40" stroke="#94a3b8" strokeWidth="0.4" />
          <line x1="37" y1="42" x2="43" y2="42" stroke="#94a3b8" strokeWidth="0.4" />
        </g>
      );
    case 'ahp-polo':
      // Polo collar.
      return (
        <g>
          <path d="M 19 24 L 24 28 L 29 24" fill="none" stroke="#0c4a6e" strokeWidth="0.7" />
          <rect x="22" y="28" width="4" height="3" fill="#f8fafc" />
        </g>
      );
  }
}
