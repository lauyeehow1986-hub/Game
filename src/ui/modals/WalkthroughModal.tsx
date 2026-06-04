import { useEffect, useMemo, useRef, useState } from 'react';
import { useFocusTrap } from '../../lib/use-focus-trap';
import { useT } from '../../lib/i18n';
import {
  beatsAt,
  canonicalChapterIds,
  chapterOf,
  nextChapterId,
  type Walkthrough,
  type WalkthroughActor,
  type WalkthroughBeat,
} from '../../lib/walkthrough';
import { ActorSprite, INTERACTION_FRAMES, WALK_FRAMES } from '../../lib/sprite-generator';

interface Props {
  walkthrough: Walkthrough;
  onClose: () => void;
}

const PLAY_TICK_MS = 100; // 10 fps is plenty for prose beats

const TEAM_ROW: Record<string, number> = {
  patient: 0,
  bystander: 1,
  'first-responder': 1,
  ambulance: 2,
  ed: 3,
  cath: 3,
  ward: 4,
  rehab: 4,
  outpatient: 4,
  support: 5,
};

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
export function WalkthroughModal({ walkthrough, onClose }: Props) {
  const t = useT();
  const cardRef = useFocusTrap<HTMLDivElement>(true);

  const [chapterId, setChapterId] = useState(walkthrough.startChapterId);
  const [localSec, setLocalSec] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [selectedActorId, setSelectedActorId] = useState<string | null>(null);
  /** Branch overlay shown when a chapter with a branchPoint reaches its end. */
  const [branchOpen, setBranchOpen] = useState(false);

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
        className="bg-clinical-panel border border-clinical-border rounded-lg max-w-5xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header — chapter title + chyron + close */}
        <header className="px-5 py-3 border-b border-clinical-border flex items-baseline justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
              {t('walkthrough.tag')} · {walkthrough.title}
            </div>
            <h2 id="walkthrough-title" className="text-sm font-semibold text-white">
              {chapter.title}
            </h2>
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
        </header>

        {/* Stage — SVG actor placements (replaced by Phaser in v9.5) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-0 min-h-0">
          <div className="relative bg-clinical-bg overflow-hidden">
            <Stage
              walkthrough={walkthrough}
              activeByActor={activeByActor}
              selectedActorId={selectedActorId}
              onPickActor={(id) => setSelectedActorId(id)}
            />
            {branchOpen && chapter.branchPoint && (
              <BranchOverlay
                prompt={chapter.branchPoint.prompt}
                options={chapter.branchPoint.options}
                onPick={handleBranchPick}
              />
            )}
          </div>

          {/* Side panel — selected actor card or active beats list */}
          <aside className="border-l border-clinical-border bg-clinical-bg/50 overflow-y-auto scrollbar-thin p-3 text-[11px] text-clinical-subtle space-y-3">
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

/* ── Stage (SVG placeholder — replaced by Phaser in v9.5) ─────────────── */

interface StageProps {
  walkthrough: Walkthrough;
  activeByActor: Map<string, WalkthroughBeat>;
  selectedActorId: string | null;
  onPickActor: (id: string) => void;
}

function Stage({ walkthrough, activeByActor, selectedActorId, onPickActor }: StageProps) {
  // Lay actors in horizontal rows by team, ordered left-to-right by id.
  const grouped = new Map<number, WalkthroughActor[]>();
  for (const a of Object.values(walkthrough.actors)) {
    const row = TEAM_ROW[a.team] ?? 5;
    const list = grouped.get(row) ?? [];
    list.push(a);
    grouped.set(row, list);
  }
  for (const list of grouped.values()) list.sort((a, b) => a.id.localeCompare(b.id));

  const rows = [...grouped.keys()].sort((a, b) => a - b);

  // Animation tick — 6 fps drives the universal interaction loop and walk
  // cycle. Both loops are short (6 / 4 frames) and the frame counter wraps
  // forever; selecting modulo by frame count inside each sprite is cheap.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => (t + 1) % (INTERACTION_FRAMES * WALK_FRAMES * 6)), 150);
    return () => window.clearInterval(id);
  }, []);

  return (
    <svg
      viewBox="0 0 480 270"
      className="w-full h-full"
      aria-label="walkthrough stage"
      style={{ imageRendering: 'pixelated' as const, shapeRendering: 'crispEdges' }}
    >
      <defs>
        <linearGradient id="stage-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0c1a2b" />
          <stop offset="100%" stopColor="#050b16" />
        </linearGradient>
      </defs>
      <rect width="480" height="270" fill="url(#stage-bg)" />
      {rows.map((rowIdx, i) => {
        const list = grouped.get(rowIdx) ?? [];
        const y = 30 + i * 38;
        return (
          <g key={rowIdx}>
            <text
              x="6"
              y={y - 12}
              fontSize="8"
              fill="#94a3b8"
              fontFamily="ui-monospace, monospace"
            >
              {TEAM_LABEL[Object.entries(TEAM_ROW).find(([, v]) => v === rowIdx)?.[0] ?? ''] ?? ''}
            </text>
            {list.map((actor, j) => {
              const x = 70 + j * 70;
              const beat = activeByActor.get(actor.id);
              const isActive = !!beat;
              const isSelected = actor.id === selectedActorId;
              return (
                <g
                  key={actor.id}
                  transform={`translate(${x},${y})`}
                  className="cursor-pointer"
                  onClick={() => onPickActor(actor.id)}
                  aria-label={`${actor.role}${beat ? `: ${beat.action}` : ''}`}
                >
                  {/* Active / selected glow halo behind the sprite */}
                  {(isActive || isSelected) && (
                    <circle
                      r="15"
                      fill={isActive ? `${actor.swatch ?? '#475569'}44` : 'transparent'}
                      stroke={isSelected ? '#fff' : '#fde68a'}
                      strokeWidth={isSelected ? 1.4 : 0.9}
                    />
                  )}
                  {/* Generated character sprite (v9.7 — HD pixel art, animated) */}
                  <g opacity={isActive ? 1 : 0.55}>
                    <ActorSprite
                      actor={actor}
                      size={28}
                      direction={beat?.direction ?? 'S'}
                      interactionFrame={isActive ? tick % INTERACTION_FRAMES : undefined}
                      walkFrame={isActive && beat?.walking ? tick % WALK_FRAMES : undefined}
                    />
                  </g>
                  <text
                    y="22"
                    textAnchor="middle"
                    fontSize="6.5"
                    fill={isActive ? '#fff' : '#94a3b8'}
                    fontFamily="ui-monospace, monospace"
                  >
                    {actor.role.length > 14 ? actor.role.slice(0, 14) + '…' : actor.role}
                  </text>
                  {isActive && (
                    <foreignObject x="-78" y="28" width="156" height="44">
                      <div className="text-[8px] leading-tight text-white/90 bg-clinical-panel/90 border border-clinical-border rounded px-1.5 py-1 text-center">
                        {beat?.action}
                      </div>
                    </foreignObject>
                  )}
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
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
