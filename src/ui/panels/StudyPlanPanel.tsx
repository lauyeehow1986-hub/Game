import { useMemo } from 'react';
import { listCases, getCase } from '../../content';
import { useProgress } from '../../state/progressStore';
import { useGame } from '../../state/gameStore';
import { useCustomCases } from '../../state/customCasesStore';
import { useT, useTr } from '../../lib/i18n';
import { CURRICULA } from '../../lib/curricula';
import { buildStudyPlan, type StudyKind } from '../../lib/study-plan';

/**
 * Today's adaptive study plan — composes spaced retrieval, weakest practice,
 * curriculum continuity, the daily challenge, and a discovery pick into a
 * ranked list of 5 things to do. Each row starts the case directly.
 */
const KIND_BADGE: Record<StudyKind, string> = {
  review: 'border-clinical-warn/40 text-clinical-warn bg-clinical-warn/5',
  practice: 'border-clinical-accent/40 text-clinical-accent bg-clinical-accent/5',
  curriculum: 'border-clinical-ok/40 text-clinical-ok bg-clinical-ok/5',
  daily: 'border-amber-500/40 text-amber-300 bg-amber-500/5',
  discover: 'border-clinical-border text-clinical-subtle',
};

export function StudyPlanPanel() {
  const t = useT();
  const tr = useTr();
  const bestScores = useProgress((s) => s.bestScores);
  const runHistory = useProgress((s) => s.runHistory);
  const unlocked = useProgress((s) => s.unlockedCaseIds);
  const customCases = useCustomCases((s) => s.cases);
  const startCase = useGame((s) => s.startCase);
  const resetRun = useGame((s) => s.resetRun);
  const status = useGame((s) => s.run.status);

  const plan = useMemo(() => {
    const catalogue = [...listCases(), ...Object.values(customCases)];
    const playableIds = catalogue.filter((c) => unlocked.includes(c.id)).map((c) => c.id);
    const unplayedIds = catalogue.filter((c) => !bestScores[c.id] && unlocked.includes(c.id)).map((c) => c.id);
    return buildStudyPlan({
      bestScores,
      runHistory,
      playableIds,
      unplayedIds,
      curricula: CURRICULA.map((c) => ({ id: c.id, caseIds: c.caseIds })),
    });
  }, [bestScores, runHistory, unlocked, customCases]);

  if (plan.length === 0) return null;

  const start = (id: string) => {
    const c = getCase(id);
    if (!c) return;
    if (status !== 'idle') resetRun();
    startCase(c);
  };

  return (
    <section className="bg-clinical-panel border border-clinical-border rounded-lg p-3 space-y-2" data-tour="study-plan">
      <header className="flex items-baseline justify-between gap-1">
        <h3 className="text-sm font-semibold text-white">{t('plan.heading')}</h3>
        <span className="text-[10px] uppercase tracking-wider text-clinical-subtle">
          {plan.length}
        </span>
      </header>
      <ol className="space-y-1.5">
        {plan.map((task, i) => {
          const c = getCase(task.caseId);
          if (!c) return null;
          return (
            <li key={`${task.kind}-${task.caseId}-${task.decisionId ?? ''}`} className="flex items-start gap-2">
              <span className="text-[10px] font-mono text-clinical-subtle pt-1">{i + 1}.</span>
              <button
                onClick={() => start(task.caseId)}
                className="flex-1 text-left rounded border border-clinical-border bg-clinical-bg/30 hover:bg-clinical-bg p-2"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[12px] text-white font-medium truncate">{tr(c.title)}</span>
                  <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${KIND_BADGE[task.kind]}`}>
                    {t(`plan.kind.${task.kind}`)}
                  </span>
                </div>
                <div className="text-[10px] text-clinical-subtle leading-snug mt-0.5">
                  {t(task.reason)}
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
