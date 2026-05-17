import { useEffect, useState } from 'react';
import type { CaseDefinition } from '../../lib/types';
import { bestPath, type BestPathStep } from '../../lib/best-path';
import { useT, useTr } from '../../lib/i18n';
import { useAchievements } from '../../state/achievementsStore';

interface Props {
  caseDef: CaseDefinition | null;
  onClose: () => void;
}

/**
 * Read-only walkthrough of a case's best-practice path: for each decision,
 * shows the prompt, the chosen (best) option with its rationale, the
 * outcome blurb, and the reference. Learners step forward / backward,
 * jump to any step. No scoring, no commitment — purely revision.
 */
export function BestPathDemoModal({ caseDef, onClose }: Props) {
  const t = useT();
  const tr = useTr();
  const [step, setStep] = useState(0);
  const [steps, setSteps] = useState<BestPathStep[]>([]);
  const fireAchievement = useAchievements((s) => s.fire);

  useEffect(() => {
    if (!caseDef) return;
    setSteps(bestPath(caseDef));
    setStep(0);
    fireAchievement({ kind: 'demo-opened' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseDef]);

  useEffect(() => {
    if (!caseDef) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') setStep((s) => Math.min(steps.length - 1, s + 1));
      else if (e.key === 'ArrowLeft') setStep((s) => Math.max(0, s - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [caseDef, steps.length, onClose]);

  if (!caseDef) return null;

  // Resolve the live step's node + decision + chosen option so we can pull
  // the outcome blurb the player would have seen.
  const current = steps[step];
  const node = current
    ? caseDef.pathway.find((n) => n.decision?.id === current.decisionId)
    : null;
  const option = current && node?.decision
    ? node.decision.options.find((o) => o.id === current.optionId)
    : null;

  const total = steps.length;
  const ratio = total === 0 ? 1 : (step + 1) / total;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bestpath-demo-title"
      className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4"
    >
      <div className="bg-clinical-panel border border-clinical-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin shadow-2xl">
        <header className="px-5 py-4 border-b border-clinical-border">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
                {t('demo.tag')}
              </div>
              <h2 id="bestpath-demo-title" className="text-base font-semibold text-white mt-1">
                {tr(caseDef.title)}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-[11px] text-clinical-subtle hover:text-white"
            >
              {t('common.close')}
            </button>
          </div>
          <p className="text-[11px] text-clinical-subtle mt-1 leading-snug">
            {t('demo.subtitle')}
          </p>
          {total > 0 && (
            <div className="mt-2">
              <div className="h-1 bg-clinical-bg rounded overflow-hidden">
                <div
                  className="h-full bg-clinical-accent"
                  style={{ width: `${ratio * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-clinical-subtle mt-0.5 font-mono">
                {t('demo.stepCount', { step: step + 1, total })}
              </div>
            </div>
          )}
        </header>

        {total === 0 ? (
          <div className="px-5 py-6 text-[12px] text-clinical-subtle">
            {t('demo.noDecisions')}
          </div>
        ) : current ? (
          <section className="px-5 py-4 space-y-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
                {t('demo.prompt')}
              </div>
              <div className="text-sm text-white mt-1">{node?.decision ? tr(node.decision.prompt) : ''}</div>
            </div>
            <div className="border border-clinical-ok/40 bg-clinical-ok/5 rounded p-3 space-y-1">
              <div className="text-[10px] uppercase tracking-wider text-clinical-ok">
                {t('demo.bestChoice')}
              </div>
              <div className="text-sm text-white font-semibold">{tr(current.optionLabel)}</div>
              <div className="text-[11px] text-white/85">{tr(current.rationale)}</div>
              <div className="text-[10px] uppercase tracking-wider text-clinical-subtle pt-1">
                {t('demo.reference')}: {node?.decision ? tr(node.decision.reference.label) : ''}
              </div>
            </div>
            {option?.outcome && (
              <div>
                <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
                  {t('demo.outcome')}
                </div>
                <ul className="space-y-1 mt-1">
                  {(['patient', 'caregiver', 'staff'] as const).map((p) => {
                    const text = tr(option.outcome[p]);
                    if (!text) return null;
                    return (
                      <li key={p} className="text-[11px]">
                        <span className="uppercase tracking-wider text-clinical-subtle mr-1 text-[9px]">
                          {t(`hud.perspective.${p}`)}
                        </span>
                        <span className="text-white/85 italic">{text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </section>
        ) : null}

        <footer className="px-5 py-3 border-t border-clinical-border flex items-center justify-between gap-2">
          <div className="text-[10px] text-clinical-subtle">{t('demo.keyHint')}</div>
          <div className="flex gap-2">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="px-3 py-1.5 rounded border border-clinical-border text-clinical-subtle hover:text-white text-xs disabled:opacity-40"
            >
              {t('common.back')}
            </button>
            {step < total - 1 ? (
              <button
                onClick={() => setStep((s) => Math.min(total - 1, s + 1))}
                className="px-4 py-1.5 rounded bg-clinical-accent text-white text-xs font-semibold hover:brightness-110"
              >
                {t('common.next')}
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded bg-clinical-ok text-white text-xs font-semibold hover:brightness-110"
              >
                {t('common.close')}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
