import { useEffect, useState } from 'react';
import { useT } from '../lib/i18n';

const DISMISS_KEY = 'sg-pathway-install-dismissed-v1';

/**
 * Small banner shown when the browser fires beforeinstallprompt (only on
 * supported Chromium browsers, only when PWA criteria are met). Dismissable
 * via localStorage so we don't nag.
 */
export function InstallPrompt() {
  const t = useT();
  const [installable, setInstallable] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(DISMISS_KEY) === '1') return;
    const onInstallable = () => setInstallable(true);
    const onInstalled = () => setInstallable(false);
    window.addEventListener('sg-pathway:installable', onInstallable);
    window.addEventListener('sg-pathway:installed', onInstalled);
    // If the event already fired before this component mounted.
    if (window.__sgPathwayInstallEvent) setInstallable(true);
    return () => {
      window.removeEventListener('sg-pathway:installable', onInstallable);
      window.removeEventListener('sg-pathway:installed', onInstalled);
    };
  }, []);

  if (!installable) return null;

  const install = async () => {
    const ev = window.__sgPathwayInstallEvent;
    if (!ev) return;
    await ev.prompt();
    setInstallable(false);
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setInstallable(false);
  };

  return (
    <div className="bg-clinical-accent/10 border-b border-clinical-accent/40 px-4 py-1.5 text-[11px] text-clinical-accent flex items-center gap-3">
      <span className="font-semibold uppercase tracking-wider text-[10px]">
        {t('install.tag')}
      </span>
      <span className="flex-1 text-white/85">{t('install.body')}</span>
      <button
        onClick={install}
        className="px-2 py-0.5 rounded bg-clinical-accent text-white font-semibold hover:brightness-110 text-[10px]"
      >
        {t('install.cta')}
      </button>
      <button
        onClick={dismiss}
        className="px-2 py-0.5 rounded border border-clinical-accent/40 text-clinical-accent hover:text-white text-[10px]"
      >
        {t('install.dismiss')}
      </button>
    </div>
  );
}
