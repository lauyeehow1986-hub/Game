import { useEffect, useState } from 'react';
import type { CaseDefinition, DecisionOption } from '../../lib/types';
import { useT, useTr } from '../../lib/i18n';
import { useFocusTrap } from '../../lib/use-focus-trap';
import { GlossaryText } from '../GlossaryText';

interface Props {
  caseDef: CaseDefinition;
  decisionId: string;
  onClose: () => void;
}

/**
 * Single-decision practice modal. Re-presents a decision from any case in
 * isolation so the learner can re-attempt without replaying the whole
 * pathway. After commit, shows the score, rationale, every alternative
 * with weighted score + rationale, and the reference — but writes nothing
 * to progress / runHistory. Pure practice.
 */
export function PracticeDecisionModal({ caseDef, decisionId, onClose }: Props) {
  const t = useT();
  const tr = useTr();
  const cardRef = useFocusTrap<HTMLDivElement>(true);
  const [picked, setPicked] = useState<DecisionOption | null>(null);
  const [committed, setCommitted] = useState(false);
  const [focusIdx, setFocusIdx] = useState(0);

  const node = caseDef.pathway.find((n) => n.decision?.id === decisionId);
  const decision = node?.decision;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (committed || !decision) return;
      const opts = decision.options;
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        setFocusIdx((i) => Math.min(opts.length - 1, i + 1));
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        setFocusIdx((i) => Math.max(0, i - 1));
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const opt = opts[focusIdx];
        if (picked?.id === opt.id) {
          setCommitted(true);
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
  }, [decision, picked, focusIdx, committed, onClose]);

  if (!decision) return null;
  const maxScore = decision.options.reduce((a, o) => Math.max(a, o.score), Number.NEGATIVE_INFINITY);
  const bestOption = decision.options.find((o) => o.score === maxScore) ?? decision.options[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="practice-prompt"
      className="fixed inset-0 z-[65] grid place-items-center bg-black/70 p-4"
    >
      <div
        ref={cardRef}
        className="bg-clinical-panel border border-clinical-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin shadow-2xl"
      >
        <header className="px-5 py-4 border-b border-clinical-border">
          <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
            {t('practice.tag')} · {tr(caseDef.title)}
          </div>
          <h2 id="practice-prompt" className="text-base font-semibold text-white mt-1">
            <GlossaryText>{tr(decision.prompt)}</GlossaryText>
          </h2>
        </header>

        {!committed ? (
          <>
            <ul role="radiogroup" aria-labelledby="practice-prompt" className="divide-y divide-clinical-border">
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
                      className={`w-full text-left px-5 py-4 transition outline-none ${
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
                          <span className="text-[10px] text-clinical-subtle font-mono mr-1">[{idx + 1}]</span>
                          <GlossaryText>{tr(opt.label)}</GlossaryText>
                        </div>
                      </div>
                      {selected && (
                        <div className="mt-3 ml-7 space-y-2 text-xs">
                          <div className="text-clinical-subtle">
                            <GlossaryText>{tr(opt.rationale)}</GlossaryText>
                          </div>
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            <footer className="px-5 py-3 border-t border-clinical-border flex items-center justify-between gap-3">
              <div className="text-[11px] text-clinical-subtle">{t('practice.hint')}</div>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="tap-target px-3 py-1.5 rounded border border-clinical-border text-clinical-subtle hover:text-white text-xs"
                >
                  {t('common.cancel')}
                </button>
                <button
                  data-autofocus
                  disabled={!picked}
                  onClick={() => setCommitted(true)}
                  className="tap-target px-4 py-2 rounded bg-clinical-accent text-white text-sm font-semibold disabled:opacity-40 hover:brightness-110"
                >
                  {t('practice.check')}
                </button>
              </div>
            </footer>
          </>
        ) : (
          <section className="px-5 py-4 space-y-3">
            {picked && (
              <div
                className={`border rounded p-3 space-y-1 ${
                  picked.score >= maxScore - 0.01
                    ? 'border-clinical-ok/40 bg-clinical-ok/5'
                    : picked.score >= 0
                    ? 'border-clinical-warn/40 bg-clinical-warn/5'
                    : 'border-clinical-danger/40 bg-clinical-danger/5'
                }`}
              >
                <div className="flex justify-between text-[10px] uppercase tracking-wider">
                  <span className="text-clinical-subtle">{t('practice.you')}</span>
                  <span
                    className={
                      picked.score >= maxScore - 0.01
                        ? 'text-clinical-ok'
                        : picked.score >= 0
                        ? 'text-clinical-warn'
                        : 'text-clinical-danger'
                    }
                  >
                    {(picked.score * decision.weight).toFixed(1)} / {(maxScore * decision.weight).toFixed(1)}
                  </span>
                </div>
                <div className="text-sm text-white font-semibold">
                  <GlossaryText>{tr(picked.label)}</GlossaryText>
                </div>
                <div className="text-[11px] text-white/85">
                  <GlossaryText>{tr(picked.rationale)}</GlossaryText>
                </div>
              </div>
            )}

            {picked && picked.id !== bestOption.id && (
              <div className="border border-clinical-accent/40 bg-clinical-accent/5 rounded p-3 space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-clinical-accent">
                  {t('practice.best')}
                </div>
                <div className="text-sm text-white font-semibold">
                  <GlossaryText>{tr(bestOption.label)}</GlossaryText>
                </div>
                <div className="text-[11px] text-white/85">
                  <GlossaryText>{tr(bestOption.rationale)}</GlossaryText>
                </div>
              </div>
            )}

            <details className="text-[11px]">
              <summary className="cursor-pointer text-clinical-subtle hover:text-white">
                {t('practice.allOptions')} ({decision.options.length})
              </summary>
              <ul className="mt-1 space-y-1.5">
                {decision.options
                  .slice()
                  .sort((a, b) => b.score - a.score)
                  .map((o) => {
                    const weighted = o.score * decision.weight;
                    const ratio = maxScore > 0 ? o.score / maxScore : 0;
                    const colour =
                      ratio >= 0.9
                        ? 'text-clinical-ok'
                        : ratio >= 0.5
                        ? 'text-clinical-warn'
                        : 'text-clinical-danger';
                    return (
                      <li key={o.id} className="border-l border-clinical-border pl-2">
                        <div className="flex justify-between gap-2">
                          <span className="text-white/85">
                            <GlossaryText>{tr(o.label)}</GlossaryText>
                          </span>
                          <span className={`font-mono shrink-0 ${colour}`}>{weighted.toFixed(1)}</span>
                        </div>
                        <div className="text-clinical-subtle leading-snug">
                          <GlossaryText>{tr(o.rationale)}</GlossaryText>
                        </div>
                      </li>
                    );
                  })}
              </ul>
            </details>

            <div className="text-[10px] uppercase tracking-wider text-clinical-subtle pt-1">
              {t('practice.reference')}: {tr(decision.reference.label)}
            </div>
            {tr(decision.reference.body) && (
              <p className="text-[11px] text-white/80 leading-snug">{tr(decision.reference.body)}</p>
            )}

            <footer className="pt-2 flex items-center justify-between gap-2">
              <div className="text-[10px] text-clinical-subtle">{t('practice.noScore')}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setCommitted(false);
                    setPicked(null);
                    setFocusIdx(0);
                  }}
                  className="tap-target px-3 py-1.5 rounded border border-clinical-border text-clinical-subtle hover:text-white text-xs"
                >
                  {t('practice.tryAgain')}
                </button>
                <button
                  data-autofocus
                  onClick={onClose}
                  className="tap-target px-3 py-1.5 rounded bg-clinical-accent text-white text-xs font-semibold hover:brightness-110"
                >
                  {t('common.close')}
                </button>
              </div>
            </footer>
          </section>
        )}
      </div>
    </div>
  );
}
