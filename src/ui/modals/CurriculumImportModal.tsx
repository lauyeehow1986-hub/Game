import { useState } from 'react';
import { validateCurriculum } from '../../lib/curriculum-schema';
import { useCustomCurricula } from '../../state/customCurriculaStore';
import { useCustomCases } from '../../state/customCasesStore';
import { useAchievements } from '../../state/achievementsStore';
import { useT, useTr } from '../../lib/i18n';

interface Props {
  open: boolean;
  onClose: () => void;
}

const SAMPLE = JSON.stringify(
  {
    id: 'my-curriculum',
    title: { en: 'My curriculum', zh: '我的课程' },
    blurb: 'Three cases on cardiology and right-siting.',
    author: 'Dr Q',
    objectives: [
      'Recognise STEMI and run a door-to-balloon pathway.',
      'Right-site stable post-MI to a Healthier-SG GP.',
    ],
    caseIds: ['stemi-acute', 'hf-outpatient', 'urti-chas-gp'],
    cases: [],
  },
  null,
  2,
);

export function CurriculumImportModal({ open, onClose }: Props) {
  const t = useT();
  const tr = useTr();
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const addBundle = useCustomCurricula((s) => s.bundles);
  const addBundleAction = useCustomCurricula((s) => s.add);
  const addCustomCase = useCustomCases((s) => s.add);
  const fireAchievement = useAchievements((s) => s.fire);

  if (!open) return null;

  const tryImport = () => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      setErrors([`JSON parse error: ${(e as Error).message}`]);
      setSuccess(null);
      return;
    }
    const r = validateCurriculum(parsed);
    if (!r.ok) {
      setErrors(r.errors);
      setSuccess(null);
      return;
    }
    addBundleAction(r.bundle);
    // Side-load any embedded cases so the curriculum's caseIds resolve.
    for (const c of r.bundle.cases ?? []) addCustomCase(c);
    fireAchievement({ kind: 'custom-content-added' });
    setErrors([]);
    setSuccess(
      t('import.success', { title: tr(r.bundle.title) }) +
        (r.bundle.cases?.length
          ? ` (+${r.bundle.cases.length} embedded case${r.bundle.cases.length === 1 ? '' : 's'})`
          : ''),
    );
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setText(await f.text());
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="curr-import-title"
      className="fixed inset-0 z-[55] grid place-items-center bg-black/70 p-4"
    >
      <div className="bg-clinical-panel border border-clinical-border rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin shadow-2xl">
        <header className="px-5 py-4 border-b border-clinical-border flex items-baseline justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
              {t('curr.import.subtitle')}
            </div>
            <h2 id="curr-import-title" className="text-base font-semibold text-white mt-1">
              {t('curr.import.heading')}
            </h2>
          </div>
          <button onClick={onClose} className="text-[11px] text-clinical-subtle hover:text-white">
            {t('common.close')}
          </button>
        </header>

        <div className="px-5 py-4 space-y-3 text-[11px] text-clinical-subtle leading-snug">
          <p>{t('curr.import.body')}</p>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="application/json,.json"
              onChange={onFile}
              className="text-[11px] text-clinical-subtle"
            />
            <button
              onClick={() => setText(SAMPLE)}
              className="text-[11px] px-2 py-1 rounded border border-clinical-border text-clinical-subtle hover:text-white"
            >
              {t('import.insertSample')}
            </button>
            <span className="ml-auto text-[10px] text-clinical-subtle">
              {Object.keys(addBundle).length} imported
            </span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='Paste a curriculum JSON here…'
            className="w-full h-72 bg-clinical-bg border border-clinical-border rounded p-2 font-mono text-[11px] text-white"
            spellCheck={false}
          />
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

        <footer className="px-5 py-3 border-t border-clinical-border flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded border border-clinical-border text-clinical-subtle hover:text-white text-xs"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={tryImport}
            disabled={!text.trim()}
            className="px-4 py-1.5 rounded bg-clinical-accent text-white text-xs font-semibold disabled:opacity-40 hover:brightness-110"
          >
            {t('common.import')}
          </button>
        </footer>
      </div>
    </div>
  );
}
