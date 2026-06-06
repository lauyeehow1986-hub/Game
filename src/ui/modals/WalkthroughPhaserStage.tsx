/**
 * WalkthroughPhaserStage — React host for the Phaser canvas renderer (v9.9,
 * beta). Mounts a Phaser.Game running WalkthroughScene and feeds it a frame
 * (computed from the SAME shared staging geometry the SVG `<Stage>` uses)
 * whenever the chapter / time / selection changes.
 *
 * Lazy-loaded by WalkthroughModal so Phaser (and react-dom/server, used to
 * bake the scene texture) only enter the bundle when the user opts into
 * Cinematic mode — the default SVG renderer stays untouched.
 */
import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import {
  WalkthroughScene,
  type PhaserFrame,
  type PhaserFigure,
} from '../../game/walkthrough/WalkthroughScene';
import { stageFigures } from '../../lib/walkthrough-staging';
import { deriveFeatures } from '../../lib/sprite-generator';
import { STAGE_W, STAGE_H, type SceneId } from '../../lib/scenery';
import type { Walkthrough, WalkthroughBeat, WalkthroughChapter } from '../../lib/walkthrough';

interface Props {
  walkthrough: Walkthrough;
  chapter: WalkthroughChapter;
  activeByActor: Map<string, WalkthroughBeat>;
  selectedActorId: string | null;
  onPickActor: (id: string) => void;
}

export default function WalkthroughPhaserStage({
  walkthrough,
  chapter,
  activeByActor,
  selectedActorId,
  onPickActor,
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<WalkthroughScene | null>(null);
  const latestFrame = useRef<PhaserFrame | null>(null);
  const onPickRef = useRef(onPickActor);
  onPickRef.current = onPickActor;
  const prevLead = useRef<string>('');

  useEffect(() => {
    if (!hostRef.current || gameRef.current) return;
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: hostRef.current,
      backgroundColor: '#0b1320',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: STAGE_W,
        height: STAGE_H,
      },
      scene: [WalkthroughScene],
      banner: false,
    });
    gameRef.current = game;

    const attach = () => {
      const s = game.scene.getScene(WalkthroughScene.KEY) as WalkthroughScene | null;
      if (!s) return;
      sceneRef.current = s;
      s.setPick((id) => onPickRef.current(id));
      if (latestFrame.current) s.setFrame(latestFrame.current);
    };
    game.events.once(Phaser.Core.Events.READY, attach);

    return () => {
      game.destroy(true);
      gameRef.current = null;
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    const { figures, leadId } = stageFigures(walkthrough, chapter, activeByActor, selectedActorId);
    const figs: PhaserFigure[] = figures.map((fig) => {
      const ft = deriveFeatures(fig.actor);
      return {
        id: fig.actor.id,
        x: fig.x,
        y: fig.y,
        scale: fig.scale,
        swatch: fig.actor.swatch ?? '#475569',
        skin: ft.skin,
        role: fig.actor.role,
        pose: fig.beat?.pose ?? 'stand',
        facing: fig.beat?.direction ?? 'S',
        isActive: fig.isActive,
        isLead: fig.isLead,
        isSelected: fig.isSelected,
      };
    });

    const leadBeat = leadId ? activeByActor.get(leadId) : undefined;
    const leadFig = figures.find((f) => f.actor.id === leadId);
    const caption =
      leadId && leadBeat && leadFig
        ? { role: walkthrough.actors[leadId]?.role ?? '', action: leadBeat.action, x: leadFig.x }
        : null;

    const leadKey = leadId && leadBeat ? `${leadId}@${leadBeat.at}` : '';
    const shake = leadKey !== prevLead.current && !!leadBeat && /shock/i.test(leadBeat.action);
    prevLead.current = leadKey;

    const frame: PhaserFrame = {
      scene: (chapter.scene ?? 'resus') as SceneId,
      figures: figs,
      caption,
      shake,
    };
    latestFrame.current = frame;
    sceneRef.current?.setFrame(frame);
  }, [walkthrough, chapter, activeByActor, selectedActorId]);

  return <div ref={hostRef} className="w-full h-full" aria-label="walkthrough stage (cinematic)" />;
}
