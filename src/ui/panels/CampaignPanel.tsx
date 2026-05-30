import { useMemo } from 'react';
import { CAMPAIGNS, campaignProgress, nextCaseInCampaign } from '../../lib/campaigns';
import { useCampaign } from '../../state/campaignStore';
import { useProgress } from '../../state/progressStore';
import { useGame } from '../../state/gameStore';
import { getCase } from '../../content';
import { useT } from '../../lib/i18n';

/**
 * Campaign mode — multi-case shifts played back-to-back. Activates one
 * campaign at a time; clicking the Continue button on the active campaign
 * starts (or resumes) the next unscored case in its sequence.
 */
export function CampaignPanel() {
  const t = useT();
  const activeId = useCampaign((s) => s.activeId);
  const setActive = useCampaign((s) => s.setActive);
  const reset = useCampaign((s) => s.reset);
  const bestScores = useProgress((s) => s.bestScores);
  const startCase = useGame((s) => s.startCase);
  const resetRun = useGame((s) => s.resetRun);
  const status = useGame((s) => s.run.status);

  const rows = useMemo(
    () =>
      CAMPAIGNS.map((c) => {
        const p = campaignProgress(c, bestScores);
        const nextId = nextCaseInCampaign(c, bestScores);
        return { c, p, nextId, active: c.id === activeId };
      }),
    [bestScores, activeId],
  );

  const handleStart = (id: string, caseId: string | null) => {
    setActive(id);
    if (!caseId) return;
    const c = getCase(caseId);
    if (!c) return;
    if (status !== 'idle') resetRun();
    startCase(c);
  };

  return (
    <section
      data-tour="campaign"
      className="bg-clinical-panel border border-clinical-border rounded-lg p-3 space-y-2"
    >
      <header className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-white">{t('campaigns.heading')}</h3>
        {activeId && (
          <button
            onClick={reset}
            className="text-[10px] uppercase tracking-wider text-clinical-subtle hover:text-white"
          >
            {t('campaigns.exit')}
          </button>
        )}
      </header>
      <ul className="space-y-2">
        {rows.map(({ c, p, nextId, active }) => {
          const pct = Math.round(p.ratio * 100);
          const done = p.completed === p.total;
          const targetMet =
            p.total > 0 && p.cumulativeScoreRatio / p.total >= c.passRatio;
          return (
            <li
              key={c.id}
              className={`rounded border p-2 ${
                active
                  ? 'border-clinical-accent bg-clinical-accent/5'
                  : 'border-clinical-border'
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <div className="text-[12px] text-white font-semibold">
                  {c.title}
                </div>
                <div className="text-[10px] text-clinical-subtle font-mono">
                  {p.completed}/{p.total} · {pct}%
                </div>
              </div>
              <p className="text-[11px] text-clinical-subtle leading-snug mt-0.5">
                {c.blurb}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {c.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] uppercase tracking-wider px-1 py-0.5 rounded border border-clinical-border text-clinical-subtle"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {p.completed > 0 && (
                <div className="mt-1 text-[10px] text-clinical-subtle font-mono">
                  {t('campaigns.avg', {
                    avg: Math.round((p.cumulativeScoreRatio / p.completed) * 100),
                    target: Math.round(c.passRatio * 100),
                  })}
                </div>
              )}
              {done ? (
                <div
                  className={`mt-2 text-[11px] ${
                    targetMet ? 'text-clinical-ok' : 'text-clinical-warn'
                  }`}
                >
                  {targetMet
                    ? t('campaigns.passed', {
                        target: Math.round(c.passRatio * 100),
                      })
                    : t('campaigns.missedTarget', {
                        target: Math.round(c.passRatio * 100),
                      })}
                </div>
              ) : (
                <button
                  onClick={() => handleStart(c.id, nextId)}
                  className="mt-2 tap-target w-full text-[11px] px-2 py-1.5 rounded bg-clinical-accent/15 border border-clinical-accent/40 text-clinical-accent hover:bg-clinical-accent/25"
                >
                  {active
                    ? t('campaigns.continue')
                    : t('campaigns.start')}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
