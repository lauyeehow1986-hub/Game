import { useEffect, useState } from 'react';
import { useFocusTrap } from '../lib/use-focus-trap';

const KEY = 'sg-pathway-tutorial-seen-v2';

const STEPS: Array<{ title: string; body: string }> = [
  {
    title: 'Welcome to SG Pathway',
    body: "A simulation of patients moving through Singapore's public + private healthcare network. You'll make clinical, financing, and care-pathway decisions and see the same scenario from patient, caregiver, and staff perspectives.",
  },
  {
    title: 'Three perspectives',
    body: 'Use the toggle in the top bar to switch between Patient, Caregiver, and Staff points-of-view. The same scene re-frames under each — the cost meter, scoring, and decisions all stay shared.',
  },
  {
    title: 'Pick a case or follow a curriculum',
    body: 'The left panel lists 20+ cases. Each card has a Start button — and a Demo best run button that walks you through the highest-scoring path without committing to a score. Below it, the Curricula panel groups cases into six taught sequences (cardiology, sepsis, end-of-life, etc.) with progress tracking.',
  },
  {
    title: 'See the patient bill build up',
    body: 'The Financing panel models ward-class subsidy → MediShield Life → MediSave → CHAS → Integrated Shield Plan → cash. Toggle ward class and IP rider on the Patient panel to see the cascade live.',
  },
  {
    title: 'Cross-sector data flow',
    body: "The Data Exchange panel shows whether the current facility contributes to NEHR. Some private hospitals don't — the patient may need to hand-carry imaging CDs across sectors.",
  },
  {
    title: 'Best-practice diff at the end of every case',
    body: "After you commit your last decision, the Results screen shows your choices vs what a best-practice run would have chosen, with the score delta on each miss. Copy a lesson-plan markdown summary, share your run as a URL, or download it as JSON.",
  },
  {
    title: 'Hospital Ops mode',
    body: "Switch the Case / Hospital Ops pill in the header to run an 8-hour shift at TTSH. Hire doctors and nurses, set bed capacity, divert ambulances, manage the budget and reputation under DORSCON. Four scenario presets cover normal shifts and outbreak surges.",
  },
  {
    title: 'Personal trends + offline',
    body: "Your scores feed a Trends panel that recommends the next case based on your weakest area. Install SG Pathway to your phone's home screen (your browser will offer this) — it runs fully offline so you can revise on the MRT.",
  },
  {
    title: '4 languages, BYO content',
    body: "Switch between English, 中文, Bahasa Melayu, and தமிழ் via the header. Author your own cases in JSON and import via the Cases panel — or paste a shareable URL someone sent you. Curricula travel the same way.",
  },
];

export function Tutorial() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const cardRef = useFocusTrap<HTMLDivElement>(open);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(KEY)) setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight' || e.key === 'Enter') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step]);

  const close = () => {
    localStorage.setItem(KEY, '1');
    // Also mark v1's key so the WhatsNew modal doesn't fire for someone
    // who's seeing the tutorial for the first time on v2.2.
    localStorage.setItem('sg-pathway-tutorial-seen-v1', '1');
    setOpen(false);
  };
  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else close();
  };
  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  if (!open) return null;
  const s = STEPS[step];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
      className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4"
    >
      <div ref={cardRef} className="bg-clinical-panel border border-clinical-border rounded-lg max-w-md w-full shadow-2xl">
        <header className="px-5 py-4 border-b border-clinical-border">
          <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
            Welcome · {step + 1} / {STEPS.length}
          </div>
          <h2 id="tutorial-title" className="text-base font-semibold text-white mt-1">
            {s.title}
          </h2>
        </header>
        <p className="px-5 py-4 text-sm text-white/90 leading-relaxed">{s.body}</p>
        <footer className="px-5 py-3 border-t border-clinical-border flex items-center justify-between gap-2">
          <button onClick={close} className="text-[11px] text-clinical-subtle hover:text-white">
            Skip
          </button>
          <div className="flex gap-2">
            <button
              disabled={step === 0}
              onClick={prev}
              className="px-3 py-1.5 rounded border border-clinical-border text-clinical-subtle disabled:opacity-30 hover:text-white text-xs"
            >
              Back
            </button>
            <button
              onClick={next}
              data-autofocus
              className="px-3 py-1.5 rounded bg-clinical-accent text-white text-xs font-semibold hover:brightness-110"
            >
              {step === STEPS.length - 1 ? 'Get started' : 'Next'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
