import { useEffect } from 'react';
import { useGame } from '../../state/gameStore';
import { useProgress } from '../../state/progressStore';
import { gradeForRatio, totalScoreFromLog } from '../../lib/scoring';
import { usePerspective } from '../../state/perspectiveStore';

export function ResultsModal() {
  const status = useGame((s) => s.run.status);
  const log = useGame((s) => s.run.log);
  const caseDef = useGame((s) => s.caseDef);
  const totalCost = useGame((s) => s.run.totalCostSGD);
  const elapsed = useGame((s) => s.run.elapsedGameMin);
  const resetRun = useGame((s) => s.resetRun);
  const perspective = usePerspective((s) => s.current);
  const setPerspective = usePerspective((s) => s.set);
  const recordCaseResult = useProgress((s) => s.recordCaseResult);

  useEffect(() => {
    if (status === 'completed' && caseDef) {
      const { earned, max } = totalScoreFromLog(log);
      recordCaseResult(caseDef.id, earned, max);
    }
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
      <div className="bg-clinical-panel border border-clinical-border rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin shadow-2xl">
        <header className="px-5 py-4 border-b border-clinical-border flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">Case complete</div>
            <h2 className="text-lg font-semibold text-white">{caseDef.title}</h2>
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
          <Stat label="Patient bill" value={`S$${totalCost.toFixed(0)}`} />
          <Stat label="In-game time" value={fmtElapsed(elapsed)} />
          <Stat label="Outcome" value={grade.message} />
        </section>

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
                    <span>{decision.reference.label}</span>
                    <span
                      className={
                        correct ? 'text-clinical-ok' : e.scoreEarned >= 0 ? 'text-clinical-warn' : 'text-clinical-danger'
                      }
                    >
                      {e.scoreEarned.toFixed(1)} / {e.maxScore.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-sm text-white font-semibold mt-1">{decision.prompt}</div>
                  <div className="text-xs text-clinical-subtle mt-1">Your choice: {option.label}</div>
                  <div className="text-xs text-white/80 mt-1">{option.rationale}</div>
                  {option.outcome[perspective] && (
                    <blockquote className="mt-2 text-xs italic border-l-2 border-clinical-accent pl-2 text-white/85">
                      {option.outcome[perspective]}
                    </blockquote>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <footer className="px-5 py-4 flex items-center justify-end gap-2">
          <button
            onClick={resetRun}
            className="px-4 py-2 rounded border border-clinical-border text-clinical-subtle hover:text-white"
          >
            Close
          </button>
        </footer>
      </div>
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

function fmtElapsed(min: number) {
  const h = Math.floor(min / 60);
  const d = Math.floor(h / 24);
  const remH = h % 24;
  if (d > 0) return `${d}d ${remH}h`;
  if (h > 0) return `${h}h ${min % 60}m`;
  return `${min}m`;
}
