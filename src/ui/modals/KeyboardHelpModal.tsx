import { useEffect, useState, lazy, Suspense } from 'react';

const KeyboardHelpContent = lazy(() =>
  import('./KeyboardHelpContent').then((m) => ({ default: m.KeyboardHelpContent })),
);

/**
 * Press ? (Shift+/) anywhere to open this overlay. Click outside or
 * press Esc to close. Lists every keyboard shortcut the app honours so
 * keyboard / screen-reader users don't have to guess.
 *
 * Only the key-listener lives in the always-mounted bundle; the dialog
 * markup is split into KeyboardHelpContent and loaded on first open.
 */
export function KeyboardHelpModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const inField =
        e.target instanceof HTMLElement &&
        (e.target.tagName === 'INPUT' ||
          e.target.tagName === 'TEXTAREA' ||
          e.target.isContentEditable);
      if (!inField && (e.key === '?' || (e.shiftKey && e.key === '/'))) {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (open && e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;
  return (
    <Suspense fallback={null}>
      <KeyboardHelpContent onClose={() => setOpen(false)} />
    </Suspense>
  );
}
