/**
 * Scenery — richly layered SVG environments for the walkthrough cinematic.
 *
 * v9.8 "cinematic staging" upgrade. Where the v9.4–v9.7 Stage laid actors out
 * in a schematic grid of team-rows over a flat gradient, the renderer now
 * composes a real *scene*: a perspective floor, mid-ground props, signage,
 * lighting, an ambient crowd of non-interactive extras, and atmospheric depth
 * (haze + vignette). Characters are then placed *in* the space with poses and
 * expressions rather than slotted into a table.
 *
 * Size is deliberately NOT optimised here — the brief is maximum realism for a
 * 480×270 stage, so every environment is hand-built from layered primitives
 * with gradients, shadows and SMIL micro-animation (ceiling fans, steam,
 * monitor blips). All declarative; no per-frame JS beyond the sprite ticker.
 *
 * The hero environment is the Bras Basah `kopitiam` where Mr Tan collapses —
 * built out in full (terrazzo floor, three hawker stalls with signage, ceiling
 * fans, fluorescent tubes, marble tables, red plastic stools, seated patrons,
 * a drink-stall queue, shophouse pillars and warm morning light from the open
 * five-foot-way). The clinical environments share a smaller kit of helpers.
 */

import type { JSX } from 'react';

export type SceneId =
  | 'kopitiam'
  | 'street'
  | 'resus'
  | 'cathlab'
  | 'imaging'
  | 'counsel'
  | 'ward'
  | 'pharmacy'
  | 'rehab'
  | 'clinic'
  | 'backhouse';

/** Stage dimensions (16:9). The horizon sits at y≈150; floor below. */
export const STAGE_W = 480;
export const STAGE_H = 270;
export const HORIZON_Y = 150;

/** A scene-anchored default position (in stage units) for an actor by index. */
export interface ScenePos {
  x: number;
  y: number;
}

/* ────────────────────────────────────────────────────────────────────────
 * Shared primitive helpers
 * ──────────────────────────────────────────────────────────────────────── */

/** A soft contact shadow ellipse — placed under figures and props. */
export function GroundShadow({ x, y, rx, opacity = 0.28 }: { x: number; y: number; rx: number; opacity?: number }): JSX.Element {
  return <ellipse cx={x} cy={y} rx={rx} ry={rx * 0.32} fill="#000" opacity={opacity} />;
}

/** A perspective floor: a near-trapezoid with receding grid lines. */
function PerspectiveFloor({
  topColor,
  bottomColor,
  lineColor,
  speckle,
}: {
  topColor: string;
  bottomColor: string;
  lineColor: string;
  speckle?: string;
}): JSX.Element {
  const lines: JSX.Element[] = [];
  // Horizontal recede lines (denser toward the horizon).
  for (let i = 1; i <= 6; i += 1) {
    const t = i / 7;
    const y = HORIZON_Y + (STAGE_H - HORIZON_Y) * (t * t);
    lines.push(<line key={`h${i}`} x1={0} y1={y} x2={STAGE_W} y2={y} stroke={lineColor} strokeWidth={0.5} opacity={0.5} />);
  }
  // Vanishing verticals toward a centre point.
  const vp = STAGE_W / 2;
  for (let i = 0; i <= 10; i += 1) {
    const xTop = vp + (i - 5) * 12;
    const xBot = vp + (i - 5) * 70;
    lines.push(<line key={`v${i}`} x1={xTop} y1={HORIZON_Y} x2={xBot} y2={STAGE_H} stroke={lineColor} strokeWidth={0.5} opacity={0.35} />);
  }
  // Optional terrazzo speckle (deterministic scatter).
  const dots: JSX.Element[] = [];
  if (speckle) {
    let seed = 1337;
    const rnd = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    for (let i = 0; i < 120; i += 1) {
      const y = HORIZON_Y + rnd() * (STAGE_H - HORIZON_Y);
      const x = rnd() * STAGE_W;
      const r = 0.4 + rnd() * 0.9;
      dots.push(<circle key={`s${i}`} cx={x} cy={y} r={r} fill={speckle} opacity={0.5} />);
    }
  }
  return (
    <g>
      <rect x={0} y={HORIZON_Y} width={STAGE_W} height={STAGE_H - HORIZON_Y} fill={`url(#floor-grad)`} />
      <defs>
        <linearGradient id="floor-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={topColor} />
          <stop offset="100%" stopColor={bottomColor} />
        </linearGradient>
      </defs>
      {lines}
      {dots}
    </g>
  );
}

/** A row of fluorescent ceiling tubes. */
function CeilingTubes({ y, count, tint = '#e6f4ff' }: { y: number; count: number; tint?: string }): JSX.Element {
  const tubes: JSX.Element[] = [];
  const span = STAGE_W / (count + 1);
  for (let i = 1; i <= count; i += 1) {
    const x = span * i - 22;
    tubes.push(
      <g key={i}>
        <rect x={x} y={y} width={44} height={3} rx={1} fill={tint} />
        <rect x={x} y={y} width={44} height={3} rx={1} fill={tint} opacity={0.5}>
          <animate attributeName="opacity" values="0.5;0.85;0.5" dur={`${3 + (i % 3)}s`} repeatCount="indefinite" />
        </rect>
        <ellipse cx={x + 22} cy={y + 8} rx={26} ry={6} fill={tint} opacity={0.12} />
      </g>,
    );
  }
  return <g>{tubes}</g>;
}

