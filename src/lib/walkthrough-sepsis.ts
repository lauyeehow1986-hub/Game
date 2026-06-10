/**
 * Sepsis walkthrough — a scrubbable cinematic of a Singapore patient's journey
 * through community-acquired urosepsis: onset at home, SCDF prehospital sepsis
 * alert, ED resuscitation on the Surviving Sepsis Campaign Hour-1 bundle,
 * source control of an obstructed infected kidney, ICU vasopressor support,
 * ward antibiotic de-escalation, and a post-sepsis-syndrome follow-up — closing
 * with the back-of-house micro lab / pharmacy / portering that make the
 * time-critical response possible.
 *
 * Reuses the existing Walkthrough engine, showpiece overlays, and achievement
 * infrastructure exactly as the STEMI and stroke pathways do.
 *
 * Three Bandersnatch-style decision points:
 *   1. End of `ambulance` — ED resus bay with a sepsis pre-alert (canonical)
 *      vs walk-in triage queue (off-canonical, delays the bundle).
 *   2. End of `resus` — empirical broad-spectrum antibiotics within the hour
 *      (canonical) vs hold antibiotics until cultures result (harmful delay).
 *   3. End of `imaging` — urgent source control of the obstructed kidney
 *      (canonical) vs antibiotics alone (the urologist then insists on
 *      decompression and routes back).
 *
 * Content is English-authored; the ms / ta tracks add translations per
 * docs/ROADMAP.md just like the other pathways.
 */
import type { Walkthrough } from './walkthrough';

