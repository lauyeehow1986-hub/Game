import { useGame } from '../../state/gameStore';
import { getFacility } from '../../content';
import { profileForFacility, describeFlow } from '../../lib/referral';

const flowColours: Record<string, string> = {
  nehr: '#4ade80',
  memo: '#facc15',
  'hand-carry': '#fb923c',
  fax: '#fb923c',
  none: '#f87171',
};

export function DataExchangePanel() {
  const viewedId = useGame((s) => s.viewedFacilityId);
  const lastTransfer = useGame((s) => s.lastTransfer);
  const transferLog = useGame((s) => s.transferLog);

  const facility = getFacility(viewedId);
  if (!facility) return null;
  const profile = profileForFacility(facility);

  return (
    <section className="bg-clinical-panel border border-clinical-border rounded-lg p-3 space-y-3">
      <header className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-white">Records & data exchange</h3>
        <span className="text-[10px] uppercase tracking-wider text-clinical-subtle">
          {facility.name.split('—')[0].split(',')[0]}
        </span>
      </header>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <Pill ok={profile.contributesToNehr} label="Contributes to NEHR" />
        <Pill ok={profile.consumesFromNehr} label="Pulls NEHR" />
        <Pill ok={profile.visibleOnHealthHub} label="HealthHub visible" />
        <Pill ok={profile.imagingPacs !== 'private-cd'} label="Imaging not on CD" />
      </div>

      <div className="text-[11px] text-clinical-subtle leading-snug">
        Lab vendor: <span className="font-mono text-white">{profile.labVendor}</span>
        {' · '}Imaging: <span className="font-mono text-white">{profile.imagingPacs}</span>
      </div>
      {profile.note && (
        <p className="text-[11px] text-clinical-subtle italic leading-snug">{profile.note}</p>
      )}

      {lastTransfer && (
        <div className="border-t border-clinical-border pt-2 space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
            Last transfer
          </div>
          <div className="text-[11px]">
            <span className="text-white font-mono">
              {getFacility(lastTransfer.fromFacilityId)?.name.split('—')[0].split(',')[0]}
            </span>
            <span className="text-clinical-subtle"> → </span>
            <span className="text-white font-mono">
              {getFacility(lastTransfer.toFacilityId)?.name.split('—')[0].split(',')[0]}
            </span>
          </div>
          <div
            className="text-[11px] font-semibold"
            style={{ color: flowColours[lastTransfer.flow] ?? '#cbd5f5' }}
          >
            {lastTransfer.flow.toUpperCase()}
          </div>
          <div className="text-[11px] text-clinical-subtle leading-snug">
            {describeFlow(lastTransfer.flow)}
          </div>
        </div>
      )}

      {transferLog.length > 1 && (
        <details className="text-[11px]">
          <summary className="cursor-pointer text-clinical-subtle hover:text-white">
            Transfer log ({transferLog.length})
          </summary>
          <ul className="mt-1 space-y-0.5">
            {transferLog.map((t, i) => (
              <li key={i} className="font-mono text-[10px]">
                <span style={{ color: flowColours[t.flow] }}>{t.flow}</span>
                <span className="text-clinical-subtle">
                  {' '}
                  {t.fromFacilityId} → {t.toFacilityId}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

function Pill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div
      className="rounded border px-2 py-1 text-[10px]"
      style={{
        borderColor: ok ? '#4ade8055' : '#f8717155',
        backgroundColor: ok ? '#4ade8011' : '#f8717111',
        color: ok ? '#4ade80' : '#f87171',
      }}
    >
      {ok ? '✓' : '✗'} {label}
    </div>
  );
}