/** A slowly spinning ceiling fan (SMIL rotation). */
function CeilingFan({ x, y }: { x: number; y: number }): JSX.Element {
  return (
    <g transform={`translate(${x},${y})`}>
      <line x1={0} y1={-12} x2={0} y2={0} stroke="#3a3a3a" strokeWidth={1.2} />
      <g>
        <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="1.6s" repeatCount="indefinite" />
        <ellipse cx={0} cy={0} rx={22} ry={3} fill="#52443a" opacity={0.8} />
        <ellipse cx={0} cy={0} rx={3} ry={22} fill="#52443a" opacity={0.8} />
        <circle r={3} fill="#2a2a2a" />
      </g>
    </g>
  );
}

/** A seated patron silhouette (ambient extra) — purely decorative. */
function SeatedPatron({ x, y, scale = 1, hue = '#3a4252', action = 'sit' }: { x: number; y: number; scale?: number; hue?: string; action?: 'sit' | 'read' | 'drink' }): JSX.Element {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <GroundShadow x={0} y={2} rx={9} opacity={0.22} />
      {/* stool */}
      <rect x={-6} y={-2} width={12} height={3} rx={1} fill="#b9342b" />
      <rect x={-5} y={1} width={2} height={6} fill="#7c2018" />
      <rect x={3} y={1} width={2} height={6} fill="#7c2018" />
      {/* body */}
      <rect x={-7} y={-20} width={14} height={20} rx={3} fill={hue} />
      {/* head */}
      <circle cx={0} cy={-26} r={6} fill="#cf9b6f" />
      <path d="M -6 -28 a 6 6 0 0 1 12 0 z" fill="#1c140e" />
      {/* arms by action */}
      {action === 'read' && <rect x={-9} y={-18} width={18} height={11} rx={1} fill="#e8e3d8" transform="rotate(-8)" />}
      {action === 'drink' && <rect x={3} y={-20} width={3} height={8} rx={1} fill="#caa57c" transform="rotate(-30 4 -16)" />}
    </g>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * KOPITIAM — the hero environment
 * ──────────────────────────────────────────────────────────────────────── */

function KopitiamScene(): JSX.Element {
  return (
    <g>
      {/* Warm morning ambience behind everything */}
      <defs>
        <linearGradient id="kopi-air" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbe7c2" />
          <stop offset="55%" stopColor="#f0d6a8" />
          <stop offset="100%" stopColor="#d9b483" />
        </linearGradient>
        <linearGradient id="kopi-light" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff3d6" stopOpacity={0.9} />
          <stop offset="100%" stopColor="#fff3d6" stopOpacity={0} />
        </linearGradient>
        <radialGradient id="kopi-vig" cx="50%" cy="46%" r="72%">
          <stop offset="65%" stopColor="#000" stopOpacity={0} />
          <stop offset="100%" stopColor="#1a0f04" stopOpacity={0.42} />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={STAGE_W} height={STAGE_H} fill="url(#kopi-air)" />

      {/* Open five-foot-way on the left — bright morning street spilling in */}
      <rect x={0} y={0} width={120} height={HORIZON_Y} fill="#f7e9c8" />
      <rect x={0} y={0} width={150} height={STAGE_H} fill="url(#kopi-light)" />
      {/* a parked motorbike out on the five-foot-way */}
      <g transform="translate(34,138)" opacity={0.9}>
        <circle cx={-10} cy={6} r={6} fill="#222" /><circle cx={14} cy={6} r={6} fill="#222" />
        <path d="M -10 6 L 2 -4 L 14 6" stroke="#374151" strokeWidth={2} fill="none" />
        <rect x={-2} y={-8} width={10} height={5} rx={1.5} fill="#7f1d1d" />
      </g>

      {/* Tiled back wall + tiled dado */}
      <rect x={0} y={0} width={STAGE_W} height={HORIZON_Y} fill="#cdbb97" opacity={0.0} />
      <rect x={120} y={0} width={STAGE_W - 120} height={70} fill="#e9dcc0" />
      <rect x={120} y={70} width={STAGE_W - 120} height={HORIZON_Y - 70} fill="#cfe3e6" />
      {/* white wall-tile grid on the dado */}
      {Array.from({ length: 12 }, (_, i) => (
        <line key={`wt${i}`} x1={120 + i * 30} y1={70} x2={120 + i * 30} y2={HORIZON_Y} stroke="#aebfc2" strokeWidth={0.4} opacity={0.7} />
      ))}
      {Array.from({ length: 3 }, (_, i) => (
        <line key={`wth${i}`} x1={120} y1={88 + i * 20} x2={STAGE_W} y2={88 + i * 20} stroke="#aebfc2" strokeWidth={0.4} opacity={0.7} />
      ))}

      {/* Ceiling band with tubes + fans */}
      <rect x={0} y={0} width={STAGE_W} height={14} fill="#d8c8a4" />
      <CeilingTubes y={6} count={5} />
      <CeilingFan x={170} y={20} />
      <CeilingFan x={330} y={20} />

      {/* ── Three hawker stalls along the back wall ── */}
      {/* Stall 1: Drinks / KOPI */}
      <g transform="translate(130,18)">
        <rect x={0} y={0} width={92} height={52} fill="#7c1d1d" />
        <rect x={0} y={0} width={92} height={12} fill="#a52828" />
        <text x={46} y={9} textAnchor="middle" fontSize="7" fontFamily="ui-monospace, monospace" fill="#ffe9b8" letterSpacing="1">
          ☕ KOPI · TEH · 美味饮料
        </text>
        {/* shelf of cups */}
        {Array.from({ length: 7 }, (_, i) => (
          <rect key={i} x={6 + i * 12} y={16} width={8} height={9} rx={1} fill="#efe6d6" />
        ))}
        {/* coffee sock / urns + steam */}
        <rect x={8} y={30} width={14} height={18} rx={1} fill="#3a2a1c" />
        <rect x={30} y={30} width={14} height={18} rx={1} fill="#52443a" />
        <g opacity={0.55}>
          <path d="M 15 30 q -3 -6 1 -10" stroke="#fff" strokeWidth={1.4} fill="none">
            <animate attributeName="opacity" values="0.1;0.6;0.1" dur="2.4s" repeatCount="indefinite" />
          </path>
          <path d="M 37 30 q 3 -6 -1 -11" stroke="#fff" strokeWidth={1.4} fill="none">
            <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2.9s" repeatCount="indefinite" />
          </path>
        </g>
        {/* price board */}
        <rect x={56} y={28} width={30} height={20} fill="#1f2937" />
        {Array.from({ length: 4 }, (_, i) => (
          <line key={i} x1={59} y1={32 + i * 4} x2={83} y2={32 + i * 4} stroke="#fbbf24" strokeWidth={0.8} opacity={0.8} />
        ))}
      </g>

      {/* Stall 2: Chicken rice (hanging roast) */}
      <g transform="translate(232,18)">
        <rect x={0} y={0} width={92} height={52} fill="#8a5a12" />
        <rect x={0} y={0} width={92} height={12} fill="#b9791c" />
        <text x={46} y={9} textAnchor="middle" fontSize="7" fontFamily="ui-monospace, monospace" fill="#fff3d6" letterSpacing="1">
          鸡饭 CHICKEN RICE
        </text>
        {/* glass display + hanging roast meats */}
        <rect x={6} y={16} width={80} height={22} rx={1} fill="#dfe9ec" opacity={0.65} />
        {Array.from({ length: 5 }, (_, i) => (
          <g key={i} transform={`translate(${16 + i * 14},16)`}>
            <line x1={0} y1={0} x2={0} y2={4} stroke="#6b4423" strokeWidth={0.8} />
            <ellipse cx={0} cy={9} rx={4} ry={6} fill="#9a3412" />
          </g>
        ))}
        <rect x={6} y={40} width={80} height={8} fill="#5b3a0f" />
      </g>

      {/* Stall 3: Noodles / wok station (partial, right edge) */}
      <g transform="translate(326,18)">
        <rect x={0} y={0} width={92} height={52} fill="#374151" />
        <rect x={0} y={0} width={92} height={12} fill="#4b5563" />
        <text x={46} y={9} textAnchor="middle" fontSize="7" fontFamily="ui-monospace, monospace" fill="#e5e7eb" letterSpacing="1">
          炒粿条 FRIED NOODLES
        </text>
        {/* wok + flame + steam */}
        <ellipse cx={28} cy={34} rx={16} ry={6} fill="#1f2937" />
        <ellipse cx={28} cy={32} rx={13} ry={4} fill="#0f172a" />
        <path d="M 22 26 q 2 -8 8 -10 q -2 6 2 9" fill="#f59e0b" opacity={0.75}>
          <animate attributeName="opacity" values="0.4;0.85;0.4" dur="0.7s" repeatCount="indefinite" />
        </path>
        <rect x={54} y={20} width={32} height={24} rx={1} fill="#111827" />
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x={57 + (i % 3) * 10} y={24 + Math.floor(i / 3) * 10} width={7} height={7} rx={1} fill="#6b7280" />
        ))}
      </g>

      {/* Shophouse pillars framing the space (depth) */}
      <rect x={112} y={0} width={10} height={STAGE_H} fill="#b59b6e" />
      <rect x={112} y={0} width={3} height={STAGE_H} fill="#d8c39a" />
      <rect x={4} y={120} width={9} height={STAGE_H - 120} fill="#c2a877" opacity={0.8} />

      {/* ── Terrazzo floor ── */}
      <PerspectiveFloor topColor="#cdbf9e" bottomColor="#a8946d" lineColor="#8a7748" speckle="#7c6b46" />
      {/* a couple of darker grout seams */}
      <line x1={0} y1={196} x2={STAGE_W} y2={196} stroke="#6f5d38" strokeWidth={0.8} opacity={0.5} />

      {/* ── Ambient mid-ground: tables, stools, patrons ──
       * The front-CENTRE is deliberately kept clear: that's the "stage" where
       * the collapse + CPR + AED choreography plays out (x≈160–260, y≈224–242).
       * The morning crowd is pushed to the flanks and the back. */}

      {/* Back row tables (smaller, near wall) — busy breakfast crowd */}
      <KopiTable x={150} y={166} scale={0.74} props="full" />
      <SeatedPatron x={128} y={172} scale={0.66} hue="#475569" action="read" />
      <SeatedPatron x={172} y={172} scale={0.68} hue="#5b4636" action="drink" />
      <KopiTable x={300} y={170} scale={0.82} props="cups" />
      <SeatedPatron x={280} y={176} scale={0.74} hue="#3b2f2a" action="drink" />

      {/* Queue at the drink stall (left) */}
      <QueuePatron x={140} y={150} scale={0.62} hue="#5b4636" />
      <QueuePatron x={152} y={156} scale={0.66} hue="#3f3f46" />
      <QueuePatron x={165} y={150} scale={0.6} hue="#7c6f63" />

      {/* A loose ring of onlookers drawn toward the commotion (behind the
       * action, facing in) — the Singapore "kaypoh" crowd gathering. */}
      <QueuePatron x={250} y={206} scale={0.8} hue="#52606e" />
      <QueuePatron x={284} y={210} scale={0.86} hue="#6b5648" />
      <QueuePatron x={312} y={206} scale={0.8} hue="#3f4654" />

      {/* Front-right table with patrons (foreground crowd, flanking right) */}
      <KopiTable x={420} y={220} scale={1.2} props="full" />
      <SeatedPatron x={452} y={230} scale={1.1} hue="#334155" action="drink" />
      <SeatedPatron x={392} y={232} scale={1.12} hue="#3b2f2a" action="read" />

      {/* Front-left table pushed to the far edge to keep the stage clear */}
      <KopiTable x={50} y={236} scale={1.18} props="cups" />
      <SeatedPatron x={28} y={246} scale={1.1} hue="#475569" action="read" />

      {/* foreground vignette for depth */}
      <rect x={0} y={0} width={STAGE_W} height={STAGE_H} fill="url(#kopi-vig)" />
    </g>
  );
}

