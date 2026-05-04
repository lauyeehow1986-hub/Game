import { useGame } from '../../state/gameStore';
import { listFacilities } from '../../content';

const groups: Array<{ key: string; label: string; types: string[] }> = [
  { key: 'acute', label: 'Acute hospitals', types: ['acute'] },
  { key: 'specialty', label: 'Specialty centres', types: ['specialty'] },
  { key: 'community', label: 'Community / step-down', types: ['community'] },
  { key: 'polyclinic', label: 'Polyclinics', types: ['polyclinic'] },
];

export function FacilityBrowser() {
  const viewed = useGame((s) => s.viewedFacilityId);
  const view = useGame((s) => s.viewFacility);
  const status = useGame((s) => s.run.status);

  const facilities = listFacilities();
  const cantBrowse = status === 'running' || status === 'awaiting-decision';

  const counts = facilities.reduce<Record<string, number>>((acc, f) => {
    acc[f.cluster] = (acc[f.cluster] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <section className="bg-clinical-panel border border-clinical-border rounded-lg p-3 space-y-2">
      <header className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-white">Network</h3>
        <span className="text-[10px] uppercase tracking-wider text-clinical-subtle">
          {facilities.length} facilities
        </span>
      </header>
      <div className="flex flex-wrap gap-1 text-[10px]">
        {Object.entries(counts).map(([c, n]) => (
          <span
            key={c}
            className="px-1.5 py-0.5 rounded border border-clinical-border text-clinical-subtle"
          >
            {c.toUpperCase()} · {n}
          </span>
        ))}
      </div>
      {cantBrowse && (
        <p className="text-[10px] text-clinical-subtle italic">
          Map follows the active patient. Stop the case to browse other facilities.
        </p>
      )}
      <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin pr-1">
        {groups.map((g) => {
          const list = facilities.filter((f) => g.types.includes(f.type));
          if (list.length === 0) return null;
          return (
            <div key={g.key}>
              <div className="text-[10px] uppercase tracking-wider text-clinical-subtle mb-1">
                {g.label}
              </div>
              <ul className="space-y-1">
                {list.map((f) => {
                  const active = viewed === f.id;
                  return (
                    <li key={f.id}>
                      <button
                        disabled={cantBrowse}
                        onClick={() => view(f.id)}
                        className={`w-full text-left px-2 py-1 rounded text-[11px] transition ${
                          active
                            ? 'bg-clinical-accent/20 text-white border border-clinical-accent'
                            : 'border border-clinical-border text-clinical-subtle hover:text-white disabled:hover:text-clinical-subtle disabled:opacity-50'
                        }`}
                      >
                        <span className="font-medium">{f.name}</span>
                        <span className="ml-1 text-[9px] uppercase tracking-wider">
                          · {f.cluster}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
