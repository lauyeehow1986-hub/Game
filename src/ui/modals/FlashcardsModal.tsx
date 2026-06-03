import { useMemo, useState, useEffect } from 'react';
import { useFocusTrap } from '../../lib/use-focus-trap';
import { useT, useTr } from '../../lib/i18n';
import type { Flashcard } from '../../lib/flashcards';

interface Props {
  deck: Flashcard[];
  onClose: () => void;
}

export function FlashcardsModal({ deck, onClose }: Props) {
  const t = useT();
  const tr = useTr();
  const cardRef = useFocusTrap<HTMLDivElement>(true);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);

  const card = deck[idx];
  const total = deck.length;

  const advance = useMemo(
    () => (delta: number) => {
      setFlipped(false);
      setIdx((i) => Math.max(0, Math.min(total - 1, i + delta)));
    },
    [total],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setFlipped((f) => !f);
        return;
      }
      if (e.key === 'ArrowRight') advance(1);
      if (e.key === 'ArrowLeft') advance(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance, onClose]);

  if (total === 0) {
    return (
      <div role="dialog" aria-modal="true" className="fixed inset-0 z-[65] grid place-items-center bg-black/70 p-4">
        <div
          ref={cardRef}
          className="bg-clinical-panel border border-clinical-border rounded-lg max-w-md w-full p-5 space-y-3 shadow-2xl"
        >
          <h2 className="text-base font-semibold text-white">{t('flashcards.heading')}</h2>
          <p className="text-[12px] text-clinical-subtle">{t('flashcards.empty')}</p>
          <div className="flex justify-end">
            <button
              data-autofocus
              onClick={onClose}
              className="tap-target px-3 py-1.5 rounded bg-clinical-accent text-white text-xs font-semibold"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="flashcards-title"
      className="fixed inset-0 z-[65] grid place-items-center bg-black/70 p-4"
    >
      <div
        ref={cardRef}
        className="bg-clinical-panel border border-clinical-border rounded-lg max-w-2xl w-full shadow-2xl"
      >
        <header className="px-5 py-3 border-b border-clinical-border flex items-baseline justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
              {t('flashcards.heading')}
            </div>
            <h2 id="flashcards-title" className="text-sm font-semibold text-white">
              {idx + 1} / {total}
            </h2>
          </div>
          <div className="flex gap-3 text-[10px]">
            <span className="text-clinical-ok">✓ {hits}</span>
            <span className="text-clinical-warn">✗ {misses}</span>
            <button
              onClick={onClose}
              className="text-clinical-subtle hover:text-white"
              aria-label={t('common.close')}
            >
              ✕
            </button>
          </div>
        </header>

        <div className="p-5 space-y-3 min-h-[260px]">
          <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
            {tr(card.caseTitle)}
          </div>
          <div className="text-base text-white font-semibold leading-snug">
            {tr(card.prompt)}
          </div>

          {flipped ? (
            <div className="space-y-2 border-t border-clinical-border pt-3">
              <div className="text-[10px] uppercase tracking-wider text-clinical-ok">
                {t('flashcards.bestAnswer')}
              </div>
              <div className="text-sm text-white font-semibold">{tr(card.bestOption)}</div>
              <div className="text-xs text-white/80">{tr(card.rationale)}</div>
              <div className="text-[10px] text-clinical-subtle font-mono pt-1">
                {tr(card.reference.label)}
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-clinical-subtle italic pt-3">
              {t('flashcards.flipHint')}
            </p>
          )}
        </div>

        <footer className="px-5 py-3 border-t border-clinical-border flex items-center justify-between gap-2 text-xs">
          <button
            onClick={() => advance(-1)}
            disabled={idx === 0}
            className="px-3 py-1.5 rounded border border-clinical-border text-clinical-subtle hover:text-white disabled:opacity-40"
          >
            {t('flashcards.prev')}
          </button>
          {flipped ? (
            <div className="flex gap-1">
              <button
                onClick={() => {
                  setMisses((m) => m + 1);
                  advance(1);
                }}
                className="px-3 py-1.5 rounded border border-clinical-warn/60 text-clinical-warn hover:bg-clinical-warn/10"
              >
                {t('flashcards.miss')}
              </button>
              <button
                onClick={() => {
                  setHits((h) => h + 1);
                  advance(1);
                }}
                className="px-3 py-1.5 rounded bg-clinical-ok text-clinical-bg font-semibold"
              >
                {t('flashcards.got')}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setFlipped(true)}
              data-autofocus
              className="px-4 py-1.5 rounded bg-clinical-accent text-white font-semibold"
            >
              {t('flashcards.reveal')}
            </button>
          )}
          <button
            onClick={() => advance(1)}
            disabled={idx === total - 1}
            className="px-3 py-1.5 rounded border border-clinical-border text-clinical-subtle hover:text-white disabled:opacity-40"
          >
            {t('flashcards.next')}
          </button>
        </footer>
      </div>
    </div>
  );
}
