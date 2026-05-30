import { useState } from 'react';
import { useFocusTrap } from '../../lib/use-focus-trap';
import { useCustomCases } from '../../state/customCasesStore';
import { useAchievements } from '../../state/achievementsStore';
import { useT } from '../../lib/i18n';
import {
  buildCaseFromDraft,
  draftWarnings,
  emptyDraft,
  emptyNode,
  emptyOption,
  type BuilderDraft,
} from '../../lib/case-builder';
import { serialiseCase } from '../../lib/case-schema';

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Guided case authoring studio: a form that assembles a valid CaseDefinition
 * via lib/case-builder (which shares validateCase with the JSON importer).
 * Save adds it to customCasesStore; Download exports the JSON.
 */
export function CaseBuilderModal({ open, onClose }: Props) {
  const t = useT();
  const cardRef = useFocusTrap<HTMLDivElement>(open);
  const addCustom = useCustomCases((s) => s.add);
  const fireAchievement = useAchievements((s) => s.fire);
  const [draft, setDraft] = useState<BuilderDraft>(emptyDraft());
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  if (!open) return null;

  const warnings = draftWarnings(draft);
  const result = buildCaseFromDraft(draft);

  const patch = (p: Partial<BuilderDraft>) => setDraft({ ...draft, ...p });
  const patchNode = (i: number, p: Partial<BuilderDraft['nodes'][number]>) => {
    const nodes = draft.nodes.map((n, idx) => (idx === i ? { ...n, ...p } : n));
    setDraft({ ...draft, nodes });
  };
  const patchOption = (ni: number, oi: number, p: Partial<ReturnType<typeof emptyOption>>) => {
    const nodes = draft.nodes.map((n, idx) => {
      if (idx !== ni) return n;
      const options = n.options.map((o, j) => (j === oi ? { ...o, ...p } : o));
      return { ...n, options };
    });
    setDraft({ ...draft, nodes });
  };

  const save = () => {
    if (!result.ok) return;
    addCustom(result.case);
    fireAchievement({ kind: 'custom-content-added' });
    setSavedMsg(t('casebuilder.saved', { title: typeof result.case.title === 'string' ? result.case.title : result.case.id }));
    setTimeout(() => {
      setSavedMsg(null);
      onClose();
    }, 1200);
  };

  const download = () => {
    if (!result.ok || typeof document === 'undefined') return;
    const blob = new Blob([serialiseCase(result.case)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.case.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const field = 'w-full bg-clinical-bg border border-clinical-border rounded px-2 py-1 text-[12px] text-white';
  const lbl = 'block text-[10px] uppercase tracking-wider text-clinical-subtle mb-0.5';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="builder-title"
      className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4"
    >
      <div
        ref={cardRef}
        className="bg-clinical-panel border border-clinical-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin shadow-2xl"
      >
        <header className="px-5 py-3 border-b border-clinical-border flex items-baseline justify-between sticky top-0 bg-clinical-panel">
          <h2 id="builder-title" className="text-sm font-semibold text-white">{t('casebuilder.heading')}</h2>
          <button onClick={onClose} className="text-[11px] text-clinical-subtle hover:text-white">
            {t('common.close')}
          </button>
        </header>

        <div className="px-5 py-4 space-y-4 text-[12px]">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <label className={lbl}>{t('casebuilder.title')}</label>
              <input className={field} value={draft.titleEn} onChange={(e) => patch({ titleEn: e.target.value })} placeholder="Acute chest pain at TTSH" />
            </div>
            <div className="col-span-2">
              <label className={lbl}>{t('casebuilder.blurb')}</label>
              <textarea className={field} rows={2} value={draft.blurbEn} onChange={(e) => patch({ blurbEn: e.target.value })} placeholder="Mr Tan, 58, presents with..." />
            </div>
            <div>
              <label className={lbl}>{t('casebuilder.category')}</label>
              <select className={field} value={draft.category} onChange={(e) => patch({ category: e.target.value as BuilderDraft['category'] })}>
                <option value="acute">acute</option>
                <option value="elective">elective</option>
                <option value="outpatient">outpatient</option>
              </select>
            </div>
            <div>
              <label className={lbl}>{t('casebuilder.primaryFacility')}</label>
              <input className={field} value={draft.primaryFacility} onChange={(e) => patch({ primaryFacility: e.target.value })} placeholder="ttsh" />
            </div>
          </div>

          {/* Nodes */}
          {draft.nodes.map((n, ni) => (
            <section key={ni} className="border border-clinical-border rounded p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-white">{t('casebuilder.node', { n: ni + 1 })}</span>
                {draft.nodes.length > 1 && (
                  <button
                    onClick={() => setDraft({ ...draft, nodes: draft.nodes.filter((_, idx) => idx !== ni) })}
                    className="text-[10px] text-clinical-danger hover:underline"
                  >
                    {t('casebuilder.removeNode')}
                  </button>
                )}
              </div>
              <div>
                <label className={lbl}>{t('casebuilder.framingStaff')}</label>
                <textarea className={field} rows={2} value={n.framingStaff} onChange={(e) => patchNode(ni, { framingStaff: e.target.value })} placeholder="What the clinician sees / notes." />
              </div>
              <div>
                <label className={lbl}>{t('casebuilder.prompt')}</label>
                <input className={field} value={n.prompt} onChange={(e) => patchNode(ni, { prompt: e.target.value })} placeholder="What do you do?" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={lbl}>{t('casebuilder.refLabel')}</label>
                  <input className={field} value={n.refLabel} onChange={(e) => patchNode(ni, { refLabel: e.target.value })} placeholder="ESC 2023 ACS" />
                </div>
                <div>
                  <label className={lbl}>{t('casebuilder.facility')}</label>
                  <input className={field} value={n.facility} onChange={(e) => patchNode(ni, { facility: e.target.value })} placeholder="ttsh" />
                </div>
              </div>

              {/* Options */}
              <div className="space-y-1.5">
                <span className={lbl}>{t('casebuilder.options')}</span>
                {n.options.map((o, oi) => (
                  <div key={oi} className="flex gap-1 items-start">
                    <input
                      className={`${field} flex-1`}
                      value={o.label}
                      onChange={(e) => patchOption(ni, oi, { label: e.target.value })}
                      placeholder={t('casebuilder.optionLabel')}
                    />
                    <input
                      type="number"
                      aria-label={t('casebuilder.score')}
                      title={t('casebuilder.score')}
                      className="w-16 bg-clinical-bg border border-clinical-border rounded px-2 py-1 text-[12px] text-white"
                      value={o.score}
                      onChange={(e) => patchOption(ni, oi, { score: parseInt(e.target.value, 10) || 0 })}
                    />
                    {n.options.length > 2 && (
                      <button
                        onClick={() => patchNode(ni, { options: n.options.filter((_, j) => j !== oi) })}
                        className="text-[12px] text-clinical-danger px-1"
                        aria-label={t('casebuilder.removeOption')}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                {n.options.length < 4 && (
                  <button
                    onClick={() => patchNode(ni, { options: [...n.options, emptyOption()] })}
                    className="text-[10px] text-clinical-accent hover:underline"
                  >
                    {t('casebuilder.addOption')}
                  </button>
                )}
              </div>
            </section>
          ))}

          <button
            onClick={() => setDraft({ ...draft, nodes: [...draft.nodes, emptyNode(draft.nodes.length)] })}
            className="text-[11px] px-2 py-1 rounded border border-clinical-border text-clinical-subtle hover:text-white"
          >
            {t('casebuilder.addNode')}
          </button>

          {/* Validation feedback */}
          {warnings.length > 0 && (
            <ul className="border border-clinical-warn/40 rounded bg-clinical-warn/5 p-2 text-[11px] text-clinical-warn space-y-0.5">
              {warnings.map((w, i) => <li key={i}>• {w}</li>)}
            </ul>
          )}
          {warnings.length === 0 && !result.ok && (
            <ul className="border border-clinical-danger/40 rounded bg-clinical-danger/5 p-2 text-[11px] text-clinical-danger space-y-0.5">
              {result.errors.map((e, i) => <li key={i}>• {e}</li>)}
            </ul>
          )}
          {savedMsg && <div className="text-[11px] text-clinical-ok">{savedMsg}</div>}
        </div>

        <footer className="px-5 py-3 border-t border-clinical-border flex items-center justify-end gap-2 sticky bottom-0 bg-clinical-panel">
          <button
            onClick={download}
            disabled={!result.ok}
            className="px-3 py-1.5 rounded border border-clinical-border text-clinical-subtle hover:text-white text-xs disabled:opacity-40"
          >
            {t('casebuilder.download')}
          </button>
          <button
            onClick={save}
            disabled={!result.ok}
            className="tap-target px-4 py-1.5 rounded bg-clinical-accent text-white text-xs font-semibold hover:brightness-110 disabled:opacity-40"
          >
            {t('casebuilder.save')}
          </button>
        </footer>
      </div>
    </div>
  );
}
