import { useState } from 'react';
import { validateCase } from '../../lib/case-schema';
import { useCustomCases } from '../../state/customCasesStore';
import { useAchievements } from '../../state/achievementsStore';
import { useFocusTrap } from '../../lib/use-focus-trap';

interface Props {
  open: boolean;
  onClose: () => void;
}

const SAMPLE = JSON.stringify(
  {
    id: 'my-case-id',
    title: 'Custom case — short title',
    blurb: 'One- or two-sentence summary of the patient and the situation.',
    category: 'acute',
    primaryFacility: 'ttsh',
    involvedFacilities: ['ttsh'],
    profileKey: 'taxiDriver',
    allowsWardChoice: false,
    guidelines: [{ label: 'My reference', body: 'Source description.' }],
    pathway: [
      {
        id: 'arrival',
        department: 'ed',
        durationMin: 10,
        framing: {
          patient: 'How the patient experiences arrival.',
          caregiver: 'What the caregiver sees.',
          staff: 'What the clinician notes.',
        },
        decision: {
          id: 'first-decision',
          prompt: 'What do you do first?',
          weight: 1,
          reference: { label: 'My reference', body: '' },
          options: [
            {
              id: 'good-option',
              label: 'The recommended choice.',
              score: 10,
              rationale: 'Why this is best.',
              outcome: { patient: 'You feel safe.', caregiver: 'OK.', staff: 'Plan made.' },
            },
            {
              id: 'bad-option',
              label: 'A worse choice.',
              score: -3,
              rationale: 'Why this is worse.',
              outcome: { patient: '', caregiver: '', staff: '' },
              effects: { setFlags: ['deteriorating'] },
            },
          ],
        },
      },
      {
        id: 'discharge',
        department: 'discharge',
        durationMin: 5,
        framing: { patient: 'Going home.', caregiver: '', staff: '' },
      },
    ],
  },
  null,
  2,
);

export function CaseImportModal({ open, onClose }: Props) {
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const add = useCustomCases((s) => s.add);
  const fireAchievement = useAchievements((s) => s.fire);
  const cardRef = useFocusTrap<HTMLDivElement>(open);

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
    const r = validateCase(parsed);
    if (!r.ok) {
      setErrors(r.errors);
      setSuccess(null);
      return;
    }
    add(r.case);
    fireAchievement({ kind: 'custom-content-added' });
    setErrors([]);
    setSuccess(`Imported "${r.case.title}". It now appears under Cases with a Custom badge.`);
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const t = await f.text();
    setText(t);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-import-title"
      className="fixed inset-0 z-[55] grid place-items-center bg-black/70 p-4"
    >
      <div ref={cardRef} className="bg-clinical-panel border border-clinical-border rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin shadow-2xl">
        <header className="px-5 py-4 border-b border-clinical-border flex items-baseline justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
              Bring your own case
            </div>
            <h2 id="case-import-title" className="text-base font-semibold text-white mt-1">
              Import a case from JSON
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[11px] text-clinical-subtle hover:text-white"
          >
            Close
          </button>
        </header>

        <div className="px-5 py-4 space-y-3 text-[11px] text-clinical-subtle leading-snug">
          <p>
            Paste a case JSON below or upload a <code>.json</code> file.
            Schema follows the built-in cases — the validator points to any
            field that's wrong. Imported cases are stored locally and appear
            in the Cases list with a Custom badge.
          </p>
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
              Insert sample
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='Paste a case JSON here…'
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

        <footer className="px-5 py-3 border-t border-clinical-border flex items-center justify-between gap-2">
          <a
            href="https://github.com/lauyeehow1986-hub/game/blob/main/src/content/cases/stemi-acute.ts"
            target="_blank"
            rel="noreferrer noopener"
            className="text-[10px] text-clinical-subtle hover:text-white"
          >
            See the built-in cases for shape reference →
          </a>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded border border-clinical-border text-clinical-subtle hover:text-white text-xs"
            >
              Cancel
            </button>
            <button
              onClick={tryImport}
              disabled={!text.trim()}
              className="px-4 py-1.5 rounded bg-clinical-accent text-white text-xs font-semibold disabled:opacity-40 hover:brightness-110"
            >
              Import
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
