import { useGame } from '../../state/gameStore';
import { useTr } from '../../lib/i18n';

export function DecisionLog() {
  const log = useGame((s) => s.run.log);
  const caseDef = useGame((s) => s.caseDef);
  const tr = useTr();

  if (!caseDef) return null;

  return (
    <section className="bg-clinical-panel border border-clinical-border rounded-lg p-3 space-y-2">
      <header className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-white">Decisions log</h3>
        <span className="text-[10px] uppercase tracking-wider text-clinical-subtle">
          {log.length} made
        </span>
      </header>
      {log.length === 0 ? (
        <p className="text-[11px] text-clinical-subtle">
          As you make decisions, they will appear here with score and rationale.
        </p>
      ) : (
        <ul className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin pr-1">
          {log.map((e, i) => {
            const node = caseDef.pathway.find((n) => n.id === e.nodeId);
            const decision = node?.decision;
            const option = decision?.options.find((o) => o.id === e.optionId);
            return (
              <li
                key={`${e.nodeId}-${i}`}
                className="text-[11px] border-l-2 pl-2 leading-snug"
                style={{
                  borderColor: e.scoreEarned >= e.maxScore - 0.01 ? '#4ade80' : e.scoreEarned >= 0 ? '#facc15' : '#f87171',
                }}
              >
                <div className="text-white font-semibold">{tr(decision?.prompt)}</div>
                <div className="text-clinical-subtle">{tr(option?.label)}</div>
                <div className="text-[10px] mt-0.5 font-mono">
                  Score {e.scoreEarned.toFixed(1)} / {e.maxScore.toFixed(1)}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