/** A standing patron in the drink-stall queue. */
function QueuePatron({ x, y, scale = 1, hue }: { x: number; y: number; scale?: number; hue: string }): JSX.Element {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <GroundShadow x={0} y={28} rx={8} opacity={0.2} />
      <rect x={-6} y={0} width={12} height={26} rx={3} fill={hue} />
      <circle cx={0} cy={-6} r={6} fill="#c79a6d" />
      <path d="M -6 -8 a 6 6 0 0 1 12 0 z" fill="#15110b" />
    </g>
  );
}

/** A round marble kopitiam table with red stools and optional table props. */
function KopiTable({ x, y, scale = 1, props = 'cups' }: { x: number; y: number; scale?: number; props?: 'cups' | 'news' | 'full' }): JSX.Element {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <GroundShadow x={0} y={14} rx={26} opacity={0.26} />
      {/* stools around */}
      <Stool x={-26} y={6} />
      <Stool x={26} y={6} />
      <Stool x={0} y={16} />
      {/* pedestal */}
      <rect x={-3} y={0} width={6} height={14} fill="#6b7280" />
      <rect x={-9} y={13} width={18} height={3} rx={1} fill="#4b5563" />
      {/* marble top */}
      <ellipse cx={0} cy={0} rx={28} ry={9} fill="#e9e6df" />
      <ellipse cx={0} cy={0} rx={28} ry={9} fill="none" stroke="#9aa0a6" strokeWidth={1} />
      <ellipse cx={0} cy={-1} rx={24} ry={7} fill="#f4f2ec" />
      {/* props on the table */}
      {(props === 'cups' || props === 'full') && (
        <>
          <ellipse cx={-10} cy={-1} rx={4} ry={2} fill="#fff" />
          <rect x={-13} y={-6} width={6} height={5} rx={1} fill="#dcdcdc" />
          <rect x={6} y={-5} width={5} height={5} rx={2.5} fill="#3a2a1c" />
        </>
      )}
      {(props === 'news' || props === 'full') && (
        <rect x={-2} y={-4} width={14} height={9} rx={0.5} fill="#e8e3d8" transform="rotate(-10 4 0)" />
      )}
      {props === 'full' && <rect x={-8} y={-2} width={4} height={3} rx={0.5} fill="#dc2626" />}
    </g>
  );
}

