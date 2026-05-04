import { useGame, type Dorscon } from '../../state/gameStore';

const dorsconColours: Record<Dorscon, string> = {
  Green: '#4ade80',
  Yellow: '#facc15',
  Orange: '#fb923c',
  Red: '#f87171',
};

const dorsconNotes: Record<Dorscon, string> = {
  Green: 'No outbreak. Routine infection control.',
  Yellow: 'Suspected imported / sporadic cases. Heightened ED screening.',
  Orange: 'Sustained transmission. NCID lead, ring-fenced wards, PPE escalation.',
  Red: 'Severe overwhelmed system. Rationing, surge wards, elective shutdown.',
};

export function PandemicPanel() {
  const p = useGame((s) => s.pandemic);
  const setDorscon = useGame((s) => s.setDorscon);
  const setPpe = useGame((s) => s.setPpe);
  const setSurge = useGame((s) => s.setSurge);
  const setEdDiv = useGame((s) => s.setEdDiversion);
  const setNcid = useGame((s) => s.setNcidActivated);

  return (
    <section className="bg-clinical-panel border border-clinical-border rounded-lg p-3 space-y-3">
      <header className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-white">Pandemic engine</h3>
        <span
          className="text-[10px] uppercase tracking-wider font-semibold"
          style={{ color: dorsconColours[p.dorscon] }}
        >
          DORSCON {p.dorscon}
        </span>
      </header>

      <div className="flex gap-1">
        {(['Green', 'Yellow', 'Orange', 'Red'] as Dorscon[]).map((d) => (
          <button
            key={d}
            onClick={() => setDorscon(d)}
            className={`flex-1 text-[11px] py-1 rounded border transition ${
              p.dorscon === d
                ? 'border-white/70 text-white font-semibold'
                : 'border-clinical-border text-clinical-subtle hover:text-white'
            }`}
            style={p.dorscon === d ? { backgroundColor: `${dorsconColours[d]}22` } : undefined}
          >
            {d}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-clinical-subtle leading-snug">{dorsconNotes[p.dorscon]}</p>

      <Slider
        label="PPE stockpile"
        value={p.ppeStockpilePct}
        onChange={setPpe}
        format={(v) => `${v}%`}
        warnBelow={30}
      />
      <Slider
        label="Surge capacity"
        value={p.surgeCapacityPct}
        onChange={setSurge}
        format={(v) => `${v}%`}
        warnBelow={15}
      />

      <div className="grid grid-cols-2 gap-2 pt-1">
        <Toggle label="ED diversion" on={p.edDiversionActive} onChange={setEdDiv} />
        <Toggle label="NCID activated" on={p.ncidActivated} onChange={setNcid} />
      </div>

      <div className="text-[10px] text-clinical-subtle pt-1">
        R<sub>eff</sub>: <span className="font-mono text-white">{p.rEffective.toFixed(2)}</span>
      </div>
    </section>
  );
}

function Slider({
  label,
  value,
  onChange,
  format,
  warnBelow,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  warnBelow?: number;
}) {
  const warn = warnBelow !== undefined && value < warnBelow;
  return (
    <div>
      <div className="flex justify-between text-[11px]">
        <span className="text-clinical-subtle">{label}</span>
        <span className={`font-mono ${warn ? 'text-clinical-danger' : 'text-white'}`}>
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-clinical-accent"
      />
    </div>
  );
}

function Toggle({
  label,
  on,
  onChange,
}: {
  label: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`text-[11px] px-2 py-1.5 rounded border transition ${
        on
          ? 'bg-clinical-danger/15 border-clinical-danger text-clinical-danger font-semibold'
          : 'border-clinical-border text-clinical-subtle hover:text-white'
      }`}
    >
      <span className="block text-[9px] uppercase tracking-wider">{label}</span>
      {on ? 'Active' : 'Off'}
    </button>
  );
}
