/**
 * Showpieces — inline SVG/SMIL "B-roll" animations for the procedural beats
 * where pixel-art figures hit their ceiling (cath stent deployment, MR table
 * sliding into the bore, AED shock arc, etc.).
 *
 * Why inline SVG and not MP4? The project's hard constraint is an offline,
 * asset-free PWA. Inline SVG + SMIL lets a showpiece ship with the bundle
 * with zero binary weight, work offline, and stay deterministic for tests.
 * When real MP4 b-roll lands later, the same beat-level hook
 * (`showpiece: { kind: 'mp4', src }`) plays it in the same overlay surface
 * with no other changes — see `ShowpieceOverlay.tsx`.
 *
 * Each showpiece is a self-contained 480×270 viewBox so it composes into the
 * stage geometry and rasterises cleanly via resvg / native browsers.
 */
import type { JSX } from 'react';

export type ShowpieceId = 'stent-deployment' | 'mri-bore-slide' | 'aed-shock';

export interface ShowpieceMeta {
  id: ShowpieceId;
  /** Human title shown above the panel. */
  title: string;
  /** Single-line subtitle / caption beneath the panel. */
  caption: string;
}

export const SHOWPIECES: Record<ShowpieceId, ShowpieceMeta> = {
  'stent-deployment': {
    id: 'stent-deployment',
    title: 'PCI — drug-eluting stent deployment',
    caption: 'Wire across · pre-dilatation · stent deployment · post-dilatation · TIMI 3 flow restored',
  },
  'mri-bore-slide': {
    id: 'mri-bore-slide',
    title: 'Cardiac MRI 1.5 T',
    caption: 'Table advanced into the bore · cine, T2, and late-gadolinium sequences acquired',
  },
  'aed-shock': {
    id: 'aed-shock',
    title: 'AED — shock advised',
    caption: 'Pads on · charging · stand clear · shock delivered',
  },
};

/** Render the inline SVG for the given showpiece. */
export function ShowpieceArt({ id }: { id: ShowpieceId }): JSX.Element {
  switch (id) {
    case 'stent-deployment':
      return <StentDeployment />;
    case 'mri-bore-slide':
      return <MriBoreSlide />;
    case 'aed-shock':
      return <AedShock />;
  }
}

/* ────────────────────────────────────────────────────────────────────────
 * Stent deployment — vessel cross-section, four phases on an 8s loop
 * ──────────────────────────────────────────────────────────────────────── */

