import { useState } from 'react';
import { CURRICULA, curriculumProgress, nextCaseInCurriculum, type Curriculum } from '../../lib/curricula';
import { useProgress } from '../../state/progressStore';
import { useGame } from '../../state/gameStore';
import { useCustomCases } from '../../state/customCasesStore';
import { getCase } from '../../content';
import { useT, useTr } from '../../lib/i18n';

export function CurriculumPanel() {
  const t = useT();
  const tr = useTr();
  const bestScores = useProgress((s) => s.bestScores);
  const startCase = useGame((s) => s.startCase);
  const resetRun = useGame((s) => s.resetRun);
  const status = useGame((s) => s.run.status);
  const customCases = useCustomCases((s) => s.cases);
  const [expanded, setExpanded] = useState<string | null>(null);

  const lookupCase = (id: string) => getCase(id) ?? customCases[id];

  const startNext = (curr: Curriculum) => {
    const id = nextCaseInCurriculum(curr, bestScores);
    if (!id) return;
    const c = lookupCase(id);
    if (!c) return;
    if (status !== 'idle') resetRun();
    startCase(c);
  };

  return (
    <section className="bg-clinical-panel border border-clinical-border rounded-lg p-3 space-y-2">
      <header className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-white">{t('curr.heading')}</h3>
        <span className="text-[10px] uppercase tracking-wider text-clinical-subtle">
          {CURRICULA.length}
        </span>
      </header>
      <ul className="space-y-2">
        {CURRICULA.map((curr) => {
          const p = curriculumProgress(curr, bestScores);
          const next = nextCaseInCurriculum(curr, bestScores);
          const isExpanded = expanded === curr.id;
          const nextCase = next ? lookupCase(next) : null;
          const done = p.completed === p.total && p.total > 0;
          return (
            <li
              key={curr.id}
              className={`rounded border ${
                done ? 'border-clinical-ok/40 bg-clinical-ok/5' : 'border-clinical-border bg-clinical-bg'
              } p-2`}
            >
              <button
                onClick={() => setExpanded(isExpanded ? null : curr.id)}
                aria-expanded={isExpanded}
                className="w-full text-left"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <div className="text-xs font-semibold text-white">{curr.title}</div>
                  <span
                    className="text-[10px] font-mono"
                    style={{ color: done ? '#4ade80' : p.ratio > 0 ? '#facc15' : '#7d8ba4' }}
                  >
                    {t('curr.progress', { done: p.completed, total: p.total })}
                  </span>
                </div>
                <p className="text-[11px] text-clinical-subtle mt-1 leading-snug">{curr.blurb}</p>
                <div className="h-1 bg-clinical-bg rounded overflow-hidden mt-1">
                  <div
                    className="h-full"
                    style={{
                      width: `${p.ratio * 100}%`,
                      backgroundColor: done ? '#4ade80' : '#3aa6ff',
                    }}
                  />
                </div>
              </button>

              {isExpanded && (
                <div className="mt-2 space-y-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-clinical-subtle mb-1">
                      {t('curr.objectives')}
                    </div>
                    <ul className="space-y-0.5 text-[11px] text-white/85 list-disc pl-4">
                      {curr.objectives.map((o, i) => (
                        <li key={i}>{o}</li>
                      ))}
                    </ul>
                  </div>
                  <ol className="text-[11px] space-y-0.5">
                    {curr.caseIds.map((id, i) => {
                      const c = lookupCase(id);
                      const has = !!bestScores[id];
                      return (
                        <li
                          key={id}
                          className="flex items-center justify-between gap-2 border-b border-clinical-border/40 py-0.5"
                        >
                          <span
                            className={`truncate ${has ? 'text-clinical-ok' : 'text-clinical-subtle'}`}
                          >
                            {i + 1}. {c ? tr(c.title) : id}
                          </span>
                          {has && (
                            <span className="font-mono text-[10px] text-clinical-ok">✓</span>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}

              <div className="mt-2 flex flex-wrap gap-2">
                {done ? (
                  <span className="text-[11px] px-2 py-1 rounded bg-clinical-ok/15 text-clinical-ok font-semibold">
                    {t('curr.complete')}
                  </span>
                ) : (
                  <button
                    onClick={() => startNext(curr)}
                    disabled={!nextCase}
                    className="text-[11px] px-2 py-1 rounded bg-clinical-accent text-white font-semibold disabled:opacity-40 hover:brightness-110"
                  >
                    {p.completed === 0 ? t('curr.begin') : t('curr.continue')}
                  </button>
                )}
                {nextCase && !done && (
                  <span className="text-[10px] text-clinical-subtle self-center">
                    {t('curr.nextLabel', { title: tr(nextCase.title) })}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
