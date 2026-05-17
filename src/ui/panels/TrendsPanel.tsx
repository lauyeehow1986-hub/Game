import { listCases } from '../../content';
import { useCustomCases } from '../../state/customCasesStore';
import { useProgress } from '../../state/progressStore';
import { useGame } from '../../state/gameStore';
import { useAchievements } from '../../state/achievementsStore';
import { computePersonalTrends, gradeBandLabel } from '../../lib/personal-trends';
import { useT, useTr } from '../../lib/i18n';
import { ACHIEVEMENTS } from '../../lib/achievements';

const CATEGORY_COLOURS: Record<'acute' | 'elective' | 'outpatient', string> = {
  acute: '#f87171',
  elective: '#38bdf8',
  outpatient: '#4ade80',
};

const gradeColour = (ratio: number): string => {
  if (ratio >= 0.9) return '#4ade80';
  if (ratio >= 0.75) return '#a3e635';
  if (ratio >= 0.5) return '#facc15';
  return '#f87171';
};

/**
 * Renders a tiny CSS-only sparkline of recent case ratios. Newest on the
 * right; bars colour-graded by ratio band.
 */
function Sparkline({ ratios }: { ratios: number[] }) {
  if (ratios.length === 0) return null;
  // Show last 12 entries (oldest -> newest).
  const shown = ratios.slice(-12);
  return (
    <div className="flex items-end gap-0.5 h-6">
      {shown.map((r, i) => (
        <div
          key={i}
          className="w-1.5 rounded-t"
          style={{
            height: `${Math.max(8, r * 100)}%`,
            backgroundColor: gradeColour(r),
          }}
          title={`${(r * 100).toFixed(0)}%`}
        />
      ))}
    </div>
  );
}

