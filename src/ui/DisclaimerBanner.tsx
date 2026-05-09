import { useEffect, useState } from 'react';

const KEY = 'sg-pathway-disclaimer-v1';

/**
 * Persistent banner reminding the player this is an educational simulation
 * with stylised numbers — not a clinical or billing reference.
 */
export function DisclaimerBanner() {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setHidden(localStorage.getItem(KEY) === '1');
  }, []);

  if (hidden) return null;

  const dismiss = () => {
    localStorage.setItem(KEY, '1');
    setHidden(true);
  };

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-1.5 text-[11px] text-amber-200/90 flex items-center gap-3">
      <span className="font-semibold uppercase tracking-wider text-amber-300 text-[10px]">
        Educational
      </span>
      <span className="flex-1">
        Stylised simulation of Singapore healthcare pathways. Subsidy, MediShield,
        MediSave and CHAS calculations are illustrative only — not authoritative.
        Not a substitute for clinical judgement or current MOH / NCID guidance.
      </span>
      <button
        onClick={dismiss}
        className="text-amber-300 hover:text-white px-2 py-0.5 rounded border border-amber-500/40 text-[10px]"
      >
        Got it
      </button>
    </div>
  );
}
