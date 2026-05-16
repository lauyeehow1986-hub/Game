import { useEffect, useState } from 'react';
import { useT } from '../lib/i18n';

/**
 * Compact pill in the HUD that lights up amber when navigator.onLine is
 * false. Cached cases still work; this just signals the state.
 */
export function OfflineIndicator() {
  const t = useT();
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    setOnline(navigator.onLine);
    const sync = () => setOnline(navigator.onLine);
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
    };
  }, []);

  if (online) return null;
  return (
    <span
      role="status"
      className="hidden sm:inline-flex h-8 px-2 items-center justify-center rounded border border-clinical-warn/60 bg-clinical-warn/10 text-clinical-warn text-[11px] font-medium"
    >
      {t('hud.offline')}
    </span>
  );
}
