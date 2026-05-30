import { useMemo, useState } from 'react';
import { useFocusTrap } from '../../lib/use-focus-trap';
import { useT, useTr } from '../../lib/i18n';
import { CURRICULA } from '../../lib/curricula';
import { EXAM_PRESETS } from '../../lib/exam';
import {
  assignmentRef,
  encodeAssignmentToUrl,
  parseRoster,
  rosterToCsv,
  summariseRoster,
  type Assignment,
} from '../../lib/assignment';

interface Props {
  open: boolean;
  onClose: () => void;
}

type Tab = 'create' | 'collect';

/**
 * Educator cohort tooling. Create tab: build an assignment (a curriculum or
 * an exam preset + pass mark) and copy a shareable link. Collect tab: paste
 * the completion tokens learners send back; see a tabulated roster + summary
 * and export CSV. Entirely backend-free.
 */
export function EducatorModal({ open, onClose }: Props) {
  const t = useT();
  const tr = useTr();
  const cardRef = useFocusTrap<HTMLDivElement>(open);
  const [tab, setTab] = useState<Tab>('create');

  // Create state
  const [kind, setKind] = useState<Assignment['kind']>('exam');
  const [target, setTarget] = useState('standard');
  const [passPct, setPassPct] = useState(65);
  const [copied, setCopied] = useState(false);

  // Collect state
  const [pasted, setPasted] = useState('');
  const roster = useMemo(() => parseRoster(pasted), [pasted]);
  const summary = useMemo(() => summariseRoster(roster), [roster]);

  if (!open) return null;

  const title =
    kind === 'curriculum'
      ? (CURRICULA.find((c) => c.id === target)?.title ?? target)
      : `${target} exam`;
  const assignment: Assignment = { kind, target, title, passPct };
  const link = encodeAssignmentToUrl(assignment);
  const ref = assignmentRef(assignment);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — the input below still lets them copy manually */
    }
  };

  const downloadCsv = () => {
    if (typeof document === 'undefined' || roster.length === 0) return;
    const blob = new Blob([rosterToCsv(roster)], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sg-pathway-roster-${ref}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabBtn = (id: Tab, label: string) => (
    <button
      onClick={() => setTab(id)}
      aria-pressed={tab === id}
      className={`px-3 py-1 text-[11px] rounded-full ${
        tab === id ? 'bg-clinical-accent text-white font-semibold' : 'text-clinical-subtle'
      }`}
    >
      {label}
    </button>
  );
  const field = 'w-full bg-clinical-bg border border-clinical-border rounded px-2 py-1 text-[12px] text-white';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="educator-title"
      className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4"
    >
      <div
        ref={cardRef}
        className="bg-clinical-panel border border-clinical-border rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto scrollbar-thin shadow-2xl"
      >
        <header className="px-5 py-3 border-b border-clinical-border flex items-center justify-between gap-3">
          <h2 id="educator-title" className="text-sm font-semibold text-white">{t('educator.heading')}</h2>
          <div className="flex items-center gap-1 bg-clinical-bg border border-clinical-border rounded-full p-0.5">
            {tabBtn('create', t('educator.tab.create'))}
            {tabBtn('collect', t('educator.tab.collect'))}
          </div>
          <button onClick={onClose} className="text-[11px] text-clinical-subtle hover:text-white">
            {t('common.close')}
          </button>
        </header>

        {tab === 'create' && (
          <div className="px-5 py-4 space-y-3 text-[12px]">
            <p className="text-[11px] text-clinical-subtle">{t('educator.create.intro')}</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-clinical-subtle mb-0.5">{t('educator.kind')}</label>
                <select
                  className={field}
                  value={kind}
                  onChange={(e) => {
                    const k = e.target.value as Assignment['kind'];
                    setKind(k);
                    setTarget(k === 'exam' ? 'standard' : CURRICULA[0].id);
                  }}
                >
                  <option value="exam">{t('educator.kind.exam')}</option>
                  <option value="curriculum">{t('educator.kind.curriculum')}</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-clinical-subtle mb-0.5">{t('educator.target')}</label>
                <select className={field} value={target} onChange={(e) => setTarget(e.target.value)}>
                  {kind === 'exam'
                    ? Object.keys(EXAM_PRESETS).map((p) => <option key={p} value={p}>{p}</option>)
                    : CURRICULA.map((c) => <option key={c.id} value={c.id}>{tr(c.title)}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-clinical-subtle mb-0.5">{t('educator.passMark')}: {passPct}%</label>
              <input type="range" min={40} max={100} step={5} value={passPct} onChange={(e) => setPassPct(parseInt(e.target.value, 10))} className="w-full accent-clinical-accent" />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-clinical-subtle mb-0.5">{t('educator.link')} ({t('educator.ref')}: {ref})</label>
              <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} className={field} />
            </div>
            <button
              onClick={copyLink}
              className="tap-target w-full px-3 py-1.5 rounded bg-clinical-accent text-white text-xs font-semibold hover:brightness-110"
            >
              {copied ? t('educator.copied') : t('educator.copyLink')}
            </button>
            <p className="text-[10px] text-clinical-subtle leading-snug">{t('educator.create.hint')}</p>
          </div>
        )}

        {tab === 'collect' && (
          <div className="px-5 py-4 space-y-3 text-[12px]">
            <p className="text-[11px] text-clinical-subtle">{t('educator.collect.intro')}</p>
            <textarea
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              rows={5}
              placeholder={t('educator.collect.placeholder')}
              aria-label={t('educator.collect.intro')}
              className={field}
            />
            {roster.length > 0 ? (
              <>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded border border-clinical-border p-2">
                    <div className="text-sm font-semibold text-white">{summary.total}</div>
                    <div className="text-[9px] uppercase tracking-wider text-clinical-subtle">{t('educator.stat.submissions')}</div>
                  </div>
                  <div className="rounded border border-clinical-border p-2">
                    <div className="text-sm font-semibold text-clinical-ok">{Math.round(summary.passRate * 100)}%</div>
                    <div className="text-[9px] uppercase tracking-wider text-clinical-subtle">{t('educator.stat.passRate')}</div>
                  </div>
                  <div className="rounded border border-clinical-border p-2">
                    <div className="text-sm font-semibold text-white">{Math.round(summary.meanScorePct)}%</div>
                    <div className="text-[9px] uppercase tracking-wider text-clinical-subtle">{t('educator.stat.meanScore')}</div>
                  </div>
                </div>
                <div className="border border-clinical-border rounded overflow-hidden">
                  <table className="w-full text-[11px]">
                    <thead className="bg-clinical-bg text-clinical-subtle">
                      <tr>
                        <th className="text-left px-2 py-1">{t('educator.col.name')}</th>
                        <th className="text-right px-2 py-1">{t('educator.col.score')}</th>
                        <th className="text-right px-2 py-1">{t('educator.col.result')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...roster].sort((a, b) => b.at - a.at).map((c, i) => (
                        <tr key={i} className="border-t border-clinical-border/50">
                          <td className="px-2 py-1 text-white">{c.name || '—'}</td>
                          <td className="px-2 py-1 text-right font-mono">{c.scorePct}%</td>
                          <td className={`px-2 py-1 text-right ${c.passed ? 'text-clinical-ok' : 'text-clinical-danger'}`}>
                            {c.passed ? t('exam.passed') : t('exam.failed')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  onClick={downloadCsv}
                  className="tap-target w-full px-3 py-1.5 rounded border border-clinical-border text-clinical-subtle hover:text-white text-xs"
                >
                  {t('educator.downloadCsv')}
                </button>
              </>
            ) : (
              pasted.trim() && <p className="text-[11px] text-clinical-warn">{t('educator.collect.none')}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
