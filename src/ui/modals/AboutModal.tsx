import { useEffect } from 'react';
import { useT } from '../../lib/i18n';
import { useFocusTrap } from '../../lib/use-focus-trap';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AboutModal({ open, onClose }: Props) {
  const t = useT();
  const trap = useFocusTrap<HTMLDivElement>(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-title"
      className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4"
    >
      <div ref={trap} className="bg-clinical-panel border border-clinical-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin shadow-2xl">
        <header className="px-5 py-4 border-b border-clinical-border flex items-baseline justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
              {t('disclaimer.tag')}
            </div>
            <h2 id="about-title" className="text-base font-semibold text-white mt-1">
              {t('about.title')}
            </h2>
            <p className="text-[11px] text-clinical-subtle mt-1 leading-snug">
              {t('about.tagline')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[11px] text-clinical-subtle hover:text-white"
          >
            {t('common.close')}
          </button>
        </header>
        <div className="px-5 py-4 space-y-4 text-[12px] text-white/90 leading-relaxed">
          <Section title={t('about.financing.h')} body={t('about.financing.body')} />
          <Section title={t('about.network.h')} body={t('about.network.body')} />
          <Section title={t('about.cases.h')} body={t('about.cases.body')} />
          <Section title={t('about.privacy.h')} body={t('about.privacy.body')} />
          <Section title={t('about.code.h')} body={t('about.code.body')} />

          <section className="border border-clinical-danger/30 rounded p-3 bg-clinical-danger/5">
            <h3 className="text-sm font-semibold text-white mb-1">{t('about.reset.h')}</h3>
            <p className="text-[12px] text-white/85 mb-2">{t('about.reset.body')}</p>
            <button
              onClick={() => {
                if (!confirm(t('about.reset.confirm'))) return;
                try {
                  localStorage.clear();
                } catch {
                  /* ignore */
                }
                alert(t('about.reset.done'));
                location.reload();
              }}
              className="px-3 py-1.5 rounded border border-clinical-danger text-clinical-danger hover:bg-clinical-danger/10 text-xs"
            >
              {t('about.reset.button')}
            </button>
          </section>
        </div>
        <footer className="px-5 py-3 border-t border-clinical-border flex items-center justify-end">
          <button
            onClick={onClose}
            data-autofocus
            className="px-3 py-1.5 rounded bg-clinical-accent text-white text-xs font-semibold hover:brightness-110"
          >
            {t('common.close')}
          </button>
        </footer>
      </div>
    </div>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
      <p className="text-[12px] text-white/85">{body}</p>
    </section>
  );
}
