import { useEffect, useState } from 'react';
import { useT } from '../../lib/i18n';
import { useFocusTrap } from '../../lib/use-focus-trap';

const KEY = 'sg-pathway-whatsnew-v10-seen';

const ITEMS: Array<{ heading: string; body: string }> = [
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
  {
    heading: 'Results: other options + replay',
    body: 'Each decision card now has an "Other options" expansion showing every sibling option not picked with its weighted score and rationale — colour-graded so you see at a glance whether alternatives would have scored higher. The footer gains a Replay case button for one-click retry.',
  },
  {
    heading: 'Difficulty badges + filter',
    body: 'Beginner / Intermediate / Advanced bands derived from decision count + the largest score gap between options. Filter the case list by band to focus practice. References panel gets a search box that filters guidelines, citations, and glossary terms live.',
  },
  {
    heading: 'New case — Suspected intimate-partner violence',
    body: 'CHAS GP → KKH One Centre with HEARS-framework disclosure, forensic-quality documentation, layered safety planning, and PAVe / AWARE continuity.',
  },
  {
    heading: 'New case — Migrant worker, construction fall',
    body: 'Exercises FWMI insurance, MOM WICA reporting, and Class-C ward financing for a non-citizen — financing pathway no other case touched.',
  },
  {
    heading: 'Pathway engine: transit nodes no longer stall',
    body: 'A long-standing bug where cases froze after the first decision (triage → resus → next decision) is fixed. The patient sprite now visibly walks the whole route between decisions instead of teleporting.',
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