function Stool({ x, y }: { x: number; y: number }): JSX.Element {
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={0} rx={7} ry={2.6} fill="#c0392b" />
      <ellipse cx={0} cy={-1} rx={7} ry={2.6} fill="#e74c3c" />
      <rect x={-5} y={1} width={1.6} height={7} fill="#7c2018" />
      <rect x={3.4} y={1} width={1.6} height={7} fill="#7c2018" />
    </g>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * STREET — ambulance on scene / transfers
 * ──────────────────────────────────────────────────────────────────────── */

function StreetScene(): JSX.Element {
  return (
    <g>
      <defs>
        <linearGradient id="street-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bcd4e6" />
          <stop offset="100%" stopColor="#e7eef2" />
        </linearGradient>
        <radialGradient id="street-vig" cx="50%" cy="48%" r="72%">
          <stop offset="65%" stopColor="#000" stopOpacity={0} />
          <stop offset="100%" stopColor="#0b1622" stopOpacity={0.4} />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={STAGE_W} height={HORIZON_Y} fill="url(#street-sky)" />
      {/* shophouse facade row */}
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i} transform={`translate(${i * 80},20)`}>
          <rect x={0} y={0} width={78} height={130} fill={i % 2 ? '#cdb79a' : '#c0d3c4'} />
          <rect x={10} y={20} width={20} height={28} fill="#5b6b78" />
          <rect x={46} y={20} width={20} height={28} fill="#5b6b78" />
          <rect x={0} y={92} width={78} height={10} fill="#8a6d4b" />
        </g>
      ))}
      {/* road */}
      <rect x={0} y={HORIZON_Y} width={STAGE_W} height={STAGE_H - HORIZON_Y} fill="#3a4250" />
      <rect x={0} y={HORIZON_Y} width={STAGE_W} height={6} fill="#6b7280" />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={20 + i * 80} y={210} width={34} height={5} fill="#e5e7eb" opacity={0.8} />
      ))}
      {/* SCDF ambulance parked right */}
      <Ambulance x={300} y={150} />
      {/* Wheeled stretcher in the action zone (left-centre) so the patient
       * isn't lying on bare tarmac during the on-scene handover. */}
      <Stretcher x={150} y={250} />
      <rect x={0} y={0} width={STAGE_W} height={STAGE_H} fill="url(#street-vig)" />
    </g>
  );
}