function StentDeployment(): JSX.Element {
  return (
    <svg viewBox="0 0 480 270" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="sp-stent-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b1830" />
          <stop offset="100%" stopColor="#040b18" />
        </linearGradient>
        <linearGradient id="sp-vessel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9b1c1c" />
          <stop offset="50%" stopColor="#7f1d1d" />
          <stop offset="100%" stopColor="#5b1414" />
        </linearGradient>
        <radialGradient id="sp-flow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#dc2626" stopOpacity={0.95} />
          <stop offset="100%" stopColor="#7f1d1d" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={480} height={270} fill="url(#sp-stent-bg)" />

      {/* labels */}
      <text x={20} y={28} fill="#fde68a" fontSize={11} fontFamily="ui-monospace, monospace" letterSpacing="1">
        LAD · proximal culprit lesion
      </text>
      <text x={460} y={28} textAnchor="end" fill="#94a3b8" fontSize={9} fontFamily="ui-monospace, monospace">
        3.5 × 24 mm DES
      </text>

      {/* phase labels along the bottom */}
      <g fontSize={9} fontFamily="ui-monospace, monospace">
        <text x={60}  y={250} fill="#94a3b8">WIRE</text>
        <text x={170} y={250} fill="#94a3b8">PRE-DILATATION</text>
        <text x={300} y={250} fill="#94a3b8">DEPLOY</text>
        <text x={400} y={250} fill="#94a3b8">FINAL TIMI 3</text>
      </g>
      {/* phase progress bar */}
      <rect x={20} y={258} width={440} height={3} rx={1.5} fill="#1e293b" />
      <rect x={20} y={258} width={0} height={3} rx={1.5} fill="#fde68a">
        <animate attributeName="width" values="0;110;220;330;440;440" keyTimes="0;0.25;0.5;0.75;0.95;1" dur="8s" repeatCount="indefinite" />
      </rect>

      {/* the vessel — outer wall + lumen, with a stenosis bump in the centre */}
      <g transform="translate(0,40)">
        {/* outer wall */}
        <path
          d="M 20 60 L 200 60 Q 220 60 230 80 Q 240 100 250 100 Q 260 100 270 80 Q 280 60 300 60 L 460 60 L 460 120 L 300 120 Q 280 120 270 100 Q 260 100 250 100 Q 240 100 230 100 Q 220 120 200 120 L 20 120 Z"
          fill="url(#sp-vessel)"
        />
        {/* lumen */}
        <path
          d="M 20 75 L 200 75 Q 218 75 226 90 L 254 90 Q 262 75 280 75 L 460 75 L 460 105 L 280 105 Q 262 105 254 90 L 226 90 Q 218 105 200 105 L 20 105 Z"
          fill="#1a0a0a"
        />

        {/* PHASE 1 — guidewire (0-2s) */}
        <g>
          <line x1={460} y1={90} x2={20} y2={90} stroke="#a3a3a3" strokeWidth={1.2} strokeDasharray="2 3">
            <animate attributeName="x1" values="460;460;20;20" keyTimes="0;0.05;0.25;1" dur="8s" repeatCount="indefinite" />
          </line>
        </g>

        {/* PHASE 2 — balloon catheter advancing over wire (2-3.5s) */}
        <g>
          <rect x={20} y={88} width={420} height={4} fill="#cbd5e1" opacity={0}>
            <animate attributeName="opacity" values="0;0;1;1;1;1" keyTimes="0;0.25;0.4;0.5;0.8;1" dur="8s" repeatCount="indefinite" />
          </rect>
        </g>

        {/* PHASE 3 — balloon inflation (3.5-5.5s) */}
        <g>
          <ellipse cx={240} cy={90} rx={2} ry={2} fill="#f8fafc">
            <animate attributeName="opacity" values="0;0;0;1;1;0.4;0;0" keyTimes="0;0.3;0.4;0.5;0.62;0.7;0.78;1" dur="8s" repeatCount="indefinite" />
            <animate attributeName="rx" values="2;2;2;4;26;26;26;26" keyTimes="0;0.3;0.4;0.5;0.62;0.7;0.78;1" dur="8s" repeatCount="indefinite" />
            <animate attributeName="ry" values="2;2;2;4;14;14;14;14" keyTimes="0;0.3;0.4;0.5;0.62;0.7;0.78;1" dur="8s" repeatCount="indefinite" />
          </ellipse>
        </g>

        {/* PHASE 4 — deployed stent struts (visible from ~5s onward, persist) */}
        <g>
          <g opacity={0}>
            <animate attributeName="opacity" values="0;0;0;0;0.4;1;1;1" keyTimes="0;0.3;0.5;0.6;0.65;0.75;0.95;1" dur="8s" repeatCount="indefinite" />
            <rect x={214} y={76} width={52} height={28} fill="none" stroke="#fafaf9" strokeWidth={0.7} />
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <line key={`v${i}`} x1={214 + i * 7} y1={76} x2={214 + i * 7} y2={104} stroke="#fafaf9" strokeWidth={0.5} opacity={0.85} />
            ))}
            {[0, 1, 2, 3].map((i) => (
              <line key={`h${i}`} x1={214} y1={80 + i * 7} x2={266} y2={80 + i * 7} stroke="#fafaf9" strokeWidth={0.4} opacity={0.7} />
            ))}
          </g>
        </g>

        {/* PHASE 5 — flow restored (6-8s): travelling pulses */}
        <g>
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={20} cy={90} r={6} fill="url(#sp-flow)" opacity={0}>
              <animate
                attributeName="opacity"
                values="0;0;0;0;0;0.95;0"
                keyTimes={`0;${0.75 + i * 0.04};${0.78 + i * 0.04};${0.83 + i * 0.04};${0.88 + i * 0.04};${0.92 + i * 0.04};1`}
                dur="8s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="cx"
                values="20;20;20;20;100;360;460"
                keyTimes={`0;${0.75 + i * 0.04};${0.78 + i * 0.04};${0.83 + i * 0.04};${0.88 + i * 0.04};${0.92 + i * 0.04};1`}
                dur="8s"
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </g>
      </g>
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * MRI bore slide — side view, table advances + scan sweep + retract loop
 * ──────────────────────────────────────────────────────────────────────── */

