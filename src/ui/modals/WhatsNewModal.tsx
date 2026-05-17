import { useEffect, useState } from 'react';
import { useT } from '../../lib/i18n';

const KEY = 'sg-pathway-whatsnew-v3-seen';

const ITEMS: Array<{ heading: string; body: string }> = [
  {
    heading: 'Achievements',
    body: '12 unlockables for distinct play styles — first case, three distinctions, completing a curriculum, finishing an Ops shift in the black, switching language, importing custom content, scoring on every built-in case. Progress visible in the Trends panel.',
  },
  {
    heading: 'Hospital Ops mode',
    body: 'Run an 8-hour shift at TTSH. Hire doctors and nurses, set bed capacity, watch the queue under DORSCON. Switch via the Case / Hospital Ops toggle in the header.',
  },
  {
    heading: 'Curricula',
    body: 'Six curated case sequences (Cardio, Acute emergencies, Cross-sector, End-of-life, Outbreak response, Paeds & women\'s health) with progress tracking and a Begin / Continue button on each.',
  },
  {
    heading: 'Best-practice diff at the end of a case',
    body: 'After every case, ResultsModal shows your decisions vs what a best-practice run would have chosen, with the score delta on each miss.',
  },
  {
    heading: 'Share runs and curricula',
    body: 'After a case, copy a Share-run URL — open it elsewhere and the RunReviewModal walks through the same diff. Curricula now travel as ?curr=... URLs too, bundling any custom cases inside.',
  },
  {
    heading: 'Lesson-plan markdown export',
    body: 'One-click copy / download of the run as teaching notes — patient summary, every decision with both rationales, references, and historical citations.',
  },
  {
    heading: 'Personal learning trends',
    body: 'The Trends panel (left column) now shows your recent runs as a sparkline, your strength by category, and a recommended next case based on your weakest area.',
  },
  {
    heading: '4-language interface + Chinese case titles',
    body: 'Language picker in the header — English, 中文, Bahasa Melayu, தமிழ். STEMI is fully Chinese-localised end-to-end as a proof-of-concept; every other case has a Chinese title.',
  },
  {
    heading: 'BYO cases via JSON',
    body: 'Author your own case in JSON, paste it into Cases → Import JSON, and share the URL. Validator points at any broken field.',
  },
  {
    heading: 'About / methodology',
    body: 'About button (header) describes exactly what the financing model assumes, what the case content represents, and what to be cautious about.',
  },
];

export function WhatsNewModal() {
  const t = useT();
  const [open, setOpen] = useState(false);

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
      <div className="bg-clinical-panel border border-clinical-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin shadow-2xl">
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
            className="px-4 py-1.5 rounded bg-clinical-accent text-white text-xs font-semibold hover:brightness-110"
          >
            {t('whatsNew.gotIt')}
          </button>
        </footer>
      </div>
    </div>
  );
}
