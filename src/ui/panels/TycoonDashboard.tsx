import { useGame } from '../../state/gameStore';

function Bar({ pct, colour }: { pct: number; colour: string }) {
  return (
    <div className="w-full h-2 bg-clinical-bg rounded overflow-hidden">
      <div
        className="h-full rounded"
        style={{ width: `${Math.min(100, pct)}%`, backgroundColor: colour }}
      />
    </div>
  );
}

export function TycoonDashboard() {
  const kpis = useGame((s) => s.kpis);

  return (
    <section className="bg-clinical-panel border border-clinical-border rounded-lg p-3 space-y-3">
      <header className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-white">Hospital KPIs</h3>
        <span className="text-[10px] uppercase tracking-wider text-clinical-subtle">
          TTSH live
        </span>
      </header>

      <div className="space-y-2 text-xs">
        <div>
          <div className="flex justify-between text-clinical-subtle">
            <span>Bed occupancy</span>
            <span className="font-mono text-white">{kpis.bedOccupancyPct}%</span>
          </div>
          <Bar
            pct={kpis.bedOccupancyPct}
            colour={kpis.bedOccupancyPct > 90 ? '#f87171' : '#3aa6ff'}
          />
        </div>
        <div>
          <div className="flex justify-between text-clinical-subtle">
            <span>ED median wait (P3)</span>
            <span className="font-mono text-white">{kpis.edWaitMin} min</span>
          </div>
          <Bar
            pct={(kpis.edWaitMin / 240) * 100}
            colour={kpis.edWaitMin > 180 ? '#facc15' : '#4ade80'}
          />
        </div>
        <div>
          <div className="flex justify-between text-clinical-subtle">
            <span>Staff fatigue index</span>
            <span className="font-mono text-white">{kpis.staffFatiguePct}%</span>
          </div>
          <Bar
            pct={kpis.staffFatiguePct}
            colour={kpis.staffFatiguePct > 75 ? '#f87171' : '#a3e635'}
          />
        </div>
        <div className="pt-1 flex justify-between border-t border-clinical-border">
          <span className="text-clinical-subtle">DORSCON</span>
          <span
            className={`px-2 rounded text-[11px] font-semibold ${
              kpis.dorscon === 'Green'
                ? 'bg-emerald-500/20 text-emerald-300'
                : kpis.dorscon === 'Yellow'
                ? 'bg-amber-500/20 text-amber-300'
                : kpis.dorscon === 'Orange'
                ? 'bg-orange-500/20 text-orange-300'
                : 'bg-rose-500/20 text-rose-300'
            }`}
          >
            {kpis.dorscon}
          </span>
        </div>
      </div>
    </section>
  );
}
