import { useEffect, useState, useLayoutEffect } from 'react';
import { useGame } from '../state/gameStore';
import { getCase } from '../content';

const KEY = 'sg-pathway-tutorial-seen-v5';

/**
 * Case that opens automatically from the final tutorial step. URTI at a
 * CHAS GP is the lowest-stakes pathway in the catalogue (acute outpatient,
 * three decisions, small score gaps) — a comfortable hands-on first run.
 */
const ONBOARDING_CASE_ID = 'urti-chas-gp';

interface Step {
  /** data-tour attribute to highlight, or null for a centered modal step. */
  target: string | null;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    target: null,
    title: 'Welcome to SG Pathway',
    body: "A simulation of patients moving through Singapore's public + private healthcare network. You'll make clinical, financing, and care-pathway decisions and see the same scenario from three perspectives — patient, caregiver, staff.",
  },
  {
    target: 'case-list',
    title: 'Pick a case',
    body: 'Every card here is a clinical scenario. Start one to begin; Demo best run walks you through the highest-scoring path without committing. Filter by difficulty, search by keyword, or import your own JSON.',
  },
  {
    target: 'perspective',
    title: 'Three perspectives',
    body: 'Same scene, three framings — Patient, Caregiver, Staff. Scoring, money, and decisions stay shared; the framing text and emphasis change so the same case teaches different lessons.',
  },
  {
    target: 'canvas',
    title: 'Watch the patient walk',
    body: 'The hospital map shows the patient figure moving between departments. In Ops mode the same canvas shows queues, bed occupancy and acuity at every department in real time.',
  },
  {
    target: 'campaign',
    title: 'Campaign mode',
    body: 'A new in v2.0 — shift-themed sequences play 3-4 cases back-to-back with a cumulative pass-ratio target. ED Friday night, cross-cluster oncology week, outbreak week, polyclinic morning, geriatric step-down arc. Finish them all for the Shift Survived achievement.',
  },
  {
    target: 'trends',
    title: 'Your learning trends',
    body: 'After a run, this panel surfaces recommended-next-case (Practice / Continue curriculum / Discover), the decisions you keep getting wrong, your achievements, and a quick-quiz of 5 random decisions for revision.',
  },
  {
    target: 'exam',
    title: 'Exams + educator tools',
    body: 'New in v3.0: timed Exam / OSCE papers (8/15/20 questions) with a pass mark and a printable certificate — no feedback until you submit. Below them, Educator tools let a teacher share an assignment link and collect a class roster, all without a server.',
  },
  {
    target: 'mode-toggle',
    title: 'Case ↔ Hospital Ops',
    body: 'Switch to Hospital Ops mode to run an 8-hour shift at TTSH. Hire staff, set bed capacity, manage budget and DORSCON. Four scenario presets cover normal shifts and outbreak surges.',
  },
  {
    target: 'lang',
    title: '4 languages',
    body: 'Switch between English, 中文, Bahasa Melayu, and தமிழ். All 23 cases play end-to-end in 中文; the rest fall back to English where translations aren\'t yet written.',
  },
  {
    target: 'kbd',
    title: 'Keyboard shortcuts',
    body: 'Press ? at any time to see all shortcuts — arrows to pick a decision, 1–9 to jump, Enter to confirm, Esc to close. The button here opens the same help.',
  },
  {
    target: null,
    title: 'Ready to start',
    body: 'Drop into a beginner case (URTI at a CHAS GP — three small decisions) or browse the catalogue yourself.',
  },
];

/**
 * Tooltip placement near the target rectangle. Returns viewport-fixed
 * position + the side the tooltip lands on (for the little arrow).
 */
function placeTooltip(rect: DOMRect, vw: number, vh: number) {
  const W = Math.min(420, vw - 24);
  const H = 220; // rough estimate; CSS clamps height anyway
  const margin = 12;
  // Prefer below, then right, then above, then left.
  if (rect.bottom + H + margin < vh) {
    return {
      top: rect.bottom + margin,
      left: Math.max(12, Math.min(vw - W - 12, rect.left + rect.width / 2 - W / 2)),
      width: W,
      side: 'top' as const,
    };
  }
  if (rect.right + W + margin < vw) {
    return {
      top: Math.max(12, Math.min(vh - H - 12, rect.top + rect.height / 2 - H / 2)),
      left: rect.right + margin,
      width: W,
      side: 'left' as const,
    };
  }
  if (rect.top - H - margin > 0) {
    return {
      top: rect.top - H - margin,
      left: Math.max(12, Math.min(vw - W - 12, rect.left + rect.width / 2 - W / 2)),
      width: W,
      side: 'bottom' as const,
    };
  }
  return {
    top: Math.max(12, Math.min(vh - H - 12, rect.top + rect.height / 2 - H / 2)),
    left: Math.max(12, rect.left - W - margin),
    width: W,
    side: 'right' as const,
  };
}

