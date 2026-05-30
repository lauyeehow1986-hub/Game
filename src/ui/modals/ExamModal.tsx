import { useEffect, useMemo, useRef, useState } from 'react';
import type { CaseDefinition, DecisionOption } from '../../lib/types';
import { useT, useTr } from '../../lib/i18n';
import { useFocusTrap } from '../../lib/use-focus-trap';
import { GlossaryText } from '../GlossaryText';
import { maxScoreForDecision } from '../../lib/scoring';
import {
  buildCertificate,
  gradeExam,
  type ExamConfig,
  type ExamPick,
} from '../../lib/exam';
import type { QuizItem } from '../../lib/quiz';
import { openPrintableCertificate } from '../../lib/certificate-print';
import { encodeCompletion } from '../../lib/assignment';
import { Confetti } from '../Confetti';

interface Props {
  exam: QuizItem[];
  config: ExamConfig;
  presetName: string;
  resolveCase: (id: string) => CaseDefinition | undefined;
  onClose: () => void;
  /** When launched from an educator assignment link, the assignment ref so a
   *  completion token can be generated for the learner to return. */
  assignmentRef?: string;
}

/**
 * Timed exam: presents each decision in isolation with NO rationale, advances
 * on selection, counts down a global timer, and on completion (or time-out)
 * grades pass/fail and offers a printable certificate. Nothing writes to
 * progress — this is assessment, not a logged run.
 */
