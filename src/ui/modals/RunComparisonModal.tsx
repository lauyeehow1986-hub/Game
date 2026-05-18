import type { CaseDefinition } from '../../lib/types';
import { useProgress } from '../../state/progressStore';
import { useT, useTr } from '../../lib/i18n';
import { useFocusTrap } from '../../lib/use-focus-trap';
import { useEffect } from 'react';

interface Props {
  caseDef: CaseDefinition;
  onClose: () => void;
}

const dayOf = (ms: number) => {
  const d = Math.floor((Date.now() - ms) / (1000 * 60 * 60 * 24));
  if (d <= 0) return 'today';
  if (d === 1) return '1d ago';
  return `${d}d ago`;
};

/**
 * Show every stored run of a case as a matrix: rows are decisions in
 * pathway order, columns are runs ordered newest-first. Each cell shows
 * the option the player picked, weighted score, and a colour band so
 * progress (or regression) between attempts is obvious at a glance.
 *
 * Pre-v16 history entries have no log; those columns just show the
 * overall score, no per-decision detail.
 */
export function RunComparisonModal({ caseDef, onClose }: Props) {
  const t = useT();
  const tr = useTr();
  const runHistory = useProgress((s) => s.runHistory);
  const cardRef = useFocusTrap<HTMLDivElement>(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const runs = (runHistory[caseDef.id] ?? []).slice().sort((a, b) => b.at - a.at);
  const decisionNodes = caseDef.pathway.filter((n) => n.decision);

  const colourForRatio = (ratio: number) =>
    ratio >= 0.9
      ? '#4ade80'
      : ratio >= 0.5
      ? '#facc15'
      : ratio >= 0
      ? '#fb923c'
      : '#f87171';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="run-compare-title"
      className="fixed inset-0 z-[65] grid place-items-center bg-black/70 p-4"
    >
      <div
        ref={cardRef}
        className="bg-clinical-panel border border-clinical-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin shadow-2xl"
      >
        <header className="px-5 py-4 border-b border-clinical-border flex items-baseline justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
              {t('compare.tag')}
            </div>
            <h2 id="run-compare-title" className="text-base font-semibold text-white mt-1">
              {tr(caseDef.title)}
            </h2>
          </div>
          <button
            onClick={onClose}
            data-autofocus
            className="text-[11px] text-clinical-subtle hover:text-white"
          >
            {t('common.close')}
          </button>
        </header>

        {runs.length === 0 ? (
          <div className="px-5 py-6 text-[12px] text-clinical-subtle">{t('compare.empty')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[11px]">
              <thead className="border-b border-clinical-border">
                <tr>
                  <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider text-clinical-subtle font-normal w-56">
                    {t('compare.decision')}
                  </th>
                  {runs.map((r, i) => {
                    const ratio = r.max > 0 ? r.score / r.max : 0;
                    return (
                      <th
                        key={`${r.at}-${i}`}
                        className="text-left px-3 py-2 align-bottom min-w-[180px]"
                      >
                        <div className="text-[9px] uppercase tracking-wider text-clinical-subtle">
                          {dayOf(r.at)}
                        </div>
                        <div className="font-mono text-white">
                          {r.score.toFixed(1)} / {r.max.toFixed(1)}
                        </div>
                        <div
                          className="font-mono text-[10px]"
                          style={{ color: colourForRatio(ratio) }}
                        >
                          {(ratio * 100).toFixed(0)}%
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {decisionNodes.map((node) => {
                  const decision = node.decision!;
                  return (
                    <tr
                      key={node.id}
                      className="border-b border-clinical-border/60 align-top"
                    >
                      <td className="px-3 py-2 text-white/85 leading-snug">{tr(decision.prompt)}</td>
                      {runs.map((r, i) => {
                        const entry = r.log?.find((e) => e.decisionId === decision.id);
                        if (!entry) {
                          return (
                            <td
                              key={`${r.at}-${i}`}
                              className="px-3 py-2 text-clinical-subtle text-[10px] italic"
                            >
                              —
                            </td>
                          );
                        }
                        const option = decision.options.find((o) => o.id === entry.optionId);
                        const ratio = entry.maxScore > 0 ? entry.scoreEarned / entry.maxScore : 0;
                        const colour = colourForRatio(ratio);
                        return (
                          <td
                            key={`${r.at}-${i}`}
                            className="px-3 py-2 border-l-2"
                            style={{ borderColor: colour }}
                          >
                            <div className="text-white leading-snug">
                              {option ? tr(option.label) : entry.optionId}
                            </div>
                            <div
                              className="font-mono text-[10px] mt-0.5"
                              style={{ color: colour }}
                            >
                              {entry.scoreEarned.toFixed(1)} / {entry.maxScore.toFixed(1)}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="px-5 py-3 text-[10px] text-clinical-subtle">{t('compare.legacy')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
