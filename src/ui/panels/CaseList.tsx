import { useEffect, useState, lazy, Suspense } from 'react';
import { listCases } from '../../content';
import { useGame } from '../../state/gameStore';
import { useProgress } from '../../state/progressStore';
import { useCustomCases } from '../../state/customCasesStore';
import { downloadCaseJson, encodeCaseToUrl, tryDecodeCaseFromHref } from '../../lib/case-share';

const CaseImportModal = lazy(() =>
  import('../modals/CaseImportModal').then((m) => ({ default: m.CaseImportModal })),
);
const BestPathDemoModal = lazy(() =>
  import('../modals/BestPathDemoModal').then((m) => ({ default: m.BestPathDemoModal })),
);
const RunComparisonModal = lazy(() =>
  import('../modals/RunComparisonModal').then((m) => ({ default: m.RunComparisonModal })),
);
import { useT, useTr } from '../../lib/i18n';
import { EMPTY_FILTER, filterCases, filterIsEmpty, type CaseFilter } from '../../lib/case-filter';
import type { CaseDefinition } from '../../lib/types';
import { useAchievements } from '../../state/achievementsStore';
import { computeDifficulty, DIFFICULTY_COLOUR } from '../../lib/case-difficulty';

export function CaseList() {
  const t = useT();
  const tr = useTr();
  const startCase = useGame((s) => s.startCase);
  const resetRun = useGame((s) => s.resetRun);
  const status = useGame((s) => s.run.status);
  const activeId = useGame((s) => s.run.caseId);
  const unlocked = useProgress((s) => s.unlockedCaseIds);
  const bestScores = useProgress((s) => s.bestScores);
  const runHistory = useProgress((s) => s.runHistory);
  const customCases = useCustomCases((s) => s.cases);
  const addCustom = useCustomCases((s) => s.add);
  const removeCustom = useCustomCases((s) => s.remove);
  const fireAchievement = useAchievements((s) => s.fire);

  const [importOpen, setImportOpen] = useState(false);
  const [demoCase, setDemoCase] = useState<CaseDefinition | null>(null);
  const [compareCase, setCompareCase] = useState<CaseDefinition | null>(null);
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [filter, setFilter] = useState<CaseFilter>(EMPTY_FILTER);

  // Decode ?case= on first mount.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const decoded = tryDecodeCaseFromHref(window.location.href);
    if (decoded) {
      addCustom(decoded);
      fireAchievement({ kind: 'custom-content-added' });
      setShareToast(t('cases.shareToast.urlImported', { title: tr(decoded.title) }));
      const url = new URL(window.location.href);
      url.searchParams.delete('case');
      window.history.replaceState({}, '', url.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allCases = [
    ...listCases().map((c) => ({ c, isCustom: false })),
    ...Object.values(customCases).map((c) => ({ c, isCustom: true })),
  ];
  const allowedIds = new Set(
    filterCases(allCases.map((x) => x.c), filter, bestScores).map((c) => c.id),
  );
  const all = allCases.filter((x) => allowedIds.has(x.c.id));
  const hiddenCount = allCases.length - all.length;

  const handleShare = async (c: CaseDefinition) => {
    const url = encodeCaseToUrl(c);
    try {
      await navigator.clipboard.writeText(url);
      setShareToast(t('cases.shareToast.copied'));
    } catch {
      setShareToast(url);
    }
    fireAchievement({ kind: 'export-used' });
    setTimeout(() => setShareToast(null), 4000);
  };

  return (
    <section data-tour="case-list" className="bg-clinical-panel border border-clinical-border rounded-lg p-3 space-y-2">
      <header className="flex items-baseline justify-between gap-1">
        <h3 className="text-sm font-semibold text-white">{t('cases.heading')}</h3>
        <div className="flex gap-1">
          <button
            onClick={() => {
              const playable = listCases().filter((c) => unlocked.includes(c.id));
              if (playable.length === 0) return;
              const c = playable[Math.floor(Math.random() * playable.length)];
              if (status !== 'idle') resetRun();
              startCase(c);
            }}
            title={t('cases.random.tip')}
            className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-clinical-border text-clinical-subtle hover:text-white"
          >
            {t('cases.random')}
          </button>
          <button
            onClick={() => setImportOpen(true)}
            className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-clinical-border text-clinical-subtle hover:text-white"
          >
            {t('cases.importJson')}
          </button>
        </div>
      </header>

      {shareToast && (
        <div className="border border-clinical-accent/40 rounded bg-clinical-accent/10 px-2 py-1 text-[11px] text-clinical-accent">
          {shareToast}
        </div>
      )}

      <div className="space-y-1">
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={filter.query}
            onChange={(e) => setFilter({ ...filter, query: e.target.value })}
            placeholder={t('cases.search.placeholder')}
            className="flex-1 bg-clinical-bg border border-clinical-border rounded px-2 py-1 text-[11px] text-white"
          />
          {!filterIsEmpty(filter) && (
            <button
              onClick={() => setFilter(EMPTY_FILTER)}
              className="text-[10px] px-2 py-1 rounded border border-clinical-border text-clinical-subtle hover:text-white"
            >
              {t('cases.search.clear')}
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {(['acute', 'elective', 'outpatient'] as const).map((cat) => {
            const on = filter.categories.includes(cat);
            return (
              <button
                key={cat}
                onClick={() =>
                  setFilter({
                    ...filter,
                    categories: on
                      ? filter.categories.filter((c) => c !== cat)
                      : [...filter.categories, cat],
                  })
                }
                className={`text-[10px] px-2 py-0.5 rounded-full border ${
                  on
                    ? 'border-clinical-accent bg-clinical-accent/15 text-clinical-accent'
                    : 'border-clinical-border text-clinical-subtle hover:text-white'
                }`}
              >
                {t(`cases.category.${cat}`)}
              </button>
            );
          })}
          <button
            onClick={() => setFilter({ ...filter, historicalOnly: !filter.historicalOnly })}
            className={`text-[10px] px-2 py-0.5 rounded-full border ${
              filter.historicalOnly
                ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                : 'border-clinical-border text-clinical-subtle hover:text-white'
            }`}
          >
            {t('cases.badge.historical')}
          </button>
          <button
            onClick={() => setFilter({ ...filter, unplayedOnly: !filter.unplayedOnly })}
            className={`text-[10px] px-2 py-0.5 rounded-full border ${
              filter.unplayedOnly
                ? 'border-clinical-accent bg-clinical-accent/15 text-clinical-accent'
                : 'border-clinical-border text-clinical-subtle hover:text-white'
            }`}
          >
            {t('cases.search.unplayed')}
          </button>
          {(['beginner', 'intermediate', 'advanced'] as const).map((band) => {
            const on = filter.difficulty === band;
            return (
              <button
                key={band}
                onClick={() => setFilter({ ...filter, difficulty: on ? null : band })}
                className="text-[10px] px-2 py-0.5 rounded-full border font-semibold"
                style={{
                  borderColor: on ? DIFFICULTY_COLOUR[band] : undefined,
                  backgroundColor: on ? `${DIFFICULTY_COLOUR[band]}22` : undefined,
                  color: on ? DIFFICULTY_COLOUR[band] : undefined,
                }}
              >
                {t(`cases.difficulty.${band}`)}
              </button>
            );
          })}
        </div>
        {hiddenCount > 0 && (
          <div className="text-[10px] text-clinical-subtle">
            {t('cases.search.hidden', { n: hiddenCount })}
          </div>
        )}
      </div>

      {all.length === 0 ? (
        <p className="text-[11px] text-clinical-subtle italic py-2">
          {t('cases.search.empty')}
        </p>
      ) : (
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
                    {(() => {
                      const d = computeDifficulty(c);
                      return (
                        <span
                          className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold"
                          style={{
                            backgroundColor: `${DIFFICULTY_COLOUR[d.band]}22`,
                            color: DIFFICULTY_COLOUR[d.band],
                          }}
                          title={t(`cases.difficulty.${d.band}.tip`, {
                            decisions: d.decisions,
                          })}
                        >
                          {t(`cases.difficulty.${d.band}`)}
                        </span>
                      );
                    })()}
                    <span>{tr(c.title)}</span>
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
                    {c.category} · {c.primaryFacility.toUpperCase()}
                    {(() => {
                      const decisions = c.pathway.filter((n) => n.decision).length;
                      const runs = runHistory[c.id]?.length ?? 0;
                      return (
                        <>
                          {' · '}
                          {decisions} {decisions === 1 ? 'decision' : 'decisions'}
                          {runs > 0 && ` · ${runs} ${runs === 1 ? 'run' : 'runs'}`}
                        </>
                      );
                    })()}
                  </div>
                </div>
                {best && (
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <span className="text-[10px] text-clinical-ok font-mono">
                      {t('cases.best')} {best.score.toFixed(1)} / {best.max.toFixed(1)}
                    </span>
                    {(runHistory[c.id]?.length ?? 0) > 1 && (
                      <button
                        onClick={() => setCompareCase(c)}
                        className="text-[10px] text-clinical-accent hover:underline"
                      >
                        {t('cases.compareRuns')}
                      </button>
                    )}
                  </div>
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
                  className="tap-target text-xs px-3 py-1.5 rounded bg-clinical-accent text-white font-semibold disabled:opacity-40 hover:brightness-110"
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
                  onClick={() => {
                    downloadCaseJson(c);
                    fireAchievement({ kind: 'export-used' });
                  }}
                  className="text-[11px] px-2 py-1 rounded border border-clinical-border text-clinical-subtle hover:text-white"
                >
                  {t('common.export')}
                </button>
                <button
                  onClick={() => setDemoCase(c)}
                  className="text-[11px] px-2 py-1 rounded border border-clinical-border text-clinical-subtle hover:text-white"
                >
                  {t('cases.demoBestRun')}
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
      )}

      <Suspense fallback={null}>
        {importOpen && (
          <CaseImportModal open={importOpen} onClose={() => setImportOpen(false)} />
        )}
        {demoCase && (
          <BestPathDemoModal caseDef={demoCase} onClose={() => setDemoCase(null)} />
        )}
        {compareCase && (
          <RunComparisonModal caseDef={compareCase} onClose={() => setCompareCase(null)} />
        )}
      </Suspense>
    </section>
  );
}
