import { Component, lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useFocusTrap } from '../../lib/use-focus-trap';
import { useT, useLocale } from '../../lib/i18n';
import {
  beatsAt,
  canonicalChapterIds,
  chapterOf,
  nextChapterId,
  type Walkthrough,
  type WalkthroughActor,
  type WalkthroughBeat,
  type WalkthroughChapter,
} from '../../lib/walkthrough';
import {
  localiseWalkthrough,
  WALKTHROUGH_I18N_PACKS,
  type WalkthroughI18nPack,
} from '../../lib/walkthrough-i18n';
import { ActorSprite, INTERACTION_FRAMES, WALK_FRAMES } from '../../lib/sprite-generator';
import {
  SceneBackground,
  GroundShadow,
  STAGE_W,
  STAGE_H,
  type SceneId,
} from '../../lib/scenery';
import { stageFigures } from '../../lib/walkthrough-staging';
import { ShowpieceOverlay } from './ShowpieceOverlay';
import { useAchievements } from '../../state/achievementsStore';

interface Props {
  walkthrough: Walkthrough;
  onClose: () => void;
}

/** Cinematic (Phaser canvas) renderer — lazy so Phaser only loads on opt-in. */
const LazyPhaserStage = lazy(() => import('./WalkthroughPhaserStage'));
/** 3D (Three.js WebGL) renderer — lazy so Three.js only loads on opt-in. */
const Lazy3DStage = lazy(() => import('./Walkthrough3DStage'));

type RendererKind = 'svg' | 'phaser' | 'three';

const PLAY_TICK_MS = 100; // 10 fps is plenty for prose beats

const TEAM_LABEL: Record<string, string> = {
  patient: 'Patient',
  bystander: 'Bystanders',
  'first-responder': 'First responders',
  ambulance: 'Ambulance crew',
  ed: 'Emergency department',
  cath: 'Cath lab',
  ward: 'Ward',
  rehab: 'Rehab',
  outpatient: 'Outpatient',
  support: 'Support staff',
};

/**
 * Scrubbable Bandersnatch-style cinematic. v9.4 uses an SVG stage so the
 * loop is provable end-to-end; v9.5 will swap the SVG <g class="stage"> for
 * a Phaser canvas without changing the parent state machine.
 */