export function TrendsPanel() {
  const t = useT();
  const tr = useTr();
  const bestScores = useProgress((s) => s.bestScores);
  const decisionsMade = useProgress((s) => s.decisionsMade);
  const casesCompleted = useProgress((s) => s.casesCompleted);
  const customCases = useCustomCases((s) => s.cases);
  const startCase = useGame((s) => s.startCase);
  const resetRun = useGame((s) => s.resetRun);
  const status = useGame((s) => s.run.status);
  const unlockedAchievements = useAchievements((s) => s.unlocked);

  const catalogue = [...listCases(), ...Object.values(customCases)];
  const runHistory = useProgress((s) => s.runHistory);
  const trends = computePersonalTrends(bestScores, catalogue, (c) => tr(c.title));
  // Build a chronological list of ratios (oldest -> newest) for the sparkline.
  const ratiosOldFirst = [...trends.caseTrends]
    .sort((a, b) => a.at - b.at)
    .map((c) => c.ratio);
  const meanGrade = gradeBandLabel(trends.meanRatio);
  const recommended = trends.recommendedCaseId
    ? catalogue.find((c) => c.id === trends.recommendedCaseId)
    : null;

  const playRecommended = () => {
    if (!recommended) return;
    if (status !== 'idle') resetRun();
    startCase(recommended);
  };

  return (
    <section className="bg-clinical-panel border border-clinical-border rounded-lg p-3 space-y-3">
      <header className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-white">{t('trends.heading')}</h3>
        <span className="text-[10px] uppercase tracking-wider text-clinical-subtle">
          {t('lb.runs', { runs: casesCompleted, decisions: decisionsMade })}
        </span>
      </header>

      <div className="grid grid-cols-3 gap-2 text-[11px]">
        <Mini label={t('lb.cases')} value={`${trends.totalPlayed}/${trends.totalCases}`} />
        <Mini
          label={t('lb.avg')}
          value={`${(trends.meanRatio * 100).toFixed(0)}%`}
          colour={gradeColour(trends.meanRatio)}
        />
        <Mini label={t('trends.grade')} value={trends.totalPlayed > 0 ? meanGrade : '—'} />
      </div>

      {trends.totalPlayed > 0 && (
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
            {t('trends.recentRuns')}
          </div>
          <Sparkline ratios={ratiosOldFirst} />
        </div>
      )}

      <div className="space-y-1 border-t border-clinical-border pt-2">
        <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
          {t('trends.byCategory')}
        </div>
        {trends.byCategory.map((c) => {
          const pct = c.meanRatio * 100;
          return (
            <div key={c.category} className="space-y-0.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-clinical-subtle">
                  {t(`cases.category.${c.category}`)} · {c.cases}
                </span>
                <span className="font-mono text-white">{c.cases > 0 ? `${pct.toFixed(0)}%` : '—'}</span>
              </div>
              <div className="h-1.5 bg-clinical-bg rounded overflow-hidden">
                <div
                  className="h-full"
                  style={{
                    width: `${pct}%`,
                    backgroundColor:
                      c.cases === 0 ? '#1f2a44' : gradeColour(c.meanRatio),
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {recommended && (
        <div className="border border-clinical-accent/40 rounded p-2 bg-clinical-accent/10 text-[11px] space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-clinical-accent">
            {t('trends.recommended')}
          </div>
          <div className="text-white">{tr(recommended.title)}</div>
          <div className="flex gap-2 mt-1">
            <button
              onClick={playRecommended}
              className="text-[11px] px-2 py-1 rounded bg-clinical-accent text-white font-semibold hover:brightness-110"
            >
              {bestScores[recommended.id] ? t('trends.replay') : t('cases.startCase')}
            </button>
            {bestScores[recommended.id] && (
              <span className="text-[10px] text-clinical-subtle self-center font-mono">
                {t('cases.best')} {bestScores[recommended.id].score.toFixed(1)} /{' '}
                {bestScores[recommended.id].max.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      )}

      <details className="text-[11px] border-t border-clinical-border pt-2">
        <summary className="cursor-pointer text-clinical-subtle hover:text-white">
          {t('ach.heading')} ·{' '}
          {t('ach.progress', { done: unlockedAchievements.length, total: ACHIEVEMENTS.length })}
        </summary>
        <ul className="mt-2 grid grid-cols-2 gap-1">
          {ACHIEVEMENTS.map((a) => {
            const got = unlockedAchievements.includes(a.id);
            return (
              <li
                key={a.id}
                className={`border rounded px-2 py-1 ${
                  got
                    ? 'border-amber-400/50 bg-amber-500/10'
                    : 'border-clinical-border bg-clinical-bg/30 opacity-60'
                }`}
                title={t(`ach.desc.${a.id}`) || a.description}
              >
                <div className="text-[11px] font-semibold text-white truncate">
                  {got ? t(`ach.title.${a.id}`) || a.title : t('ach.locked')}
                </div>
                <div className="text-[9px] text-clinical-subtle truncate">
                  {t(`ach.desc.${a.id}`) || a.description}
                </div>
              </li>
            );
          })}
        </ul>
      </details>

      {trends.caseTrends.length > 0 && (
        <details className="text-[11px]">
          <summary className="cursor-pointer text-clinical-subtle hover:text-white">
            {t('trends.allCases')} ({trends.caseTrends.length})
          </summary>
          <ul className="mt-1 space-y-1 max-h-56 overflow-y-auto scrollbar-thin pr-1">
            {trends.caseTrends.map((row) => {
              const caseHistory = runHistory[row.caseId] ?? [];
              const historyRatios = caseHistory.map((e) =>
                e.max > 0 ? e.score / e.max : 0,
              );
              return (
              <li
                key={row.caseId}
                className="flex items-center gap-2 border border-clinical-border rounded px-2 py-1"
              >
                <span
                  className="w-1.5 h-6 rounded"
                  style={{ backgroundColor: CATEGORY_COLOURS[row.category] }}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-white truncate">{row.title}</div>
                  <div className="text-[9px] text-clinical-subtle uppercase tracking-wider">
                    {row.category}
                    {caseHistory.length > 1 && ` · ${caseHistory.length} runs`}
                  </div>
                </div>
                {historyRatios.length > 1 && (
                  <div className="hidden sm:flex items-end gap-px h-6 mr-1">
                    {historyRatios.slice(-6).map((r, i) => (
                      <div
                        key={i}
                        className="w-1 rounded-t"
                        style={{
                          height: `${Math.max(8, r * 100)}%`,
                          backgroundColor: gradeColour(r),
                        }}
                        title={`${(r * 100).toFixed(0)}%`}
                      />
                    ))}
                  </div>
                )}
                <div className="text-right font-mono">
                  <div className="text-white">
                    {row.score.toFixed(1)}/{row.max.toFixed(1)}
                  </div>
                  <div className="text-[9px]" style={{ color: gradeColour(row.ratio) }}>
                    {(row.ratio * 100).toFixed(0)}%
                  </div>
                </div>
              </li>
              );
            })}
          </ul>
        </details>
      )}
    </section>
  );
}

function Mini({ label, value, colour }: { label: string; value: string; colour?: string }) {
  return (
    <div className="rounded border border-clinical-border bg-clinical-bg/40 px-2 py-1">
      <div className="text-[9px] uppercase tracking-wider text-clinical-subtle">{label}</div>
      <div
        className="font-mono text-[11px] text-white"
        style={colour ? { color: colour } : undefined}
      >
        {value}
      </div>
    </div>
  );
}