export const sepsisWalkthrough: Walkthrough = {
  id: 'sepsis-pathway-v1',
  title: 'Sepsis — community urosepsis to recovery',
  startChapterId: 'onset',
  actors: {
    /* Patient + family */
    'patient': {
      id: 'sepsis-patient',
      role: 'Mdm Devi, 68',
      team: 'patient',
      bio: 'A 68-year-old retiree with type 2 diabetes. Two days of dysuria and frequency, now rigors, fever and new confusion. Lives with her daughter in a Toa Payoh flat.',
      swatch: '#3aa6ff',
    },
    'family-daughter': {
      id: 'sepsis-daughter',
      role: 'Daughter, 41',
      team: 'patient',
      bio: 'The patient\'s daughter, a primary-school teacher. Notices her mother is drowsy and hot, calls 995, and stays as the family decision-maker through the ICU consent conversations.',
      swatch: '#60a5fa',
    },

    /* Pre-hospital */
    'paramedic': {
      id: 'sepsis-paramedic',
      role: 'SCDF paramedic',
      team: 'ambulance',
      bio: 'SCDF Advanced Care Paramedic. Screens for sepsis with qSOFA, records a low BP and high RR, secures IV access and pre-notifies the receiving ED of a possible sepsis.',
      swatch: '#f87171',
    },
    'driver': {
      id: 'sepsis-driver',
      role: 'SCDF EA driver',
      team: 'ambulance',
      bio: 'Emergency Ambulance driver. Transports priority-one and pre-alerts the ED so a resus bay and team are ready on arrival.',
      swatch: '#fb923c',
    },

    /* Emergency Department */
    'triage-nurse': {
      id: 'triage-nurse',
      role: 'ED triage nurse',
      team: 'ed',
      bio: 'Runs the ED sepsis screen at triage (vitals + lactate + suspected infection), assigns a P1 category, and escalates straight to the resus bay.',
      swatch: '#fbbf24',
    },
    'ed-doctor': {
      id: 'sepsis-ed-doctor',
      role: 'ED registrar',
      team: 'ed',
      bio: 'Leads the resuscitation, confirms septic shock, and drives the Surviving Sepsis Campaign Hour-1 bundle: cultures, lactate, broad-spectrum antibiotics, fluids and source hunting.',
      swatch: '#ef4444',
    },
    'ed-nurse': {
      id: 'sepsis-ed-nurse',
      role: 'ED resus nurse',
      team: 'ed',
      bio: 'Draws two sets of blood cultures before antibiotics, sends a venous lactate, starts the balanced-crystalloid bolus and hangs the first antibiotic dose.',
      swatch: '#dc2626',
    },
    'ed-pharmacist': {
      id: 'ed-pharmacist',
      role: 'ED pharmacist',
      team: 'ed',
      bio: 'Confirms the empirical regimen against the local antibiogram, renal-doses for the patient\'s eGFR, and checks for allergy and interactions before the first dose.',
      swatch: '#f59e0b',
    },

    /* Imaging + source control */
    'radiographer': {
      id: 'radiographer',
      role: 'CT radiographer',
      team: 'ed',
      bio: 'Performs the CT of the abdomen and pelvis that shows an obstructing left renal calculus with an infected, hydronephrotic kidney.',
      swatch: '#a855f7',
    },
    'radiologist': {
      id: 'radiologist',
      role: 'Radiologist',
      team: 'ed',
      bio: 'Reports the obstructed, infected kidney and flags it to the ED and urology as a surgical emergency requiring decompression.',
      swatch: '#9333ea',
    },
    'urologist': {
      id: 'urologist',
      role: 'Urologist on call',
      team: 'cath',
      bio: 'Decompresses the infected obstructed system — emergency retrograde stent or percutaneous nephrostomy — the source control without which antibiotics alone will fail.',
      swatch: '#c026d3',
    },
    'ir-nurse': {
      id: 'ir-nurse',
      role: 'Procedure nurse',
      team: 'cath',
      bio: 'Sets up the urology / interventional suite, positions and monitors the patient through the decompression under sedation.',
      swatch: '#e879f9',
    },

    /* ICU */
    'intensivist': {
      id: 'intensivist',
      role: 'ICU intensivist',
      team: 'ward',
      bio: 'Admits the patient to the medical ICU, starts noradrenaline for fluid-refractory shock targeting a MAP of 65, and reviews the lactate-clearance trend.',
      swatch: '#22d3ee',
    },
    'icu-nurse': {
      id: 'icu-nurse',
      role: 'ICU nurse',
      team: 'ward',
      bio: 'One-to-one ICU nursing: titrates the vasopressor, monitors urine output and the arterial line, and reassesses perfusion against the resuscitation targets.',
      swatch: '#06b6d4',
    },

    /* Ward step-down */
    'ward-consultant': {
      id: 'sepsis-id-consultant',
      role: 'Infectious diseases consultant',
      team: 'ward',
      bio: 'Reviews the culture and sensitivity results, de-escalates from broad-spectrum to targeted therapy, and sets the total antibiotic duration with the stewardship team.',
      swatch: '#10b981',
    },
    'ward-nurse': {
      id: 'sepsis-ward-nurse',
      role: 'Ward nurse',
      team: 'ward',
      bio: 'General-ward nursing after ICU step-down: continues IV-to-oral switch, monitors for recurrence, and supports early mobilisation.',
      swatch: '#34d399',
    },
    'ward-physio': {
      id: 'sepsis-physio',
      role: 'Physiotherapist',
      team: 'rehab',
      bio: 'Treats ICU-acquired weakness and deconditioning with progressive mobilisation, a cornerstone of recovery from post-sepsis syndrome.',
      swatch: '#a3e635',
    },

    /* Outpatient follow-up */
    'clinic-doctor': {
      id: 'clinic-doctor',
      role: 'Specialist (clinic)',
      team: 'outpatient',
      bio: 'Reviews the patient after discharge, screens for post-sepsis syndrome (fatigue, cognition, mood), confirms stone-clearance planning and optimises diabetes control.',
      swatch: '#f97316',
    },

    /* Back-of-house support staff (atmospheric throughout + featured chapter) */
    'micro-scientist': {
      id: 'micro-scientist',
      role: 'Microbiology scientist',
      team: 'support',
      bio: 'Processes the blood cultures, flags the positive bottle, performs Gram stain and identification, and phones the critical result that lets the team de-escalate precisely.',
      swatch: '#78716c',
    },
    'pharmacy-tech': {
      id: 'pharmacy-tech',
      role: 'Pharmacy technician',
      team: 'support',
      bio: 'Prepares and delivers the time-critical first antibiotic dose from the satellite pharmacy so the Hour-1 target is met.',
      swatch: '#a8a29e',
    },
    'porter': {
      id: 'porter',
      role: 'Hospital porter',
      team: 'support',
      bio: 'Moves the patient between resus, CT, the procedure suite and ICU — every transfer on the critical path of a time-dependent illness.',
      swatch: '#d6d3d1',
    },
    'cleaner-icu': {
      id: 'cleaner-icu',
      role: 'ICU cleaner',
      team: 'support',
      bio: 'Terminal-cleans the ICU bay and high-touch surfaces between patients; infection-prevention discipline that protects the next critically ill admission.',
      swatch: '#e7e5e4',
    },
  },
  chapters: {
    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 1 — Onset at home: fever, rigors, new confusion; 995 called
     * ──────────────────────────────────────────────────────────────────── */
    onset: {
      id: 'onset',
      title: 'Onset — 19:40 in Toa Payoh',
      scene: 'kopitiam',
      durationSec: 28,
      timeOfDay: '19:40 SGT',
      location: 'Toa Payoh flat',
      defaultNextChapterId: 'ambulance',
      beats: [
        { at: 0, actorId: 'patient', action: 'Two days of dysuria, now shivering with rigors at the dinner table.', pos: { x: 210, y: 224 }, pose: 'sit', expression: 'pained' },
        { at: 3, actorId: 'family-daughter', action: 'Notices her mother is hot, drowsy and not making sense.', pos: { x: 262, y: 222 }, pose: 'stand', expression: 'alarmed' },
        { at: 7, actorId: 'patient', action: 'Confused and flushed — temperature 39.2 °C, breathing fast.', pos: { x: 210, y: 230 }, pose: 'sit', expression: 'distressed' },
        { at: 11, actorId: 'family-daughter', action: 'Dials 995 — reports fever, confusion and a recent urine infection.', pos: { x: 268, y: 224 }, pose: 'point', direction: 'W', expression: 'alarmed', sfx: '📞 995' },
        { at: 16, actorId: 'family-daughter', action: 'Dispatcher advises: keep her sitting up, stay on the line, unlock the gate.', pos: { x: 262, y: 226 }, pose: 'stand', expression: 'focused' },
        { at: 22, actorId: 'patient', action: 'Slumping, clammy and barely rousable — this is more than a simple UTI.', pos: { x: 206, y: 234 }, pose: 'collapsed', expression: 'unconscious' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 2 — Ambulance: qSOFA, hypotension, prehospital sepsis alert
     * Branch: ED resus pre-alert (canonical) vs walk-in triage queue
     * ──────────────────────────────────────────────────────────────────── */
    ambulance: {
      id: 'ambulance',
      title: 'Ambulance on scene — 19:58',
      scene: 'street',
      durationSec: 28,
      timeOfDay: '19:58 SGT',
      location: 'Void deck — Toa Payoh',
      defaultNextChapterId: 'resus',
      branchPoint: {
        prompt: 'BP 86/48, RR 28, GCS 13, temp 39.2 — qSOFA 3, suspected source urinary. How does she arrive at the ED?',
        options: [
          {
            label: 'ED resus bay — prehospital sepsis pre-alert phoned ahead',
            hint: 'Team and bay ready on arrival; the Surviving Sepsis Hour-1 clock starts immediately.',
            nextChapterId: 'resus',
          },
          {
            label: 'Walk-in triage queue — no pre-alert',
            hint: 'Care is delayed in the queue; every hour to antibiotics in septic shock raises mortality.',
            nextChapterId: 'triage-delay',
          },
        ],
      },
      beats: [
        { at: 0, actorId: 'patient', action: 'On the stretcher — mottled, drowsy, peripherally shut down.', pos: { x: 172, y: 244 }, pose: 'collapsed', expression: 'pained' },
        { at: 0, actorId: 'paramedic', action: 'Primary survey. qSOFA 3 (low BP, high RR, altered mental state).', pos: { x: 224, y: 246 }, pose: 'kneel', direction: 'W', expression: 'focused' },
        { at: 4, actorId: 'paramedic', action: 'Capillary glucose, large-bore IV, starts a fluid bolus en route.', pos: { x: 224, y: 246 }, pose: 'kneel', direction: 'W', expression: 'focused' },
        { at: 9, actorId: 'driver', action: 'Loads the patient — priority one. Pre-alerts the ED: possible sepsis.', pos: { x: 314, y: 238 }, pose: 'point', expression: 'focused', walking: true, sfx: '🚨 SIREN' },
        { at: 14, actorId: 'paramedic', action: 'Oxygen titrated to SpO2 94%. BP rechecked 88/50. Conscious to voice.', pos: { x: 224, y: 240 }, pose: 'stand', direction: 'W', expression: 'focused' },
        { at: 20, actorId: 'family-daughter', action: 'Follows in the ambulance, gives the medication list and allergy history.', pos: { x: 286, y: 236 }, pose: 'stand', expression: 'distressed' },
        { at: 25, actorId: 'paramedic', action: 'Resus bay confirmed. ETA 3 minutes. Sepsis team standing by.', pos: { x: 224, y: 240 }, pose: 'stand', expression: 'relieved' },
      ],
    },

    /* Off-canonical: walk-in triage delay, then merges back to resus. */
    'triage-delay': {
      id: 'triage-delay',
      title: 'Walk-in triage — the clock keeps running',
      scene: 'clinic',
      durationSec: 18,
      timeOfDay: '20:12 SGT',
      location: 'ED triage',
      defaultNextChapterId: 'resus',
      beats: [
        { at: 0, actorId: 'patient', action: 'Waiting in the queue — deteriorating quietly, lactate still rising.', pos: { x: 210, y: 236 }, pose: 'sit', expression: 'distressed' },
        { at: 4, actorId: 'family-daughter', action: 'Pleads at the counter — "she\'s getting worse".', pos: { x: 262, y: 230 }, pose: 'point', direction: 'W', expression: 'alarmed' },
        { at: 9, actorId: 'triage-nurse', action: 'Sepsis screen at triage finally flags red — escalates to resus now.', pos: { x: 312, y: 226 }, pose: 'stand', direction: 'W', expression: 'focused', sfx: '⚠ SEPSIS' },
        { at: 14, actorId: 'patient', action: 'Rushed through — but reperfusion of the bundle is already minutes behind.', pos: { x: 220, y: 238 }, pose: 'collapsed', expression: 'pained' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 3 — ED resus: Surviving Sepsis Hour-1 bundle
     * Branch: empirical antibiotics now (canonical) vs wait for cultures
     * ──────────────────────────────────────────────────────────────────── */
    resus: {
      id: 'resus',
      title: 'Resus — the Hour-1 bundle',
      scene: 'resus',
      durationSec: 34,
      timeOfDay: '20:05 SGT',
      location: 'ED resuscitation bay',
      defaultNextChapterId: 'imaging',
      branchPoint: {
        prompt: 'Septic shock, lactate 4.6, source likely urinary. Antibiotic decision?',
        options: [
          {
            label: 'Empirical broad-spectrum antibiotics now — after cultures, within the hour',
            hint: 'SSC Hour-1: cultures first, then immediate broad-spectrum cover. Every hour of delay costs lives.',
            nextChapterId: 'imaging',
          },
          {
            label: 'Hold antibiotics until cultures and CT result',
            hint: 'Delaying antibiotics in septic shock to "confirm" the source increases mortality.',
            nextChapterId: 'antibiotic-delay',
          },
        ],
      },
      beats: [
        { at: 0, actorId: 'patient', action: 'Into the resus bay — BP 84/46, HR 122, mottled knees.', pos: { x: 200, y: 236 }, pose: 'collapsed', expression: 'pained' },
        { at: 0, actorId: 'triage-nurse', action: 'Handover: qSOFA 3, suspected urosepsis. Sepsis screen positive.', pos: { x: 150, y: 232 }, pose: 'stand', direction: 'E', expression: 'focused' },
        { at: 4, actorId: 'ed-doctor', action: 'Declares septic shock. Calls the Hour-1 bundle. Measures lactate.', pos: { x: 250, y: 234 }, pose: 'stand', direction: 'W', expression: 'focused', sfx: '⏱ HOUR-1' },
        { at: 9, actorId: 'ed-nurse', action: 'Two sets of blood cultures drawn BEFORE antibiotics. Urine sent.', pos: { x: 226, y: 246 }, pose: 'kneel', direction: 'W', expression: 'focused' },
        { at: 14, actorId: 'ed-nurse', action: 'Venous lactate 4.6. Balanced crystalloid 30 ml/kg bolus running.', pos: { x: 226, y: 246 }, pose: 'kneel', direction: 'W', expression: 'focused' },
        { at: 19, actorId: 'ed-pharmacist', action: 'Confirms empirical cover against the antibiogram; renal-doses for eGFR.', pos: { x: 286, y: 232 }, pose: 'stand', direction: 'W', expression: 'focused' },
        { at: 24, actorId: 'ed-doctor', action: 'Broad-spectrum antibiotics given within 38 minutes of arrival.', pos: { x: 250, y: 234 }, pose: 'stand', direction: 'W', expression: 'focused' },
        { at: 29, actorId: 'ed-doctor', action: 'BP still 88/50 after fluids — fluid-refractory. Source hunt + ICU referral.', pos: { x: 250, y: 234 }, pose: 'point', direction: 'W', expression: 'focused' },
      ],
    },

    /* Off-canonical: antibiotic delay worsens shock, then merges to imaging. */
    'antibiotic-delay': {
      id: 'antibiotic-delay',
      title: 'Antibiotics delayed — shock deepens',
      scene: 'resus',
      durationSec: 18,
      timeOfDay: '20:48 SGT',
      location: 'ED resuscitation bay',
      defaultNextChapterId: 'imaging',
      beats: [
        { at: 0, actorId: 'patient', action: 'Lactate climbs to 6.1; BP 78/40 despite fluids — organs starving.', pos: { x: 204, y: 236 }, pose: 'collapsed', expression: 'distressed' },
        { at: 5, actorId: 'ed-nurse', action: 'Urine output near zero; mottling spreads up the thighs.', pos: { x: 232, y: 244 }, pose: 'kneel', direction: 'W', expression: 'alarmed' },
        { at: 10, actorId: 'ed-doctor', action: 'Reverses course — gives broad-spectrum antibiotics immediately.', pos: { x: 252, y: 234 }, pose: 'stand', direction: 'W', expression: 'focused', sfx: '⏱ LATE' },
        { at: 14, actorId: 'ed-doctor', action: 'Damage done: delayed cover means a harder, longer ICU course ahead.', pos: { x: 252, y: 234 }, pose: 'stand', expression: 'distressed' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 4 — Source identification: CT shows obstructed infected kidney
     * Branch: urgent source control (canonical) vs antibiotics alone
     * ──────────────────────────────────────────────────────────────────── */
    imaging: {
      id: 'imaging',
      title: 'Finding the source — 20:40',
      scene: 'imaging',
      durationSec: 26,
      timeOfDay: '20:40 SGT',
      location: 'CT scanner',
      defaultNextChapterId: 'source-control',
      branchPoint: {
        prompt: 'CT: obstructing left ureteric stone with an infected, hydronephrotic kidney. Next step?',
        options: [
          {
            label: 'Urgent decompression — emergency stent or nephrostomy',
            hint: 'An obstructed infected system is a surgical emergency; antibiotics cannot sterilise undrained pus.',
            nextChapterId: 'source-control',
          },
          {
            label: 'Antibiotics alone — defer any drainage',
            hint: 'Source control is mandatory here; without decompression the patient stays septic.',
            nextChapterId: 'no-source-control',
          },
        ],
      },
      beats: [
        { at: 0, actorId: 'porter', action: 'Wheels the patient to CT — a monitored transfer on the critical path.', pos: { x: 150, y: 240 }, pose: 'walk', walking: true, direction: 'E', expression: 'focused' },
        { at: 4, actorId: 'radiographer', action: 'Positions for CT abdomen/pelvis; contrast timed to the renal phase.', pos: { x: 250, y: 232 }, pose: 'stand', direction: 'W', expression: 'focused' },
        { at: 9, actorId: 'patient', action: 'Into the scanner bore — pan-CT to localise the septic source.', pos: { x: 214, y: 236 }, pose: 'collapsed', expression: 'pained', showpiece: { kind: 'svg', id: 'mri-bore-slide', title: 'CT abdomen/pelvis', caption: 'Obstructing left ureteric calculus + hydronephrosis' } },
        { at: 15, actorId: 'radiologist', action: 'Reports an obstructed, infected left kidney — flags it as a surgical emergency.', pos: { x: 286, y: 230 }, pose: 'point', direction: 'W', expression: 'focused', sfx: '⚠ OBSTRUCTED' },
        { at: 21, actorId: 'ed-doctor', action: 'Source identified. Refers urology for emergency decompression.', pos: { x: 232, y: 234 }, pose: 'stand', direction: 'W', expression: 'focused' },
      ],
    },

    /* Off-canonical: no source control — urologist insists, routes back. */
    'no-source-control': {
      id: 'no-source-control',
      title: 'No drainage — the source festers',
      scene: 'imaging',
      durationSec: 18,
      timeOfDay: '21:20 SGT',
      location: 'ED — urology review',
      defaultNextChapterId: 'source-control',
      beats: [
        { at: 0, actorId: 'patient', action: 'Remains in refractory shock — undrained pus keeps seeding the blood.', pos: { x: 210, y: 236 }, pose: 'collapsed', expression: 'distressed' },
        { at: 5, actorId: 'urologist', action: '"Antibiotics will not sterilise an obstructed system — we must decompress now."', pos: { x: 262, y: 230 }, pose: 'point', direction: 'W', expression: 'focused' },
        { at: 11, actorId: 'ed-doctor', action: 'Agrees — escalates to emergency drainage without further delay.', pos: { x: 224, y: 234 }, pose: 'stand', direction: 'W', expression: 'focused', sfx: '➜ DRAIN' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 5 — Source control: emergency decompression
     * ──────────────────────────────────────────────────────────────────── */
    'source-control': {
      id: 'source-control',
      title: 'Source control — emergency decompression',
      scene: 'cathlab',
      durationSec: 28,
      timeOfDay: '21:05 SGT',
      location: 'Urology / IR suite',
      defaultNextChapterId: 'icu',
      beats: [
        { at: 0, actorId: 'ir-nurse', action: 'Preps the suite, positions and monitors the patient under sedation.', pos: { x: 168, y: 240 }, pose: 'kneel', direction: 'E', expression: 'focused' },
        { at: 5, actorId: 'urologist', action: 'Cystoscopy and emergency retrograde JJ stent past the obstructing stone.', pos: { x: 240, y: 234 }, pose: 'stand', direction: 'W', expression: 'focused' },
        { at: 12, actorId: 'urologist', action: 'Infected urine drains under pressure — the septic source is decompressed.', pos: { x: 240, y: 234 }, pose: 'point', direction: 'W', expression: 'focused', showpiece: { kind: 'svg', id: 'stent-deployment', title: 'Ureteric stent', caption: 'Decompressing the obstructed, infected kidney' }, sfx: '💧 DRAINED' },
        { at: 19, actorId: 'patient', action: 'Physiology begins to turn — heart rate settles as the source is controlled.', pos: { x: 206, y: 238 }, pose: 'collapsed', expression: 'relieved' },
        { at: 24, actorId: 'urologist', action: 'Definitive stone treatment deferred until the sepsis has resolved.', pos: { x: 240, y: 234 }, pose: 'stand', expression: 'focused' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 6 — ICU: vasopressors, lactate clearance, organ support
     * ──────────────────────────────────────────────────────────────────── */
    icu: {
      id: 'icu',
      title: 'ICU — vasopressors and reassessment',
      scene: 'ward',
      durationSec: 30,
      timeOfDay: '22:10 SGT',
      location: 'Medical ICU',
      defaultNextChapterId: 'ward',
      beats: [
        { at: 0, actorId: 'patient', action: 'Admitted to the medical ICU — arterial line, catheter, hourly outputs.', pos: { x: 206, y: 236 }, pose: 'collapsed', expression: 'pained' },
        { at: 4, actorId: 'intensivist', action: 'Fluid-refractory shock — starts noradrenaline targeting a MAP of 65.', pos: { x: 252, y: 232 }, pose: 'stand', direction: 'W', expression: 'focused' },
        { at: 10, actorId: 'icu-nurse', action: 'Titrates the vasopressor; tracks urine output and capillary refill.', pos: { x: 228, y: 244 }, pose: 'kneel', direction: 'W', expression: 'focused' },
        { at: 16, actorId: 'intensivist', action: 'Repeat lactate 2.4 — clearing. Perfusion and mentation improving.', pos: { x: 252, y: 232 }, pose: 'stand', direction: 'W', expression: 'relieved', sfx: '📉 LACTATE 2.4' },
        { at: 22, actorId: 'family-daughter', action: 'Updated at the bedside; consents to ongoing organ support.', pos: { x: 300, y: 236 }, pose: 'stand', expression: 'distressed' },
        { at: 27, actorId: 'intensivist', action: 'Stable overnight — weaning the vasopressor, planning ward step-down.', pos: { x: 252, y: 232 }, pose: 'stand', expression: 'relieved' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 7 — Ward step-down: antibiotic de-escalation + mobilisation
     * ──────────────────────────────────────────────────────────────────── */
    ward: {
      id: 'ward',
      title: 'Ward step-down — de-escalation',
      scene: 'ward',
      durationSec: 28,
      timeOfDay: 'Day 4 — 10:30',
      location: 'General ward',
      defaultNextChapterId: 'recovery',
      beats: [
        { at: 0, actorId: 'patient', action: 'Off vasopressors, sitting up, talking with her daughter again.', pos: { x: 208, y: 232 }, pose: 'sit', expression: 'relieved' },
        { at: 4, actorId: 'ward-consultant', action: 'Cultures grew E. coli sensitive to a narrow agent — de-escalates therapy.', pos: { x: 252, y: 232 }, pose: 'stand', direction: 'W', expression: 'focused', sfx: '🧫 E. coli' },
        { at: 10, actorId: 'ward-consultant', action: 'Sets total antibiotic duration with stewardship; plans IV-to-oral switch.', pos: { x: 252, y: 232 }, pose: 'stand', direction: 'W', expression: 'focused' },
        { at: 16, actorId: 'ward-nurse', action: 'Switches to oral antibiotics; watches for any recurrence of fever.', pos: { x: 226, y: 240 }, pose: 'stand', direction: 'W', expression: 'focused' },
        { at: 21, actorId: 'ward-physio', action: 'Mobilises her for ICU-acquired weakness — sit-to-stand, then a short walk.', pos: { x: 290, y: 236 }, pose: 'walk', walking: true, direction: 'W', expression: 'focused' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 8 — Recovery clinic: post-sepsis syndrome follow-up
     * ──────────────────────────────────────────────────────────────────── */
    recovery: {
      id: 'recovery',
      title: 'Recovery — post-sepsis follow-up',
      scene: 'clinic',
      durationSec: 26,
      timeOfDay: 'Week 6 — clinic',
      location: 'Specialist outpatient clinic',
      defaultNextChapterId: 'backhouse',
      beats: [
        { at: 0, actorId: 'patient', action: 'Walks into clinic — tired and forgetful but home and recovering.', pos: { x: 204, y: 232 }, pose: 'walk', walking: true, direction: 'E', expression: 'neutral' },
        { at: 5, actorId: 'clinic-doctor', action: 'Screens for post-sepsis syndrome — fatigue, low mood, cognitive fog.', pos: { x: 256, y: 232 }, pose: 'stand', direction: 'W', expression: 'focused' },
        { at: 11, actorId: 'clinic-doctor', action: 'Plans definitive stone clearance now the sepsis has resolved.', pos: { x: 256, y: 232 }, pose: 'stand', direction: 'W', expression: 'focused' },
        { at: 17, actorId: 'clinic-doctor', action: 'Optimises diabetes control and updates vaccinations to cut recurrence risk.', pos: { x: 256, y: 232 }, pose: 'stand', direction: 'W', expression: 'relieved' },
        { at: 22, actorId: 'family-daughter', action: 'Reassured — a recovery plan, and the warning signs to watch for at home.', pos: { x: 300, y: 234 }, pose: 'stand', expression: 'relieved' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 9 — Back-of-house: the unseen sepsis response
     * ──────────────────────────────────────────────────────────────────── */
    backhouse: {
      id: 'backhouse',
      title: 'Back-of-house — the unseen response',
      scene: 'backhouse',
      durationSec: 28,
      timeOfDay: 'Throughout',
      location: 'Lab · pharmacy · portering',
      beats: [
        { at: 0, actorId: 'micro-scientist', action: 'Loads the blood cultures; the positive bottle flags overnight.', pos: { x: 168, y: 232 }, pose: 'stand', direction: 'E', expression: 'focused' },
        { at: 6, actorId: 'micro-scientist', action: 'Gram stain and ID; phones the critical result that guides de-escalation.', pos: { x: 168, y: 232 }, pose: 'point', direction: 'E', expression: 'focused', sfx: '☎ CRITICAL' },
        { at: 12, actorId: 'pharmacy-tech', action: 'Prepared and ran up the first antibiotic dose to meet the Hour-1 target.', pos: { x: 244, y: 236 }, pose: 'walk', walking: true, direction: 'W', expression: 'focused' },
        { at: 18, actorId: 'porter', action: 'Logged every transfer — resus → CT → suite → ICU — without a wasted minute.', pos: { x: 300, y: 240 }, pose: 'walk', walking: true, direction: 'W', expression: 'focused' },
        { at: 23, actorId: 'cleaner-icu', action: 'Terminal-cleans the ICU bay so the next critically ill patient is safe.', pos: { x: 210, y: 236 }, pose: 'stand', direction: 'S', expression: 'neutral' },
      ],
    },
  },
};
