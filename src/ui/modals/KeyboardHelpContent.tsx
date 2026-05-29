import { useT } from '../../lib/i18n';
import { useFocusTrap } from '../../lib/use-focus-trap';

export function KeyboardHelpContent({ onClose }: { onClose: () => void }) {
  const t = useT();
  const cardRef = useFocusTrap<HTMLDivElement>(true);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="kbd-help-title"
      className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        className="bg-clinical-panel border border-clinical-border rounded-lg max-w-md w-full shadow-2xl"
      >
        <header className="px-5 py-4 border-b border-clinical-border">
          <h2 id="kbd-help-title" className="text-base font-semibold text-white">
            {t('a11y.kbd.heading')}
          </h2>
          <p className="text-[11px] text-clinical-subtle mt-1">{t('a11y.kbd.subtitle')}</p>
        </header>
        <div className="px-5 py-4 space-y-4 text-[12px]">
          <Group title={t('a11y.kbd.global')}>
            <Row keys={['?']} label={t('a11y.kbd.k.help')} />
            <Row keys={['Esc']} label={t('a11y.kbd.k.esc')} />
            <Row keys={['Tab', 'Shift+Tab']} label={t('a11y.kbd.k.tab')} />
          </Group>
          <Group title={t('a11y.kbd.decision')}>
            <Row keys={['↑', '↓']} label={t('a11y.kbd.k.arrows')} />
            <Row keys={['1', '2', '…']} label={t('a11y.kbd.k.nums')} />
            <Row keys={['Enter']} label={t('a11y.kbd.k.enter')} />
          </Group>
          <Group title={`${t('a11y.kbd.demo')} / ${t('a11y.kbd.tutorial')}`}>
            <Row keys={['←', '→']} label={t('a11y.kbd.k.lr')} />
          </Group>
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

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-[10px] uppercase tracking-wider text-clinical-subtle mb-1.5">
        {title}
      </h3>
      <ul className="space-y-1">{children}</ul>
    </section>
  );
}

function Row({ keys, label }: { keys: string[]; label: string }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="text-white/85">{label}</span>
      <span className="flex gap-1 shrink-0">
        {keys.map((k) => (
          <kbd
            key={k}
            className="px-1.5 py-0.5 rounded border border-clinical-border bg-clinical-bg text-[10px] font-mono text-clinical-subtle"
          >
            {k}
          </kbd>
        ))}
      </span>
    </li>
  );
}
