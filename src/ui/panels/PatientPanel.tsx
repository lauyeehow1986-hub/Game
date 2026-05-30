import { useGame } from '../../state/gameStore';
import { usePerspective } from '../../state/perspectiveStore';
import { getFacility } from '../../content';
import { useT, useTr } from '../../lib/i18n';
import { GlossaryText } from '../GlossaryText';
import type { WardClass } from '../../lib/financing';

export function PatientPanel() {
  const caseDef = useGame((s) => s.caseDef);
  const run = useGame((s) => s.run);
  const profile = useGame((s) => s.profile);
  const setWardClass = useGame((s) => s.setWardClass);
  const setIp = useGame((s) => s.setIntegratedShield);
  const perspective = usePerspective((s) => s.current);
  const tr = useTr();
  const t = useT();

  if (!caseDef || !profile) {
    return (
      <section className="bg-clinical-panel border border-clinical-border rounded-lg p-3 space-y-2">
        <h3 className="text-sm font-semibold text-white">Patient</h3>
        <p className="text-xs text-clinical-subtle">No active case. Pick a case below to begin.</p>
      </section>
    );
  }

  const node = caseDef.pathway.find((n) => n.id === run.currentNodeId) ?? caseDef.pathway[0];
  const facility = getFacility(node.facility ?? caseDef.primaryFacility);
  const dept = facility?.departments.find((d) => d.id === node.department);
  const framing = tr(node.framing[perspective]);

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

      <button
        onClick={() => setIp(!profile.hasIntegratedShield)}
        className={`w-full text-left px-2 py-1.5 rounded border text-[11px] transition ${
          profile.hasIntegratedShield
            ? 'border-clinical-accent bg-clinical-accent/15 text-white'
            : 'border-clinical-border text-clinical-subtle hover:text-white'
        }`}
      >
        <span className="block text-[9px] uppercase tracking-wider">Integrated Shield Plan</span>
        {profile.hasIntegratedShield ? 'Active — IP rider tops up to as-charged' : 'None — MediShield Life only'}
      </button>

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
                title={t(`ward.${w}`)}
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
            {t(`ward.${profile.wardClass}`)}
          </div>
        </div>
      )}

      <div className="border-t border-clinical-border pt-2 space-y-1">
        {facility && (
          <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
            {facility.name}
          </div>
        )}
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: dept?.colour ?? '#3aa6ff' }}
          />
          <span className="text-xs font-semibold text-white">{dept?.name ?? node.department}</span>
        </div>
        <p className="text-[11px] text-clinical-subtle leading-snug">{dept?.description}</p>
      </div>

      {framing && (
        <blockquote className="border-l-2 border-clinical-accent pl-3 text-xs text-white/90 italic leading-relaxed">
          <GlossaryText>{framing}</GlossaryText>
        </blockquote>
      )}

      {(() => {
        const transit = run.journey
          .slice(0, -1)
          .map((id) => caseDef.pathway.find((n) => n.id === id))
          .filter((n): n is NonNullable<typeof n> => n != null);
        if (transit.length === 0) return null;
        return (
          <details className="border-t border-clinical-border pt-2 text-[11px]">
            <summary className="cursor-pointer text-clinical-subtle hover:text-white">
              Journey so far ({transit.length} {transit.length === 1 ? 'stop' : 'stops'})
            </summary>
            <ol className="mt-1 space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin pr-1">
              {transit.map((n, i) => {
                const f = getFacility(n.facility ?? caseDef.primaryFacility);
                const d = f?.departments.find((x) => x.id === n.department);
                const text = tr(n.framing[perspective]);
                if (!text) return null;
                return (
                  <li key={`${n.id}-${i}`} className="border-l-2 border-clinical-border pl-2">
                    <div className="text-[9px] uppercase tracking-wider text-clinical-subtle">
                      {f?.name ?? ''}{f && d ? ' · ' : ''}{d?.shortLabel ?? d?.name ?? n.department}
                    </div>
                    <div className="text-white/85 italic leading-snug">
                      <GlossaryText>{text}</GlossaryText>
                    </div>
                  </li>
                );
              })}
            </ol>
          </details>
        );
      })()}
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
