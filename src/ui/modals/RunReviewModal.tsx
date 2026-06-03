import { useEffect, useState } from 'react';
import { tryDecodeRunFromHref, type RunSnapshot } from '../../lib/case-share';
import { compareToBestPath } from '../../lib/best-path';
import { gradeForRatio, totalScoreFromLog } from '../../lib/scoring';
import { getCase } from '../../content';
import { useT, useTr } from '../../lib/i18n';
import type { CaseDefinition } from '../../lib/types';
import { useFocusTrap } from '../../lib/use-focus-trap';
import {
  decodeThread,
  encodeThread,
  mergeThreads,
  parsePastedThreads,
  runRef,
  type ReviewComment,
  type ReviewThread,
} from '../../lib/peer-review';

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
  const ref = runRef(snap);

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

        <PeerReviewPanel runRef={ref} diffLength={diff.length} />

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

const THREAD_KEY_PREFIX = 'sg-pathway-review-thread-v1:';

function loadThread(ref: string): ReviewThread {
  if (typeof window === 'undefined') return { runRef: ref, comments: [] };
  try {
    const raw = window.localStorage.getItem(THREAD_KEY_PREFIX + ref);
    if (!raw) return { runRef: ref, comments: [] };
    const t = JSON.parse(raw) as ReviewThread;
    return t.runRef === ref ? t : { runRef: ref, comments: [] };
  } catch {
    return { runRef: ref, comments: [] };
  }
}
function saveThread(t: ReviewThread): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(THREAD_KEY_PREFIX + t.runRef, JSON.stringify(t));
}

/**
 * v6.0 peer-review panel: lets a reviewer add per-step comments to a shared
 * run, persist them locally by runRef, and import/export the whole thread
 * as an SGR1.* token (clipboard). Backend-free.
 */
function PeerReviewPanel({ runRef, diffLength }: { runRef: string; diffLength: number }) {
  const t = useT();
  const [thread, setThread] = useState<ReviewThread>(() => loadThread(runRef));
  const [draft, setDraft] = useState<{ author: string; step: number; body: string }>({ author: '', step: 0, body: '' });
  const [paste, setPaste] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2000);
  };

  const addComment = () => {
    const body = draft.body.trim();
    if (!body) return;
    const c: ReviewComment = { step: draft.step, author: draft.author.trim() || 'Anon', body, at: Date.now() };
    const next: ReviewThread = { runRef, comments: [...thread.comments, c] };
    setThread(next);
    saveThread(next);
    setDraft({ ...draft, body: '' });
  };

  const exportToken = async () => {
    const tok = encodeThread(thread);
    try {
      await navigator.clipboard.writeText(tok);
      flash(t('review.copied'));
    } catch {
      window.prompt(t('review.copyManual'), tok);
    }
  };

  const importFromPaste = () => {
    let next = thread;
    for (const incoming of parsePastedThreads(paste)) {
      if (incoming.runRef === runRef) next = mergeThreads(next, incoming);
    }
    if (next === thread) {
      // Try a single token form too.
      const single = decodeThread(paste.trim());
      if (single && single.runRef === runRef) next = mergeThreads(next, single);
    }
    if (next !== thread) {
      setThread(next);
      saveThread(next);
      setPaste('');
      flash(t('review.imported'));
    } else {
      flash(t('review.noneFound'));
    }
  };

  const field = 'w-full bg-clinical-bg border border-clinical-border rounded px-2 py-1 text-[12px] text-white';

  return (
    <section className="px-5 py-3 border-t border-clinical-border space-y-2">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-white">{t('review.heading')}</h3>
        <span className="text-[10px] uppercase tracking-wider text-clinical-subtle">ref {runRef}</span>
      </div>
      <p className="text-[11px] text-clinical-subtle">{t('review.intro')}</p>

      {thread.comments.length > 0 && (
        <ul className="space-y-1.5">
          {thread.comments.map((c, i) => (
            <li key={i} className="border border-clinical-border rounded p-2">
              <div className="flex items-baseline justify-between text-[10px] uppercase tracking-wider text-clinical-subtle">
                <span>{c.author} · {t('review.step', { n: c.step + 1 })}</span>
                <span>{new Date(c.at).toLocaleDateString('en-CA')}</span>
              </div>
              <p className="text-[12px] text-white mt-0.5 whitespace-pre-wrap">{c.body}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-[1fr_80px] gap-1">
        <input
          className={field}
          value={draft.author}
          onChange={(e) => setDraft({ ...draft, author: e.target.value })}
          placeholder={t('review.author')}
          aria-label={t('review.author')}
        />
        <select
          className={field}
          value={draft.step}
          onChange={(e) => setDraft({ ...draft, step: parseInt(e.target.value, 10) })}
          aria-label={t('review.step', { n: draft.step + 1 })}
        >
          {Array.from({ length: Math.max(1, diffLength) }, (_, i) => (
            <option key={i} value={i}>{i + 1}</option>
          ))}
        </select>
      </div>
      <textarea
        className={field}
        rows={2}
        value={draft.body}
        onChange={(e) => setDraft({ ...draft, body: e.target.value })}
        placeholder={t('review.bodyPlaceholder')}
        aria-label={t('review.body')}
      />
      <div className="flex gap-2">
        <button
          onClick={addComment}
          disabled={!draft.body.trim()}
          className="px-3 py-1.5 rounded bg-clinical-accent text-white text-xs font-semibold hover:brightness-110 disabled:opacity-40"
        >
          {t('review.add')}
        </button>
        <button
          onClick={exportToken}
          className="px-3 py-1.5 rounded border border-clinical-border text-clinical-subtle hover:text-white text-xs"
        >
          {t('review.copyToken')}
        </button>
      </div>

      <details className="text-[11px]">
        <summary className="cursor-pointer text-clinical-subtle hover:text-white">{t('review.importSummary')}</summary>
        <textarea
          className={`${field} mt-1`}
          rows={2}
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          placeholder="SGR1.…"
          aria-label={t('review.importSummary')}
        />
        <button
          onClick={importFromPaste}
          className="mt-1 px-3 py-1 rounded border border-clinical-border text-clinical-subtle hover:text-white text-xs"
        >
          {t('review.importBtn')}
        </button>
      </details>

      {toast && <div className="text-[11px] text-clinical-accent">{toast}</div>}
    </section>
  );
}
