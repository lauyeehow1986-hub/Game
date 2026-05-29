import { useEffect, useRef } from 'react';
import { useGame } from '../state/gameStore';
import { usePacing } from '../state/pacingStore';

/**
 * When the player has opted into real-time pacing, advance the
 * in-game clock by one game-minute every `secondsPerGameMin` real
 * seconds — but only while an acute-timer case is awaiting a
 * decision. Renders nothing. Pausing is automatic: tab hidden, mode
 * switched to ops, modal closed, or status changes away from
 * awaiting-decision all stop the ticker.
 */
export function RealtimeTicker() {
  const realtime = usePacing((s) => s.realtime);
  const sec = usePacing((s) => s.secondsPerGameMin);
  const caseDef = useGame((s) => s.caseDef);
  const status = useGame((s) => s.run.status);
  const acute = caseDef?.acuteTimer != null;
  const handleRef = useRef<number | null>(null);

  useEffect(() => {
    const active = realtime && acute && status === 'awaiting-decision';
    if (!active) {
      if (handleRef.current !== null) {
        window.clearInterval(handleRef.current);
        handleRef.current = null;
      }
      return;
    }
    const intervalMs = Math.max(500, sec * 1000);
    handleRef.current = window.setInterval(() => {
      if (document.hidden) return;
      useGame.getState().tickGameTime(1);
    }, intervalMs);
    return () => {
      if (handleRef.current !== null) {
        window.clearInterval(handleRef.current);
        handleRef.current = null;
      }
    };
  }, [realtime, acute, status, sec]);

  return null;
}
