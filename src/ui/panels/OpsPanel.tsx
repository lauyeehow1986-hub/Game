import { useOps, type OpsSpeed } from '../../state/opsStore';
import type { OpsDepartmentId } from '../../lib/ops';

const DEPT_DISPLAY: OpsDepartmentId[] = ['triage', 'ed', 'imaging', 'ot', 'ward'];

function fmtTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function OpsPanel() {
  const state = useOps((s) => s.state);
  const mode = useOps((s) => s.mode);
  const speed = useOps((s) => s.speed);
  const start = useOps((s) => s.start);
  const pause = useOps((s) => s.pause);
  const resume = useOps((s) => s.resume);
  const reset = useOps((s) => s.reset);
  const setSpeed = useOps((s) => s.setSpeed);
  const setDiversion = useOps((s) => s.setDiversion);
  const setCap = useOps((s) => s.setDepartmentCapacity);
  const setOpen = useOps((s) => s.setDepartmentOpen);

  const progress = (state.shiftMinElapsed / state.shiftLengthMin) * 100;
  const activeOnFloor = state.patients.filter((p) => !p.done).length;
  const queued = (id: OpsDepartmentId) => state.queues[id].length;
  const inDept = (id: OpsDepartmentId) =>
    state.patients.filter((p) => !p.done && p.route[p.step] === id).length - queued(id);

  return (
    <section className="bg-clinical-panel border border-clinical-border rounded-lg p-3 space-y-3">
      <header className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-white">Hospital Ops</h3>
        <span className="text-[10px] uppercase tracking-wider text-clinical-subtle">
          Shift {fmtTime(state.shiftMinElapsed)} / {fmtTime(state.shiftLengthMin)}
        </span>
      </header>

      <div className="h-1.5 bg-clinical-bg rounded overflow-hidden">
        <div
          className="h-full bg-clinical-accent"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>

      <div className="flex items-center gap-2">
        {mode === 'idle' || mode === 'ended' ? (
          <button
            onClick={start}
            className="flex-1 px-3 py-1.5 rounded bg-clinical-accent text-white text-xs font-semibold hover:brightness-110"
          >
            Start 8-h shift
          </button>
        ) : mode === 'running' ? (
          <button
            onClick={pause}
            className="flex-1 px-3 py-1.5 rounded border border-clinical-border text-clinical-subtle hover:text-white text-xs"
          >
            Pause
          </button>
        ) : (
          <button
            onClick={resume}
            className="flex-1 px-3 py-1.5 rounded bg-clinical-accent text-white text-xs font-semibold hover:brightness-110"
          >
            Resume
          </button>
        )}
        <button
          onClick={reset}
          className="px-3 py-1.5 rounded border border-clinical-border text-clinical-subtle hover:text-white text-xs"
        >
          Reset
        </button>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-[10px] uppercase tracking-wider text-clinical-subtle mr-1">
          Speed
        </span>
        {([1, 5, 30] as OpsSpeed[]).map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className={`flex-1 text-[11px] py-0.5 rounded border ${
              speed === s
                ? 'border-clinical-accent bg-clinical-accent/15 text-white'
                : 'border-clinical-border text-clinical-subtle hover:text-white'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>

      <button
        onClick={() => setDiversion(!state.diversion)}
        className={`w-full text-[11px] px-2 py-1.5 rounded border ${
          state.diversion
            ? 'border-clinical-warn bg-clinical-warn/15 text-clinical-warn'
            : 'border-clinical-border text-clinical-subtle hover:text-white'
        }`}
      >
        ED diversion: {state.diversion ? 'Active' : 'Off'}
      </button>

      <div className="space-y-1.5 border-t border-clinical-border pt-2">
        <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
          Departments — load and capacity
        </div>
        {DEPT_DISPLAY.map((id) => {
          const dept = state.departments[id];
          const occ = inDept(id);
          const q = queued(id);
          const usagePct = dept.capacity > 0 ? Math.min(100, (occ / dept.capacity) * 100) : 100;
          const colour = !dept.open
            ? '#7d8ba4'
            : usagePct > 95
            ? '#f87171'
            : usagePct > 75
            ? '#facc15'
            : '#4ade80';
          return (
            <div key={id} className="space-y-0.5">
              <div className="flex justify-between text-[11px]">
                <button
                  onClick={() => setOpen(id, !dept.open)}
                  className={`text-left ${dept.open ? 'text-white' : 'text-clinical-subtle line-through'}`}
                >
                  {dept.name}
                  {!dept.open && ' (closed)'}
                </button>
                <span className="font-mono text-clinical-subtle">
                  {occ}/{dept.capacity}
                  {q > 0 && (
                    <span className="ml-1 text-clinical-warn">
                      +{q} q
                    </span>
                  )}
                </span>
              </div>
              <div className="h-1.5 bg-clinical-bg rounded overflow-hidden">
                <div
                  className="h-full"
                  style={{ width: `${usagePct}%`, backgroundColor: colour }}
                />
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCap(id, dept.capacity - 1)}
                  className="text-[10px] px-1 rounded border border-clinical-border text-clinical-subtle hover:text-white"
                  disabled={dept.capacity === 0}
                >
                  −
                </button>
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={dept.capacity}
                  onChange={(e) => setCap(id, Number(e.target.value))}
                  className="flex-1 accent-clinical-accent h-3"
                />
                <button
                  onClick={() => setCap(id, dept.capacity + 1)}
                  className="text-[10px] px-1 rounded border border-clinical-border text-clinical-subtle hover:text-white"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-clinical-border pt-2 grid grid-cols-2 gap-2 text-[11px]">
        <Mini label="On floor" value={`${activeOnFloor}`} />
        <Mini label="Discharged" value={`${state.kpis.discharged}`} />
        <Mini label="Arrivals" value={`${state.kpis.arrivals}`} />
        <Mini
          label="Deteriorated"
          value={`${state.kpis.deteriorations}`}
          danger={state.kpis.deteriorations > 0}
        />
        <Mini label="Avg LOS" value={`${state.kpis.avgLosMin.toFixed(0)}m`} />
        <Mini
          label="ED P3 wait"
          value={`${state.kpis.edWaitP3Min}m`}
          danger={state.kpis.edWaitP3Min > 240}
        />
        <Mini label="Occupancy" value={`${(state.kpis.occupancy * 100).toFixed(0)}%`} />
      </div>

      {mode === 'ended' && (
        <div className="border border-clinical-accent/40 rounded p-2 text-[11px] bg-clinical-accent/10 space-y-1">
          <div className="font-semibold text-white">Shift complete</div>
          <div className="text-clinical-subtle leading-snug">
            Throughput {state.kpis.discharged} of {state.kpis.arrivals} arrivals
            ({state.kpis.arrivals > 0
              ? Math.round((state.kpis.discharged / state.kpis.arrivals) * 100)
              : 0}
            %). Avg LOS {state.kpis.avgLosMin.toFixed(0)} min.
            {state.kpis.deteriorations > 0 &&
              ` ${state.kpis.deteriorations} P1/P2 deteriorations while queued.`}
          </div>
        </div>
      )}
    </section>
  );
}

function Mini({
  label,
  value,
  danger,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded border px-2 py-1 ${
        danger
          ? 'border-clinical-danger/50 bg-clinical-danger/10'
          : 'border-clinical-border bg-clinical-bg/40'
      }`}
    >
      <div className="text-[9px] uppercase tracking-wider text-clinical-subtle">{label}</div>
      <div className={`font-mono text-[11px] ${danger ? 'text-clinical-danger' : 'text-white'}`}>
        {value}
      </div>
    </div>
  );
}
