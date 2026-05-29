import { useEffect, lazy, Suspense } from 'react';
import { useGame } from '../../state/gameStore';
import { useProgress } from '../../state/progressStore';
import { gradeForRatio, totalScoreFromLog } from '../../lib/scoring';
import { usePerspective } from '../../state/perspectiveStore';
import { chimeCaseComplete } from '../../lib/audio';
import { useState } from 'react';
import { compareToBestPath } from '../../lib/best-path';
import { useT, useTr, useLocale } from '../../lib/i18n';
import { generateLessonPlan } from '../../lib/lesson-plan';
import { openPrintableLessonPlan } from '../../lib/lesson-plan-print';
import { encodeRunToUrl } from '../../lib/case-share';
import { GlossaryText } from '../GlossaryText';
import { useAchievements } from '../../state/achievementsStore';
import { useStreak, currentStreakValue } from '../../state/streakStore';
import { useFocusTrap } from '../../lib/use-focus-trap';

const PracticeDecisionModal = lazy(() =>
  import('./PracticeDecisionModal').then((m) => ({ default: m.PracticeDecisionModal })),
);

export function ResultsModal() {
  const t = useT();
  const tr = useTr();
  const status = useGame((s) => s.run.status);
  const log = useGame((s) => s.run.log);
  const caseDef = useGame((s) => s.caseDef);
  const totalCost = useGame((s) => s.run.totalCostSGD);
  const totals = useGame((s) => s.totals);
  const burden = useGame((s) => s.caregiverBurden);
  const profile = useGame((s) => s.profile);
  const elapsed = useGame((s) => s.run.elapsedGameMin);
  const resetRun = useGame((s) => s.resetRun);
  const startCase = useGame((s) => s.startCase);
  const perspective = usePerspective((s) => s.current);
  const setPerspective = usePerspective((s) => s.set);
  const recordCaseResult = useProgress((s) => s.recordCaseResult);
  const runHistory = useProgress((s) => s.runHistory);
  const decisionNotes = useProgress((s) => s.decisionNotes);
  const setDecisionNote = useProgress((s) => s.setDecisionNote);
  const fireAchievement = useAchievements((s) => s.fire);
  const recordStreakDay = useStreak((s) => s.recordToday);
  const cardRef = useFocusTrap<HTMLDivElement>(status === 'completed');
  const [practice, setPractice] = useState<{ decisionId: string } | null>(null);

  // Build a {decisionId -> text} view of the persisted notes for the
  // currently-completed case, so the ExportButtons + textareas read off
  // the same shape they used pre-persistence.
  const caseId = caseDef?.id ?? '';
  const notes: Record<string, string> = {};
  if (caseId) {
    const prefix = `${caseId}|`;
    for (const [k, v] of Object.entries(decisionNotes)) {
      if (k.startsWith(prefix)) notes[k.slice(prefix.length)] = v;
    }
  }

  useEffect(() => {
    if (status === 'completed' && caseDef) {
      const { earned, max } = totalScoreFromLog(log);
      recordCaseResult(caseDef.id, earned, max, log);
      recordStreakDay();
      chimeCaseComplete();
      const runsForThisCase = (runHistory[caseDef.id]?.length ?? 0) + 1;
      fireAchievement({
        kind: 'case-completed',
        caseId: caseDef.id,
        scoreRatio: max > 0 ? earned / max : 0,
        runsForThisCase,
        currentStreakDays: currentStreakValue(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, caseDef, log, recordCaseResult]);

  if (status !== 'completed' || !caseDef) return null;
  const { earned, max } = totalScoreFromLog(log);
  const ratio = max > 0 ? earned / max : 0;
  const grade = gradeForRatio(ratio);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
    >
      <div ref={cardRef} className="bg-clinical-panel border border-clinical-border rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin shadow-2xl">
        <header className="px-5 py-4 border-b border-clinical-border flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">Case complete</div>
            <h2 className="text-lg font-semibold text-white">{tr(caseDef.title)}</h2>
          </div>
          <div
            className="px-3 py-1.5 rounded font-bold text-base"
            style={{ backgroundColor: `${grade.colour}22`, color: grade.colour }}
          >
            {grade.grade}
          </div>
        </header>

        <section className="px-5 py-4 grid grid-cols-3 gap-3 border-b border-clinical-border">
          <Stat label="Score" value={`${earned.toFixed(1)} / ${max.toFixed(1)}`} />
          <Stat label="Decisions" value={`${log.length}`} />
          <Stat label="Cash OOP" value={`S$${totalCost.toFixed(0)}`} />
          <Stat label="In-game time" value={fmtElapsed(elapsed)} />
          <Stat label="Outcome" value={grade.message} />
          {profile && (
            <Stat
              label="Ward class"
              value={profile.wardClass === 'na' ? 'Outpatient' : `Class ${profile.wardClass}`}
            />
          )}
        </section>

        {totals.gross > 0 && (
          <section className="px-5 py-4 border-b border-clinical-border space-y-2">
            <h3 className="text-sm font-semibold text-white">Patient financing breakdown</h3>
            <div className="grid grid-cols-5 gap-2 text-xs">
              <Money label="Gross" value={totals.gross} colour="#cbd5f5" />
              <Money label="Subsidy" value={totals.subsidy} colour="#4ade80" />
              <Money label="MediShield" value={totals.mediShield} colour="#3aa6ff" />
              <Money label="MediSave" value={totals.mediSave} colour="#a3e635" />
              <Money label="Cash" value={totals.cash} colour={totals.cash > 1500 ? '#f87171' : '#facc15'} />
            </div>
            <div className="flex gap-3 text-[11px] text-clinical-subtle pt-2">
              <span>Caregiver: <span className="text-white">{burden.timeOffWorkHours.toFixed(0)}h off work</span></span>
              <span>Worry: <span className="text-white">{burden.financialWorry.toFixed(0)}/100</span></span>
              <span>Sleep debt: <span className="text-white">{burden.sleepDebt.toFixed(0)}/100</span></span>
            </div>
          </section>
        )}

        <section className="px-5 py-4 border-b border-clinical-border space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">View by perspective</h3>
            <div className="flex gap-1 ml-auto bg-clinical-bg border border-clinical-border rounded-full p-0.5">
              {(['patient', 'caregiver', 'staff'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPerspective(p)}
                  className={`px-2 py-0.5 text-[11px] rounded-full ${
                    perspective === p
                      ? 'bg-clinical-accent text-white font-semibold'
                      : 'text-clinical-subtle'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            {log.map((e, i) => {
              const node = caseDef.pathway.find((n) => n.id === e.nodeId)!;
              const decision = node.decision!;
              const option = decision.options.find((o) => o.id === e.optionId)!;
              const correct = e.scoreEarned >= e.maxScore - 0.01;
              return (
                <div
                  key={`${e.nodeId}-${i}`}
                  className="border border-clinical-border rounded p-3 bg-clinical-bg/40"
                >
                  <div className="flex justify-between text-[10px] uppercase tracking-wider text-clinical-subtle">
                    <span>{tr(decision.reference.label)}</span>
                    <span
                      className={
                        correct ? 'text-clinical-ok' : e.scoreEarned >= 0 ? 'text-clinical-warn' : 'text-clinical-danger'
                      }
                    >
                      {e.scoreEarned.toFixed(1)} / {e.maxScore.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-sm text-white font-semibold mt-1">
                    <GlossaryText>{tr(decision.prompt)}</GlossaryText>
                  </div>
                  <div className="text-xs text-clinical-subtle mt-1">
                    Your choice: <GlossaryText>{tr(option.label)}</GlossaryText>
                  </div>
                  <div className="text-xs text-white/80 mt-1">
                    <GlossaryText>{tr(option.rationale)}</GlossaryText>
                  </div>
                  {tr(option.outcome[perspective]) && (
                    <blockquote className="mt-2 text-xs italic border-l-2 border-clinical-accent pl-2 text-white/85">
                      {tr(option.outcome[perspective])}
                    </blockquote>
                  )}
                  <label className="block mt-2 text-[11px]">
                    <span className="text-[9px] uppercase tracking-wider text-clinical-subtle">
                      {t('results.note.label')}
                    </span>
                    <textarea
                      value={notes[decision.id] ?? ''}
                      onChange={(e) =>
                        setDecisionNote(caseDef.id, decision.id, e.target.value)
                      }
                      placeholder={t('results.note.placeholder')}
                      rows={2}
                      className="mt-0.5 w-full bg-clinical-bg border border-clinical-border rounded px-2 py-1 text-[11px] text-white resize-y"
                    />
                  </label>
                  <button
                    onClick={() => setPractice({ decisionId: decision.id })}
                    className="mt-1 text-[10px] px-2 py-0.5 rounded border border-clinical-accent/40 text-clinical-accent hover:bg-clinical-accent/10"
                  >
                    {t('results.practiceDecision')}
                  </button>
                  {decision.options.length > 1 && (
                    <details className="mt-2 text-[11px]">
                      <summary className="cursor-pointer text-clinical-subtle hover:text-white">
                        Other options ({decision.options.length - 1})
                      </summary>
                      <ul className="mt-1 space-y-1.5">
                        {decision.options
                          .filter((o) => o.id !== option.id)
                          .sort((a, b) => b.score - a.score)
                          .map((o) => {
                            const ratio = e.maxScore > 0 ? (o.score * decision.weight) / e.maxScore : 0;
                            const colour =
                              ratio >= 0.9
                                ? 'text-clinical-ok'
                                : ratio >= 0.5
                                ? 'text-clinical-warn'
                                : 'text-clinical-danger';
                            return (
                              <li key={o.id} className="border-l border-clinical-border pl-2">
                                <div className="flex justify-between gap-2">
                                  <span className="text-white/85">
                                    <GlossaryText>{tr(o.label)}</GlossaryText>
                                  </span>
                                  <span className={`font-mono shrink-0 ${colour}`}>
                                    {(o.score * decision.weight).toFixed(1)}
                                  </span>
                                </div>
                                <div className="text-clinical-subtle leading-snug">
                                  <GlossaryText>{tr(o.rationale)}</GlossaryText>
                                </div>
                              </li>
                            );
                          })}
                      </ul>
                    </details>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {(() => {
          const diff = compareToBestPath(caseDef, log);
          if (diff.length === 0) return null;
          return (
            <section className="px-5 py-4 border-b border-clinical-border space-y-2">
              <h3 className="text-sm font-semibold text-white">{t('results.bestPath.h')}</h3>
              <div className="grid gap-2">
                {diff.map((row, i) => {
                  const yours = row.yours;
                  const delta = yours ? row.best.score - yours.score : row.best.score;
                  return (
                    <div
                      key={i}
                      className={`border rounded p-2 ${
                        row.match
                          ? 'border-clinical-ok/40 bg-clinical-ok/5'
                          : 'border-clinical-warn/40 bg-clinical-warn/5'
                      }`}
                    >
                      <div className="flex justify-between text-[10px] uppercase tracking-wider">
                        <span className="text-clinical-subtle truncate flex-1"><GlossaryText>{tr(row.prompt)}</GlossaryText></span>
                        <span
                          className={
                            row.match ? 'text-clinical-ok' : 'text-clinical-warn'
                          }
                        >
                          {row.match ? t('results.bestPath.match') : t('results.bestPath.miss')}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 text-[11px]">
                        <div>
                          <div className="text-[9px] uppercase tracking-wider text-clinical-subtle">
                            {t('results.bestPath.you')}
                          </div>
                          <div className="text-white">{yours ? <GlossaryText>{tr(yours.label)}</GlossaryText> : '—'}</div>
                          {yours && (
                            <div className="font-mono text-[10px] text-clinical-subtle">
                              {yours.score.toFixed(1)} / {yours.maxScore.toFixed(1)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-[9px] uppercase tracking-wider text-clinical-subtle">
                            {t('results.bestPath.best')}
                          </div>
                          <div className="text-white"><GlossaryText>{tr(row.best.label)}</GlossaryText></div>
                          <div className="font-mono text-[10px] text-clinical-subtle">
                            {row.best.score.toFixed(1)}
                            {!row.match && (
                              <span className="ml-2 text-clinical-warn">
                                {t('results.bestPath.deltaScore', { delta: delta.toFixed(1) })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })()}

        {caseDef.historical && caseDef.citations && caseDef.citations.length > 0 && (
          <section className="px-5 py-4 border-b border-clinical-border space-y-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                Historical
              </span>
              Educational disclaimer & citations
            </h3>
            <p className="text-[11px] text-clinical-subtle leading-snug">
              This scenario is a simplified educational reconstruction of a real Singapore healthcare event.
              Decisions, timings, and outcomes are stylised; refer to the listed sources and current MOH /
              NCID guidance for clinical or operational use.
            </p>
            <ul className="space-y-1 text-[11px]">
              {caseDef.citations.map((c, i) => (
                <li key={i} className="text-clinical-subtle">
                  <span className="text-white/70">[{i + 1}]</span> {c}
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="px-5 py-4 flex items-center justify-end gap-2 flex-wrap">
          <ExportButtons notes={notes} />
          <button
            onClick={() => {
              resetRun();
              startCase(caseDef);
            }}
            className="tap-target px-4 py-2 rounded bg-clinical-accent text-white text-xs font-semibold hover:brightness-110"
          >
            {t('results.replay')}
          </button>
          <button
            onClick={resetRun}
            data-autofocus
            className="tap-target px-4 py-2 rounded border border-clinical-border text-clinical-subtle hover:text-white text-xs"
          >
            {t('common.close')}
          </button>
        </footer>
      </div>
      <Suspense fallback={null}>
        {practice && (
          <PracticeDecisionModal
            caseDef={caseDef}
            decisionId={practice.decisionId}
            onClose={() => setPractice(null)}
          />
        )}
      </Suspense>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-clinical-border bg-clinical-bg/40 p-2">
      <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">{label}</div>
      <div className="text-sm font-semibold text-white mt-0.5">{value}</div>
    </div>
  );
}

function Money({ label, value, colour }: { label: string; value: number; colour: string }) {
  return (
    <div className="rounded border border-clinical-border bg-clinical-bg/40 p-2">
      <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">{label}</div>
      <div className="text-sm font-mono font-semibold mt-0.5" style={{ color: colour }}>
        S${value.toFixed(0)}
      </div>
    </div>
  );
}

function fmtElapsed(min: number) {
  const h = Math.floor(min / 60);
  const d = Math.floor(h / 24);
  const remH = h % 24;
  if (d > 0) return `${d}d ${remH}h`;
  if (h > 0) return `${h}h ${min % 60}m`;
  return `${min}m`;
}

function ExportButtons({ notes }: { notes: Record<string, string> }) {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const caseDef = useGame((s) => s.caseDef);
  const log = useGame((s) => s.run.log);
  const journey = useGame((s) => s.run.journey);
  const elapsed = useGame((s) => s.run.elapsedGameMin);
  const totalCost = useGame((s) => s.run.totalCostSGD);
  const burden = useGame((s) => s.caregiverBurden);
  const profile = useGame((s) => s.profile);
  const fireAchievement = useAchievements((s) => s.fire);
  const [toast, setToast] = useState<string | null>(null);

  if (!caseDef) return null;

  const fireExport = () => fireAchievement({ kind: 'export-used' });

  const lesson = () =>
    generateLessonPlan({
      caseDef,
      log,
      journey,
      elapsedGameMin: elapsed,
      totalCostSGD: totalCost,
      burden,
      locale,
      profile: profile
        ? {
            name: profile.name,
            wardClass: profile.wardClass,
            chasTier: profile.chasTier,
            hasIntegratedShield: profile.hasIntegratedShield,
          }
        : undefined,
      notes,
    });

  const copyLesson = async () => {
    try {
      await navigator.clipboard.writeText(lesson());
      setToast(t('results.copyLessonDone'));
    } catch {
      setToast(t('results.copyLesson'));
    }
    fireExport();
    setTimeout(() => setToast(null), 3000);
  };

  const downloadLesson = () => {
    if (typeof document === 'undefined') return;
    const blob = new Blob([lesson()], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${caseDef.id}.lesson.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    fireExport();
  };

  const printLesson = () => {
    fireExport();
    openPrintableLessonPlan({
      notes,
      caseDef,
      log,
      journey,
      elapsedGameMin: elapsed,
      totalCostSGD: totalCost,
      burden,
      locale,
      profile: profile
        ? {
            name: profile.name,
            wardClass: profile.wardClass,
            chasTier: profile.chasTier,
            hasIntegratedShield: profile.hasIntegratedShield,
          }
        : undefined,
    });
  };

  const shareRun = async () => {
    const url = encodeRunToUrl({
      caseId: caseDef.id,
      log,
      journey,
      elapsedGameMin: elapsed,
      totalCostSGD: totalCost,
      burden,
      profile: profile
        ? {
            name: profile.name,
            wardClass: profile.wardClass,
            chasTier: profile.chasTier,
            hasIntegratedShield: profile.hasIntegratedShield,
          }
        : undefined,
    });
    try {
      await navigator.clipboard.writeText(url);
      setToast(t('results.shareRunDone'));
    } catch {
      setToast(url);
    }
    fireExport();
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mr-auto">
      <button
        onClick={copyLesson}
        className="text-[11px] px-2 py-1 rounded border border-clinical-border text-clinical-subtle hover:text-white"
      >
        {t('results.copyLesson')}
      </button>
      <button
        onClick={downloadLesson}
        className="text-[11px] px-2 py-1 rounded border border-clinical-border text-clinical-subtle hover:text-white"
      >
        {t('results.downloadLesson')}
      </button>
      <button
        onClick={printLesson}
        className="text-[11px] px-2 py-1 rounded border border-clinical-border text-clinical-subtle hover:text-white"
      >
        {t('results.printLesson')}
      </button>
      <button
        onClick={shareRun}
        className="text-[11px] px-2 py-1 rounded border border-clinical-border text-clinical-subtle hover:text-white"
      >
        {t('results.shareRun')}
      </button>
      {toast && <span className="text-[10px] text-clinical-accent">{toast}</span>}
    </div>
  );
}
