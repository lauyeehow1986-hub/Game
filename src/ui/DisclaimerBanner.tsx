import { useEffect, useState } from 'react';
import { useT } from '../lib/i18n';

const KEY = 'sg-pathway-disclaimer-v1';

export function DisclaimerBanner() {
  const t = useT();
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
        {t('disclaimer.tag')}
      </span>
      <span className="flex-1">{t('disclaimer.body')}</span>
      <button
        onClick={dismiss}
        className="text-amber-300 hover:text-white px-2 py-0.5 rounded border border-amber-500/40 text-[10px]"
      >
        {t('common.gotIt')}
      </button>
    </div>
  );
}
