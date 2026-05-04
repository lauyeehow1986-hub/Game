import { useGame } from '../../state/gameStore';
import { usePerspective } from '../../state/perspectiveStore';
import { TTSH } from '../../content/facilities/nhg/ttsh';

export function PatientPanel() {
  const caseDef = useGame((s) => s.caseDef);
  const run = useGame((s) => s.run);
  const perspective = usePerspective((s) => s.current);

  if (!caseDef) {
    return (
      <section className="bg-clinical-panel border border-clinical-border rounded-lg p-3 space-y-2">
        <h3 className="text-sm font-semibold text-white">Patient</h3>
        <p className="text-xs text-clinical-subtle">
          No active case. Pick a case below to begin.
        </p>
      </section>
    );
  }

  const node = caseDef.pathway.find((n) => n.id === run.currentNodeId) ?? caseDef.pathway[0];
  const dept = TTSH.departments.find((d) => d.id === node.department);
  const framing = node.framing[perspective];

  return (
    <section className="bg-clinical-panel border border-clinical-border rounded-lg p-3 space-y-2">
      <h3 className="text-sm font-semibold text-white">Patient · {caseDef.title.split('—')[0].trim()}</h3>
      <p className="text-[11px] text-clinical-subtle leading-snug">{caseDef.blurb}</p>
      <div className="border-t border-clinical-border pt-2 space-y-1">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: dept?.colour ?? '#3aa6ff' }}
          />
          <span className="text-xs font-semibold text-white">{dept?.name ?? '—'}</span>
        </div>
        <p className="text-xs text-clinical-subtle">{dept?.description}</p>
      </div>
      {framing && (
        <blockquote className="border-l-2 border-clinical-accent pl-3 text-xs text-white/90 italic leading-relaxed">
          {framing}
        </blockquote>
      )}
    </section>
  );
}
