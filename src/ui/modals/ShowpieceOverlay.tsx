/**
 * ShowpieceOverlay — picks the active "b-roll" beat (if any) and renders its
 * inline-SVG or MP4 showpiece above the stage, regardless of which renderer
 * (SVG `<Stage>` or Phaser canvas) is mounted below. Mounted as a sibling
 * inside the modal's relative stage container.
 *
 * Visual treatment: a centred 70%-width framed panel over a soft scrim, with a
 * gold title bar and a subtitle. Fades in/out (CSS transition) so the cut
 * between staged action and showpiece reads as a film-grammar B-roll insert,
 * not a hard jump-cut.
 *
 * MP4 failures (404 / unsupported codec) silently fall back to no overlay so
 * the stage action continues — the showpiece is decorative, never essential.
 */
import { useEffect, useMemo, useState } from 'react';
import type { BeatShowpiece, WalkthroughBeat } from '../../lib/walkthrough';
import { SHOWPIECES, ShowpieceArt } from '../../lib/showpieces';

interface Props {
  activeBeats: WalkthroughBeat[];
}

export function ShowpieceOverlay({ activeBeats }: Props) {
  /* Pick the latest-fired active beat that declares a showpiece. */
  const beat = useMemo(() => {
    let pick: WalkthroughBeat | undefined;
    for (const b of activeBeats) {
      if (!b.showpiece) continue;
      if (!pick || b.at > pick.at) pick = b;
    }
    return pick;
  }, [activeBeats]);

  /* Track the showpiece for fade-out: keep the previous one mounted briefly
   * after `beat` goes away so the panel can transition out instead of popping. */
  const [shown, setShown] = useState<BeatShowpiece | undefined>(beat?.showpiece);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (beat?.showpiece) {
      setShown(beat.showpiece);
      const id = window.setTimeout(() => setVisible(true), 10);
      return () => window.clearTimeout(id);
    }
    setVisible(false);
    const id = window.setTimeout(() => setShown(undefined), 280);
    return () => window.clearTimeout(id);
  }, [beat]);

  const [videoFailed, setVideoFailed] = useState(false);
  useEffect(() => {
    setVideoFailed(false);
  }, [shown && shown.kind === 'mp4' ? shown.src : null]);

  if (!shown) return null;
  if (shown.kind === 'mp4' && videoFailed) return null;

  const meta = shown.kind === 'svg' ? SHOWPIECES[shown.id] : null;
  const title = shown.title ?? meta?.title ?? '';
  const caption = shown.caption ?? meta?.caption ?? '';

  return (
    <div
      className={`absolute inset-0 z-20 grid place-items-center transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
      aria-hidden={!visible}
      style={{ pointerEvents: 'none' }}
    >
      {/* dimming scrim */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px]" />
      {/* framed panel */}
      <div className="relative w-[78%] max-w-[560px] aspect-[16/9] bg-clinical-bg border border-amber-300/40 rounded-md shadow-2xl overflow-hidden">
        {/* title bar */}
        <div className="absolute top-0 left-0 right-0 px-3 py-1.5 bg-black/65 border-b border-amber-300/30 flex items-baseline justify-between">
          <span className="text-[10px] uppercase tracking-wider text-amber-300 font-semibold">{title}</span>
          <span className="text-[9px] font-mono text-clinical-subtle">B-ROLL</span>
        </div>
        {/* body */}
        <div className="absolute inset-0 pt-7 pb-6">
          {shown.kind === 'svg' ? (
            <ShowpieceArt id={shown.id} />
          ) : (
            <video
              src={shown.src}
              poster={shown.poster}
              autoPlay
              muted
              playsInline
              loop={shown.loop ?? true}
              onError={() => setVideoFailed(true)}
              className="w-full h-full object-contain bg-black"
            />
          )}
        </div>
        {/* caption */}
        {caption && (
          <div className="absolute bottom-0 left-0 right-0 px-3 py-1 bg-black/65 border-t border-amber-300/20">
            <span className="text-[10px] text-white/90 leading-tight">{caption}</span>
          </div>
        )}
      </div>
    </div>
  );
}