/** A wheeled ambulance stretcher / trolley (patient lies on top of it). */
function Stretcher({ x, y }: { x: number; y: number }): JSX.Element {
  return (
    <g transform={`translate(${x},${y})`}>
      <GroundShadow x={30} y={14} rx={48} opacity={0.3} />
      <rect x={-8} y={0} width={92} height={9} rx={3} fill="#dfe5ea" />
      <rect x={-8} y={0} width={92} height={3} rx={1.5} fill="#f87171" />
      {/* raised back-rest at the head end */}
      <rect x={-10} y={-10} width={10} height={12} rx={2} fill="#cdd9df" transform="rotate(-14 -5 -4)" />
      {/* frame + wheels */}
      <rect x={2} y={9} width={3} height={16} fill="#94a3b8" />
      <rect x={70} y={9} width={3} height={16} fill="#94a3b8" />
      <circle cx={4} cy={26} r={3.5} fill="#1f2937" />
      <circle cx={72} cy={26} r={3.5} fill="#1f2937" />
    </g>
  );
}

function Ambulance({ x, y }: { x: number; y: number }): JSX.Element {
  return (
    <g transform={`translate(${x},${y})`}>
      <GroundShadow x={70} y={70} rx={90} opacity={0.3} />
      <rect x={0} y={-6} width={150} height={56} rx={4} fill="#f4f6f8" />
      <rect x={0} y={-6} width={150} height={14} fill="#d62828" />
      {/* red SCDF chevrons on the body */}
      {Array.from({ length: 7 }, (_, i) => (
        <path key={i} d={`M ${20 + i * 18} 14 l 10 0 l -10 30 l -10 0 z`} fill={i % 2 ? '#d62828' : '#fbbf24'} opacity={0.9} />
      ))}
      {/* cab */}
      <rect x={150} y={6} width={40} height={44} rx={3} fill="#e9edf0" />
      <rect x={156} y={12} width={28} height={18} rx={2} fill="#9fc3d6" />
      {/* light bar */}
      <rect x={50} y={-12} width={50} height={6} rx={2} fill="#1f2937" />
      <rect x={56} y={-12} width={14} height={6} rx={2} fill="#ef4444"><animate attributeName="opacity" values="1;0.2;1" dur="0.8s" repeatCount="indefinite" /></rect>
      <rect x={80} y={-12} width={14} height={6} rx={2} fill="#3b82f6"><animate attributeName="opacity" values="0.2;1;0.2" dur="0.8s" repeatCount="indefinite" /></rect>
      {/* wheels */}
      <circle cx={36} cy={50} r={12} fill="#1f2937" /><circle cx={36} cy={50} r={5} fill="#6b7280" />
      <circle cx={150} cy={50} r={12} fill="#1f2937" /><circle cx={150} cy={50} r={5} fill="#6b7280" />
      {/* open rear doors */}
      <rect x={-14} y={-6} width={14} height={56} rx={2} fill="#dfe5ea" />
    </g>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * Clinical interiors share a kit: tiled floor + back wall + ceiling tubes.
 * ──────────────────────────────────────────────────────────────────────── */

function ClinicalShell({
  wall,
  floorTop,
  floorBottom,
  vigColor = '#04111d',
  children,
}: {
  wall: string;
  floorTop: string;
  floorBottom: string;
  vigColor?: string;
  children?: React.ReactNode;
}): JSX.Element {
  return (
    <g>
      <defs>
        <radialGradient id="clin-vig" cx="50%" cy="46%" r="72%">
          <stop offset="62%" stopColor="#000" stopOpacity={0} />
          <stop offset="100%" stopColor={vigColor} stopOpacity={0.45} />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={STAGE_W} height={HORIZON_Y} fill={wall} />
      {/* wall skirting + tile seams */}
      {Array.from({ length: 16 }, (_, i) => (
        <line key={i} x1={i * 30} y1={0} x2={i * 30} y2={HORIZON_Y} stroke="#ffffff" strokeWidth={0.3} opacity={0.12} />
      ))}
      <rect x={0} y={HORIZON_Y - 6} width={STAGE_W} height={6} fill="#ffffff" opacity={0.18} />
      <CeilingTubes y={5} count={5} />
      <PerspectiveFloor topColor={floorTop} bottomColor={floorBottom} lineColor="#ffffff" />
      {children}
      <rect x={0} y={0} width={STAGE_W} height={STAGE_H} fill="url(#clin-vig)" />
    </g>
  );
}

/** A vital-signs monitor with an animated ECG trace. */
function VitalsMonitor({ x, y }: { x: number; y: number }): JSX.Element {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={0} y={0} width={42} height={30} rx={2} fill="#0b1220" stroke="#334155" strokeWidth={1} />
      <polyline
        points="2,20 8,20 11,8 14,26 17,20 24,20 27,14 30,20 40,20"
        fill="none"
        stroke="#34d399"
        strokeWidth={1.2}
      >
        <animate attributeName="opacity" values="0.6;1;0.6" dur="1s" repeatCount="indefinite" />
      </polyline>
      <text x={36} y={28} textAnchor="end" fontSize="5" fill="#f87171" fontFamily="ui-monospace, monospace">88</text>
      <rect x={-3} y={30} width={48} height={3} fill="#475569" />
      <rect x={18} y={33} width={4} height={20} fill="#64748b" />
    </g>
  );
}

function ResusScene(): JSX.Element {
  return (
    <ClinicalShell wall="#16404d" floorTop="#1f5562" floorBottom="#0e2f38">
      {/* resus bay curtain rails */}
      <rect x={0} y={20} width={STAGE_W} height={3} fill="#0b2c34" />
      {Array.from({ length: 3 }, (_, i) => (
        <rect key={i} x={20 + i * 150} y={23} width={120} height={120} fill="#2a6b78" opacity={0.5} />
      ))}
      {/* resus trolley centre */}
      <g transform="translate(170,176)">
        <GroundShadow x={36} y={26} rx={56} opacity={0.3} />
        <rect x={0} y={0} width={120} height={14} rx={3} fill="#e2e8f0" />
        <rect x={0} y={0} width={120} height={5} rx={2} fill="#3aa6ff" />
        <rect x={6} y={14} width={4} height={22} fill="#94a3b8" />
        <rect x={110} y={14} width={4} height={22} fill="#94a3b8" />
        <circle cx={10} cy={38} r={4} fill="#1f2937" /><circle cx={112} cy={38} r={4} fill="#1f2937" />
      </g>
      <VitalsMonitor x={300} y={70} />
      {/* IV pole */}
      <g transform="translate(140,120)">
        <rect x={0} y={0} width={2} height={60} fill="#94a3b8" />
        <rect x={-6} y={6} width={12} height={14} rx={2} fill="#cbd5e1" opacity={0.8} />
      </g>
    </ClinicalShell>
  );
}

function CathLabScene(): JSX.Element {
  return (
    <ClinicalShell wall="#0f2a3a" floorTop="#143a4a" floorBottom="#081f29" vigColor="#02080f">
      {/* lead-glass control window */}
      <rect x={300} y={26} width={150} height="70" rx={3} fill="#13384a" stroke="#1f4f63" strokeWidth={2} />
      <rect x={310} y={36} width={130} height={50} fill="#1d5468" opacity={0.6} />
      {/* C-arm over the table */}
      <g transform="translate(150,90)">
        <path d="M 0 0 a 80 80 0 0 0 0 120" fill="none" stroke="#cbd5e1" strokeWidth={14} opacity={0.9} />
        <rect x={-16} y={-12} width={32} height={20} rx={3} fill="#94a3b8" />
        <rect x={-16} y={108} width={32} height={20} rx={3} fill="#94a3b8" />
      </g>
      {/* procedure table */}
      <g transform="translate(120,182)">
        <GroundShadow x={60} y={24} rx={70} opacity={0.32} />
        <rect x={0} y={0} width={150} height={12} rx={3} fill="#0b1220" />
        <rect x={0} y={0} width={150} height={4} rx={2} fill="#1e3a5f" />
        <rect x={70} y={12} width={6} height={30} fill="#475569" />
      </g>
      {/* radiation monitors on ceiling arm */}
      <g transform="translate(250,40)">
        <rect x={0} y={0} width={50} height={34} rx={2} fill="#0b1220" stroke="#334155" />
        <polyline points="3,18 20,18 24,6 28,28 32,18 47,18" fill="none" stroke="#f472b6" strokeWidth="1" />
      </g>
    </ClinicalShell>
  );
}

function ImagingScene(): JSX.Element {
  return (
    <ClinicalShell wall="#23314a" floorTop="#2b3b56" floorBottom="#141d2e" vigColor="#05070d">
      {/* CT/MRI gantry — big ring */}
      <g transform="translate(250,120)">
        <ellipse cx={0} cy={0} rx={86} ry={86} fill="#e8edf2" />
        <ellipse cx={0} cy={0} rx={58} ry={58} fill="#cdd6df" />
        <ellipse cx={0} cy={0} rx={34} ry={34} fill="#0b1220" />
        <ellipse cx={0} cy={0} rx={34} ry={34} fill="none" stroke="#3b82f6" strokeWidth={2} opacity={0.7}>
          <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2.5s" repeatCount="indefinite" />
        </ellipse>
      </g>
      {/* patient table sliding into the bore */}
      <g transform="translate(70,176)">
        <GroundShadow x={70} y={24} rx={72} opacity={0.3} />
        <rect x={0} y={0} width={170} height={12} rx={3} fill="#f1f5f9" />
        <rect x={0} y={0} width={170} height={4} rx={2} fill="#60a5fa" />
        <rect x={20} y={12} width={6} height={28} fill="#94a3b8" />
        <rect x={150} y={12} width={6} height={28} fill="#94a3b8" />
      </g>
    </ClinicalShell>
  );
}

function CounselScene(): JSX.Element {
  return (
    <ClinicalShell wall="#3a3326" floorTop="#5a4a33" floorBottom="#332817" vigColor="#0f0a04">
      {/* warm counselling room — softer light */}
      <defs>
        <radialGradient id="warm-glow" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#fde68a" stopOpacity={0.25} />
          <stop offset="100%" stopColor="#fde68a" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={STAGE_W} height={STAGE_H} fill="url(#warm-glow)" />
      {/* display screen with angiogram */}
      <g transform="translate(300,40)">
        <rect x={0} y={0} width={120} height={74} rx={3} fill="#0b1220" stroke="#475569" strokeWidth={2} />
        <ellipse cx={60} cy={37} rx={40} ry={28} fill="#1a2536" />
        <path d="M 40 20 Q 60 30 56 50 Q 70 44 84 56" stroke="#e5e7eb" strokeWidth={1.6} fill="none" />
        <path d="M 56 50 Q 50 58 64 64" stroke="#f87171" strokeWidth={1.6} fill="none" />
        <circle cx={58} cy={52} r={2.5} fill="#f87171"><animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" /></circle>
      </g>
      {/* round meeting table */}
      <g transform="translate(150,196)">
        <GroundShadow x={50} y={20} rx={66} opacity={0.28} />
        <ellipse cx={50} cy={6} rx={70} ry={18} fill="#6b4f2a" />
        <ellipse cx={50} cy={3} rx={70} ry={18} fill="#7d5d33" />
        <ellipse cx={50} cy={2} rx={60} ry={14} fill="#8a6a3c" />
      </g>
    </ClinicalShell>
  );
}

function WardScene(): JSX.Element {
  return (
    <ClinicalShell wall="#2c4a5e" floorTop="#3a5a6e" floorBottom="#1d3340" vigColor="#040d14">
      {/* window with daylight */}
      <rect x={320} y={26} width={130} height={70} rx={3} fill="#bfe0ee" />
      <rect x={320} y={26} width={130} height={70} rx={3} fill="none" stroke="#1f4456" strokeWidth={3} />
      <line x1={385} y1={26} x2={385} y2={96} stroke="#1f4456" strokeWidth={2} />
      {/* curtain divider */}
      <rect x={20} y={20} width={4} height={130} fill="#0e2733" />
      <rect x={24} y={28} width={90} height={100} fill="#3f7588" opacity={0.45} />
      {/* hospital bed with raised head + rails */}
      <g transform="translate(120,176)">
        <GroundShadow x={70} y={28} rx={80} opacity={0.3} />
        <rect x={0} y={2} width={150} height={16} rx={3} fill="#e8eef2" />
        <rect x={0} y={2} width={150} height={5} rx={2} fill="#5eb1c9" />
        {/* raised backrest */}
        <rect x={-6} y={-18} width={10} height={22} rx={2} fill="#cdd9df" transform="rotate(-12 0 -8)" />
        {/* pillow */}
        <rect x={4} y={-10} width={26} height={12} rx={4} fill="#f8fafc" transform="rotate(-12 16 -4)" />
        {/* side rails */}
        <rect x={40} y={-6} width={70} height={3} rx={1.5} fill="#94a3b8" />
        <rect x={6} y={18} width={4} height={26} fill="#94a3b8" />
        <rect x={140} y={18} width={4} height={26} fill="#94a3b8" />
      </g>
      <VitalsMonitor x={296} y={120} />
      {/* IV pole */}
      <g transform="translate(86,128)">
        <rect x={0} y={0} width={2} height={56} fill="#94a3b8" />
        <rect x={-6} y={4} width={12} height={16} rx={2} fill="#dbeafe" opacity={0.85} />
      </g>
    </ClinicalShell>
  );
}

function PharmacyScene(): JSX.Element {
  return (
    <ClinicalShell wall="#23424f" floorTop="#2f5160" floorBottom="#162e38" vigColor="#040f14">
      {/* wall of medicine shelving */}
      {Array.from({ length: 4 }, (_, r) => (
        <g key={r} transform={`translate(40,${24 + r * 30})`}>
          <rect x={0} y={0} width={400} height={24} fill="#1b3540" />
          {Array.from({ length: 26 }, (_, i) => (
            <rect key={i} x={4 + i * 15} y={4} width={11} height={16} rx={1} fill={['#fbbf24', '#34d399', '#f87171', '#60a5fa', '#e5e7eb'][i % 5]} opacity={0.85} />
          ))}
        </g>
      ))}
      {/* counter */}
      <g transform="translate(60,184)">
        <GroundShadow x={180} y={28} rx={150} opacity={0.28} />
        <rect x={0} y={0} width={360} height={30} rx={3} fill="#dfe7ec" />
        <rect x={0} y={0} width={360} height={6} fill="#5eb1c9" />
      </g>
    </ClinicalShell>
  );
}

function RehabScene(): JSX.Element {
  return (
    <ClinicalShell wall="#314a3e" floorTop="#cbb58a" floorBottom="#a08a5e" vigColor="#0a1410">
      {/* big bright windows */}
      {Array.from({ length: 3 }, (_, i) => (
        <rect key={i} x={30 + i * 150} y={24} width={120} height={70} rx={3} fill="#cdeaf0" stroke="#274b3d" strokeWidth={3} />
      ))}
      {/* treadmill */}
      <g transform="translate(280,168)">
        <GroundShadow x={30} y={36} rx={50} opacity={0.3} />
        <rect x={0} y={20} width={70} height={14} rx={3} fill="#1f2937" />
        <rect x={0} y={18} width={70} height={4} rx={2} fill="#374151" />
        <rect x={60} y={-14} width={4} height={34} fill="#4b5563" />
        <rect x={44} y={-16} width={24} height={4} rx={2} fill="#4b5563" />
        <rect x={50} y={-26} width={16} height={12} rx={2} fill="#0b1220" />
      </g>
      {/* parallel bars */}
      <g transform="translate(90,170)">
        <rect x={0} y={-6} width={90} height={3} rx={1.5} fill="#9a7b4f" />
        <rect x={0} y={20} width={3} height={28} fill="#6b7280" />
        <rect x={87} y={20} width={3} height={28} fill="#6b7280" />
      </g>
    </ClinicalShell>
  );
}

function ClinicScene(): JSX.Element {
  return (
    <ClinicalShell wall="#2a3f54" floorTop="#39536a" floorBottom="#1c2e3d" vigColor="#040c14">
      {/* exam couch */}
      <g transform="translate(280,178)">
        <GroundShadow x={55} y={26} rx={62} opacity={0.28} />
        <rect x={0} y={0} width={120} height={14} rx={3} fill="#e2e8f0" />
        <rect x={0} y={0} width={120} height={4} rx={2} fill="#5eb1c9" />
        <rect x={-4} y={-12} width={26} height={14} rx={3} fill="#cdd9df" transform="rotate(-10 8 -5)" />
        <rect x={8} y={14} width={4} height={26} fill="#94a3b8" />
        <rect x={108} y={14} width={4} height={26} fill="#94a3b8" />
      </g>
      {/* desk + screen with ECG/echo */}
      <g transform="translate(40,168)">
        <rect x={0} y={20} width={120} height={10} rx={2} fill="#6b4f2a" />
        <rect x={20} y={-6} width={50} height={30} rx={2} fill="#0b1220" stroke="#475569" />
        <polyline points="24,12 36,12 40,2 44,22 48,12 66,12" fill="none" stroke="#34d399" strokeWidth="1" />
      </g>
      {/* light box with films */}
      <rect x={330} y={30} width="100" height="64" rx={2} fill="#dbeafe" opacity={0.85} />
      <rect x={336} y={36} width={42} height={52} fill="#0b1220" opacity={0.5} />
      <rect x={382} y={36} width={42} height={52} fill="#0b1220" opacity={0.5} />
    </ClinicalShell>
  );
}

function BackhouseScene(): JSX.Element {
  return (
    <ClinicalShell wall="#3a3a40" floorTop="#4a4a52" floorBottom="#262629" vigColor="#070708">
      {/* industrial back-of-house: laundry carts, kitchen counter, trays */}
      <g transform="translate(40,150)">
        {/* big linen cart */}
        <rect x={0} y={0} width={70} height={40} rx={4} fill="#cbd5e1" />
        <rect x={4} y={-8} width={62} height={10} rx={3} fill="#e2e8f0" />
        <circle cx={12} cy={44} r={5} fill="#1f2937" /><circle cx={58} cy={44} r={5} fill="#1f2937" />
      </g>
      {/* stainless kitchen counter */}
      <g transform="translate(150,170)">
        <rect x={0} y={0} width={180} height={16} rx={2} fill="#aeb8c2" />
        <rect x={0} y={0} width={180} height={5} fill="#cdd6df" />
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x={10 + i * 28} y={-8} width={20} height={8} rx={1} fill="#e5e7eb" />
        ))}
      </g>
      {/* hanging utensils / steam */}
      <g transform="translate(360,150)">
        <rect x={0} y={0} width={80} height={40} rx={3} fill="#1f2937" />
        <path d="M 20 0 q -2 -8 2 -12" stroke="#fff" strokeWidth={1.4} fill="none" opacity={0.5}>
          <animate attributeName="opacity" values="0.1;0.5;0.1" dur="2.6s" repeatCount="indefinite" />
        </path>
      </g>
    </ClinicalShell>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * Scene dispatch + default actor staging positions per scene
 * ──────────────────────────────────────────────────────────────────────── */

