import { useGame } from '../state/gameStore';
import { usePerspective } from '../state/perspectiveStore';
import type { Perspective } from '../lib/types';

const labels: Record<Perspective, { name: string; tag: string; colour: string }> = {
  patient: { name: 'Patient', tag: 'POV', colour: 'bg-rose-500/80' },
  caregiver: { name: 'Caregiver', tag: 'POV', colour: 'bg-amber-500/80' },
  staff: { name: 'Staff', tag: 'POV', colour: 'bg-sky-500/80' },
};

function formatGameTime(min: number): string {
  const h = Math.floor(min / 60);
  const d = Math.floor(h / 24);
  const hr = h % 24;
  const mm = min % 60;
  if (d > 0) return `Day ${d + 1} · ${String(hr).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  return `${String(hr).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export function HUD() {
  const current = usePerspective((s) => s.current);
  const setPerspective = usePerspective((s) => s.set);
  const elapsed = useGame((s) => s.run.elapsedGameMin);
  const status = useGame((s) => s.run.status);
  const cost = useGame((s) => s.run.totalCostSGD);

  return (
    <header className="flex items-center gap-4 bg-clinical-panel border-b border-clinical-border px-5 py-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded bg-sgRed grid place-items-center text-white font-bold">+</div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-white">SG Pathway</div>
          <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
            Singapore healthcare patient simulator
          </div>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-3 ml-4 text-xs">
        <span className="px-2 py-1 rounded bg-clinical-bg border border-clinical-border text-clinical-subtle">
          Game time: <span className="text-white font-mono">{formatGameTime(elapsed)}</span>
        </span>
        <span className="px-2 py-1 rounded bg-clinical-bg border border-clinical-border text-clinical-subtle">
          Status:{' '}
          <span
            className={
              status === 'awaiting-decision'
                ? 'text-clinical-warn font-semibold'
                : status === 'completed'
                ? 'text-clinical-ok font-semibold'
                : status === 'running'
                ? 'text-clinical-accent'
                : 'text-clinical-subtle'
            }
          >
            {status === 'idle' ? 'Idle' : status === 'running' ? 'In progress' : status === 'awaiting-decision' ? 'Decision required' : 'Completed'}
          </span>
        </span>
        <span className="px-2 py-1 rounded bg-clinical-bg border border-clinical-border text-clinical-subtle">
          Patient bill so far: <span className="text-white font-mono">S${cost.toFixed(0)}</span>
        </span>
      </div>

      <div className="ml-auto flex items-center gap-1 bg-clinical-bg border border-clinical-border rounded-full p-1">
        {(['patient', 'caregiver', 'staff'] as Perspective[]).map((p) => (
          <button
            key={p}
            onClick={() => setPerspective(p)}
            className={`px-3 py-1 text-xs rounded-full transition ${
              current === p
                ? `${labels[p].colour} text-white font-semibold`
                : 'text-clinical-subtle hover:text-white'
            }`}
          >
            {labels[p].name}
          </button>
        ))}
      </div>
    </header>
  );
}
