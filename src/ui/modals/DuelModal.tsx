import { useEffect, useMemo, useState } from 'react';
import type { CaseDefinition, DecisionOption } from '../../lib/types';
import { useT, useTr } from '../../lib/i18n';
import { useFocusTrap } from '../../lib/use-focus-trap';
import { GlossaryText } from '../GlossaryText';
import { maxScoreForDecision } from '../../lib/scoring';
import { buildExam } from '../../lib/exam';
import type { QuizItem } from '../../lib/quiz';
import { gradeDuel, whoIsUp, type DuelPick } from '../../lib/duel';
import { Confetti } from '../Confetti';

interface Props {
  pool: CaseDefinition[];
  count?: number;
  onClose: () => void;
}

/**
 * Head-to-head duel: two players share the device. Both face the same N
 * decisions in the same order; odd indices belong to player 1, even to
 * player 0. No per-question feedback; a head-to-head verdict at the end.
 */
export function DuelModal({ pool, count = 10, onClose }: Props) {
  const t = useT();
  const tr = useTr();
  const cardRef = useFocusTrap<HTMLDivElement>(true);
  const items: QuizItem[] = useMemo(() => buildExam(pool, count), [pool, count]);
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<DuelPick[]>([]);
  const [focusIdx, setFocusIdx] = useState(0);
  const finished = index >= items.length;

  const item = items[index];
  const caseDef = item ? pool.find((c) => c.id === item.caseId) : null;
  const node = caseDef?.pathway.find((n) => n.decision?.id === item?.decisionId);
  const decision = node?.decision;
  const player = whoIsUp(index);

  const commit = (opt: DecisionOption) => {
    if (!decision) return;
    const max = maxScoreForDecision(decision);
    setPicks([...picks, { player, score: opt.score * decision.weight, max }]);
    setFocusIdx(0);
    setIndex(index + 1);
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

  const result = useMemo(() => gradeDuel(picks), [picks]);

  const playerColour = (p: 0 | 1) =>
    p === 0
      ? 'border-clinical-accent text-clinical-accent'
      : 'border-amber-400 text-amber-300';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="duel-title"
      className="fixed inset-0 z-[65] grid place-items-center bg-black/70 p-4"
    >
      {finished && result.winner !== 'draw' && <Confetti active />}
      <div ref={cardRef} className="bg-clinical-panel border border-clinical-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin shadow-2xl">
        <header className="px-5 py-3 border-b border-clinical-border flex items-center justify-between gap-3">
          <h2 id="duel-title" className="text-sm font-semibold text-white">{t('duel.heading')}</h2>
          {!finished && (
            <span className="text-[11px] text-clinical-subtle font-mono">{index + 1}/{items.length}</span>
          )}
          <button onClick={onClose} className="text-[11px] text-clinical-subtle hover:text-white">{t('common.close')}</button>
        </header>

        {!finished && decision && (
          <div className="px-5 py-4 space-y-3">
            <div className={`inline-flex items-center gap-2 px-2 py-1 rounded border ${playerColour(player)}`}>
              <span className="text-[10px] uppercase tracking-wider">{t('duel.turn')}</span>
              <span className="text-[12px] font-semibold">{t(`duel.player${player + 1}`)}</span>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">{caseDef ? tr(caseDef.title) : ''}</div>
            <p className="text-sm text-white font-medium"><GlossaryText>{tr(decision.prompt)}</GlossaryText></p>
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
            <p className="text-[10px] text-clinical-subtle">{t('duel.passDevice')}</p>
          </div>
        )}

        {finished && (
          <div className="px-5 py-6 space-y-4 text-center">
            <div className="text-3xl font-extrabold text-white">
              {result.winner === 'draw' ? t('duel.draw') : t('duel.winner', { player: result.winner + 1 })}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([0, 1] as const).map((p) => (
                <div key={p} className={`rounded border p-3 ${playerColour(p)} ${result.winner === p ? 'ring-2 ring-current' : ''}`}>
                  <div className="text-[10px] uppercase tracking-wider">{t(`duel.player${p + 1}`)}</div>
                  <div className="text-2xl font-extrabold mt-1">{p === 0 ? result.p0.ratioPct : result.p1.ratioPct}%</div>
                  <div className="text-[10px] text-clinical-subtle mt-0.5">
                    {p === 0 ? `${result.p0.earned.toFixed(0)} / ${result.p0.max.toFixed(0)}` : `${result.p1.earned.toFixed(0)} / ${result.p1.max.toFixed(0)}`}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={onClose}
              data-autofocus
              className="tap-target px-4 py-2 rounded border border-clinical-border text-clinical-subtle hover:text-white text-xs"
            >
              {t('common.close')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
