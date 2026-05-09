import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { HospitalScene, pushOpsBadges, type OpsBadgePayload } from './scenes/HospitalScene';
import { useOps } from '../state/opsStore';
import { useMode } from '../state/modeStore';
import { useGame } from '../state/gameStore';
import { bus, Events } from '../lib/events';
import type { OpsDepartmentId, OpsState } from '../lib/ops';

interface Props {
  className?: string;
}

const OPS_DEPTS: OpsDepartmentId[] = ['triage', 'ed', 'imaging', 'ot', 'ward'];

function snapshotBadges(state: OpsState): OpsBadgePayload {
  const byDept: OpsBadgePayload['byDept'] = {};
  for (const id of OPS_DEPTS) {
    const dept = state.departments[id];
    const queue = state.queues[id].length;
    const occ = state.patients.filter(
      (p) => !p.done && p.route[p.step] === id && !state.queues[id].includes(p.id),
    ).length;
    byDept[id] = { occ, cap: dept.capacity, queue, open: dept.open };
  }
  return { byDept };
}

export function PhaserGame({ className }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!hostRef.current || gameRef.current) return;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: hostRef.current,
      backgroundColor: '#0b1320',
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [BootScene, HospitalScene],
      banner: false,
    });
    gameRef.current = game;

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  // Push ops badges into the canvas while in ops mode.
  useEffect(() => {
    let lastMode = useMode.getState().mode;
    let unsubOps: (() => void) | null = null;
    let unsubMode: (() => void) | null = null;

    const wireOps = () => {
      // Force the canvas to TTSH while in ops mode.
      useGame.getState().viewFacility('ttsh');
      bus.emit(Events.FacilityChanged, { facilityId: 'ttsh' });
      pushOpsBadges(snapshotBadges(useOps.getState().state));
      unsubOps = useOps.subscribe((s) => {
        pushOpsBadges(snapshotBadges(s.state));
      });
    };
    const unwireOps = () => {
      unsubOps?.();
      unsubOps = null;
      pushOpsBadges(null);
    };

    if (lastMode === 'ops') wireOps();

    unsubMode = useMode.subscribe((s) => {
      if (s.mode === lastMode) return;
      lastMode = s.mode;
      if (s.mode === 'ops') wireOps();
      else unwireOps();
    });

    return () => {
      unsubOps?.();
      unsubMode?.();
      pushOpsBadges(null);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className={className}
      style={{ width: '100%', height: '100%', overflow: 'hidden' }}
    />
  );
}
