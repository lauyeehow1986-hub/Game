import { useEffect, useState } from 'react';

const KEY = 'sg-pathway-tutorial-seen-v1';

const STEPS: Array<{ title: string; body: string }> = [
  {
    title: 'Welcome to SG Pathway',
    body: 'A simulation of patients moving through Singapore\'s public + private healthcare network. You\'ll make clinical, financing, and care-pathway decisions and see the same scenario from patient, caregiver, and staff perspectives.',
  },
  {
    title: 'Three perspectives',
    body: 'Use the toggle in the top bar to switch between Patient, Caregiver, and Staff points-of-view. The same scene re-frames under each — the cost meter, scoring, and decisions all stay shared.',
  },
  {
    title: 'Pick a case to begin',
    body: 'The left panel lists the cases. Start with Acute STEMI for an ED-to-rehab walk-through, or Disease X for a multi-facility outbreak. Cases marked Historical are educational reconstructions of SARS 2003 and COVID-19.',
  },
  {
    title: 'Patient bill is real',
    body: 'The Financing panel models ward-class subsidy → MediShield Life → MediSave → CHAS → Integrated Shield Plan → cash. Toggle ward class and IP rider on the patient panel to see the cascade live.',
  },
  {
    title: 'Cross-sector data',
    body: 'The Data Exchange panel shows whether the current facility contributes to NEHR. Some private hospitals don\'t — the patient may need to hand-carry imaging CDs across sectors.',
  },
];

export function Tutorial() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

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
      <div className="bg-clinical-panel border border-clinical-border rounded-lg max-w-md w-full shadow-2xl">
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
          <button
            onClick={close}
            className="text-[11px] text-clinical-subtle hover:text-white"
          >
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
