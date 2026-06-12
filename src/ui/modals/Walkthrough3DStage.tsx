/**
 * Walkthrough3DStage — React host for the Three.js renderer (v9.17).
 *
 * Mirrors WalkthroughPhaserStage: computes frames from the SAME shared
 * staging geometry (`walkthrough-staging.ts`) and feeds them to the Stage3D
 * engine. Lazy-loaded by WalkthroughModal so Three.js only enters the bundle
 * when the user opts into 3D mode.
 *
 * Because text rendered onto a WebGL canvas is blurry and unstylable, the
 * caption ("broadcast band") and the beat SFX indicator are DOM overlays on
 * top of the canvas — same film grammar as the SVG stage, crisper than
 * canvas text.
 */
import { useEffect, useRef, useState } from 'react';
import { Stage3D, type Figure3D, type Frame3D } from '../../game3d/Stage3D';
import { isWebGPUOptedIn, isWebGPUSupported, resolveBackend, setWebGPUOptedIn } from '../../game3d/webgpu';
import { stageFigures } from '../../lib/walkthrough-staging';
import type { SceneId } from '../../lib/scenery';
import type { Walkthrough, WalkthroughBeat, WalkthroughChapter } from '../../lib/walkthrough';

interface Props {
  walkthrough: Walkthrough;
  chapter: WalkthroughChapter;
  activeByActor: Map<string, WalkthroughBeat>;
  selectedActorId: string | null;
  onPickActor: (id: string) => void;
}

export default function Walkthrough3DStage({
  walkthrough,
  chapter,
  activeByActor,
  selectedActorId,
  onPickActor,
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<Stage3D | null>(null);
  const onPickRef = useRef(onPickActor);
  onPickRef.current = onPickActor;
  const prevLead = useRef<string>('');
  // Cinematic grade (SSAO + bloom + vignette + SMAA) ON by default — the
  // walkthrough is a "watch", not an interactive game loop, so the ~15-25%
  // frame cost buys a much richer image. WebGL-only; the toggle still lets a
  // low-end device drop it. (Visual-research loop iter 3.)
  const [postFx, setPostFx] = useState(true);
  // WebGPU opt-in (v9.18): only meaningful where navigator.gpu exists;
  // Stage3D.create falls back to WebGL whenever adapter/init fails.
  const [webgpu, setWebgpu] = useState(() => isWebGPUOptedIn() && isWebGPUSupported());
  const [liveBackend, setLiveBackend] = useState<'webgl' | 'webgpu'>('webgl');

  useEffect(() => {
    if (!hostRef.current) return;
    let cancelled = false;
    const host = hostRef.current;
    void Stage3D.create(host, { backend: resolveBackend(webgpu, isWebGPUSupported()) }).then((stage) => {
      if (cancelled) {
        stage.dispose();
        return;
      }
      stage.setPick((id) => onPickRef.current(id));
      stageRef.current = stage;
      setLiveBackend(stage.backend);
    });
    return () => {
      cancelled = true;
      stageRef.current?.dispose();
      stageRef.current = null;
    };
  }, [webgpu]);

  useEffect(() => {
    stageRef.current?.setPostFxEnabled(postFx && liveBackend === 'webgl');
  }, [postFx, liveBackend]);

  const { figures, leadId } = stageFigures(walkthrough, chapter, activeByActor, selectedActorId);
  const leadBeat = leadId ? activeByActor.get(leadId) : undefined;

  useEffect(() => {
    const figs: Figure3D[] = figures.map((fig) => ({
      id: fig.actor.id,
      actor: fig.actor,
      x: fig.x,
      y: fig.y,
      pose: fig.beat?.pose ?? 'stand',
      expression: fig.beat?.expression ?? 'neutral',
      facing: fig.beat?.direction ?? 'S',
      walking: !!fig.beat?.walking,
      speaking: fig.isLead && fig.isActive,
      isActive: fig.isActive,
      isLead: fig.isLead,
      isSelected: fig.isSelected,
    }));

    const leadKey = leadId && leadBeat ? `${leadId}@${leadBeat.at}` : '';
    const shake = leadKey !== prevLead.current && !!leadBeat && /shock/i.test(leadBeat.action);
    prevLead.current = leadKey;

    const frame: Frame3D = {
      scene: (chapter.scene ?? 'resus') as SceneId,
      figures: figs,
      shake,
    };
    stageRef.current?.setFrame(frame);
  });

  const leadRole = leadId ? walkthrough.actors[leadId]?.role ?? '' : '';

  return (
    <div className="relative w-full h-full" aria-label="walkthrough stage (3D)">
      <div ref={hostRef} className="absolute inset-0" />
      {/* PostFX toggle — SSAO + bloom + vignette + SMAA (WebGL only) */}
      {liveBackend === 'webgl' && (
        <button
          type="button"
          onClick={() => setPostFx((v) => !v)}
          aria-pressed={postFx}
          className={`absolute bottom-2 right-2 z-10 px-2 py-1 rounded border text-[10px] uppercase tracking-wider transition-colors ${
            postFx
              ? 'bg-amber-300/90 border-amber-300 text-black'
              : 'bg-black/60 border-amber-300/40 text-amber-200 hover:bg-black/80'
          }`}
          title="Postprocessing: ambient occlusion + bloom + vignette (heavier)"
        >
          {postFx ? 'PostFX on' : 'PostFX off'}
        </button>
      )}
      {/* WebGPU opt-in — shown only when the browser exposes navigator.gpu */}
      {isWebGPUSupported() && (
        <button
          type="button"
          onClick={() => {
            const next = !webgpu;
            setWebGPUOptedIn(next);
            setWebgpu(next);
          }}
          aria-pressed={webgpu}
          className={`absolute bottom-2 right-24 z-10 px-2 py-1 rounded border text-[10px] uppercase tracking-wider transition-colors ${
            liveBackend === 'webgpu'
              ? 'bg-sky-300/90 border-sky-300 text-black'
              : 'bg-black/60 border-sky-300/40 text-sky-200 hover:bg-black/80'
          }`}
          title="Render via WebGPU (beta). PostFX and HDR image-based lighting stay on the WebGL path; falls back to WebGL if the adapter fails."
        >
          {liveBackend === 'webgpu' ? 'WebGPU on' : 'WebGPU β'}
        </button>
      )}
      {/* broadcast caption band — same grammar as the SVG stage bubble */}
      {leadBeat && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 max-w-[85%] px-3 py-1.5 rounded bg-black/70 border border-amber-300/40 backdrop-blur-[2px] pointer-events-none">
          <span className="text-[10px] uppercase tracking-wider text-amber-300 font-semibold mr-2">
            {leadRole}
          </span>
          <span className="text-[11px] text-white/95">{leadBeat.action}</span>
        </div>
      )}
      {/* floating SFX onomatopoeia */}
      {leadBeat?.sfx && (
        <div
          key={`${leadId}@${leadBeat.at}`}
          className="absolute top-12 left-1/2 -translate-x-1/2 text-lg font-bold text-amber-200 drop-shadow-[0_0_6px_rgba(0,0,0,0.8)] animate-bounce pointer-events-none"
          aria-hidden="true"
        >
          {leadBeat.sfx}
        </div>
      )}
    </div>
  );
}
