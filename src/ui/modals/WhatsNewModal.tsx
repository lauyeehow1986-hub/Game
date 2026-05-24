import { useEffect, useState } from 'react';
import { useT } from '../../lib/i18n';
import { useFocusTrap } from '../../lib/use-focus-trap';

const KEY = 'sg-pathway-whatsnew-v11-seen';

const ITEMS: Array<{ heading: string; body: string }> = [
  {
    heading: 'All 23 cases now fully bilingual',
    body: 'Every case in the catalogue is now playable end-to-end in Chinese (中文) as well as English — the full pathway prose, every decision prompt, every option, every rationale, every outcome, every guideline reference. Switch language from the header to play in 中文. All six curricula — Cardio, Acute Emergencies, Cross-Sector, End-of-Life, Pandemic, Paeds & Women — are fully bilingual.',
  },
  {
    heading: 'Practice mode — re-attempt single decisions',
    body: 'The Trends panel "Decisions to revisit" list (and every decision card in Results) now has a Practice button. Opens the decision in isolation: pick, check, see your score + best-practice + every sibling option with weighted scores and rationales. Pure practice — nothing writes to your bestScores or runHistory.',
  },
  {
    heading: 'Compare your runs of the same case',
    body: 'After you have played a case more than once, the case card surfaces a "Compare runs" link. Opens a matrix view: columns are runs newest-first with score + percentage, rows are each decision, cells show the option you picked with a colour-graded score. Spot exactly which decisions you changed between attempts.',
  },
  {
    heading: 'New case — Paracetamol overdose, SGH → IMH',
    body: 'A 23rd case covering acute self-harm: P1 triage, NAC dosing, NICE NG225-style psychosocial assessment, MHCTA disposition (and its misuse), family / safety-net negotiation, and IMH C-L + Mobile Crisis Team continuity. Adds 4 new guideline references.',
  },
  {
    heading: 'The patient is now a human, not a dot',
    body: 'The map sprite is a stylised head + body figure with a walking gait between rooms instead of a coloured circle. Zero asset weight; pure visual upgrade.',
  },
  {
    heading: 'Patient journey transcript',
    body: 'The framing for triage, imaging, transfers and ward observations no longer disappears between decisions. The PatientPanel shows a "Journey so far" log, the lesson-plan export embeds it as a clinical narrative section, and shared-run URLs carry it for educators reviewing a learner\'s path.',
  },
  {
    heading: 'Three-track recommendations + decisions to revisit',
    body: 'Trends now offers Practice / Continue curriculum / Discover instead of a single nag. A new "Decisions to revisit" list aggregates your runHistory log per decision and points at the specific decisions you keep getting wrong — spaced-repetition steering.',
  },
  {
    heading: 'Reflection notes that persist',
    body: 'After completing a case, each decision card has a small textarea for your reasoning. Notes save automatically per case+decision (latest wins), survive across sessions, and are embedded as blockquotes in the lesson-plan export. A new Trends panel section browses + exports all your notes as markdown.',
  },
];

export function WhatsNewModal() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const cardRef = useFocusTrap<HTMLDivElement>(open);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(KEY)) {
      // Only show if the user has already seen the tutorial (i.e. is a
      // returning user); a fresh user gets the tutorial instead.
      const tutorialSeen = localStorage.getItem('sg-pathway-tutorial-seen-v1');
      if (tutorialSeen) setOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = () => {
    localStorage.setItem(KEY, '1');
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="whatsnew-title"
      className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4"
    >
      <div ref={cardRef} className="bg-clinical-panel border border-clinical-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin shadow-2xl">
        <header className="px-5 py-4 border-b border-clinical-border">
          <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
            {t('whatsNew.subtitle')}
          </div>
          <h2 id="whatsnew-title" className="text-base font-semibold text-white mt-1">
            {t('whatsNew.title')}
          </h2>
        </header>
        <ul className="divide-y divide-clinical-border">
          {ITEMS.map((item, i) => (
            <li key={i} className="px-5 py-3">
              <div className="text-sm font-semibold text-white mb-1">{item.heading}</div>
              <p className="text-[12px] text-white/85 leading-relaxed">{item.body}</p>
            </li>
          ))}
        </ul>
        <footer className="px-5 py-3 border-t border-clinical-border flex items-center justify-end">
          <button
            onClick={close}
            data-autofocus
            className="px-4 py-1.5 rounded bg-clinical-accent text-white text-xs font-semibold hover:brightness-110"
          >
            {t('whatsNew.gotIt')}
          </button>
        </footer>
      </div>
    </div>
  );
}
