import { useMemo } from 'react';
import { useFocusTrap } from '../../lib/use-focus-trap';
import { useT } from '../../lib/i18n';
import { useProgress } from '../../state/progressStore';
import { gradeHistogram, runsPerWeek, analyticsSummary } from '../../lib/analytics';

interface Props {
  open: boolean;
  onClose: () => void;
}

const BAND_COLOUR: Record<string, string> = {
  A: '#4ade80', B: '#a3e635', C: '#facc15', D: '#f87171',
};

/**
 * Analytics dashboard: distribution + time-series views over runHistory,
 * complementing the inline Trends panel. CSS-only bar charts (no chart lib).
 */
export function AnalyticsModal({ open, onClose }: Props) {
  const t = useT();
  const cardRef = useFocusTrap<HTMLDivElement>(open);
  const runHistory = useProgress((s) => s.runHistory);

  const summary = useMemo(() => analyticsSummary(runHistory), [runHistory]);
  const histo = useMemo(() => gradeHistogram(runHistory), [runHistory]);
  const weeks = useMemo(() => runsPerWeek(runHistory, 8), [runHistory]);

  if (!open) return null;

  const histoMax = Math.max(1, ...histo.map((b) => b.count));
  const weekMax = Math.max(1, ...weeks.map((w) => w.runs));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="analytics-title"
      className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4"
    >
      <div
        ref={cardRef}
        className="bg-clinical-panel border border-clinical-border rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto scrollbar-thin shadow-2xl"
      >
        <header className="px-5 py-3 border-b border-clinical-border flex items-baseline justify-between">
          <h2 id="analytics-title" className="text-sm font-semibold text-white">{t('analytics.heading')}</h2>
          <button onClick={onClose} className="text-[11px] text-clinical-subtle hover:text-white">
            {t('common.close')}
          </button>
        </header>

        {summary.totalRuns === 0 ? (
          <div className="px-5 py-8 text-center text-[12px] text-clinical-subtle">{t('analytics.empty')}</div>
        ) : (
          <div className="px-5 py-4 space-y-5 text-[12px]">
            {/* Summary tiles */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <Tile value={`${summary.totalRuns}`} label={t('analytics.runs')} />
              <Tile value={`${Math.round(summary.meanRatio * 100)}%`} label={t('analytics.mean')} />
              <Tile value={`${Math.round(summary.bestRatio * 100)}%`} label={t('analytics.best')} />
              <Tile value={`${summary.distinctions}`} label={t('analytics.distinctions')} />
            </div>

            {/* Grade distribution */}
            <section>
              <div className="text-[10px] uppercase tracking-wider text-clinical-subtle mb-1.5">{t('analytics.distribution')}</div>
              <div className="space-y-1">
                {histo.map((b) => (
                  <div key={b.band} className="flex items-center gap-2">
                    <span className="w-12 text-clinical-subtle">{b.label}</span>
                    <div className="flex-1 bg-clinical-bg rounded h-4 overflow-hidden">
                      <div
                        className="h-full rounded"
                        style={{ width: `${(b.count / histoMax) * 100}%`, backgroundColor: BAND_COLOUR[b.band], minWidth: b.count > 0 ? '6px' : 0 }}
                      />
                    </div>
                    <span className="w-6 text-right font-mono text-white">{b.count}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Activity over time */}
            <section>
              <div className="text-[10px] uppercase tracking-wider text-clinical-subtle mb-1.5">{t('analytics.activity')}</div>
              <div className="flex items-end gap-1 h-20">
                {weeks.map((w) => (
                  <div key={w.weekStart} className="flex-1 flex flex-col items-center justify-end gap-1" title={`${w.weekStart}: ${w.runs}`}>
                    <div
                      className="w-full rounded-t bg-clinical-accent"
                      style={{ height: `${(w.runs / weekMax) * 100}%`, minHeight: w.runs > 0 ? '4px' : 0 }}
                    />
                    <span className="text-[8px] text-clinical-subtle font-mono">{w.weekStart.slice(5)}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded border border-clinical-border p-2">
      <div className="text-sm font-semibold text-white">{value}</div>
      <div className="text-[9px] uppercase tracking-wider text-clinical-subtle">{label}</div>
    </div>
  );
}
