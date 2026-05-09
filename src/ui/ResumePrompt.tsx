import { useEffect, useState } from 'react';
import { useGame, loadSnapshot, clearSnapshot } from '../state/gameStore';
import { getCase } from '../content';

/**
 * If a persisted mid-case run exists in localStorage, prompt the player to
 * resume or discard it. Shown once on boot.
 */
export function ResumePrompt() {
  const restoreRun = useGame((s) => s.restoreRun);
  const [snap, setSnap] = useState<ReturnType<typeof loadSnapshot> | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const s = loadSnapshot();
    if (s) setSnap(s);
  }, []);

  if (!snap || dismissed) return null;
  const caseDef = getCase(snap.caseId);
  if (!caseDef) {
    clearSnapshot();
    return null;
  }

  const resume = () => {
    restoreRun(caseDef, snap);
    setDismissed(true);
  };
  const discard = () => {
    clearSnapshot();
    setDismissed(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-title"
      className="fixed inset-0 z-[55] grid place-items-center bg-black/70 p-4"
    >
      <div className="bg-clinical-panel border border-clinical-border rounded-lg max-w-md w-full shadow-2xl">
        <header className="px-5 py-4 border-b border-clinical-border">
          <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
            Unfinished case
          </div>
          <h2 id="resume-title" className="text-base font-semibold text-white mt-1">
            Resume {caseDef.title.split('—')[0].trim()}?
          </h2>
        </header>
        <div className="px-5 py-4 text-sm text-white/85 leading-relaxed space-y-2">
          <p>
            We saved your run after the last decision. You can pick up where you left off,
            or discard and start fresh.
          </p>
          <ul className="text-xs text-clinical-subtle space-y-0.5">
            <li>Decisions made: <span className="font-mono text-white">{snap.run.log.length}</span></li>
            <li>Cash so far: <span className="font-mono text-white">S${snap.totals.cash.toFixed(0)}</span></li>
            <li>Game time: <span className="font-mono text-white">{snap.run.elapsedGameMin} min</span></li>
          </ul>
        </div>
        <footer className="px-5 py-3 border-t border-clinical-border flex items-center justify-end gap-2">
          <button
            onClick={discard}
            className="px-3 py-1.5 rounded border border-clinical-border text-clinical-subtle hover:text-white text-xs"
          >
            Discard
          </button>
          <button
            onClick={resume}
            className="px-4 py-1.5 rounded bg-clinical-accent text-white text-xs font-semibold hover:brightness-110"
          >
            Resume
          </button>
        </footer>
      </div>
    </div>
  );
}
