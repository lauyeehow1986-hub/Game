import { useState } from 'react';
import { useGame } from '../../state/gameStore';
import { usePerspective } from '../../state/perspectiveStore';
import { useProgress } from '../../state/progressStore';
import type { DecisionOption } from '../../lib/types';

export function DecisionModal() {
  const pending = useGame((s) => s.run.pendingDecision);
  const status = useGame((s) => s.run.status);
  const resolve = useGame((s) => s.resolveDecision);
  const recordDecisionMade = useProgress((s) => s.recordDecisionMade);
  const perspective = usePerspective((s) => s.current);
  const [picked, setPicked] = useState<DecisionOption | null>(null);

  if (status !== 'awaiting-decision' || !pending) return null;
  const { decision } = pending;
  const maxScore = decision.options.reduce((a, o) => Math.max(a, o.score), 0);

  const handlePick = (opt: DecisionOption) => setPicked(opt);
  const handleConfirm = () => {
    if (!picked) return;
    recordDecisionMade();
    resolve(picked);
    setPicked(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
    >
      <div className="bg-clinical-panel border border-clinical-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin shadow-2xl">
        <header className="px-5 py-4 border-b border-clinical-border">
          <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
            Decision required · {perspective} POV
          </div>
          <h2 className="text-base font-semibold text-white mt-1">{decision.prompt}</h2>
        </header>

        <ul className="divide-y divide-clinical-border">
          {decision.options.map((opt) => {
            const selected = picked?.id === opt.id;
            return (
              <li key={opt.id}>
                <button
                  onClick={() => handlePick(opt)}
                  className={`w-full text-left px-5 py-3 transition ${
                    selected ? 'bg-clinical-accent/10' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 w-4 h-4 rounded-full border-2 grid place-items-center shrink-0 ${
                        selected ? 'border-clinical-accent' : 'border-clinical-subtle'
                      }`}
                    >
                      {selected && <span className="w-2 h-2 rounded-full bg-clinical-accent" />}
                    </span>
                    <div className="text-sm text-white">{opt.label}</div>
                  </div>
                  {selected && (
                    <div className="mt-3 ml-7 space-y-2 text-xs">
                      <div className="text-clinical-subtle">{opt.rationale}</div>
                      <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
                        Reference: {decision.reference.label}
                      </div>
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <footer className="px-5 py-3 border-t border-clinical-border flex items-center justify-between">
          <div className="text-[11px] text-clinical-subtle">
            Pick the option you'd defend on a ward round. Max score this decision:{' '}
            <span className="font-mono text-white">
              {(maxScore * decision.weight).toFixed(1)}
            </span>
          </div>
          <button
            disabled={!picked}
            onClick={handleConfirm}
            className="px-4 py-2 rounded bg-clinical-accent text-white text-sm font-semibold disabled:opacity-40 hover:brightness-110"
          >
            Commit decision
          </button>
        </footer>
      </div>
    </div>
  );
}
