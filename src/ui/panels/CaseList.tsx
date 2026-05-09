import { listCases } from '../../content';
import { useGame } from '../../state/gameStore';
import { useProgress } from '../../state/progressStore';

export function CaseList() {
  const startCase = useGame((s) => s.startCase);
  const resetRun = useGame((s) => s.resetRun);
  const status = useGame((s) => s.run.status);
  const activeId = useGame((s) => s.run.caseId);
  const unlocked = useProgress((s) => s.unlockedCaseIds);
  const bestScores = useProgress((s) => s.bestScores);

  return (
    <section className="bg-clinical-panel border border-clinical-border rounded-lg p-3 space-y-2">
      <header className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-white">Cases</h3>
        <span className="text-[10px] uppercase tracking-wider text-clinical-subtle">v0.1</span>
      </header>
      <ul className="space-y-2">
        {listCases().map((c) => {
          const isUnlocked = unlocked.includes(c.id);
          const best = bestScores[c.id];
          const isActive = activeId === c.id && status !== 'idle';
          return (
            <li
              key={c.id}
              className={`rounded border p-2 ${
                isActive
                  ? 'border-clinical-accent bg-clinical-accent/5'
                  : 'border-clinical-border bg-clinical-bg'
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    {c.historical && (
                      <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                        Historical
                      </span>
                    )}
                    <span>{c.title}</span>
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
                    {c.category} · {c.primaryFacility.toUpperCase()}
                  </div>
                </div>
                {best && (
                  <span className="text-[10px] text-clinical-ok font-mono">
                    Best {best.score.toFixed(1)} / {best.max.toFixed(1)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-clinical-subtle mt-1 leading-snug">{c.blurb}</p>
              <div className="mt-2 flex gap-2">
                <button
                  disabled={!isUnlocked}
                  onClick={() => {
                    if (isActive) resetRun();
                    startCase(c);
                  }}
                  className="text-[11px] px-2 py-1 rounded bg-clinical-accent text-white font-semibold disabled:opacity-40 hover:brightness-110"
                >
                  {isActive ? 'Restart' : 'Start case'}
                </button>
                {isActive && (
                  <button
                    onClick={resetRun}
                    className="text-[11px] px-2 py-1 rounded border border-clinical-border text-clinical-subtle hover:text-white"
                  >
                    Stop
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
