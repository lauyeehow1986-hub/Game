import { useEffect, useMemo, useState } from 'react';
import type { CaseDefinition, DecisionLogEntry } from '../../lib/types';
import { useT, useTr } from '../../lib/i18n';
import { useFocusTrap } from '../../lib/use-focus-trap';
import { GlossaryText } from '../GlossaryText';
import { buildReplay } from '../../lib/replay';

interface Props {
  caseDef: CaseDefinition;
  log: DecisionLogEntry[];
  onClose: () => void;
}

/**
 * Timeline scrubber for a finished run: scrub forward / backward through
 * each committed decision and see the cumulative score, derived stability,
 * and journey up to that point. Read-only; no engine side effects.
 */
export function ReplayScrubberModal({ caseDef, log, onClose }: Props) {
  const t = useT();
  const tr = useTr();
  const cardRef = useFocusTrap<HTMLDivElement>(true);
  const steps = useMemo(() => buildReplay(caseDef, log), [caseDef, log]);
  const [i, setI] = useState(Math.max(0, steps.length - 1));

  // Keyboard nav: ← → step, Home / End jump.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onClose();
      if (e.key === 'ArrowLeft') setI((x) => Math.max(0, x - 1));
      else if (e.key === 'ArrowRight') setI((x) => Math.min(steps.length - 1, x + 1));
      else if (e.key === 'Home') setI(0);
      else if (e.key === 'End') setI(steps.length - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [steps.length, onClose]);

  if (steps.length === 0) {
    return (
      <div role="dialog" aria-modal="true" aria-labelledby="replay-title" className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4">
        <div ref={cardRef} className="bg-clinical-panel border border-clinical-border rounded-lg max-w-md w-full p-5 shadow-2xl">
          <h2 id="replay-title" className="text-sm font-semibold text-white mb-2">{t('replay.heading')}</h2>
          <p className="text-[12px] text-clinical-subtle">{t('replay.empty')}</p>
          <button onClick={onClose} className="mt-4 px-3 py-1.5 rounded border border-clinical-border text-clinical-subtle hover:text-white text-xs">
            {t('common.close')}
          </button>
        </div>
      </div>
    );
  }

  const step = steps[i];
  const node = caseDef.pathway.find((n) => n.id === step.nodeId);
  const decision = node?.decision;
  const ratio = step.cumMax > 0 ? Math.round((step.cumScore / step.cumMax) * 100) : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="replay-title"
      className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4"
    >
      <div ref={cardRef} className="bg-clinical-panel border border-clinical-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin shadow-2xl">
        <header className="px-5 py-3 border-b border-clinical-border flex items-center justify-between gap-3">
          <h2 id="replay-title" className="text-sm font-semibold text-white">{t('replay.heading')}</h2>
          <span className="text-[11px] text-clinical-subtle font-mono">{i + 1}/{steps.length}</span>
          <button onClick={onClose} className="text-[11px] text-clinical-subtle hover:text-white">{t('common.close')}</button>
        </header>

        <div className="px-5 py-4 space-y-3 text-[12px]">
          {/* Slider */}
          <input
            type="range"
            min={0}
            max={steps.length - 1}
            value={i}
            onChange={(e) => setI(parseInt(e.target.value, 10))}
            aria-label={t('replay.heading')}
            className="w-full accent-clinical-accent"
          />

          {/* Header: decision + score */}
          <div className="flex items-baseline justify-between gap-3">
            <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">{node?.department ?? ''}</div>
            <div className="text-[11px] font-mono text-white">{step.cumScore.toFixed(1)} / {step.cumMax.toFixed(1)} <span className="text-clinical-subtle">({ratio}%)</span></div>
          </div>

          {decision && (
            <p className="text-sm text-white font-medium">
              <GlossaryText>{tr(decision.prompt)}</GlossaryText>
            </p>
          )}
          <div className="text-[12px] rounded border border-clinical-accent/40 bg-clinical-accent/5 p-2">
            <span className="text-[10px] uppercase tracking-wider text-clinical-subtle mr-1">{t('replay.chose')}</span>
            <span className="text-white"><GlossaryText>{tr(step.optionLabel as Parameters<typeof tr>[0])}</GlossaryText></span>
          </div>

          {/* Stability strip */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-clinical-subtle mb-1">{t('replay.stability')}</div>
            <div className="flex items-end gap-[2px] h-10">
              {step.stability.points.map((p, idx) => (
                <div
                  key={idx}
                  title={`${idx + 1}: ${p.value}`}
                  className="flex-1 rounded-t"
                  style={{
                    height: `${p.value}%`,
                    minHeight: '4px',
                    backgroundColor: p.value >= 67 ? '#4ade80' : p.value >= 34 ? '#facc15' : '#f87171',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Journey breadcrumbs */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-clinical-subtle mb-1">{t('replay.journey')}</div>
            <div className="flex flex-wrap gap-1">
              {step.journey.map((nid, idx) => (
                <span key={`${nid}-${idx}`} className={`text-[10px] px-1.5 py-0.5 rounded border ${nid === step.nodeId ? 'border-clinical-accent text-clinical-accent' : 'border-clinical-border text-clinical-subtle'}`}>
                  {nid}
                </span>
              ))}
            </div>
          </div>
        </div>

        <footer className="px-5 py-3 border-t border-clinical-border flex items-center justify-between text-[11px]">
          <span className="text-clinical-subtle">{t('replay.kbHint')}</span>
          <div className="flex gap-1">
            <button onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0} className="px-2 py-1 rounded border border-clinical-border text-clinical-subtle hover:text-white disabled:opacity-40">←</button>
            <button onClick={() => setI((x) => Math.min(steps.length - 1, x + 1))} disabled={i === steps.length - 1} className="px-2 py-1 rounded border border-clinical-border text-clinical-subtle hover:text-white disabled:opacity-40">→</button>
          </div>
        </footer>
      </div>
    </div>
  );
}
