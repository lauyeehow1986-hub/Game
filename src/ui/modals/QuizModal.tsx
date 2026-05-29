import { useEffect, useState } from 'react';
import type { CaseDefinition, DecisionOption } from '../../lib/types';
import { useT, useTr } from '../../lib/i18n';
import { useFocusTrap } from '../../lib/use-focus-trap';
import { GlossaryText } from '../GlossaryText';
import { totalQuizScore, type QuizItem } from '../../lib/quiz';

interface Props {
  quiz: QuizItem[];
  resolveCase: (id: string) => CaseDefinition | undefined;
  onClose: () => void;
}

interface Pick {
  decisionId: string;
  optionId: string;
  optionLabel: unknown;
  score: number;
  max: number;
}

/**
 * Walks a quiz of N decisions in sequence. Each item presents a
 * single decision in isolation (Practice-style: prompt, options,
 * Check answer → feedback with your/best/all options). Header shows
 * running score and progress; after the last item a Summary screen
 * shows total + per-question outcome. Nothing writes to bestScores
 * or runHistory — pure revision.
 */
export function QuizModal({ quiz, resolveCase, onClose }: Props) {
  const t = useT();
  const tr = useTr();
  const cardRef = useFocusTrap<HTMLDivElement>(true);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<DecisionOption | null>(null);
  const [committed, setCommitted] = useState(false);
  const [focusIdx, setFocusIdx] = useState(0);
  const [picks, setPicks] = useState<Pick[]>([]);

  const item = quiz[index];
  const caseDef = item ? resolveCase(item.caseId) : null;
  const node = caseDef?.pathway.find((n) => n.decision?.id === item?.decisionId);
  const decision = node?.decision;
  const done = index >= quiz.length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (done || !decision || committed) return;
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
        if (picked?.id === opt.id) checkAnswer();
        else setPicked(opt);
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
  }, [decision, picked, focusIdx, committed, done, onClose]);

  const checkAnswer = () => {
    if (!picked || !decision) return;
    const max = decision.options.reduce((a, o) => Math.max(a, o.score), Number.NEGATIVE_INFINITY) * decision.weight;
    const score = picked.score * decision.weight;
    setPicks((prev) => [
      ...prev,
      { decisionId: decision.id, optionId: picked.id, optionLabel: picked.label, score, max },
    ]);
    setCommitted(true);
  };

  const nextQuestion = () => {
    setPicked(null);
    setFocusIdx(0);
    setCommitted(false);
    setIndex((i) => i + 1);
  };

  const restart = () => {
    setIndex(0);
    setPicks([]);
    setPicked(null);
    setFocusIdx(0);
    setCommitted(false);
  };

  const score = totalQuizScore(picks);
  const total = quiz.length;

  if (quiz.length === 0) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-[65] grid place-items-center bg-black/70 p-4"
      >
        <div
          ref={cardRef}
          className="bg-clinical-panel border border-clinical-border rounded-lg max-w-md w-full shadow-2xl p-5 space-y-3"
        >
          <h2 className="text-base font-semibold text-white">{t('quiz.tag')}</h2>
          <p className="text-[12px] text-clinical-subtle">{t('quiz.empty')}</p>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              data-autofocus
              className="tap-target px-3 py-1.5 rounded bg-clinical-accent text-white text-xs font-semibold"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-title"
      className="fixed inset-0 z-[65] grid place-items-center bg-black/70 p-4"
    >
      <div
        ref={cardRef}
        className="bg-clinical-panel border border-clinical-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin shadow-2xl"
      >
        <header className="px-5 py-3 border-b border-clinical-border flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
              {t('quiz.tag')}
            </div>
            <h2 id="quiz-title" className="text-sm font-semibold text-white">
              {done
                ? t('quiz.summaryHeading')
                : t('quiz.progress', { n: index + 1, total })}
            </h2>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
              {t('quiz.runningScore')}
            </div>
            <div className="font-mono text-sm text-white">
              {score.earned.toFixed(1)} / {score.max.toFixed(1)}
            </div>
          </div>
        </header>

        {done ? (
          <section className="px-5 py-4 space-y-3">
            <div className="text-3xl font-mono text-white">
              {(score.ratio * 100).toFixed(0)}%
            </div>
            <ul className="space-y-1 text-[11px]">
              {picks.map((p, i) => {
                const ratio = p.max > 0 ? p.score / p.max : 0;
                const colour =
                  ratio >= 0.9
                    ? 'text-clinical-ok'
                    : ratio >= 0.5
                    ? 'text-clinical-warn'
                    : 'text-clinical-danger';
                return (
                  <li
                    key={`${p.decisionId}-${i}`}
                    className="flex justify-between gap-3 border-l-2 border-clinical-border pl-2"
                  >
                    <span className="text-white/85 truncate flex-1">
                      {i + 1}. {tr(p.optionLabel as Parameters<typeof tr>[0])}
                    </span>
                    <span className={`font-mono shrink-0 ${colour}`}>
                      {p.score.toFixed(1)} / {p.max.toFixed(1)}
                    </span>
                  </li>
                );
              })}
            </ul>
            <footer className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={restart}
                className="tap-target px-3 py-1.5 rounded border border-clinical-border text-clinical-subtle hover:text-white text-xs"
              >
                {t('quiz.again')}
              </button>
              <button
                onClick={onClose}
                data-autofocus
                className="tap-target px-3 py-1.5 rounded bg-clinical-accent text-white text-xs font-semibold hover:brightness-110"
              >
                {t('common.close')}
              </button>
            </footer>
          </section>
        ) : decision && caseDef ? (
          <>
            <div className="px-5 py-3 border-b border-clinical-border">
              <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
                {tr(caseDef.title)}
              </div>
              <div className="text-sm text-white mt-1">
                <GlossaryText>{tr(decision.prompt)}</GlossaryText>
              </div>
            </div>
            {!committed ? (
              <>
                <ul role="radiogroup" className="divide-y divide-clinical-border">
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
                              <span className="text-[10px] text-clinical-subtle font-mono mr-1">
                                [{idx + 1}]
                              </span>
                              <GlossaryText>{tr(opt.label)}</GlossaryText>
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <footer className="px-5 py-3 border-t border-clinical-border flex items-center justify-end gap-2">
                  <button
                    onClick={onClose}
                    className="tap-target px-3 py-1.5 rounded border border-clinical-border text-clinical-subtle hover:text-white text-xs"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    data-autofocus
                    disabled={!picked}
                    onClick={checkAnswer}
                    className="tap-target px-4 py-2 rounded bg-clinical-accent text-white text-sm font-semibold disabled:opacity-40 hover:brightness-110"
                  >
                    {t('practice.check')}
                  </button>
                </footer>
              </>
            ) : (
              <section className="px-5 py-4 space-y-3">
                {(() => {
                  const maxScore = decision.options.reduce(
                    (a, o) => Math.max(a, o.score),
                    Number.NEGATIVE_INFINITY,
                  );
                  const bestOption =
                    decision.options.find((o) => o.score === maxScore) ?? decision.options[0];
                  const lastPick = picks[picks.length - 1];
                  return (
                    <>
                      <div
                        className={`border rounded p-3 space-y-1 ${
                          (picked?.score ?? 0) >= maxScore - 0.01
                            ? 'border-clinical-ok/40 bg-clinical-ok/5'
                            : (picked?.score ?? 0) >= 0
                            ? 'border-clinical-warn/40 bg-clinical-warn/5'
                            : 'border-clinical-danger/40 bg-clinical-danger/5'
                        }`}
                      >
                        <div className="flex justify-between text-[10px] uppercase tracking-wider">
                          <span className="text-clinical-subtle">{t('practice.you')}</span>
                          <span className="font-mono text-white">
                            {lastPick?.score.toFixed(1)} / {lastPick?.max.toFixed(1)}
                          </span>
                        </div>
                        <div className="text-sm text-white font-semibold">
                          {picked && <GlossaryText>{tr(picked.label)}</GlossaryText>}
                        </div>
                        <div className="text-[11px] text-white/85">
                          {picked && <GlossaryText>{tr(picked.rationale)}</GlossaryText>}
                        </div>
                      </div>
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
                      <div className="text-[10px] uppercase tracking-wider text-clinical-subtle pt-1">
                        {t('practice.reference')}: {tr(decision.reference.label)}
                      </div>
                    </>
                  );
                })()}
                <footer className="pt-2 flex items-center justify-end gap-2">
                  <button
                    onClick={nextQuestion}
                    data-autofocus
                    className="tap-target px-4 py-2 rounded bg-clinical-accent text-white text-xs font-semibold hover:brightness-110"
                  >
                    {index + 1 < total ? t('quiz.next') : t('quiz.finish')}
                  </button>
                </footer>
              </section>
            )}
          </>
        ) : (
          <div className="px-5 py-6 text-[12px] text-clinical-subtle">
            {t('quiz.brokenItem')}
          </div>
        )}
      </div>
    </div>
  );
}