export function SceneBackground({ scene }: { scene: SceneId }): JSX.Element {
  switch (scene) {
    case 'kopitiam': return <KopitiamScene />;
    case 'street': return <StreetScene />;
    case 'resus': return <ResusScene />;
    case 'cathlab': return <CathLabScene />;
    case 'imaging': return <ImagingScene />;
    case 'counsel': return <CounselScene />;
    case 'ward': return <WardScene />;
    case 'pharmacy': return <PharmacyScene />;
    case 'rehab': return <RehabScene />;
    case 'clinic': return <ClinicScene />;
    case 'backhouse': return <BackhouseScene />;
  }
}

/**
 * Deterministic fallback staging: when a beat doesn't pin an explicit
 * position, fan present actors across the front of the stage in a gentle arc
 * so they read as standing *in* the room (and large enough to see) rather than
 * lined up in a grid mid-scene over the props. Centred slightly right of the
 * middle to clear the left-side fixtures (IV poles, bed heads, desks). `index`
 * is the actor's slot among the present actors; `count` is the total present.
 */
export function defaultStagePos(index: number, count: number): ScenePos {
  const n = Math.max(1, count);
  const cx = 250;
  const spread = Math.min(300, 60 * n);
  const startX = cx - spread / 2;
  const step = n > 1 ? spread / (n - 1) : 0;
  const x = n === 1 ? cx : startX + index * step;
  // In the clear front band, with a slight depth zig-zag so figures don't
  // perfectly overlap and gain a touch of staggered depth.
  const y = 228 + (index % 2 === 0 ? 0 : 16);
  return { x, y };
}

/** Depth-based scale: figures lower on the stage (closer) are larger. */
export function depthScale(y: number): number {
  const t = Math.max(0, Math.min(1, (y - HORIZON_Y) / (STAGE_H - HORIZON_Y)));
  return 0.7 + t * 0.6; // 0.7 at horizon → 1.3 at the very front
}
