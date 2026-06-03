import { useMemo, useState } from 'react';
import { listCases, getCase } from '../../content';
import { useCustomCases } from '../../state/customCasesStore';
import { useStudySets, type StudySet } from '../../state/studySetsStore';
import { useGame } from '../../state/gameStore';
import { useT, useTr } from '../../lib/i18n';

/**
 * Personal study sets — let the player compose ad-hoc packs from any subset
 * of the catalogue. Sets persist locally and live alongside curricula and
 * campaigns. Clicking a set's case starts it; clicking 'Play next' fires
 * the first unplayed case in the set.
 */
export function StudySetsPanel() {
  const t = useT();
  const tr = useTr();
  const sets = useStudySets((s) => s.sets);
  const createSet = useStudySets((s) => s.create);
  const renameSet = useStudySets((s) => s.rename);
  const removeSet = useStudySets((s) => s.remove);
  const addCase = useStudySets((s) => s.addCase);
  const removeCase = useStudySets((s) => s.removeCase);
  const customCases = useCustomCases((s) => s.cases);
  const startCase = useGame((s) => s.startCase);
  const resetRun = useGame((s) => s.resetRun);
  const status = useGame((s) => s.run.status);

  const catalogue = useMemo(() => [...listCases(), ...Object.values(customCases)], [customCases]);
  const setList = useMemo(() => Object.values(sets).sort((a, b) => b.createdAt - a.createdAt), [sets]);

  const [newName, setNewName] = useState('');
  const [pickerOpenFor, setPickerOpenFor] = useState<string | null>(null);

  const startById = (id: string) => {
    const c = getCase(id);
    if (!c) return;
    if (status !== 'idle') resetRun();
    startCase(c);
  };

  return (
    <section className="bg-clinical-panel border border-clinical-border rounded-lg p-3 space-y-2">
      <header className="flex items-baseline justify-between gap-1">
        <h3 className="text-sm font-semibold text-white">{t('sets.heading')}</h3>
        <span className="text-[10px] uppercase tracking-wider text-clinical-subtle">{setList.length}</span>
      </header>

      {/* Create */}
      <div className="flex gap-1">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={t('sets.namePlaceholder')}
          aria-label={t('sets.namePlaceholder')}
          className="flex-1 bg-clinical-bg border border-clinical-border rounded px-2 py-1 text-[11px] text-white"
        />
        <button
          onClick={() => {
            if (!newName.trim()) return;
            createSet(newName, []);
            setNewName('');
          }}
          className="text-[11px] px-2 py-1 rounded border border-clinical-accent/40 text-clinical-accent hover:text-clinical-accent/80"
        >
          {t('sets.create')}
        </button>
      </div>

      {setList.length === 0 ? (
        <p className="text-[11px] text-clinical-subtle">{t('sets.empty')}</p>
      ) : (
        <ul className="space-y-2">
          {setList.map((s) => (
            <SetRow
              key={s.id}
              set={s}
              catalogue={catalogue}
              onRename={(name) => renameSet(s.id, name)}
              onRemove={() => removeSet(s.id)}
              onAddCase={(caseId) => addCase(s.id, caseId)}
              onRemoveCase={(caseId) => removeCase(s.id, caseId)}
              onStart={startById}
              tr={tr}
              t={t}
              pickerOpen={pickerOpenFor === s.id}
              setPickerOpen={(open) => setPickerOpenFor(open ? s.id : null)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function SetRow({
  set,
  catalogue,
  onRename,
  onRemove,
  onAddCase,
  onRemoveCase,
  onStart,
  tr,
  t,
  pickerOpen,
  setPickerOpen,
}: {
  set: StudySet;
  catalogue: ReturnType<typeof listCases>;
  onRename: (name: string) => void;
  onRemove: () => void;
  onAddCase: (caseId: string) => void;
  onRemoveCase: (caseId: string) => void;
  onStart: (id: string) => void;
  tr: ReturnType<typeof useTr>;
  t: ReturnType<typeof useT>;
  pickerOpen: boolean;
  setPickerOpen: (open: boolean) => void;
}) {
  const [editingName, setEditingName] = useState(set.name);
  const [editing, setEditing] = useState(false);
  const eligible = catalogue.filter((c) => !set.caseIds.includes(c.id));

  return (
    <li className="rounded border border-clinical-border p-2 space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        {editing ? (
          <input
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            onBlur={() => {
              onRename(editingName);
              setEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            }}
            className="flex-1 bg-clinical-bg border border-clinical-border rounded px-2 py-0.5 text-[12px] text-white"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-[12px] text-white font-semibold text-left flex-1 hover:underline"
          >
            {set.name}
          </button>
        )}
        <button
          onClick={onRemove}
          aria-label={t('sets.delete')}
          title={t('sets.delete')}
          className="text-[11px] text-clinical-danger hover:underline"
        >
          ×
        </button>
      </div>
      <ul className="space-y-0.5">
        {set.caseIds.map((id) => {
          const c = catalogue.find((x) => x.id === id);
          return (
            <li key={id} className="flex items-center gap-1">
              <button
                onClick={() => onStart(id)}
                disabled={!c}
                className="flex-1 text-left text-[11px] px-2 py-1 rounded border border-clinical-border text-clinical-subtle hover:text-white disabled:opacity-40"
              >
                → {c ? tr(c.title) : id}
              </button>
              <button
                onClick={() => onRemoveCase(id)}
                className="text-[11px] text-clinical-subtle hover:text-clinical-danger px-1"
                aria-label={t('sets.removeCase')}
              >
                −
              </button>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center justify-between">
        <button
          onClick={() => setPickerOpen(!pickerOpen)}
          className="text-[11px] text-clinical-accent hover:underline"
        >
          {pickerOpen ? t('sets.hidePicker') : t('sets.addCase')}
        </button>
        {set.caseIds.length > 0 && (
          <button
            onClick={() => onStart(set.caseIds[0])}
            className="text-[11px] px-2 py-0.5 rounded bg-clinical-accent text-white font-semibold"
          >
            ▶ {t('sets.playFirst')}
          </button>
        )}
      </div>
      {pickerOpen && (
        <select
          onChange={(e) => {
            if (e.target.value) {
              onAddCase(e.target.value);
              e.target.value = '';
              setPickerOpen(false);
            }
          }}
          aria-label={t('sets.addCase')}
          className="w-full bg-clinical-bg border border-clinical-border rounded px-2 py-1 text-[11px] text-white"
          defaultValue=""
        >
          <option value="">{t('sets.pickCase')}</option>
          {eligible.map((c) => (
            <option key={c.id} value={c.id}>{tr(c.title)}</option>
          ))}
        </select>
      )}
    </li>
  );
}