export function WalkthroughModal({ walkthrough: rawWalkthrough, onClose }: Props) {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const cardRef = useFocusTrap<HTMLDivElement>(true);

  // Localisation overlay: when the UI locale is non-English and a translation
  // pack exists for this pathway, fetch it (lazily, so the English chunk never
  // pays for it) and swap the strings. Falls back to English per-string.
  const [pack, setPack] = useState<WalkthroughI18nPack | null>(null);
  useEffect(() => {
    let live = true;
    const loader = locale !== 'en' ? WALKTHROUGH_I18N_PACKS[rawWalkthrough.id] : undefined;
    if (!loader) {
      setPack(null);
      return;
    }
    void loader().then((p) => {
      if (live) setPack(p);
    });
    return () => {
      live = false;
    };
  }, [rawWalkthrough.id, locale]);

  const walkthrough = useMemo(
    () => localiseWalkthrough(rawWalkthrough, pack, locale),
    [rawWalkthrough, pack, locale],
  );
  const machineAssisted = locale !== 'en' && !!pack?.machineAssisted;

  const [chapterId, setChapterId] = useState(walkthrough.startChapterId);
  const [localSec, setLocalSec] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [selectedActorId, setSelectedActorId] = useState<string | null>(null);
  /** Branch overlay shown when a chapter with a branchPoint reaches its end. */
  const [branchOpen, setBranchOpen] = useState(false);
  /** Stage renderer — SVG (default, polished) or Phaser canvas (beta). */
  const [renderer, setRenderer] = useState<RendererKind>('svg');

  const chapter = chapterOf(walkthrough, chapterId);
  const totalSec = chapter?.durationSec ?? 0;
  const canonicalIds = useMemo(() => canonicalChapterIds(walkthrough), [walkthrough]);

  /* Advance time while playing. Pauses when a branch overlay is open or when
   * the chapter has ended (without a branch, that means we wait for the user
   * to advance manually if there's no defaultNextChapterId). */
  useEffect(() => {
    if (!playing || branchOpen || !chapter) return;
    const id = window.setInterval(() => {
      setLocalSec((s) => {
        const next = s + PLAY_TICK_MS / 1000;
        if (next >= chapter.durationSec) {
          // Reached the chapter end.
          if (chapter.branchPoint) {
            setPlaying(false);
            setBranchOpen(true);
            return chapter.durationSec;
          }
          if (chapter.defaultNextChapterId) {
            setChapterId(chapter.defaultNextChapterId);
            return 0;
          }
          // Terminal canonical chapter — fire walkthrough-completed.
          useAchievements
            .getState()
            .fire({ kind: 'walkthrough-completed', walkthroughId: walkthrough.id });
          setPlaying(false);
          return chapter.durationSec;
        }
        return next;
      });
    }, PLAY_TICK_MS);
    return () => window.clearInterval(id);
  }, [playing, branchOpen, chapter]);

  /* When the chapter switches, reset the timeline. */
  useEffect(() => {
    setLocalSec(0);
    setSelectedActorId(null);
    setBranchOpen(false);
  }, [chapterId]);

  /* Keyboard: space toggles play, arrows scrub, escape closes. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (branchOpen) return; // Block scrubbing while a decision is open.
      if (e.key === ' ') {
        e.preventDefault();
        setPlaying((p) => !p);
        return;
      }
      if (!chapter) return;
      if (e.key === 'ArrowRight') {
        setLocalSec((s) => Math.min(chapter.durationSec, s + 1));
      } else if (e.key === 'ArrowLeft') {
        setLocalSec((s) => Math.max(0, s - 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [branchOpen, chapter, onClose]);

  if (!chapter) {
    return null;
  }

  const activeBeats = beatsAt(chapter, localSec);
  const activeByActor = new Map(activeBeats.map((b) => [b.actorId, b] as const));

  const handleBranchPick = (idx: number) => {
    if (!chapter.branchPoint) return;
    const next = nextChapterId(walkthrough, chapter.id, idx);
    if (!next) return;
    setBranchOpen(false);
    setChapterId(next);
    setPlaying(true);
  };

  const canonicalIndex = canonicalIds.indexOf(chapter.id);
  const progressPct = totalSec > 0 ? Math.round((localSec / totalSec) * 100) : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="walkthrough-title"
      className="fixed inset-0 z-[70] grid place-items-center bg-black/80 p-4"
    >
      <div
        ref={cardRef}
        className="bg-clinical-panel border border-clinical-border rounded-lg max-w-5xl w-full h-[88vh] max-h-[88vh] overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header — chapter title + chyron + close */}
        <header className="px-5 py-3 border-b border-clinical-border flex items-baseline justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-clinical-subtle flex items-center gap-1.5">
              <span>{t('walkthrough.tag')} · {walkthrough.title}</span>
              {machineAssisted && (
                <span
                  className="px-1 py-px rounded bg-amber-500/15 text-amber-300 normal-case tracking-normal"
                  title={t('walkthrough.machineAssisted.hint')}
                >
                  {t('walkthrough.machineAssisted')}
                </span>
              )}
            </div>
            <h2 id="walkthrough-title" className="text-sm font-semibold text-white">
              {chapter.title}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Renderer toggle — SVG (default) vs Phaser canvas (beta) */}
            <div className="flex rounded border border-clinical-border overflow-hidden text-[10px]">
              <button
                onClick={() => setRenderer('svg')}
                className={`px-2 py-1 ${renderer === 'svg' ? 'bg-clinical-accent text-white' : 'text-clinical-subtle hover:text-white'}`}
                aria-pressed={renderer === 'svg'}
                title="Vector stage (default)"
              >
                2D
              </button>
              <button
                onClick={() => setRenderer('phaser')}
                className={`px-2 py-1 ${renderer === 'phaser' ? 'bg-clinical-accent text-white' : 'text-clinical-subtle hover:text-white'}`}
                aria-pressed={renderer === 'phaser'}
                title="Phaser canvas renderer (beta) — tweened motion, particles, camera"
              >
                Cinematic ᴮᴱᵀᴬ
              </button>
              <button
                onClick={() => setRenderer('three')}
                className={`px-2 py-1 ${renderer === 'three' ? 'bg-clinical-accent text-white' : 'text-clinical-subtle hover:text-white'}`}
                aria-pressed={renderer === 'three'}
                title="Three.js WebGL renderer (beta) — physically-lit 3D sets, articulated characters"
              >
                3D ᴮᴱᵀᴬ
              </button>
            </div>
            <div className="text-right space-y-0.5">
              {chapter.timeOfDay && (
                <div className="text-[11px] font-mono text-amber-300">{chapter.timeOfDay}</div>
              )}
              {chapter.location && (
                <div className="text-[10px] text-clinical-subtle">{chapter.location}</div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-clinical-subtle hover:text-white text-base"
              aria-label={t('common.close')}
            >
              ✕
            </button>
          </div>
        </header>

        {/* Stage — SVG vector renderer (default) or Phaser canvas (beta) */}
        <div className="flex-1 grid grid-cols-1 grid-rows-[1fr_auto] md:grid-rows-none md:grid-cols-[1fr_260px] gap-0 min-h-0">
          <div className="relative bg-clinical-bg overflow-hidden">
            {renderer === 'phaser' || renderer === 'three' ? (
              <StageErrorBoundary onFallback={() => setRenderer('svg')}>
                <Suspense
                  fallback={
                    <div className="absolute inset-0 grid place-items-center text-[11px] text-clinical-subtle">
                      {renderer === 'three' ? 'Loading 3D renderer…' : 'Loading cinematic renderer…'}
                    </div>
                  }
                >
                  {renderer === 'three' ? (
                    <Lazy3DStage
                      walkthrough={walkthrough}
                      chapter={chapter}
                      activeByActor={activeByActor}
                      selectedActorId={selectedActorId}
                      onPickActor={(id) => setSelectedActorId(id)}
                    />
                  ) : (
                    <LazyPhaserStage
                      walkthrough={walkthrough}
                      chapter={chapter}
                      activeByActor={activeByActor}
                      selectedActorId={selectedActorId}
                      onPickActor={(id) => setSelectedActorId(id)}
                    />
                  )}
                </Suspense>
              </StageErrorBoundary>
            ) : (
              <Stage
                walkthrough={walkthrough}
                chapter={chapter}
                activeByActor={activeByActor}
                selectedActorId={selectedActorId}
                onPickActor={(id) => setSelectedActorId(id)}
              />
            )}
            {/* Procedural "b-roll" showpiece — plays above the stage during
                beats that declare one. Asset-free SVG by default; MP4 hook
                available for content owners. */}
            <ShowpieceOverlay activeBeats={activeBeats} />
            {branchOpen && chapter.branchPoint && (
              <BranchOverlay
                prompt={chapter.branchPoint.prompt}
                options={chapter.branchPoint.options}
                onPick={handleBranchPick}
              />
            )}
          </div>

          {/* Side panel — selected actor card or active beats list */}
          <aside className="border-t md:border-t-0 md:border-l border-clinical-border bg-clinical-bg/50 overflow-y-auto scrollbar-thin p-3 text-[11px] text-clinical-subtle space-y-3 max-h-[26vh] md:max-h-none">
            {selectedActorId ? (
              <ActorCard
                actor={walkthrough.actors[selectedActorId]}
                beat={activeByActor.get(selectedActorId)}
                onClose={() => setSelectedActorId(null)}
              />
            ) : (
              <ActiveBeats walkthrough={walkthrough} beats={activeBeats} />
            )}
          </aside>
        </div>

        {/* Footer — transport controls + scrubber */}
        <footer className="px-5 py-3 border-t border-clinical-border space-y-2 bg-clinical-panel">
          <div className="flex items-center gap-2 text-[11px]">
            <button
              onClick={() => setPlaying((p) => !p)}
              disabled={branchOpen}
              className="tap-target px-3 py-1.5 rounded bg-clinical-accent text-white font-semibold disabled:opacity-40"
              aria-pressed={playing}
            >
              {playing ? t('walkthrough.pause') : t('walkthrough.play')}
            </button>
            <button
              onClick={() => {
                setLocalSec(0);
                setPlaying(false);
              }}
              disabled={branchOpen}
              className="px-2 py-1.5 rounded border border-clinical-border text-clinical-subtle hover:text-white disabled:opacity-40"
            >
              {t('walkthrough.restartChapter')}
            </button>
            <span className="ml-auto font-mono text-[10px] text-clinical-subtle">
              {formatSec(localSec)} / {formatSec(totalSec)} · {progressPct}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={totalSec}
            step={0.1}
            value={localSec}
            disabled={branchOpen}
            onChange={(e) => {
              setLocalSec(Number(e.target.value));
              setPlaying(false);
            }}
            className="w-full accent-clinical-accent"
            aria-label={t('walkthrough.scrub')}
          />
          {/* Chapter strip — canonical linear path; branches show as forks */}
          <div className="flex gap-1 overflow-x-auto scrollbar-thin">
            {canonicalIds.map((id, i) => {
              const c = walkthrough.chapters[id];
              if (!c) return null;
              const active = id === chapter.id;
              return (
                <button
                  key={id}
                  onClick={() => {
                    setChapterId(id);
                  }}
                  className={`shrink-0 px-2 py-1 rounded text-[10px] border ${
                    active
                      ? 'border-clinical-accent text-white bg-clinical-accent/20'
                      : 'border-clinical-border text-clinical-subtle hover:text-white'
                  }`}
                  title={c.title}
                >
                  {i + 1}. {c.title}
                </button>
              );
            })}
            {/* Off-canonical (branch) chapters appear after a divider so the
                learner can jump back to a branch they already entered. */}
            {Object.values(walkthrough.chapters)
              .filter((c) => !canonicalIds.includes(c.id))
              .map((c) => {
                const active = c.id === chapter.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setChapterId(c.id)}
                    className={`shrink-0 px-2 py-1 rounded text-[10px] border italic ${
                      active
                        ? 'border-amber-400 text-amber-200 bg-amber-400/10'
                        : 'border-amber-400/40 text-amber-300 hover:text-amber-200'
                    }`}
                    title={c.title}
                  >
                    ⤴ {c.title}
                  </button>
                );
              })}
          </div>
          <p className="text-[10px] text-clinical-subtle">{t('walkthrough.kbHint')}</p>
          {canonicalIndex >= 0 && (
            <p className="text-[10px] text-clinical-subtle">
              {t('walkthrough.canonicalCounter', {
                n: canonicalIndex + 1,
                total: canonicalIds.length,
              })}
            </p>
          )}
        </footer>
      </div>
    </div>
  );
}

