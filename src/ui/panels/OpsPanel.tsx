import { useOps, type OpsSpeed, SCENARIOS } from '../../state/opsStore';
import type { OpsDepartmentId } from '../../lib/ops';

const DEPT_DISPLAY: OpsDepartmentId[] = ['triage', 'ed', 'imaging', 'ot', 'ward'];

function fmtTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function fmtSGD(n: number): string {
  if (Math.abs(n) >= 10000) return `${(n / 1000).toFixed(1)}k`;
  return Math.round(n).toLocaleString('en-SG');
}

export function OpsPanel() {
  const state = useOps((s) => s.state);
  const mode = useOps((s) => s.mode);
  const speed = useOps((s) => s.speed);
  const scenarioId = useOps((s) => s.scenarioId);
  const history = useOps((s) => s.history);
  const start = useOps((s) => s.start);
  const pause = useOps((s) => s.pause);
  const resume = useOps((s) => s.resume);
  const reset = useOps((s) => s.reset);
  const setSpeed = useOps((s) => s.setSpeed);
  const setDiversion = useOps((s) => s.setDiversion);
  const setCap = useOps((s) => s.setDepartmentCapacity);
  const setOpen = useOps((s) => s.setDepartmentOpen);
  const hire = useOps((s) => s.hire);
  const selectScenario = useOps((s) => s.selectScenario);
  const nextDay = useOps((s) => s.nextDay);

  const progress = (state.shiftMinElapsed / state.shiftLengthMin) * 100;
  const activeOnFloor = state.patients.filter((p) => !p.done).length;
  const queued = (id: OpsDepartmentId) => state.queues[id].length;
  const inDept = (id: OpsDepartmentId) =>
    state.patients.filter((p) => !p.done && p.route[p.step] === id).length - queued(id);
  const net = state.budget.revenueShiftSGD - state.budget.costShiftSGD;
  const cashColour =
    state.budget.cashSGD < 10000 ? '#f87171' : state.budget.cashSGD < 30000 ? '#facc15' : '#4ade80';

  const scenario = SCENARIOS.find((s) => s.id === scenarioId);

  return (
    <section className="bg-clinical-panel border border-clinical-border rounded-lg p-3 space-y-3">
      <header className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-white">Hospital Ops · Day {state.dayNumber}</h3>
        <span className="text-[10px] uppercase tracking-wider text-clinical-subtle">
          Shift {fmtTime(state.shiftMinElapsed)} / {fmtTime(state.shiftLengthMin)}
        </span>
      </header>

      <div>
        <select
          value={scenarioId}
          onChange={(e) => selectScenario(e.target.value)}
          className="w-full bg-clinical-bg border border-clinical-border rounded px-2 py-1 text-[11px] text-white"
          disabled={mode === 'running'}
        >
          {SCENARIOS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        {scenario && (
          <p className="text-[10px] text-clinical-subtle mt-1 leading-snug">{scenario.description}</p>
        )}
      </div>

      <div className="h-1.5 bg-clinical-bg rounded overflow-hidden">
        <div className="h-full bg-clinical-accent" style={{ width: `${Math.min(100, progress)}%` }} />
      </div>

      <div className="grid grid-cols-3 gap-1 text-[11px]">
        <Mini label="Cash" value={`S$${fmtSGD(state.budget.cashSGD)}`} colour={cashColour} />
        <Mini
          label="Net shift"
          value={`${net >= 0 ? '+' : ''}S$${fmtSGD(net)}`}
          colour={net >= 0 ? '#4ade80' : '#f87171'}
        />
        <Mini
          label="Reputation"
          value={`${state.reputation.toFixed(0)}`}
          colour={state.reputation < 50 ? '#f87171' : state.reputation < 70 ? '#facc15' : '#4ade80'}
        />
      </div>

      <div className="flex items-center gap-2">
        {mode === 'idle' ? (
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
        ) : mode === 'paused' ? (
          <button
            onClick={resume}
            className="flex-1 px-3 py-1.5 rounded bg-clinical-accent text-white text-xs font-semibold hover:brightness-110"
          >
            Resume
          </button>
        ) : (
          <button
            onClick={nextDay}
            className="flex-1 px-3 py-1.5 rounded bg-clinical-ok text-white text-xs font-semibold hover:brightness-110"
          >
            Next day
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
        <span className="text-[10px] uppercase tracking-wider text-clinical-subtle mr-1">Speed</span>
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
        <div className="text-[10px] uppercase tracking-wider text-clinical-subtle flex justify-between">
          <span>Departments — staffing & capacity</span>
          <span>
            Daily S${fmtSGD(state.budget.dailyFixedCostSGD + state.budget.dailyStaffingCostSGD)}
          </span>
        </div>
        {DEPT_DISPLAY.map((id) => {
          const dept = state.departments[id];
          const occ = inDept(id);
          const q = queued(id);
          const usagePct = dept.capacity > 0 ? Math.min(100, (occ / dept.capacity) * 100) : 100;
          const understaffed = dept.open && (dept.doctors === 0 || dept.nurses === 0);
          const colour = !dept.open
            ? '#7d8ba4'
            : understaffed
            ? '#f87171'
            : usagePct > 95
            ? '#f87171'
            : usagePct > 75
            ? '#facc15'
            : '#4ade80';
          return (
            <div key={id} className="space-y-0.5 border-t border-clinical-border/40 pt-1">
              <div className="flex justify-between text-[11px]">
                <button
                  onClick={() => setOpen(id, !dept.open)}
                  className={`text-left ${dept.open ? 'text-white' : 'text-clinical-subtle line-through'}`}
                >
                  {dept.name}
                  {!dept.open && ' (closed)'}
                  {understaffed && ' (unstaffed)'}
                </button>
                <span className="font-mono text-clinical-subtle">
                  {occ}/{dept.capacity}
                  {q > 0 && <span className="ml-1 text-clinical-warn">+{q} q</span>}
                </span>
              </div>
              <div className="h-1.5 bg-clinical-bg rounded overflow-hidden">
                <div className="h-full" style={{ width: `${usagePct}%`, backgroundColor: colour }} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-clinical-subtle w-8">Beds</span>
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
              <div className="flex items-center gap-1 text-[10px] text-clinical-subtle">
                <span className="w-8">Drs</span>
                <button onClick={() => hire(id, 'doctors', -1)} className="px-1 rounded border border-clinical-border hover:text-white">
                  −
                </button>
                <span className="font-mono text-white w-4 text-center">{dept.doctors}</span>
                <button onClick={() => hire(id, 'doctors', 1)} className="px-1 rounded border border-clinical-border hover:text-white">
                  +
                </button>
                <span className="w-12 ml-2">Nurses</span>
                <button onClick={() => hire(id, 'nurses', -1)} className="px-1 rounded border border-clinical-border hover:text-white">
                  −
                </button>
                <span className="font-mono text-white w-4 text-center">{dept.nurses}</span>
                <button onClick={() => hire(id, 'nurses', 1)} className="px-1 rounded border border-clinical-border hover:text-white">
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
      </div>

      {mode === 'ended' && scenario && (
        <div className="border border-clinical-accent/40 rounded p-2 text-[11px] bg-clinical-accent/10 space-y-1">
          <div className="font-semibold text-white">End of day {state.dayNumber}</div>
          <div className="text-clinical-subtle leading-snug">
            Discharged {state.kpis.discharged} / {state.kpis.arrivals}. Net S${fmtSGD(net)}.
            {state.kpis.deteriorations > 0 && ` ${state.kpis.deteriorations} P1/P2 deteriorations.`}
          </div>
          {(() => {
            const c = scenario.successCriteria;
            const passed =
              state.reputation >= c.minReputation &&
              state.kpis.deteriorations <= c.maxDeteriorations &&
              state.kpis.discharged >= c.minDischarged &&
              net >= c.minNetSGD;
            return (
              <div
                className={`text-[10px] font-semibold ${
                  passed ? 'text-clinical-ok' : 'text-clinical-danger'
                }`}
              >
                {passed ? 'Scenario PASS' : 'Scenario FAIL'} — needs Rep ≥{c.minReputation}, Det ≤
                {c.maxDeteriorations}, Disch ≥{c.minDischarged}, Net ≥ S${fmtSGD(c.minNetSGD)}
              </div>
            );
          })()}
        </div>
      )}

      {history.length > 0 && (
        <details className="text-[11px] border-t border-clinical-border pt-2">
          <summary className="cursor-pointer text-clinical-subtle hover:text-white">
            Day history ({history.length})
          </summary>
          <ul className="mt-1 space-y-0.5">
            {history.map((d) => (
              <li key={d.day} className="font-mono text-[10px] flex justify-between">
                <span>D{d.day}</span>
                <span className="text-clinical-subtle">
                  {d.discharged}/{d.arrivals} · net S${fmtSGD(d.netSGD)} · rep {d.reputation.toFixed(0)}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

function Mini({
  label,
  value,
  danger,
  colour,
}: {
  label: string;
  value: string;
  danger?: boolean;
  colour?: string;
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
      <div
        className={`font-mono text-[11px] ${danger ? 'text-clinical-danger' : 'text-white'}`}
        style={colour && !danger ? { color: colour } : undefined}
      >
        {value}
      </div>
    </div>
  );
}
