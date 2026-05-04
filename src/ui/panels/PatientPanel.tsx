import { useGame } from '../../state/gameStore';
import { usePerspective } from '../../state/perspectiveStore';
import { TTSH } from '../../content/facilities/nhg/ttsh';
import type { WardClass } from '../../lib/financing';

const wardLabels: Record<WardClass, string> = {
  A: 'Class A · single room · no subsidy',
  B1: 'Class B1 · 4-bedder · ~20% subsidy',
  B2: 'Class B2 · 6-bedder · ~65% subsidy',
  C: 'Class C · open ward · ~80% subsidy',
  na: 'Outpatient',
};

export function PatientPanel() {
  const caseDef = useGame((s) => s.caseDef);
  const run = useGame((s) => s.run);
  const profile = useGame((s) => s.profile);
  const setWardClass = useGame((s) => s.setWardClass);
  const perspective = usePerspective((s) => s.current);

  if (!caseDef || !profile) {
    return (
      <section className="bg-clinical-panel border border-clinical-border rounded-lg p-3 space-y-2">
        <h3 className="text-sm font-semibold text-white">Patient</h3>
        <p className="text-xs text-clinical-subtle">No active case. Pick a case below to begin.</p>
      </section>
    );
  }

  const node = caseDef.pathway.find((n) => n.id === run.currentNodeId) ?? caseDef.pathway[0];
  const dept = TTSH.departments.find((d) => d.id === node.department);
  const framing = node.framing[perspective];

  return (
    <section className="bg-clinical-panel border border-clinical-border rounded-lg p-3 space-y-2">
      <header>
        <h3 className="text-sm font-semibold text-white">{profile.name}</h3>
        {profile.notes && (
          <p className="text-[11px] text-clinical-subtle leading-snug">{profile.notes}</p>
        )}
      </header>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <Mini label="Citizenship" value={profile.citizenship.toUpperCase()} />
        <Mini label="CHAS" value={profile.chasTier === 'none' ? '—' : profile.chasTier.toUpperCase()} />
        <Mini label="Per-capita income" value={`S$${profile.perCapitaIncomeSGD}/mo`} />
        <Mini label="MediSave" value={`S$${profile.mediSaveBalanceSGD}`} />
      </div>

      {caseDef.allowsWardChoice && (
        <div className="border-t border-clinical-border pt-2 space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
            Ward class
          </div>
          <div className="flex gap-1">
            {(['C', 'B2', 'B1', 'A'] as WardClass[]).map((w) => (
              <button
                key={w}
                onClick={() => setWardClass(w)}
                title={wardLabels[w]}
                className={`flex-1 text-xs py-1 rounded border transition ${
                  profile.wardClass === w
                    ? 'bg-clinical-accent text-white border-clinical-accent font-semibold'
                    : 'border-clinical-border text-clinical-subtle hover:text-white'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
          <div className="text-[10px] text-clinical-subtle leading-snug">
            {wardLabels[profile.wardClass]}
          </div>
        </div>
      )}

      <div className="border-t border-clinical-border pt-2 space-y-1">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: dept?.colour ?? '#3aa6ff' }}
          />
          <span className="text-xs font-semibold text-white">{dept?.name ?? '—'}</span>
        </div>
        <p className="text-[11px] text-clinical-subtle leading-snug">{dept?.description}</p>
      </div>

      {framing && (
        <blockquote className="border-l-2 border-clinical-accent pl-3 text-xs text-white/90 italic leading-relaxed">
          {framing}
        </blockquote>
      )}
    </section>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-clinical-border bg-clinical-bg/40 px-2 py-1">
      <div className="text-[9px] uppercase tracking-wider text-clinical-subtle">{label}</div>
      <div className="text-white font-mono text-[11px]">{value}</div>
    </div>
  );
}
