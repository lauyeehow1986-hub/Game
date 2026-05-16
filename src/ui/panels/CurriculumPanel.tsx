import { useEffect, useState } from 'react';
import {
  CURRICULA,
  curriculumProgress,
  nextCaseInCurriculum,
  type Curriculum,
} from '../../lib/curricula';
import { useProgress } from '../../state/progressStore';
import { useGame } from '../../state/gameStore';
import { useCustomCases } from '../../state/customCasesStore';
import { useCustomCurricula } from '../../state/customCurriculaStore';
import { getCase } from '../../content';
import { useT, useTr } from '../../lib/i18n';
import {
  downloadCurriculumJson,
  encodeCurriculumToUrl,
  tryDecodeCurriculumFromHref,
} from '../../lib/case-share';
import { CurriculumImportModal } from '../modals/CurriculumImportModal';
import type { CurriculumBundle } from '../../lib/curriculum-schema';

/**
 * Bridge a CurriculumBundle into the same shape the panel renders for the
 * built-in Curriculum type (objectives become plain strings; tr() resolves
 * any LocalisedString at render time).
 */
function bundleAsCurriculum(b: CurriculumBundle, tr: (v: unknown) => string): Curriculum {
  return {
    id: b.id,
    title: tr(b.title),
    blurb: tr(b.blurb),
    objectives: b.objectives.map((o) => tr(o)),
    caseIds: b.caseIds,
  };
}