export function ExamModal({ exam, config, presetName, resolveCase, onClose, assignmentRef }: Props) {
  const t = useT();
  const tr = useTr();
  const cardRef = useFocusTrap<HTMLDivElement>(true);
  const [index, setIndex] = useState(0);
  const [focusIdx, setFocusIdx] = useState(0);
  const [picks, setPicks] = useState<ExamPick[]>([]);
  const [remaining, setRemaining] = useState(config.durationSec);
  const [finished, setFinished] = useState(false);
  const [name, setName] = useState('');
  const [tokenCopied, setTokenCopied] = useState(false);

  const item = exam[index];
  const caseDef = item ? resolveCase(item.caseId) : null;
  const node = caseDef?.pathway.find((n) => n.decision?.id === item?.decisionId);
  const decision = node?.decision;

  const finish = () => setFinished(true);

  // Countdown — ticks once per second; auto-submits when it hits zero.
  const finishRef = useRef(finish);
  finishRef.current = finish;
  useEffect(() => {
    if (finished) return;
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(id);
          finishRef.current();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [finished]);

  const result = useMemo(
    () => gradeExam(picks, exam.length, config.passRatio),
    [picks, exam.length, config.passRatio],
  );

  const commit = (opt: DecisionOption) => {
    if (!decision) return;
    const max = maxScoreForDecision(decision);
    const next = [...picks, { score: opt.score * decision.weight, max }];
    setPicks(next);
    setFocusIdx(0);
    if (index + 1 >= exam.length) {
      setFinished(true);
    } else {
      setIndex(index + 1);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (finished || !decision) return;
      const opts = decision.options;
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        setFocusIdx((i) => Math.min(opts.length - 1, i + 1));
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        setFocusIdx((i) => Math.max(0, i - 1));
      } else if (/^[1-9]$/.test(e.key)) {
        const n = parseInt(e.key, 10) - 1;
        if (n < opts.length) setFocusIdx(n);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        commit(opts[focusIdx]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, decision, focusIdx, index, picks]);

  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;
  const lowTime = remaining <= 60;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exam-title"
      className="fixed inset-0 z-[65] grid place-items-center bg-black/70 p-4"
    >
      {finished && result.passed && <Confetti active />}
      <div
        ref={cardRef}
        className="bg-clinical-panel border border-clinical-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin shadow-2xl"
      >
        <header className="px-5 py-3 border-b border-clinical-border flex items-center justify-between gap-3">
          <h2 id="exam-title" className="text-sm font-semibold text-white">
            {t('exam.heading')}
          </h2>
          {!finished && (
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-clinical-subtle font-mono">
                {index + (picks.length > index ? 0 : 1)}/{exam.length}
              </span>
              <span
                className={`font-mono px-2 py-0.5 rounded border ${
                  lowTime
                    ? 'border-clinical-danger text-clinical-danger animate-pulse'
                    : 'border-clinical-border text-clinical-subtle'
                }`}
                aria-label={t('exam.timeLeft')}
              >
                {mm}:{String(ss).padStart(2, '0')}
              </span>
            </div>
          )}
        </header>

        {!finished && decision && (
          <div className="px-5 py-4 space-y-3">
            <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
              {caseDef ? tr(caseDef.title) : ''}
            </div>
            <p className="text-sm text-white font-medium">
              <GlossaryText>{tr(decision.prompt)}</GlossaryText>
            </p>
            <div className="space-y-1.5">
              {decision.options.map((opt, i) => (
                <button
                  key={opt.id}
                  onClick={() => commit(opt)}
                  onMouseEnter={() => setFocusIdx(i)}
                  className={`w-full text-left px-3 py-2 rounded border text-[12px] transition ${
                    i === focusIdx
                      ? 'border-clinical-accent bg-clinical-accent/10 text-white'
                      : 'border-clinical-border text-clinical-subtle hover:text-white'
                  }`}
                >
                  <span className="font-mono text-[10px] text-clinical-subtle mr-1.5">{i + 1}</span>
                  <GlossaryText>{tr(opt.label)}</GlossaryText>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-clinical-subtle">{t('exam.noFeedback')}</p>
          </div>
        )}

        {finished && (
          <div className="px-5 py-6 space-y-4 text-center">
            <div
              className="text-3xl font-extrabold"
              style={{ color: result.passed ? '#4ade80' : '#f87171' }}
            >
              {result.passed ? t('exam.passed') : t('exam.failed')}
            </div>
            <div className="text-sm text-white">
              {t('exam.score', {
                pct: Math.round(result.ratio * 100),
                threshold: Math.round(config.passRatio * 100),
              })}
            </div>
            <div className="text-[11px] text-clinical-subtle">
              {t('exam.answered', { answered: result.answered, total: result.total })}
            </div>

            <div className="pt-2">
              <label className="block text-[11px] text-clinical-subtle mb-1 text-left">
                {t('exam.nameLabel')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('exam.namePlaceholder')}
                aria-label={t('exam.nameLabel')}
                className="w-full bg-clinical-bg border border-clinical-border rounded px-2 py-1.5 text-[12px] text-white"
              />
            </div>

            <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
              <button
                onClick={() => {
                  const cert = buildCertificate(result, presetName);
                  openPrintableCertificate(cert, name);
                }}
                className="tap-target px-4 py-2 rounded bg-clinical-accent text-white text-xs font-semibold hover:brightness-110"
              >
                {t('exam.certificate')}
              </button>
              {assignmentRef && (
                <button
                  onClick={async () => {
                    const token = encodeCompletion({
                      ref: assignmentRef,
                      name: name.trim(),
                      scorePct: Math.round(result.ratio * 100),
                      passed: result.passed,
                      at: Date.now(),
                    });
                    try {
                      await navigator.clipboard.writeText(token);
                      setTokenCopied(true);
                      setTimeout(() => setTokenCopied(false), 1800);
                    } catch {
                      window.prompt(t('exam.tokenManual'), token);
                    }
                  }}
                  className="tap-target px-4 py-2 rounded border border-clinical-warn text-clinical-warn text-xs"
                >
                  {tokenCopied ? t('exam.tokenCopied') : t('exam.copyToken')}
                </button>
              )}
              <button
                onClick={onClose}
                data-autofocus
                className="tap-target px-4 py-2 rounded border border-clinical-border text-clinical-subtle hover:text-white text-xs"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
