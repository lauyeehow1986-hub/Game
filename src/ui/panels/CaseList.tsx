import { useEffect, useState } from 'react';
import { listCases } from '../../content';
import { useGame } from '../../state/gameStore';
import { useProgress } from '../../state/progressStore';
import { useCustomCases } from '../../state/customCasesStore';
import { downloadCaseJson, encodeCaseToUrl, tryDecodeCaseFromHref } from '../../lib/case-share';
import { CaseImportModal } from '../modals/CaseImportModal';
import { useT, useTr } from '../../lib/i18n';
import type { CaseDefinition } from '../../lib/types';

export function CaseList() {
  const t = useT();
  const tr = useTr();
  const startCase = useGame((s) => s.startCase);
  const resetRun = useGame((s) => s.resetRun);
  const status = useGame((s) => s.run.status);
  const activeId = useGame((s) => s.run.caseId);
  const unlocked = useProgress((s) => s.unlockedCaseIds);
  const bestScores = useProgress((s) => s.bestScores);
  const customCases = useCustomCases((s) => s.cases);
  const addCustom = useCustomCases((s) => s.add);
  const removeCustom = useCustomCases((s) => s.remove);

  const [importOpen, setImportOpen] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Decode ?case= on first mount.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const decoded = tryDecodeCaseFromHref(window.location.href);
    if (decoded) {
      addCustom(decoded);
      setShareToast(t('cases.shareToast.urlImported', { title: tr(decoded.title) }));
      const url = new URL(window.location.href);
      url.searchParams.delete('case');
      window.history.replaceState({}, '', url.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const all: Array<{ c: CaseDefinition; isCustom: boolean }> = [
    ...listCases().map((c) => ({ c, isCustom: false })),
    ...Object.values(customCases).map((c) => ({ c, isCustom: true })),
  ];

  const handleShare = async (c: CaseDefinition) => {
    const url = encodeCaseToUrl(c);
    try {
      await navigator.clipboard.writeText(url);
      setShareToast(t('cases.shareToast.copied'));
    } catch {
      setShareToast(url);
    }
    setTimeout(() => setShareToast(null), 4000);
  };

  return (
    <section className="bg-clinical-panel border border-clinical-border rounded-lg p-3 space-y-2">
      <header className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-white">{t('cases.heading')}</h3>
        <button
          onClick={() => setImportOpen(true)}
          className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-clinical-border text-clinical-subtle hover:text-white"
        >
          {t('cases.importJson')}
        </button>
      </header>

      {shareToast && (
        <div className="border border-clinical-accent/40 rounded bg-clinical-accent/10 px-2 py-1 text-[11px] text-clinical-accent">
          {shareToast}
        </div>
      )}

      <ul className="space-y-2">
        {all.map(({ c, isCustom }) => {
          const isUnlocked = isCustom || unlocked.includes(c.id);
          const best = bestScores[c.id];
          const isActive = activeId === c.id && status !== 'idle';
          return (
            <li
              key={c.id}
              className={`rounded border p-2 ${
                isActive
                  ? 'border-clinical-accent bg-clinical-accent/5'
                  : 'border-clinical-border bg-clinical-bg'
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5 flex-wrap">
                    {c.historical && (
                      <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                        {t('cases.badge.historical')}
                      </span>
                    )}
                    {isCustom && (
                      <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-clinical-accent/25 text-clinical-accent">
                        {t('cases.badge.custom')}
                      </span>
                    )}
                    <span>{tr(c.title)}</span>
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
                    {c.category} · {c.primaryFacility.toUpperCase()}
                  </div>
                </div>
                {best && (
                  <span className="text-[10px] text-clinical-ok font-mono">
                    {t('cases.best')} {best.score.toFixed(1)} / {best.max.toFixed(1)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-clinical-subtle mt-1 leading-snug">{tr(c.blurb)}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  disabled={!isUnlocked}
                  onClick={() => {
                    if (isActive) resetRun();
                    startCase(c);
                  }}
                  className="text-[11px] px-2 py-1 rounded bg-clinical-accent text-white font-semibold disabled:opacity-40 hover:brightness-110"
                >
                  {isActive ? t('cases.restart') : t('cases.startCase')}
                </button>
                {isActive && (
                  <button
                    onClick={resetRun}
                    className="text-[11px] px-2 py-1 rounded border border-clinical-border text-clinical-subtle hover:text-white"
                  >
                    {t('common.stop')}
                  </button>
                )}
                <button
                  onClick={() => handleShare(c)}
                  className="text-[11px] px-2 py-1 rounded border border-clinical-border text-clinical-subtle hover:text-white"
                >
                  {t('common.share')}
                </button>
                <button
                  onClick={() => downloadCaseJson(c)}
                  className="text-[11px] px-2 py-1 rounded border border-clinical-border text-clinical-subtle hover:text-white"
                >
                  {t('common.export')}
                </button>
                {isCustom && (
                  <button
                    onClick={() => removeCustom(c.id)}
                    className="text-[11px] px-2 py-1 rounded border border-clinical-danger/50 text-clinical-danger hover:bg-clinical-danger/10"
                  >
                    {t('common.delete')}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <CaseImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </section>
  );
}