export function CurriculumPanel() {
  const t = useT();
  const tr = useTr();
  const bestScores = useProgress((s) => s.bestScores);
  const startCase = useGame((s) => s.startCase);
  const resetRun = useGame((s) => s.resetRun);
  const status = useGame((s) => s.run.status);
  const customCases = useCustomCases((s) => s.cases);
  const addCustomCase = useCustomCases((s) => s.add);
  const customBundles = useCustomCurricula((s) => s.bundles);
  const addBundle = useCustomCurricula((s) => s.add);
  const removeBundle = useCustomCurricula((s) => s.remove);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Decode ?curr= from the URL on mount and side-load any embedded cases.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const b = tryDecodeCurriculumFromHref(window.location.href);
    if (b) {
      addBundle(b);
      for (const c of b.cases ?? []) addCustomCase(c);
      setToast(t('curr.shareToast.urlImported', { title: tr(b.title) }));
      const url = new URL(window.location.href);
      url.searchParams.delete('curr');
      window.history.replaceState({}, '', url.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lookupCase = (id: string) => getCase(id) ?? customCases[id];

  const startNext = (curr: Curriculum) => {
    const id = nextCaseInCurriculum(curr, bestScores);
    if (!id) return;
    const c = lookupCase(id);
    if (!c) return;
    if (status !== 'idle') resetRun();
    startCase(c);
  };

  const trAny = (v: unknown) => tr(v as Parameters<typeof tr>[0]);

  const customAsCurricula: Array<Curriculum & { isCustom: true; bundle: CurriculumBundle }> =
    Object.values(customBundles).map((b) => ({
      ...bundleAsCurriculum(b, trAny),
      isCustom: true,
      bundle: b,
    }));

  const all: Array<Curriculum & { isCustom?: boolean; bundle?: CurriculumBundle }> = [
    ...CURRICULA,
    ...customAsCurricula,
  ];

  const handleShare = async (b: CurriculumBundle) => {
    const url = encodeCurriculumToUrl(b);
    try {
      await navigator.clipboard.writeText(url);
      setToast(t('curr.shareToast.copied'));
    } catch {
      setToast(url);
    }
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <section className="bg-clinical-panel border border-clinical-border rounded-lg p-3 space-y-2">
      <header className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-white">{t('curr.heading')}</h3>
        <button
          onClick={() => setImportOpen(true)}
          className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-clinical-border text-clinical-subtle hover:text-white"
        >
          {t('curr.importCurriculum')}
        </button>
      </header>

      {toast && (
        <div className="border border-clinical-accent/40 rounded bg-clinical-accent/10 px-2 py-1 text-[11px] text-clinical-accent">
          {toast}
        </div>
      )}

      <ul className="space-y-2">
        {all.map((curr) => {
          const p = curriculumProgress(curr, bestScores);
          const next = nextCaseInCurriculum(curr, bestScores);
          const isExpanded = expanded === curr.id;
          const nextCase = next ? lookupCase(next) : null;
          const done = p.completed === p.total && p.total > 0;
          const isCustom = curr.isCustom;
          return (
            <li
              key={curr.id}
              className={`rounded border ${
                done
                  ? 'border-clinical-ok/40 bg-clinical-ok/5'
                  : 'border-clinical-border bg-clinical-bg'
              } p-2`}
            >
              <button
                onClick={() => setExpanded(isExpanded ? null : curr.id)}
                aria-expanded={isExpanded}
                className="w-full text-left"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5 flex-wrap">
                    {isCustom && (
                      <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-clinical-accent/25 text-clinical-accent">
                        {t('cases.badge.custom')}
                      </span>
                    )}
                    <span>{curr.title}</span>
                  </div>
                  <span
                    className="text-[10px] font-mono"
                    style={{ color: done ? '#4ade80' : p.ratio > 0 ? '#facc15' : '#7d8ba4' }}
                  >
                    {t('curr.progress', { done: p.completed, total: p.total })}
                  </span>
                </div>
                <p className="text-[11px] text-clinical-subtle mt-1 leading-snug">{curr.blurb}</p>
                <div className="h-1 bg-clinical-bg rounded overflow-hidden mt-1">
                  <div
                    className="h-full"
                    style={{
                      width: `${p.ratio * 100}%`,
                      backgroundColor: done ? '#4ade80' : '#3aa6ff',
                    }}
                  />
                </div>
              </button>

              {isExpanded && (
                <div className="mt-2 space-y-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-clinical-subtle mb-1">
                      {t('curr.objectives')}
                    </div>
                    <ul className="space-y-0.5 text-[11px] text-white/85 list-disc pl-4">
                      {curr.objectives.map((o, i) => (
                        <li key={i}>{o}</li>
                      ))}
                    </ul>
                  </div>
                  <ol className="text-[11px] space-y-0.5">
                    {curr.caseIds.map((id, i) => {
                      const c = lookupCase(id);
                      const has = !!bestScores[id];
                      return (
                        <li
                          key={id}
                          className="flex items-center justify-between gap-2 border-b border-clinical-border/40 py-0.5"
                        >
                          <span
                            className={`truncate ${has ? 'text-clinical-ok' : 'text-clinical-subtle'}`}
                          >
                            {i + 1}. {c ? tr(c.title) : id}
                          </span>
                          {has && (
                            <span className="font-mono text-[10px] text-clinical-ok">✓</span>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}

              <div className="mt-2 flex flex-wrap gap-2">
                {done ? (
                  <span className="text-[11px] px-2 py-1 rounded bg-clinical-ok/15 text-clinical-ok font-semibold">
                    {t('curr.complete')}
                  </span>
                ) : (
                  <button
                    onClick={() => startNext(curr)}
                    disabled={!nextCase}
                    className="text-[11px] px-2 py-1 rounded bg-clinical-accent text-white font-semibold disabled:opacity-40 hover:brightness-110"
                  >
                    {p.completed === 0 ? t('curr.begin') : t('curr.continue')}
                  </button>
                )}
                {curr.bundle && (
                  <>
                    <button
                      onClick={() => handleShare(curr.bundle!)}
                      className="text-[11px] px-2 py-1 rounded border border-clinical-border text-clinical-subtle hover:text-white"
                    >
                      {t('curr.shareCurriculum')}
                    </button>
                    <button
                      onClick={() => downloadCurriculumJson(curr.bundle!)}
                      className="text-[11px] px-2 py-1 rounded border border-clinical-border text-clinical-subtle hover:text-white"
                    >
                      {t('curr.exportCurriculum')}
                    </button>
                    {isCustom && (
                      <button
                        onClick={() => removeBundle(curr.id)}
                        className="text-[11px] px-2 py-1 rounded border border-clinical-danger/50 text-clinical-danger hover:bg-clinical-danger/10"
                      >
                        {t('common.delete')}
                      </button>
                    )}
                  </>
                )}
                {nextCase && !done && (
                  <span className="text-[10px] text-clinical-subtle self-center">
                    {t('curr.nextLabel', { title: tr(nextCase.title) })}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <CurriculumImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </section>
  );
}
