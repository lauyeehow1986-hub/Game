import { useState } from 'react';
import { useFocusTrap } from '../../lib/use-focus-trap';
import { useT, useTr } from '../../lib/i18n';
import { useGame } from '../../state/gameStore';
import {
  conditionOptions,
  profileOptions,
  generateScenarioFrom,
} from '../../lib/scenario-generator';

interface Props {
  open: boolean;
  onClose: () => void;
}

const RANDOM = '__random__';

/**
 * Sandbox / free-play mode: pick a patient profile and a clinical condition
 * (or leave either random) and generate a bespoke encounter on demand. The
 * v4.0 capstone — turns the v3.3 generator into a configurable studio.
 */
export function SandboxModal({ open, onClose }: Props) {
  const t = useT();
  const tr = useTr();
  const cardRef = useFocusTrap<HTMLDivElement>(open);
  const startCase = useGame((s) => s.startCase);
  const resetRun = useGame((s) => s.resetRun);
  const status = useGame((s) => s.run.status);
  const [conditionKey, setConditionKey] = useState(RANDOM);
  const [profileKey, setProfileKey] = useState(RANDOM);

  if (!open) return null;

  const conditions = conditionOptions();
  const profiles = profileOptions();
  const field = 'w-full bg-clinical-bg border border-clinical-border rounded px-2 py-1.5 text-[12px] text-white';

  const launch = () => {
    const c = generateScenarioFrom({
      conditionKey: conditionKey === RANDOM ? undefined : conditionKey,
      profileKey: profileKey === RANDOM ? undefined : profileKey,
    });
    if (status !== 'idle') resetRun();
    startCase(c);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sandbox-title"
      className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4"
    >
      <div
        ref={cardRef}
        className="bg-clinical-panel border border-clinical-border rounded-lg max-w-md w-full shadow-2xl"
      >
        <header className="px-5 py-3 border-b border-clinical-border flex items-baseline justify-between">
          <h2 id="sandbox-title" className="text-sm font-semibold text-white">{t('sandbox.heading')}</h2>
          <button onClick={onClose} className="text-[11px] text-clinical-subtle hover:text-white">
            {t('common.close')}
          </button>
        </header>

        <div className="px-5 py-4 space-y-4 text-[12px]">
          <p className="text-[11px] text-clinical-subtle">{t('sandbox.intro')}</p>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-clinical-subtle mb-0.5">{t('sandbox.condition')}</label>
            <select className={field} value={conditionKey} onChange={(e) => setConditionKey(e.target.value)}>
              <option value={RANDOM}>{t('sandbox.random')}</option>
              {conditions.map((c) => (
                <option key={c.key} value={c.key}>{tr(c.title)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-clinical-subtle mb-0.5">{t('sandbox.profile')}</label>
            <select className={field} value={profileKey} onChange={(e) => setProfileKey(e.target.value)}>
              <option value={RANDOM}>{t('sandbox.random')}</option>
              {profiles.map((p) => (
                <option key={p.key} value={p.key}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <footer className="px-5 py-3 border-t border-clinical-border flex items-center justify-end">
          <button
            onClick={launch}
            className="tap-target px-4 py-1.5 rounded bg-clinical-accent text-white text-xs font-semibold hover:brightness-110"
          >
            {t('sandbox.launch')}
          </button>
        </footer>
      </div>
    </div>
  );
}
