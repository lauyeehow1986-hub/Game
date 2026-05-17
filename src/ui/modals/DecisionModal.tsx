import { useEffect, useRef, useState } from 'react';
import { useGame } from '../../state/gameStore';
import { usePerspective } from '../../state/perspectiveStore';
import { useProgress } from '../../state/progressStore';
import type { DecisionOption } from '../../lib/types';
import { chimeDecision } from '../../lib/audio';
import { useTr } from '../../lib/i18n';
import { GlossaryText } from '../GlossaryText';

export function DecisionModal() {
  const tr = useTr();
  const pending = useGame((s) => s.run.pendingDecision);
  const status = useGame((s) => s.run.status);
  const resolve = useGame((s) => s.resolveDecision);
  const recordDecisionMade = useProgress((s) => s.recordDecisionMade);
  const perspective = usePerspective((s) => s.current);
  const [picked, setPicked] = useState<DecisionOption | null>(null);
  const [focusIdx, setFocusIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Reset selection when a new decision arrives.
  useEffect(() => {
    setPicked(null);
    setFocusIdx(0);
  }, [pending?.decision.id]);

  // Focus the dialog on open so screen readers and keyboard users land here.
  useEffect(() => {
    if (status === 'awaiting-decision' && containerRef.current) {
      containerRef.current.focus();
    }
  }, [status]);

  // Keyboard navigation.
  useEffect(() => {
    if (status !== 'awaiting-decision' || !pending) return;
    const opts = pending.decision.options;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        setFocusIdx((i) => Math.min(opts.length - 1, i + 1));
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        setFocusIdx((i) => Math.max(0, i - 1));
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        const opt = opts[focusIdx];
        if (picked?.id === opt.id) {
          handleConfirm();
        } else {
          setPicked(opt);
        }
      } else if (/^[1-9]$/.test(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (idx < opts.length) {
          setFocusIdx(idx);
          setPicked(opts[idx]);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, pending, picked, focusIdx]);

  if (status !== 'awaiting-decision' || !pending) return null;
  const { decision } = pending;
  const maxScore = decision.options.reduce((a, o) => Math.max(a, o.score), 0);

  const handleConfirm = () => {
    if (!picked) return;
    recordDecisionMade();
    chimeDecision();
    resolve(picked);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="decision-prompt"
      ref={containerRef}
      tabIndex={-1}
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
    >
      <div className="bg-clinical-panel border border-clinical-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin shadow-2xl">
        <header className="px-5 py-4 border-b border-clinical-border">
          <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
            Decision required · {perspective} POV
          </div>
          <h2 id="decision-prompt" className="text-base font-semibold text-white mt-1">
            <GlossaryText>{tr(decision.prompt)}</GlossaryText>
          </h2>
        </header>

        <ul role="radiogroup" aria-labelledby="decision-prompt" className="divide-y divide-clinical-border">
          {decision.options.map((opt, idx) => {
            const selected = picked?.id === opt.id;
            const focused = focusIdx === idx;
            return (
              <li key={opt.id}>
                <button
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    setFocusIdx(idx);
                    setPicked(opt);
                  }}
                  className={`w-full text-left px-5 py-3 transition outline-none ${
                    selected
                      ? 'bg-clinical-accent/10'
                      : focused
                      ? 'bg-white/5'
                      : 'hover:bg-white/5'
                  } ${focused ? 'ring-2 ring-clinical-accent ring-inset' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 w-4 h-4 rounded-full border-2 grid place-items-center shrink-0 ${
                        selected ? 'border-clinical-accent' : 'border-clinical-subtle'
                      }`}
                    >
                      {selected && <span className="w-2 h-2 rounded-full bg-clinical-accent" />}
                    </span>
                    <div className="text-sm text-white">
                      <span className="text-[10px] text-clinical-subtle font-mono mr-1">
                        [{idx + 1}]
                      </span>
                      <GlossaryText>{tr(opt.label)}</GlossaryText>
                    </div>
                  </div>
                  {selected && (
                    <div className="mt-3 ml-7 space-y-2 text-xs">
                      <div className="text-clinical-subtle"><GlossaryText>{tr(opt.rationale)}</GlossaryText></div>
                      <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
                        Reference: {tr(decision.reference.label)}
                      </div>
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <footer className="px-5 py-3 border-t border-clinical-border flex items-center justify-between gap-3">
          <div className="text-[11px] text-clinical-subtle">
            <span className="hidden sm:inline">↑/↓ to choose, 1–9 to jump, Enter to confirm. </span>
            Max score:{' '}
            <span className="font-mono text-white">
              {(maxScore * decision.weight).toFixed(1)}
            </span>
          </div>
          <button
            disabled={!picked}
            onClick={handleConfirm}
            className="px-4 py-2 rounded bg-clinical-accent text-white text-sm font-semibold disabled:opacity-40 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-clinical-accent focus:ring-offset-2 focus:ring-offset-clinical-panel"
          >
            Commit decision
          </button>
        </footer>
      </div>
    </div>
  );
}
