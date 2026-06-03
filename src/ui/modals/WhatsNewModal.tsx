import { useEffect, useState } from 'react';
import { useT } from '../../lib/i18n';
import { useFocusTrap } from '../../lib/use-focus-trap';

const KEY = 'sg-pathway-whatsnew-v50-seen';

const ITEMS: Array<{ heading: string; body: string }> = [
  {
    heading: 'v5.0 — Personalised practice: study plan, duel, specialty cases, high-contrast',
    body: 'The personalised-experience milestone. A new "Today\'s plan" panel composes 5 ranked things to do — spaced-retrieval review, weakest practice, curriculum continuity, daily challenge, discovery — so you always have a next click. ⚔ Duel mode lets two players share the device with alternating questions and a head-to-head verdict. Three new specialty cases fill catalogue gaps: an ERAS knee TKR, an AECOPD with targeted oxygen, and an IV-antibiotic anaphylaxis with the IM-adrenaline-first rule. Settings gains a high-contrast theme (AAA palette, OS prefers-contrast also honoured). 35 cases, 450+ tests.',
  },
  {
    heading: 'v4.0 — Branching cases, vitals, generator, analytics, Sandbox',
    body: 'The sandbox milestone. The pathway engine now ships a genuinely branching case (chest-pain triage forks three ways then reconverges). A derived 0-100 stability chip in the HUD shows how the patient is doing because of your choices. The case list gains ✨ Generate — a Sandbox where you pick a patient + condition (or leave them random) to compose a bespoke encounter. The Trends panel gains 📊 Analytics — score-distribution + 8-week activity dashboards over your run history. 32 cases, 94 facilities, 440+ tests.',
  },
  {
    heading: 'v3.0 — Exams, a case builder, and educator tools',
    body: 'The classroom milestone. Timed Exam / OSCE mode (8/15/20-question papers, countdown, pass/fail, printable certificate) lives in the Trends panel. A guided Case Authoring Studio (the ✎ Build button) lets anyone compose a valid scenario through a form — no JSON required. Educator tools turn the game into a teaching platform: build an assignment link, share it with a cohort, and collect the completion tokens learners send back into a roster with CSV export — all without a server or accounts.',
  },
  {
    heading: 'v2.1 — Spaced retrieval, current guidelines, three new cases',
    body: 'A deep-research pass refreshed the whole game. New: a spaced-retrieval scheduler resurfaces decisions you got wrong at expanding intervals (1/3/7/21/60 days) — see the "🔁 Review due decisions" button in Trends. Clinical guidelines updated to 2025-26 (ATLS 11 xABCDE, ESC 2023 ACS prasugrel, SGLT2i across all HF, KDIGO 2024 finerenone, ESO large-core thrombectomy, the 2026 Singapore National Dengue Guideline). The facility map was cleaned against current MOH sources (now 94, incl. Serangoon/Tengah/Eunos polyclinics + SACH Bedok). Three new cases exercise the latest reforms: Mindline 1771 + Tiered Care, Age Well SG / HPC+ ageing-in-place, and cancer financing under the MediShield Life 2025 changes.',
  },
  {
    heading: 'v2.0 — Campaigns, voice narration, smart suggestions',
    body: 'A new Campaigns panel groups cases into shift-themed sequences (TTSH Friday-night ED, Cross-cluster oncology week, Outbreak week — NCID lead, Polyclinic morning clinic). Each shift tracks cumulative score and a pass-ratio target. The PatientPanel framing now has 🔊 Speak + 🎙 Auto-narrate buttons that use the Web Speech API to read each scene aloud in the active locale — accessibility win, zero asset weight. The case list surfaces a Suggested badge on whichever case is your best next step: a weak spot to practice, an unfinished curriculum, or a discovery pick.',
  },
  {
    heading: 'Two more cases — CAP + heat injury',
    body: 'Community-acquired pneumonia walks polyclinic CURB-65 triage → KTPH ED short-stay → convalescent NAIS vaccination + HPB I-Quit referral. Exertional heat injury at SAF training: cool-first-transport-second protocol, rhabdomyolysis + AKI ICU care, and graded return-to-unit rehab.',
  },
  {
    heading: 'Streak-defense banner',
    body: 'If you played yesterday but not yet today, a one-tap "Defend streak" prompt appears under the HUD — it launches Today\'s Challenge so you keep your streak alive without scrolling.',
  },
  {
    heading: 'Confetti on distinction',
    body: 'Score 90% or higher and a brief confetti burst celebrates the result. Honours your prefers-reduced-motion setting if you have opted out.',
  },
  {
    heading: 'Daily learning streak + heatmap',
    body: 'Complete at least one case in a day to extend your streak — a 🔥 chip in the HUD shows how many days in a row you have played. The Trends panel adds a 12-week heatmap of your activity and surfaces both current and best-ever streaks. Streaks of 3 / 7 / 30 days each unlock an achievement.',
  },
  {
    heading: 'Today\'s challenge',
    body: 'A new ☀ Today button in the case list picks the same case for every player on a given date. Stable per-day, drawn deterministically from your unlocked catalogue — a low-friction way to keep the streak alive on busy days.',
  },
  {
    heading: 'Backup & restore',
    body: 'Settings now offers Export / Import JSON. Move your progress, streak, achievements, custom cases and curricula to another browser without losing anything.',
  },
  {
    heading: 'Two more cases — dental abscess + dengue cluster',
    body: 'A Healthway after-hours → NDCS dental emergency walks through Ludwig-angina red flags and antibiotic stewardship. A dengue with warning signs case at NTFGH covers MOH CPG fluid resuscitation, NEA / MOM dorm-cluster notification, and FWMI cost coverage for migrant workers.',
  },
  {
    heading: 'Roadmap complete — what shipped',
    body: 'The plan\'s remaining v1.0-polish items have all landed: interactive coachmarks tutorial (point-and-explain, not text slides), Quick Quiz mode, opt-in real-time pacing for acute-timer cases, Ops-mode patient figures (no more colored dots). Hit Tutorial in the header to take the new tour.',
  },
  {
    heading: 'Opt-in real-time pacing',
    body: 'Acute cases like STEMI have a door-to-balloon clock that previously only ticked on decision commits — read forever, still hit the goal. Click the timer pill in the HUD to turn on real-time pacing: 1 game-minute per ~3 real seconds. STEMI\'s 90-min window becomes ~4.5 real minutes of decision time. Pauses automatically when the tab is hidden, the mode switches to Ops, or you toggle it off.',
  },
  {
    heading: '⚡ Quick Quiz',
    body: 'The Trends panel gains a Quick Quiz button. Click to walk 5 random decisions in isolation — same Check answer / your-choice / best-practice feedback as Practice mode, plus a running score across the session and a percentage summary at the end. Nothing writes to bestScores or runHistory — pure revision.',
  },
  {
    heading: 'All 23 cases fully bilingual',
    body: 'Every case in the catalogue is now playable end-to-end in Chinese (中文) as well as English — the full pathway prose, every decision prompt, every option, every rationale, every outcome, every guideline reference. Lesson-plan exports also localise their section headings to your chosen language.',
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
