import { useEffect, useState } from 'react';
import { useGame } from '../state/gameStore';
import { usePerspective } from '../state/perspectiveStore';
import type { Perspective } from '../lib/types';
import { isMuted, setMuted } from '../lib/audio';

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
  const caseDef = useGame((s) => s.caseDef);
  const flags = useGame((s) => s.run.flags);
  const [muted, setMutedState] = useState(true);

  const timer = caseDef?.acuteTimer;
  const exceeded = timer && elapsed > timer.goalMin;
  const flagAlreadySet = timer && flags.includes(timer.missedFlag);

  useEffect(() => {
    setMutedState(isMuted());
  }, []);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  };

  const replayTutorial = () => {
    localStorage.removeItem('sg-pathway-tutorial-seen-v1');
    location.reload();
  };

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
          Cash OOP so far: <span className="text-white font-mono">S${cost.toFixed(0)}</span>
        </span>
        {timer && (
          <span
            className={`px-2 py-1 rounded border font-mono ${
              exceeded
                ? 'bg-clinical-danger/20 border-clinical-danger text-clinical-danger'
                : elapsed > timer.goalMin * 0.7
                ? 'bg-clinical-warn/15 border-clinical-warn/50 text-clinical-warn'
                : 'bg-clinical-bg border-clinical-border text-clinical-ok'
            }`}
            title={timer.goalLabel}
          >
            {timer.goalLabel}: {elapsed}/{timer.goalMin} min
            {exceeded && !flagAlreadySet && ' — exceeded'}
          </span>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="flex items-center gap-1 bg-clinical-bg border border-clinical-border rounded-full p-1">
          {(['patient', 'caregiver', 'staff'] as Perspective[]).map((p) => (
            <button
              key={p}
              onClick={() => setPerspective(p)}
              aria-pressed={current === p}
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
        <button
          onClick={toggleMute}
          aria-label={muted ? 'Unmute audio cues' : 'Mute audio cues'}
          title={muted ? 'Unmute audio cues' : 'Mute audio cues'}
          className="hidden sm:inline-flex h-8 px-2 items-center justify-center rounded border border-clinical-border text-clinical-subtle hover:text-white text-[11px] font-medium"
        >
          {muted ? 'Audio off' : 'Audio on'}
        </button>
        <button
          onClick={replayTutorial}
          aria-label="Replay tutorial"
          title="Replay tutorial"
          className="hidden sm:inline-flex h-8 px-2 items-center justify-center rounded border border-clinical-border text-clinical-subtle hover:text-white text-[11px] font-medium"
        >
          Tutorial
        </button>
      </div>
    </header>
  );
}
