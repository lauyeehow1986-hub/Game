import { listCases } from '../../content';
import { useCustomCases } from '../../state/customCasesStore';
import { useProgress } from '../../state/progressStore';
import { gradeForRatio } from '../../lib/scoring';

export function LeaderboardPanel() {
  const bestScores = useProgress((s) => s.bestScores);
  const decisionsMade = useProgress((s) => s.decisionsMade);
  const casesCompleted = useProgress((s) => s.casesCompleted);
  const customCases = useCustomCases((s) => s.cases);
  const reset = useProgress((s) => s.reset);

  const builtIn = listCases();
  const custom = Object.values(customCases);
  const all = [...builtIn, ...custom];

  const ranked = all
    .map((c) => {
      const b = bestScores[c.id];
      const ratio = b && b.max > 0 ? b.score / b.max : null;
      return { c, best: b ?? null, ratio };
    })
    .sort((a, b) => {
      if (a.ratio === null && b.ratio === null) return 0;
      if (a.ratio === null) return 1;
      if (b.ratio === null) return -1;
      return b.ratio - a.ratio;
    });

  const completed = ranked.filter((r) => r.ratio !== null);
  const meanRatio =
    completed.length === 0
      ? 0
      : completed.reduce((acc, r) => acc + (r.ratio ?? 0), 0) / completed.length;

  return (
    <section className="bg-clinical-panel border border-clinical-border rounded-lg p-3 space-y-2">
      <header className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-white">Personal best</h3>
        <span className="text-[10px] uppercase tracking-wider text-clinical-subtle">
          {casesCompleted} runs · {decisionsMade} decisions
        </span>
      </header>

      <div className="grid grid-cols-3 gap-2 text-[11px]">
        <Mini label="Cases" value={`${completed.length}/${all.length}`} />
        <Mini
          label="Avg score"
          value={`${(meanRatio * 100).toFixed(0)}%`}
          colour={meanRatio >= 0.9 ? '#4ade80' : meanRatio >= 0.75 ? '#a3e635' : meanRatio >= 0.5 ? '#facc15' : '#f87171'}
        />
        <Mini label="Decisions" value={`${decisionsMade}`} />
      </div>

      <ul className="space-y-1 max-h-72 overflow-y-auto scrollbar-thin pr-1">
        {ranked.map(({ c, best, ratio }) => {
          const grade = ratio !== null ? gradeForRatio(ratio) : null;
          return (
            <li
              key={c.id}
              className="flex items-center gap-2 border border-clinical-border rounded px-2 py-1 text-[11px]"
            >
              <div className="flex-1 min-w-0">
                <div className="text-white truncate">{c.title}</div>
                <div className="text-[10px] text-clinical-subtle">
                  {c.category} · {c.primaryFacility.toUpperCase()}
                </div>
              </div>
              {best ? (
                <div className="text-right">
                  <div className="font-mono text-white">
                    {best.score.toFixed(1)}/{best.max.toFixed(1)}
                  </div>
                  {grade && (
                    <div
                      className="text-[9px] uppercase tracking-wider"
                      style={{ color: grade.colour }}
                    >
                      {grade.grade}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[10px] text-clinical-subtle">Not played</div>
              )}
            </li>
          );
        })}
      </ul>

      {completed.length > 0 && (
        <button
          onClick={() => {
            if (confirm('Clear all personal bests and progress?')) reset();
          }}
          className="w-full text-[10px] py-1 rounded border border-clinical-border text-clinical-subtle hover:text-clinical-danger hover:border-clinical-danger/50"
        >
          Reset progress
        </button>
      )}
    </section>
  );
}

function Mini({
  label,
  value,
  colour,
}: {
  label: string;
  value: string;
  colour?: string;
}) {
  return (
    <div className="rounded border border-clinical-border bg-clinical-bg/40 px-2 py-1">
      <div className="text-[9px] uppercase tracking-wider text-clinical-subtle">{label}</div>
      <div className="font-mono text-[11px] text-white" style={colour ? { color: colour } : undefined}>
        {value}
      </div>
    </div>
  );
}
