import { useEffect, useRef } from 'react';
import { useGame } from '../state/gameStore';
import { usePacing } from '../state/pacingStore';
import { chimePulse } from '../lib/audio';

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
    let pulseAccumulator = 0;
    handleRef.current = window.setInterval(() => {
      if (document.hidden) return;
      useGame.getState().tickGameTime(1);
      // Heartbeat pulse: fires once acute timer is more than half spent;
      // accelerates as it approaches goalMin. Skipped if the user has
      // muted audio (chimePulse internally checks isMuted()).
      const s = useGame.getState();
      const goal = s.caseDef?.acuteTimer?.goalMin;
      if (!goal) return;
      const ratio = s.run.elapsedGameMin / goal;
      if (ratio < 0.5) return;
      // Beat once per N ticks where N drops from 4 → 1 as ratio rises.
      pulseAccumulator += 1;
      const cadence = Math.max(1, Math.round(4 - 3 * Math.min(1, ratio)));
      if (pulseAccumulator >= cadence) {
        pulseAccumulator = 0;
        chimePulse(Math.min(1, ratio));
      }
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
