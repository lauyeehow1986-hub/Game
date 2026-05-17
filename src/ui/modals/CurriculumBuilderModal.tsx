import { useMemo, useState } from 'react';
import { listCases } from '../../content';
import { useCustomCases } from '../../state/customCasesStore';
import { useCustomCurricula } from '../../state/customCurriculaStore';
import { useAchievements } from '../../state/achievementsStore';
import { useFocusTrap } from '../../lib/use-focus-trap';
import { useT, useTr } from '../../lib/i18n';
import { validateCurriculum, type CurriculumBundle } from '../../lib/curriculum-schema';
import type { CaseDefinition } from '../../lib/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'custom-curriculum';
}

export function CurriculumBuilderModal({ open, onClose }: Props) {
  const t = useT();
  const tr = useTr();
  const customCases = useCustomCases((s) => s.cases);
  const addBundle = useCustomCurricula((s) => s.add);
  const fireAchievement = useAchievements((s) => s.fire);
  const cardRef = useFocusTrap<HTMLDivElement>(open);

  const [title, setTitle] = useState('');
  const [blurb, setBlurb] = useState('');
  const [author, setAuthor] = useState('');
  const [objective, setObjective] = useState('');
  const [objectives, setObjectives] = useState<string[]>([]);
  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

  const catalogue: CaseDefinition[] = useMemo(
    () => [...listCases(), ...Object.values(customCases)],
    [customCases],
  );

  if (!open) return null;

  const reset = () => {
    setTitle('');
    setBlurb('');
    setAuthor('');
    setObjective('');
    setObjectives([]);
    setPickedIds([]);
    setErrors([]);
    setSuccess(null);
  };

  const addObjective = () => {
    const v = objective.trim();
    if (!v) return;
    setObjectives([...objectives, v]);
    setObjective('');
  };

  const removeObjective = (i: number) => {
    setObjectives(objectives.filter((_, idx) => idx !== i));
  };

  const toggleCase = (id: string) => {
    setPickedIds(pickedIds.includes(id) ? pickedIds.filter((x) => x !== id) : [...pickedIds, id]);
  };

  const moveCase = (idx: number, dir: -1 | 1) => {
    const next = [...pickedIds];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    setPickedIds(next);
  };

  const save = () => {
    const bundle: CurriculumBundle = {
      id: slugify(title),
      title,
      blurb,
      objectives,
      caseIds: pickedIds,
      author: author.trim() || undefined,
      // Embed only the custom cases the curriculum references so consumers
      // don't have to install them separately.
      cases: pickedIds
        .map((id) => customCases[id])
        .filter((c): c is CaseDefinition => !!c),
    };
    const r = validateCurriculum(bundle);
    if (!r.ok) {
      setErrors(r.errors);
      setSuccess(null);
      return;
    }
    addBundle(r.bundle);
    fireAchievement({ kind: 'custom-content-added' });
    setSuccess(t('builder.saved', { title }));
    setErrors([]);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="curr-builder-title"
      className="fixed inset-0 z-[55] grid place-items-center bg-black/70 p-4"
    >
      <div ref={cardRef} className="bg-clinical-panel border border-clinical-border rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin shadow-2xl">
        <header className="px-5 py-4 border-b border-clinical-border flex items-baseline justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
              {t('builder.subtitle')}
            </div>
            <h2 id="curr-builder-title" className="text-base font-semibold text-white mt-1">
              {t('builder.heading')}
            </h2>
          </div>
          <button onClick={onClose} className="text-[11px] text-clinical-subtle hover:text-white">
            {t('common.close')}
          </button>
        </header>

        <div className="px-5 py-4 space-y-4 text-[12px]">
          <Field label={t('builder.title')}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Cardiology mini"
              className="w-full bg-clinical-bg border border-clinical-border rounded px-2 py-1 text-[12px] text-white"
            />
            <div className="text-[10px] text-clinical-subtle mt-0.5">
              {t('builder.idPreview')}: <span className="font-mono">{slugify(title)}</span>
            </div>
          </Field>

          <Field label={t('builder.blurb')}>
            <textarea
              value={blurb}
              onChange={(e) => setBlurb(e.target.value)}
              placeholder="One- or two-sentence description."
              rows={2}
              className="w-full bg-clinical-bg border border-clinical-border rounded px-2 py-1 text-[12px] text-white"
            />
          </Field>

          <Field label={t('builder.author')}>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Optional"
              className="w-full bg-clinical-bg border border-clinical-border rounded px-2 py-1 text-[12px] text-white"
            />
          </Field>

          <Field label={t('builder.objectives')}>
            <div className="flex gap-1">
              <input
                type="text"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addObjective();
                  }
                }}
                placeholder="Recognise STEMI within 90 min…"
                className="flex-1 bg-clinical-bg border border-clinical-border rounded px-2 py-1 text-[12px] text-white"
              />
              <button
                onClick={addObjective}
                className="px-2 py-1 rounded border border-clinical-border text-clinical-subtle hover:text-white text-[11px]"
              >
                {t('builder.add')}
              </button>
            </div>
            {objectives.length > 0 && (
              <ul className="mt-2 space-y-1">
                {objectives.map((o, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 border border-clinical-border rounded px-2 py-1"
                  >
                    <span className="flex-1 text-white/85">{o}</span>
                    <button
                      onClick={() => removeObjective(i)}
                      className="text-[10px] text-clinical-subtle hover:text-clinical-danger"
                    >
                      {t('common.delete')}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Field>

          <Field label={t('builder.pickedCases', { n: pickedIds.length })}>
            {pickedIds.length === 0 ? (
              <p className="text-[11px] text-clinical-subtle">
                {t('builder.noCases')}
              </p>
            ) : (
              <ol className="space-y-1">
                {pickedIds.map((id, idx) => {
                  const c = catalogue.find((x) => x.id === id);
                  return (
                    <li
                      key={id}
                      className="flex items-center gap-2 border border-clinical-border rounded px-2 py-1"
                    >
                      <span className="text-clinical-subtle text-[10px] font-mono w-6">
                        {idx + 1}.
                      </span>
                      <span className="flex-1 truncate text-white">
                        {c ? tr(c.title) : id}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => moveCase(idx, -1)}
                          disabled={idx === 0}
                          className="text-[10px] px-1 rounded border border-clinical-border text-clinical-subtle hover:text-white disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveCase(idx, 1)}
                          disabled={idx === pickedIds.length - 1}
                          className="text-[10px] px-1 rounded border border-clinical-border text-clinical-subtle hover:text-white disabled:opacity-30"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => toggleCase(id)}
                          className="text-[10px] px-1 rounded border border-clinical-danger/50 text-clinical-danger hover:bg-clinical-danger/10"
                        >
                          {t('common.delete')}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </Field>

          <Field label={t('builder.allCases', { n: catalogue.length })}>
            <ul className="max-h-56 overflow-y-auto scrollbar-thin border border-clinical-border rounded">
              {catalogue.map((c) => {
                const checked = pickedIds.includes(c.id);
                return (
                  <li
                    key={c.id}
                    className="flex items-center gap-2 border-b border-clinical-border/40 last:border-b-0 px-2 py-1"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCase(c.id)}
                      className="accent-clinical-accent"
                    />
                    <span className="flex-1 truncate text-[11px] text-white">{tr(c.title)}</span>
                    <span className="text-[9px] uppercase tracking-wider text-clinical-subtle">
                      {c.category}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Field>

          {errors.length > 0 && (
            <ul className="border border-clinical-danger/40 rounded bg-clinical-danger/10 p-2 space-y-0.5 text-clinical-danger text-[11px]">
              {errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
          {success && (
            <div className="border border-clinical-ok/40 rounded bg-clinical-ok/10 p-2 text-clinical-ok text-[11px]">
              {success}
            </div>
          )}
        </div>

        <footer className="px-5 py-3 border-t border-clinical-border flex items-center justify-between gap-2">
          <button
            onClick={reset}
            className="text-[11px] text-clinical-subtle hover:text-white"
          >
            {t('common.reset')}
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded border border-clinical-border text-clinical-subtle hover:text-white text-xs"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={save}
              disabled={!title.trim() || !blurb.trim() || objectives.length === 0 || pickedIds.length < 2}
              className="px-4 py-1.5 rounded bg-clinical-accent text-white text-xs font-semibold disabled:opacity-40 hover:brightness-110"
            >
              {t('builder.save')}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[10px] uppercase tracking-wider text-clinical-subtle mb-1">
        {label}
      </div>
      {children}
    </label>
  );
}