/* ── Stage — cinematic scene composition (v9.8) ───────────────────────── *
 * Replaces the v9.4–v9.7 team-row grid. Renders the chapter's SceneBackground
 * environment, then stages only the *present* actors in the space with depth
 * scaling, ground shadows, poses, expressions, and a single "current line"
 * speech bubble for the lead beat. Reads as a directed shot rather than a
 * roster. */

interface StageProps {
  walkthrough: Walkthrough;
  chapter: WalkthroughChapter;
  activeByActor: Map<string, WalkthroughBeat>;
  selectedActorId: string | null;
  onPickActor: (id: string) => void;
}

function Stage({ walkthrough, chapter, activeByActor, selectedActorId, onPickActor }: StageProps) {
  const scene: SceneId = chapter.scene ?? 'resus';

  // Animation tick — 6 fps drives the interaction loop and walk cycle.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(
      () => setTick((t) => (t + 1) % (INTERACTION_FRAMES * WALK_FRAMES * 6)),
      150,
    );
    return () => window.clearInterval(id);
  }, []);

  // Shared staging geometry (same as the Phaser renderer uses).
  const { figures: staged, leadId } = stageFigures(walkthrough, chapter, activeByActor, selectedActorId);
  const leadBeat = leadId ? activeByActor.get(leadId) : undefined;
  const lead = leadId && leadBeat ? { id: leadId, beat: leadBeat } : null;

  return (
    <svg
      viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
      className="w-full h-full"
      aria-label="walkthrough stage"
      style={{ shapeRendering: 'crispEdges' }}
    >
      <defs>
        {/* soft focus glow behind whoever is currently speaking */}
        <radialGradient id="lead-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde68a" stopOpacity={0.34} />
          <stop offset="60%" stopColor="#fde68a" stopOpacity={0.1} />
          <stop offset="100%" stopColor="#fde68a" stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* Environment — v9.14 assets-heavy: load the pre-baked HD PNG when
       *  available (sharper, gradient-rich) and fall back to inline SVG if
       *  the asset is missing. */}
      <UltraBackground scene={scene} />

      {/* Staged figures */}
      {staged.map(({ actor, beat, x, y, scale, isActive, isSelected }) => {
        const figScale = 34 * scale;
        const isLead = actor.id === leadId;
        const walking = beat?.walking ?? false;
        // SVG parity with Phaser (v9.10): glide figures between beat positions
        // via a CSS transform transition. Walking beats use a longer ease so
        // they read as a traversal rather than a glide-in.
        const moveCss = {
          transform: `translate(${x}px, ${y}px)`,
          transition: `transform ${walking ? 850 : 450}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        } as const;
        return (
          <g
            key={actor.id}
            style={moveCss}
            className="cursor-pointer"
            onClick={() => onPickActor(actor.id)}
            aria-label={`${actor.role}${beat ? `: ${beat.action}` : ''}`}
          >
            {/* focus glow behind the speaker */}
            {isLead && (
              <ellipse
                cx={0}
                cy={-figScale * 0.45}
                rx={figScale * 0.95}
                ry={figScale * 1.05}
                fill="url(#lead-halo)"
              />
            )}
            {/* contact shadow */}
            <GroundShadow x={0} y={2} rx={9 * scale} opacity={isActive ? 0.34 : 0.2} />
            {/* selection / active ring on the floor */}
            {(isActive || isSelected) && (
              <ellipse
                cx={0}
                cy={2}
                rx={13 * scale}
                ry={4.5 * scale}
                fill="none"
                stroke={isSelected ? '#ffffff' : actor.swatch ?? '#fde68a'}
                strokeWidth={isSelected ? 1.6 : 1.1}
                opacity={0.85}
              />
            )}
            {/* pulsing ring marks the current speaker */}
            {isLead && !isSelected && (
              <ellipse cx={0} cy={2} rx={15 * scale} ry={5 * scale} fill="none" stroke="#fde68a" strokeWidth={1.4}>
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="rx" values={`${13 * scale};${17 * scale};${13 * scale}`} dur="1.5s" repeatCount="indefinite" />
              </ellipse>
            )}
            {/* sprite — anchored so feet sit on (0,0) */}
            <g transform={`translate(0,${-figScale / 2})`} opacity={isActive ? 1 : 0.5}>
              <ActorSprite
                actor={actor}
                size={figScale}
                direction={beat?.direction ?? 'S'}
                pose={beat?.pose ?? 'stand'}
                expression={beat?.expression ?? 'neutral'}
                interactionFrame={isActive ? tick % INTERACTION_FRAMES : undefined}
                walkFrame={isActive && beat?.walking ? tick % WALK_FRAMES : undefined}
                speaking={isActive && actor.id === leadId}
              />
            </g>
            {/* small name tag — skipped for the lead (named in the bubble) */}
            {!isLead && (
              <text
                y={10}
                textAnchor="middle"
                fontSize={5.5}
                fill={isActive ? '#fff' : '#cbd5e1'}
                stroke="#000"
                strokeWidth={0.4}
                paintOrder="stroke"
                fontFamily="ui-monospace, monospace"
              >
                {actor.role.length > 16 ? actor.role.slice(0, 16) + '…' : actor.role}
              </text>
            )}
          </g>
        );
      })}

      {/* Current line of dialogue — pinned to the top "broadcast" band so it
       * never occludes the figures (which live below the horizon). A faint
       * stem links it to the speaker's head; the speaker also pulses. */}
      {lead && (() => {
        const s = staged.find((st) => st.actor.id === lead!.id);
        if (!s) return null;
        const figScale = 34 * s.scale;
        const bw = 200;
        const bh = 52;
        const bx = Math.max(bw / 2 + 4, Math.min(STAGE_W - bw / 2 - 4, s.x));
        const by = 8;
        const headY = s.y - figScale; // top of the speaker's head
        return (
          <g key="lead-bubble" pointerEvents="none">
            {/* stem from bubble down to the speaker's head */}
            <line
              x1={bx}
              y1={by + bh}
              x2={s.x}
              y2={headY - 2}
              stroke="#fde68a"
              strokeWidth={0.6}
              strokeDasharray="2 2"
              opacity={0.5}
            />
            <circle cx={s.x} cy={headY - 2} r={1.4} fill="#fde68a" opacity={0.8} />
            <foreignObject x={bx - bw / 2} y={by} width={bw} height={bh}>
              <div className="text-[8px] leading-snug text-white bg-black/80 border border-amber-300/40 rounded-md px-2 py-1 text-center shadow-xl">
                <span className="text-amber-300 font-semibold">{walkthrough.actors[lead!.id]?.role}: </span>
                {lead!.beat.action}
              </div>
            </foreignObject>
          </g>
        );
      })()}

      {/* Audio cue text indicator (v9.16+). When the lead beat declares an
       *  `sfx` string, render it as a floating onomatopoeia near the speaker
       *  — comic-book style. Drifts up + fades, looping every 1.6s. */}
      {lead?.beat.sfx && (() => {
        const s = staged.find((st) => st.actor.id === lead.id);
        if (!s) return null;
        const headY = s.y - 34 * s.scale;
        return (
          <g key={`sfx-${lead.id}-${lead.beat.at}`} pointerEvents="none">
            <text
              x={s.x + 16}
              y={headY - 4}
              fontSize={9}
              fontFamily="ui-monospace, monospace"
              fontWeight="bold"
              fill="#fbbf24"
              stroke="#000"
              strokeWidth={0.6}
              paintOrder="stroke"
              style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))' }}
            >
              <animate attributeName="opacity" values="0;1;1;0" dur="1.6s" repeatCount="indefinite" />
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 4; 0 -8; 0 -12"
                dur="1.6s"
                repeatCount="indefinite"
              />
              {lead.beat.sfx}
            </text>
          </g>
        );
      })()}
    </svg>
  );
}

/** Assets-heavy backdrop (v9.14+). Renders the pre-baked HD PNG when it
 *  loads cleanly; gracefully falls back to the inline-SVG scene if the
 *  asset isn't found (development without `pnpm bake:scenes`, or a PWA
 *  cache miss). The fallback keeps everything offline-capable. */
function UltraBackground({ scene }: { scene: SceneId }) {
  const [pngFailed, setPngFailed] = useState(false);
  // Reset on scene change so we re-attempt the new PNG.
  useEffect(() => setPngFailed(false), [scene]);
  if (pngFailed) {
    return <SceneBackground scene={scene} />;
  }
  // Vite serves /public assets from root; production base path is '/'.
  const href = `${import.meta.env.BASE_URL ?? '/'}walkthrough/scenes/${scene}.png`.replace('//', '/');
  return (
    <image
      href={href}
      x={0}
      y={0}
      width={STAGE_W}
      height={STAGE_H}
      preserveAspectRatio="xMidYMid slice"
      onError={() => setPngFailed(true)}
    />
  );
}

function BranchOverlay({
  prompt,
  options,
  onPick,
}: {
  prompt: string;
  options: { label: string; hint?: string }[];
  onPick: (idx: number) => void;
}) {
  return (
    <div className="absolute inset-0 bg-black/75 grid place-items-center p-6 z-10">
      <div className="bg-clinical-panel border border-clinical-accent rounded-lg max-w-lg w-full p-4 space-y-3 shadow-2xl">
        <div className="text-[10px] uppercase tracking-wider text-clinical-accent">
          ⤴ Decision point
        </div>
        <p className="text-sm text-white font-semibold leading-snug">{prompt}</p>
        <div className="space-y-2">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => onPick(i)}
              className="w-full text-left px-3 py-2 rounded border border-clinical-border bg-clinical-bg hover:bg-clinical-accent/10 hover:border-clinical-accent"
            >
              <div className="text-[12px] font-semibold text-white">{opt.label}</div>
              {opt.hint && (
                <div className="text-[10px] text-clinical-subtle mt-0.5">{opt.hint}</div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActorCard({
  actor,
  beat,
  onClose,
}: {
  actor: WalkthroughActor | undefined;
  beat: WalkthroughBeat | undefined;
  onClose: () => void;
}) {
  if (!actor) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
            {TEAM_LABEL[actor.team] ?? actor.team}
          </div>
          <div className="text-[13px] font-semibold text-white">{actor.role}</div>
        </div>
        <button
          onClick={onClose}
          className="text-clinical-subtle hover:text-white"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <p className="text-[11px] leading-snug text-white/85">{actor.bio}</p>
      {beat && (
        <div className="border-t border-clinical-border pt-2">
          <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
            Right now
          </div>
          <p className="text-[11px] leading-snug text-white">{beat.action}</p>
        </div>
      )}
    </div>
  );
}

function ActiveBeats({
  walkthrough,
  beats,
}: {
  walkthrough: Walkthrough;
  beats: WalkthroughBeat[];
}) {
  if (beats.length === 0) {
    return <p className="italic">No active beats yet — scrub forward.</p>;
  }
  return (
    <div className="space-y-2">
      <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
        On-screen now
      </div>
      <ul className="space-y-1.5">
        {beats.map((b) => {
          const a = walkthrough.actors[b.actorId];
          return (
            <li
              key={`${b.actorId}-${b.at}`}
              className="border-l-2 pl-2"
              style={{ borderColor: a?.swatch ?? '#475569' }}
            >
              <div className="text-[11px] text-white font-semibold">
                {a?.role ?? b.actorId}
              </div>
              <div className="text-[10px] text-clinical-subtle">{b.action}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function formatSec(s: number): string {
  const total = Math.max(0, Math.round(s));
  const m = Math.floor(total / 60);
  const ss = String(total % 60).padStart(2, '0');
  return `${m}:${ss}`;
}

/** Keeps a Phaser mount failure from ever taking down the modal — falls back
 *  to the SVG renderer with a one-tap recovery. */
class StageErrorBoundary extends Component<
  { onFallback: () => void; children: ReactNode },
  { failed: boolean }
> {
  constructor(props: { onFallback: () => void; children: ReactNode }) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="absolute inset-0 grid place-items-center text-center text-[11px] text-clinical-subtle p-4">
          <div>
            Cinematic renderer unavailable on this device.{' '}
            <button onClick={this.props.onFallback} className="underline text-clinical-accent">
              Switch to 2D
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
