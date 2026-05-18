import { useEffect, useState } from 'react';
import { tryDecodeRunFromHref, type RunSnapshot } from '../../lib/case-share';
import { compareToBestPath } from '../../lib/best-path';
import { gradeForRatio, totalScoreFromLog } from '../../lib/scoring';
import { getCase } from '../../content';
import { useT, useTr } from '../../lib/i18n';
import type { CaseDefinition } from '../../lib/types';
import { useFocusTrap } from '../../lib/use-focus-trap';

/**
 * Opens automatically when the URL carries a ?run=... payload. Lets an
 * educator paste a student's run URL and walk through the same diff the
 * student saw, without running the case live.
 */
export function RunReviewModal() {
  const t = useT();
  const tr = useTr();
  const [snap, setSnap] = useState<RunSnapshot | null>(null);
  const [caseDef, setCaseDef] = useState<CaseDefinition | null>(null);
  const [unknownCaseId, setUnknownCaseId] = useState<string | null>(null);
  const errorCardRef = useFocusTrap<HTMLDivElement>(unknownCaseId != null);
  const cardRef = useFocusTrap<HTMLDivElement>(snap != null && caseDef != null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const r = tryDecodeRunFromHref(window.location.href);
    if (!r) return;
    const c = getCase(r.caseId);
    if (!c) {
      setUnknownCaseId(r.caseId);
    } else {
      setSnap(r);
      setCaseDef(c);
    }
    // Strip the param so refresh doesn't re-trigger.
    const url = new URL(window.location.href);
    url.searchParams.delete('run');
    window.history.replaceState({}, '', url.toString());
  }, []);

  const close = () => {
    setSnap(null);
    setCaseDef(null);
    setUnknownCaseId(null);
  };

  if (unknownCaseId) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4"
      >
        <div ref={errorCardRef} className="bg-clinical-panel border border-clinical-border rounded-lg max-w-md w-full shadow-2xl p-5 space-y-3">
          <h2 className="text-base font-semibold text-white">{t('runReview.heading')}</h2>
          <p className="text-[12px] text-clinical-subtle">
            {t('runReview.notFound', { id: unknownCaseId })}
          </p>
          <div className="flex justify-end">
            <button
              onClick={close}
              data-autofocus
              className="px-3 py-1.5 rounded bg-clinical-accent text-white text-xs font-semibold"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!snap || !caseDef) return null;

  const { earned, max } = totalScoreFromLog(snap.log);
  const ratio = max > 0 ? earned / max : 0;
  const grade = gradeForRatio(ratio);
  const diff = compareToBestPath(caseDef, snap.log);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="run-review-title"
      className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4"
    >
      <div ref={cardRef} className="bg-clinical-panel border border-clinical-border rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin shadow-2xl">
        <header className="px-5 py-4 border-b border-clinical-border flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
              {t('runReview.heading')}
            </div>
            <h2 id="run-review-title" className="text-base font-semibold text-white mt-1">
              {tr(caseDef.title)}
            </h2>
            <p className="text-[11px] text-clinical-subtle mt-1 leading-snug">
              {t('runReview.subtitle', { title: tr(caseDef.title) })}
            </p>
          </div>
          <div
            className="px-3 py-1.5 rounded font-bold text-base"
            style={{ backgroundColor: `${grade.colour}22`, color: grade.colour }}
          >
            {grade.grade}
          </div>
        </header>

        <section className="px-5 py-4 grid grid-cols-3 gap-3 border-b border-clinical-border text-xs">
          <Mini label="Score" value={`${earned.toFixed(1)} / ${max.toFixed(1)}`} />
          <Mini label="Decisions" value={`${snap.log.length}`} />
          <Mini label="Cash OOP" value={`S$${snap.totalCostSGD.toFixed(0)}`} />
          {snap.profile && (
            <>
              <Mini
                label="Ward class"
                value={snap.profile.wardClass === 'na' ? 'Outpatient' : `Class ${snap.profile.wardClass}`}
              />
              <Mini
                label="CHAS"
                value={snap.profile.chasTier === 'none' ? '—' : snap.profile.chasTier.toUpperCase()}
              />
              <Mini label="IP rider" value={snap.profile.hasIntegratedShield ? 'Yes' : 'No'} />
            </>
          )}
        </section>

        {snap.journey && snap.journey.length > 0 && (() => {
          const stops = snap.journey
            .map((id) => caseDef.pathway.find((n) => n.id === id))
            .filter((n): n is NonNullable<typeof n> => n != null)
            .filter((n) => tr(n.framing.staff).trim().length > 0);
          if (stops.length === 0) return null;
          return (
            <section className="px-5 py-4 border-b border-clinical-border space-y-2">
              <h3 className="text-sm font-semibold text-white">Patient journey</h3>
              <ul className="space-y-1.5 text-[11px] max-h-48 overflow-y-auto scrollbar-thin pr-1">
                {stops.map((n, i) => (
                  <li
                    key={`${n.id}-${i}`}
                    className="border-l-2 border-clinical-border pl-2"
                  >
                    <div className="text-[9px] uppercase tracking-wider text-clinical-subtle">
                      {n.facility ?? caseDef.primaryFacility} · {n.department}
                    </div>
                    <div className="text-white/85 italic leading-snug">
                      {tr(n.framing.staff)}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })()}

        {diff.length > 0 && (
          <section className="px-5 py-4 border-b border-clinical-border space-y-2">
            <h3 className="text-sm font-semibold text-white">{t('results.bestPath.h')}</h3>
            <div className="grid gap-2">
              {diff.map((row, i) => {
                const yours = row.yours;
                const delta = yours ? row.best.score - yours.score : row.best.score;
                return (
                  <div
                    key={i}
                    className={`border rounded p-2 ${
                      row.match
                        ? 'border-clinical-ok/40 bg-clinical-ok/5'
                        : 'border-clinical-warn/40 bg-clinical-warn/5'
                    }`}
                  >
                    <div className="flex justify-between text-[10px] uppercase tracking-wider">
                      <span className="text-clinical-subtle truncate flex-1">{tr(row.prompt)}</span>
                      <span className={row.match ? 'text-clinical-ok' : 'text-clinical-warn'}>
                        {row.match ? t('results.bestPath.match') : t('results.bestPath.miss')}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 text-[11px]">
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-clinical-subtle">
                          {t('results.bestPath.you')}
                        </div>
                        <div className="text-white">{yours ? tr(yours.label) : '—'}</div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-clinical-subtle">
                          {t('results.bestPath.best')}
                        </div>
                        <div className="text-white">{tr(row.best.label)}</div>
                        {!row.match && (
                          <div className="font-mono text-[10px] text-clinical-warn">
                            {t('results.bestPath.deltaScore', { delta: delta.toFixed(1) })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <footer className="px-5 py-3 border-t border-clinical-border flex items-center justify-end gap-2">
          <button
            onClick={close}
            data-autofocus
            className="px-4 py-1.5 rounded bg-clinical-accent text-white text-xs font-semibold hover:brightness-110"
          >
            {t('common.close')}
          </button>
        </footer>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-clinical-border bg-clinical-bg/40 p-2">
      <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">{label}</div>
      <div className="text-sm font-semibold text-white mt-0.5">{value}</div>
    </div>
  );
}