interface Placement {
  top: number;
  left: number;
  width: number;
  side: 'top' | 'right' | 'bottom' | 'left';
}

export function Tutorial() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [tip, setTip] = useState<Placement | null>(null);
  const startCase = useGame((s) => s.startCase);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(KEY)) setOpen(true);
  }, []);

  // Re-measure the target on step change + window resize.
  useLayoutEffect(() => {
    if (!open) return;
    let cancelled = false;
    const measure = () => {
      const s = STEPS[step];
      if (!s.target) {
        if (!cancelled) {
          setRect(null);
          setTip(null);
        }
        return;
      }
      const el = document.querySelector(`[data-tour="${s.target}"]`);
      if (!el) {
        if (!cancelled) {
          setRect(null);
          setTip(null);
        }
        return;
      }
      const r = el.getBoundingClientRect();
      if (cancelled) return;
      setRect(r);
      setTip(placeTooltip(r, window.innerWidth, window.innerHeight));
      // Scroll the target into view if it's off-screen.
      if (r.top < 0 || r.bottom > window.innerHeight) {
        (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };
    measure();
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      cancelled = true;
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [open, step]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight' || e.key === 'Enter') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step]);

  const close = () => {
    localStorage.setItem(KEY, '1');
    localStorage.setItem('sg-pathway-tutorial-seen-v1', '1');
    localStorage.setItem('sg-pathway-tutorial-seen-v2', '1');
    setOpen(false);
  };
  const startBeginner = () => {
    const c = getCase(ONBOARDING_CASE_ID);
    if (c) startCase(c);
    close();
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
  const hasTarget = !!s.target && rect !== null && tip !== null;

  const tooltipStyle: React.CSSProperties = hasTarget
    ? {
        position: 'fixed',
        top: tip!.top,
        left: tip!.left,
        width: tip!.width,
      }
    : {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(420px, calc(100vw - 24px))',
      };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="tutorial-title" className="fixed inset-0 z-[60]">
      {hasTarget ? (
        <svg className="fixed inset-0 w-full h-full pointer-events-auto" onClick={close}>
          <defs>
            <mask id="tour-cutout">
              <rect width="100%" height="100%" fill="white" />
              <rect
                x={Math.max(0, rect!.left - 6)}
                y={Math.max(0, rect!.top - 6)}
                width={rect!.width + 12}
                height={rect!.height + 12}
                rx={10}
                ry={10}
                fill="black"
              />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgba(0,0,0,0.7)" mask="url(#tour-cutout)" />
          <rect
            x={Math.max(0, rect!.left - 6)}
            y={Math.max(0, rect!.top - 6)}
            width={rect!.width + 12}
            height={rect!.height + 12}
            rx={10}
            ry={10}
            fill="none"
            stroke="#38bdf8"
            strokeWidth={2}
          />
        </svg>
      ) : (
        <button
          aria-label="Close tour"
          className="fixed inset-0 bg-black/70 cursor-pointer"
          onClick={close}
        />
      )}

      <div
        style={tooltipStyle}
        onClick={(e) => e.stopPropagation()}
        className="bg-clinical-panel border border-clinical-accent/50 rounded-lg shadow-2xl"
      >
        <header className="px-5 py-3 border-b border-clinical-border">
          <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
            Tour · {step + 1} / {STEPS.length}
          </div>
          <h2 id="tutorial-title" className="text-base font-semibold text-white mt-1">
            {s.title}
          </h2>
        </header>
        <p className="px-5 py-3 text-[13px] text-white/90 leading-relaxed">{s.body}</p>
        <footer className="px-5 py-3 border-t border-clinical-border flex items-center justify-between gap-2">
          <button onClick={close} className="text-[11px] text-clinical-subtle hover:text-white">
            Skip tour
          </button>
          <div className="flex gap-2">
            <button
              disabled={step === 0}
              onClick={prev}
              className="px-3 py-1.5 rounded border border-clinical-border text-clinical-subtle disabled:opacity-30 hover:text-white text-xs"
            >
              Back
            </button>
            {step === STEPS.length - 1 ? (
              <>
                <button
                  onClick={close}
                  className="px-3 py-1.5 rounded border border-clinical-border text-clinical-subtle hover:text-white text-xs"
                >
                  Browse cases
                </button>
                <button
                  onClick={startBeginner}
                  data-autofocus
                  className="px-3 py-1.5 rounded bg-clinical-accent text-white text-xs font-semibold hover:brightness-110"
                >
                  Start a beginner case
                </button>
              </>
            ) : (
              <button
                onClick={next}
                data-autofocus
                className="px-3 py-1.5 rounded bg-clinical-accent text-white text-xs font-semibold hover:brightness-110"
              >
                Next
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