function MriBoreSlide(): JSX.Element {
  return (
    <svg viewBox="0 0 480 270" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="sp-mri-room" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0b1220" />
        </linearGradient>
        <linearGradient id="sp-bore-shell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="40%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
        <radialGradient id="sp-bore-mouth" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0b1220" />
          <stop offset="80%" stopColor="#020617" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={480} height={270} fill="url(#sp-mri-room)" />

      {/* labels */}
      <text x={20} y={28} fill="#fde68a" fontSize={11} fontFamily="ui-monospace, monospace" letterSpacing="1">
        CARDIAC MRI · 1.5 T
      </text>
      <text x={460} y={28} textAnchor="end" fill="#94a3b8" fontSize={9} fontFamily="ui-monospace, monospace">
        Cine · T2 · LGE
      </text>

      {/* floor */}
      <rect x={0} y={210} width={480} height={60} fill="#0b1424" />
      <line x1={0} y1={210} x2={480} y2={210} stroke="#1e293b" strokeWidth={1} />

      {/* MRI machine — chunky bore on the right */}
      <g transform="translate(250,60)">
        {/* outer shell */}
        <rect x={0} y={0} width={200} height={150} rx={20} fill="url(#sp-bore-shell)" />
        {/* manufacturer plate */}
        <rect x={70} y={10} width={60} height={8} rx={1} fill="#1e293b" />
        <text x={100} y={17} textAnchor="middle" fill="#fde68a" fontSize={5} fontFamily="ui-monospace, monospace">1.5 T</text>
        {/* bore mouth */}
        <ellipse cx={100} cy={80} rx={70} ry={50} fill="url(#sp-bore-mouth)" />
        <ellipse cx={100} cy={80} rx={70} ry={50} fill="none" stroke="#475569" strokeWidth={1.2} />
        {/* indicator lights */}
        <circle cx={30} cy={140} r={3} fill="#34d399">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx={42} cy={140} r={3} fill="#f87171" opacity={0.7} />
      </g>

      {/* Scan sweep — vertical line inside the bore, animated during phase 2 */}
      <g clipPath="url(#sp-mri-bore-clip)" opacity={0}>
        <animate attributeName="opacity" values="0;0;0;0.85;0.85;0;0" keyTimes="0;0.25;0.3;0.35;0.6;0.65;1" dur="10s" repeatCount="indefinite" />
        <line x1={280} y1={90} x2={280} y2={170} stroke="#34d399" strokeWidth={1.6}>
          <animate attributeName="x1" values="280;420;280;420;280" keyTimes="0;0.25;0.5;0.75;1" dur="10s" repeatCount="indefinite" />
          <animate attributeName="x2" values="280;420;280;420;280" keyTimes="0;0.25;0.5;0.75;1" dur="10s" repeatCount="indefinite" />
        </line>
      </g>
      <defs>
        <clipPath id="sp-mri-bore-clip">
          <ellipse cx={350} cy={140} rx={68} ry={48} />
        </clipPath>
      </defs>

      {/* Pulse rings emanating from the bore during scan */}
      {[0, 1, 2].map((i) => (
        <ellipse key={i} cx={350} cy={140} rx={68} ry={48} fill="none" stroke="#34d399" strokeWidth={1} opacity={0}>
          <animate
            attributeName="opacity"
            values="0;0;0;0.6;0"
            keyTimes={`0;${0.3 + i * 0.05};${0.32 + i * 0.05};${0.4 + i * 0.05};${0.55 + i * 0.05}`}
            dur="10s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="rx"
            values="68;68;68;90;120"
            keyTimes={`0;${0.3 + i * 0.05};${0.32 + i * 0.05};${0.4 + i * 0.05};${0.55 + i * 0.05}`}
            dur="10s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="ry"
            values="48;48;48;60;80"
            keyTimes={`0;${0.3 + i * 0.05};${0.32 + i * 0.05};${0.4 + i * 0.05};${0.55 + i * 0.05}`}
            dur="10s"
            repeatCount="indefinite"
          />
        </ellipse>
      ))}

      {/* Patient on the table — slides into the bore and out */}
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0; 230 0; 230 0; 0 0; 0 0"
          keyTimes="0;0.2;0.7;0.9;1"
          dur="10s"
          repeatCount="indefinite"
        />
        {/* table */}
        <rect x={50} y={156} width={170} height={10} rx={2} fill="#e2e8f0" />
        <rect x={50} y={156} width={170} height={3} rx={1.5} fill="#5eb1c9" />
        {/* table support + wheels */}
        <rect x={62} y={166} width={4} height={30} fill="#94a3b8" />
        <rect x={206} y={166} width={4} height={30} fill="#94a3b8" />
        <circle cx={64} cy={198} r={4} fill="#1f2937" />
        <circle cx={208} cy={198} r={4} fill="#1f2937" />
        {/* patient — simple recumbent silhouette */}
        <g transform="translate(80,140)">
          {/* pillow + head */}
          <rect x={-6} y={4} width={20} height={10} rx={3} fill="#f8fafc" />
          <circle cx={3} cy={10} r={6} fill="#cf9b6f" />
          {/* covered body */}
          <rect x={14} y={6} width={90} height={14} rx={4} fill="#cbd5e1" />
          {/* cardiac coil */}
          <rect x={56} y={6} width={20} height={6} rx={2} fill="#0ea5e9" opacity={0.8} />
        </g>
      </g>

      {/* phase progress bar */}
      <g>
        <rect x={20} y={258} width={440} height={3} rx={1.5} fill="#1e293b" />
        <rect x={20} y={258} width={0} height={3} rx={1.5} fill="#fde68a">
          <animate attributeName="width" values="0;110;330;440;440" keyTimes="0;0.2;0.7;0.9;1" dur="10s" repeatCount="indefinite" />
        </rect>
      </g>
      <g fontSize={9} fontFamily="ui-monospace, monospace">
        <text x={50}  y={250} fill="#94a3b8">ADVANCE</text>
        <text x={180} y={250} fill="#94a3b8">ACQUIRE</text>
        <text x={350} y={250} fill="#94a3b8">RETRACT</text>
      </g>
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * AED shock — pad placement, charge, "stand clear", arc + ECG conversion
 * ──────────────────────────────────────────────────────────────────────── */

function AedShock(): JSX.Element {
  return (
    <svg viewBox="0 0 480 270" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="sp-aed-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c0a0a" />
          <stop offset="100%" stopColor="#0a0303" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={480} height={270} fill="url(#sp-aed-bg)" />

      <text x={20} y={28} fill="#fde68a" fontSize={11} fontFamily="ui-monospace, monospace" letterSpacing="1">
        AED · biphasic 200 J
      </text>
      <text x={460} y={28} textAnchor="end" fill="#94a3b8" fontSize={9} fontFamily="ui-monospace, monospace">
        STAND CLEAR
      </text>

      {/* torso silhouette */}
      <g transform="translate(160,80)">
        <ellipse cx={80} cy={80} rx={120} ry={70} fill="#3a1414" />
        {/* pads */}
        <rect x={30} y={40} width={26} height={26} rx={4} fill="#fbbf24" />
        <text x={43} y={56} textAnchor="middle" fontSize={6} fontFamily="ui-monospace, monospace" fill="#1c1917">RA</text>
        <rect x={104} y={94} width={26} height={26} rx={4} fill="#fbbf24" />
        <text x={117} y={110} textAnchor="middle" fontSize={6} fontFamily="ui-monospace, monospace" fill="#1c1917">APEX</text>

        {/* arc between pads — fires during shock phase */}
        <g opacity={0}>
          <animate attributeName="opacity" values="0;0;0;1;0;0" keyTimes="0;0.45;0.5;0.52;0.6;1" dur="6s" repeatCount="indefinite" />
          <path d="M 56 53 Q 75 30 95 50 Q 105 75 117 94" stroke="#fde68a" strokeWidth={2.4} fill="none" />
          <path d="M 56 53 Q 88 60 117 94" stroke="#fff" strokeWidth={1} fill="none" opacity={0.9} />
        </g>
      </g>

      {/* ECG strip — VF before shock, sinus after */}
      <g transform="translate(20,210)">
        <rect x={0} y={0} width={440} height={40} fill="#020617" stroke="#1e293b" strokeWidth={0.6} />
        {/* VF trace (chaotic) — visible pre-shock */}
        <path
          d="M 0 20 Q 8 4 14 28 Q 22 8 32 22 Q 40 6 48 28 Q 56 12 66 24 Q 74 6 84 28 Q 92 10 102 24 Q 112 6 120 28 Q 130 10 138 24 Q 148 6 158 28 Q 166 12 176 24 Q 184 6 194 28 Q 204 10 212 24"
          stroke="#f87171"
          strokeWidth={1.1}
          fill="none"
        >
          <animate attributeName="opacity" values="1;1;1;0;0;0" keyTimes="0;0.45;0.5;0.55;0.95;1" dur="6s" repeatCount="indefinite" />
        </path>
        {/* sinus trace — appears post-shock */}
        <path
          d="M 220 20 L 240 20 L 245 14 L 252 30 L 256 20 L 270 20 L 275 8 L 282 32 L 286 20 L 300 20 L 305 8 L 312 32 L 316 20 L 330 20 L 335 8 L 342 32 L 346 20 L 360 20 L 365 8 L 372 32 L 376 20 L 390 20 L 395 8 L 402 32 L 406 20 L 440 20"
          stroke="#34d399"
          strokeWidth={1.2}
          fill="none"
          opacity={0}
        >
          <animate attributeName="opacity" values="0;0;0;0;1;1" keyTimes="0;0.4;0.5;0.55;0.65;1" dur="6s" repeatCount="indefinite" />
        </path>
      </g>

      {/* phase progress bar */}
      <g>
        <rect x={20} y={258} width={440} height={3} rx={1.5} fill="#1e293b" />
        <rect x={20} y={258} width={0} height={3} rx={1.5} fill="#fde68a">
          <animate attributeName="width" values="0;120;220;330;440;440" keyTimes="0;0.25;0.5;0.7;0.95;1" dur="6s" repeatCount="indefinite" />
        </rect>
      </g>
      <g fontSize={9} fontFamily="ui-monospace, monospace">
        <text x={50}  y={250} fill="#94a3b8">PADS</text>
        <text x={150} y={250} fill="#94a3b8">CHARGE</text>
        <text x={260} y={250} fill="#94a3b8">SHOCK</text>
        <text x={380} y={250} fill="#94a3b8">ROSC</text>
      </g>
    </svg>
  );
}
