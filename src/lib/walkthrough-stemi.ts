/**
 * STEMI walkthrough — canonical scrubbable cinematic of a Singapore patient's
 * journey from out-of-hospital cardiac arrest through PCI, ward stay,
 * cardiac rehab, outpatient follow-up, and a back-of-house epilogue showing
 * how support staff make the whole thing possible.
 *
 * Three Bandersnatch-style decision points:
 *   1. End of `ambulance` — SGH (canonical) or nearest A&E (off-canonical).
 *   2. End of `cardiac-cta` — include cardiac MRI (canonical) or skip.
 *   3. End of `family-conference` — recommend PCI (canonical) or CABG (the
 *      surgeon then declines and routes back to PCI).
 *
 * Content is English-authored; v10.1 / v10.2 / v11.0 add ms / ta translations
 * per docs/ROADMAP.md.
 */
import type { Walkthrough } from './walkthrough';

export const stemiWalkthrough: Walkthrough = {
  id: 'stemi-pathway-v1',
  title: 'STEMI — full patient journey',
  startChapterId: 'collapse',
  actors: {
    /* Patient + family */
    'patient': {
      id: 'patient',
      role: 'Mr Tan, 58',
      team: 'patient',
      bio: 'A 58-year-old retired SBS bus driver. No prior cardiac history. Collapses outside a coffee shop on his morning kopi run.',
      swatch: '#3aa6ff',
    },
    'family-wife': {
      id: 'family-wife',
      role: 'Mrs Tan, 56',
      team: 'patient',
      bio: 'The patient\'s wife. Works part-time at a community club. Arrives at SGH ~40 minutes after the ambulance, accompanied by her son. Lead family decision-maker for the consent conversations.',
      swatch: '#60a5fa',
    },
    'family-son': {
      id: 'family-son',
      role: 'Son, 28',
      team: 'patient',
      bio: 'The patient\'s adult son, a logistics manager. Drives his mother to SGH and acts as the family liaison through the ward stay and discharge planning.',
      swatch: '#93c5fd',
    },

    /* Pre-hospital */
    'bystander': {
      id: 'bystander',
      role: 'Bystander',
      team: 'bystander',
      bio: 'A passer-by trained in DARE (Dispatcher-Assisted first REsponder). Calls 995 and starts hands-only CPR while waiting for the AED.',
      swatch: '#a3e635',
    },
    'cfr': {
      id: 'cfr',
      role: 'myResponder CFR',
      team: 'first-responder',
      bio: 'Community First Responder dispatched via the SCDF myResponder app. Carries a PAD AED and arrives ahead of the ambulance.',
      swatch: '#facc15',
    },
    'support-cleaner': {
      id: 'support-cleaner',
      role: 'Coffee shop attendant',
      team: 'support',
      bio: 'Coffee shop attendant who clears tables and keeps onlookers back so the CFR can work. Singapore CPR culture in action.',
      swatch: '#94a3b8',
    },

    /* Ambulance */
    'paramedic': {
      id: 'paramedic',
      role: 'SCDF paramedic',
      team: 'ambulance',
      bio: 'SCDF Advanced Care Paramedic. Runs the 12-lead ECG, transmits the STEMI alert, manages airway and IV en route.',
      swatch: '#f87171',
    },
    'driver': {
      id: 'driver',
      role: 'SCDF EA driver',
      team: 'ambulance',
      bio: 'Emergency Ambulance driver. Routes via the optimal corridor and pre-notifies the receiving hospital for blue-call triage.',
      swatch: '#fb923c',
    },

    /* Emergency Department */
    'ed-doctor': {
      id: 'ed-doctor',
      role: 'ED registrar',
      team: 'ed',
      bio: 'Receives the prehospital handover, confirms the STEMI on the repeat ECG, activates the cath team via the 24/7 STEMI pager line.',
      swatch: '#ef4444',
    },
    'ed-nurse': {
      id: 'ed-nurse',
      role: 'ED nurse',
      team: 'ed',
      bio: 'Establishes a second IV, draws bloods (troponin, FBC, U&E, APTT) in parallel with transfer to the cath lab.',
      swatch: '#dc2626',
    },
    'ed-hca': {
      id: 'ed-hca',
      role: 'ED HCA',
      team: 'ed',
      bio: 'Healthcare Assistant. Performs the repeat 12-lead ECG, takes vital signs, supports the nursing team during fast-track triage.',
      swatch: '#b91c1c',
    },
    'ed-clerk': {
      id: 'ed-clerk',
      role: 'ED registration clerk',
      team: 'support',
      bio: 'Registration clerk. Confirms identity via NRIC, opens the inpatient record, calls the next-of-kin from the patient\'s phone contacts.',
      swatch: '#a1a1aa',
    },

    /* Cath lab */
    'cath-cardio': {
      id: 'cath-cardio',
      role: 'Interventional cardiologist',
      team: 'cath',
      bio: 'NHCS interventional cardiologist on STEMI call. Performs the diagnostic angiogram, leads the heart-team discussion, executes the PCI.',
      swatch: '#a855f7',
    },
    'cath-nurse': {
      id: 'cath-nurse',
      role: 'Cath lab nurse',
      team: 'cath',
      bio: 'Scrubs in, monitors haemodynamics, hands instruments, records the procedure log.',
      swatch: '#9333ea',
    },
    'cath-radiog': {
      id: 'cath-radiog',
      role: 'Cath lab radiographer',
      team: 'cath',
      bio: 'Operates the C-arm, optimises views for the operator, manages radiation dose.',
      swatch: '#7e22ce',
    },

    /* Imaging (CT / MRI) */
    'imaging-radiog': {
      id: 'imaging-radiog',
      role: 'Imaging radiographer',
      team: 'cath',
      bio: 'Cardiac CT and MRI radiographer. Operates the scanner, manages gating, supervises contrast and gadolinium injections.',
      swatch: '#6b21a8',
    },
    'imaging-nurse': {
      id: 'imaging-nurse',
      role: 'Imaging nurse',
      team: 'cath',
      bio: 'Nurse covering the imaging suite. Administers IV contrast / gadolinium, monitors the patient during scans.',
      swatch: '#581c87',
    },

    /* Heart team */
    'consultant-cardio': {
      id: 'consultant-cardio',
      role: 'Consultant cardiologist',
      team: 'cath',
      bio: 'Senior cardiologist leading the heart-team discussion. Chairs the family conference, explains options in plain Mandarin.',
      swatch: '#c084fc',
    },
    'ct-surgeon': {
      id: 'ct-surgeon',
      role: 'Cardiothoracic surgeon',
      team: 'cath',
      bio: 'On-call cardiothoracic surgeon. Reviews angiogram for surgical candidacy. Declines CABG when anatomy and SYNTAX score favour PCI.',
      swatch: '#d8b4fe',
    },

    /* Ward team */
    'ward-consultant': {
      id: 'ward-consultant',
      role: 'Cardiology consultant',
      team: 'ward',
      bio: 'Consultant cardiologist leading the daily ward round. Reviews the case, sets the management plan, communicates with the family.',
      swatch: '#0ea5e9',
    },
    'ward-reg': {
      id: 'ward-reg',
      role: 'Cardiology registrar',
      team: 'ward',
      bio: 'Registrar on the cardiology team. Pre-rounds before the consultant, writes daily plans, manages overnight issues.',
      swatch: '#0284c7',
    },
    'ward-mo': {
      id: 'ward-mo',
      role: 'Medical Officer',
      team: 'ward',
      bio: 'Junior doctor on the ward. Clerks new admissions, takes daily bloods, writes discharge summaries.',
      swatch: '#0369a1',
    },
    'ward-nurse': {
      id: 'ward-nurse',
      role: 'Ward nurse',
      team: 'ward',
      bio: 'Ward staff nurse. Responsible for medication administration, monitoring, and patient education.',
      swatch: '#075985',
    },
    'ward-hca': {
      id: 'ward-hca',
      role: 'Ward HCA',
      team: 'ward',
      bio: 'Healthcare Assistant. Vital signs, bathing, mobilisation support, feeding assistance.',
      swatch: '#0c4a6e',
    },
    'ward-physio': {
      id: 'ward-physio',
      role: 'Cardiac physiotherapist (AHP)',
      team: 'ward',
      bio: 'Phase I cardiac rehab on the ward. Early mobilisation, breathing exercises, activity progression.',
      swatch: '#10b981',
    },
    'ward-ot': {
      id: 'ward-ot',
      role: 'Occupational therapist (AHP)',
      team: 'ward',
      bio: 'Assesses activities of daily living, plans for the home environment, advises on energy conservation.',
      swatch: '#059669',
    },
    'ward-dietitian': {
      id: 'ward-dietitian',
      role: 'Dietitian (AHP)',
      team: 'ward',
      bio: 'Reviews dietary history, plans the cardiac-protective diet, counsels on sodium, lipids, weight.',
      swatch: '#047857',
    },
    'ward-pharm': {
      id: 'ward-pharm',
      role: 'Clinical pharmacist (AHP)',
      team: 'ward',
      bio: 'Reviews medication regimens for interactions, renal dose adjustments, pre-discharge counselling.',
      swatch: '#065f46',
    },

    /* Discharge */
    'discharge-coord': {
      id: 'discharge-coord',
      role: 'Case manager',
      team: 'ward',
      bio: 'Discharge planner. Coordinates cardiac rehab referral, home setup, financial counselling, outpatient appointments.',
      swatch: '#022c22',
    },

    /* Outpatient pharmacy */
    'outpatient-pharm': {
      id: 'outpatient-pharm',
      role: 'Outpatient pharmacist',
      team: 'outpatient',
      bio: 'Dispenses discharge medications, counsels the patient on dosing, side effects, and adherence.',
      swatch: '#f59e0b',
    },

    /* Cardiac rehab */
    'rehab-physio': {
      id: 'rehab-physio',
      role: 'Cardiac rehab physiotherapist',
      team: 'rehab',
      bio: 'NHCS Phase II cardiac rehab. Supervises monitored exercise sessions, prescribes home programmes.',
      swatch: '#ec4899',
    },

    /* Outpatient specialist */
    'clinic-cardio': {
      id: 'clinic-cardio',
      role: 'Cardiologist (clinic)',
      team: 'outpatient',
      bio: 'Outpatient cardiology specialist. Reviews ECG / echo, medication compliance; titrates therapy; plans follow-up imaging.',
      swatch: '#f97316',
    },

    /* Back-of-house support staff (atmospheric throughout + featured chapter) */
    'cleaner-cath': {
      id: 'cleaner-cath',
      role: 'Cath lab cleaner',
      team: 'support',
      bio: 'Terminal-cleans the cath lab between cases. Turnover time directly drives how soon the next STEMI patient gets a slot — every minute counts in a 24/7 PCI service.',
      swatch: '#78716c',
    },
    'cleaner-ward': {
      id: 'cleaner-ward',
      role: 'Ward cleaner',
      team: 'support',
      bio: 'Cleans wards, isolation rooms, and bed-spaces between admissions. Two-step disinfection, colour-coded cloths, daily morning round.',
      swatch: '#a8a29e',
    },
    'cook-kitchen': {
      id: 'cook-kitchen',
      role: 'Hospital cook',
      team: 'support',
      bio: 'Prepares cardiac-protective trays (low-salt, low-fat) as ordered by the dietitian. Halal and vegetarian options stocked by default.',
      swatch: '#d6d3d1',
    },
    'laundry-staff': {
      id: 'laundry-staff',
      role: 'Laundry coordinator',
      team: 'support',
      bio: 'Manages the linen par level for the wards. Stockouts delay bed turnover and stall new admissions; par level is rechecked each shift handover.',
      swatch: '#e7e5e4',
    },
    'admin-billing': {
      id: 'admin-billing',
      role: 'Billing clerk',
      team: 'support',
      bio: 'Itemises the bill, computes MediShield Life claim eligibility, the subsidy band for the ward class, the MediSave drawdown cap; explains the cash component to the family.',
      swatch: '#fafaf9',
    },
  },
  chapters: {
    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 1 — Collapse + bystander CPR + CFR with AED
     * ──────────────────────────────────────────────────────────────────── */
    collapse: {
      id: 'collapse',
      title: 'Collapse — 08:15 at Bras Basah',
      scene: 'kopitiam',
      durationSec: 30,
      timeOfDay: '08:15 SGT',
      location: 'Bras Basah kopitiam',
      defaultNextChapterId: 'ambulance',
      beats: [
        // Mr Tan, mid-morning kopi run, suddenly clutches his chest.
        { at: 0, actorId: 'patient', action: 'Walking to the kopi counter — clutches chest, collapses.', pos: { x: 214, y: 224 }, pose: 'stand', expression: 'pained' },
        // A passer-by sees it and reacts.
        { at: 2, actorId: 'bystander', action: 'Sees the collapse, shouts for help, dials 995.', pos: { x: 264, y: 224 }, pose: 'stand', expression: 'alarmed' },
        // Mr Tan is on the ground, unresponsive.
        { at: 3, actorId: 'patient', action: 'Down on the floor — unresponsive.', pos: { x: 202, y: 238 }, pose: 'collapsed', expression: 'unconscious' },
        // The coffee-shop attendant clears tables and waves onlookers back.
        { at: 4, actorId: 'support-cleaner', action: 'Clears tables and keeps onlookers back so the area is safe.', pos: { x: 314, y: 214 }, pose: 'point', direction: 'W', expression: 'alarmed' },
        // Bystander checks first: unresponsive + no normal breathing = cardiac arrest.
        { at: 4, actorId: 'bystander', action: 'Kneels, checks: unresponsive, not breathing normally — it’s a cardiac arrest.', pos: { x: 212, y: 256 }, pose: 'kneel', direction: 'W', expression: 'alarmed' },
        // Bystander drops to his knees and starts hands-only CPR.
        { at: 6, actorId: 'bystander', action: 'On 995: dispatcher confirms cardiac arrest. Starts hands-only CPR.', pos: { x: 208, y: 256 }, pose: 'cpr', direction: 'W', expression: 'focused' },
        // Pulseless; compressions ongoing.
        { at: 10, actorId: 'patient', action: 'Pulseless. Receiving chest compressions at 100–120 / min.', pos: { x: 202, y: 238 }, pose: 'collapsed', expression: 'unconscious' },
        // The myResponder CFR sprints in from the five-foot-way with a PAD AED.
        { at: 14, actorId: 'cfr', action: 'myResponder ping accepted — arrives with PAD AED from 280 m away.', pos: { x: 372, y: 232 }, pose: 'walk', walking: true, direction: 'W', expression: 'focused' },
        // CFR kneels on the far side, applies pads, delivers a shock.
        { at: 18, actorId: 'cfr', action: 'AED pads on. Shock advised. Stand clear, shock delivered.', pos: { x: 166, y: 242 }, pose: 'kneel', direction: 'E', expression: 'focused', showpiece: { kind: 'svg', id: 'aed-shock' }, sfx: '⚡ CLEAR!' },
        // Bystander hands over: stands clear for the shock, then supports (only one
        // rescuer compresses at a time) so the CFR runs the next cycle solo.
        { at: 18, actorId: 'bystander', action: 'Stands clear for the shock, then supports — reassurance and airway.', pos: { x: 286, y: 230 }, pose: 'stand', direction: 'W', expression: 'focused' },
        { at: 22, actorId: 'cfr', action: 'CPR resumed. Second cycle.', pos: { x: 195, y: 256 }, pose: 'cpr', direction: 'E', expression: 'focused' },
        // ROSC — Mr Tan groans, a pulse returns.
        { at: 26, actorId: 'patient', action: 'Return of spontaneous circulation. Groaning. Pulse palpable.', pos: { x: 202, y: 238 }, pose: 'collapsed', expression: 'pained' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 2 — Ambulance arrival, prehospital ECG, STEMI alert
     * Branch: SGH primary PCI (canonical) vs nearest A&E (alternate)
     * ──────────────────────────────────────────────────────────────────── */
    ambulance: {
      id: 'ambulance',
      title: 'Ambulance on scene — 08:24',
      scene: 'street',
      durationSec: 28,
      timeOfDay: '08:24 SGT',
      location: 'On scene — Bras Basah Road',
      defaultNextChapterId: 'arrive-sgh',
      branchPoint: {
        prompt: 'The 12-lead shows anterior STEMI. Where does this patient go?',
        options: [
          {
            label: 'SGH — primary PCI centre, cath team activated',
            hint: 'STEMI network destination. Bypasses the regular ED; bloods + cath in parallel.',
            nextChapterId: 'arrive-sgh',
          },
          {
            label: 'Nearest A&E (private) — no on-site cath',
            hint: 'Faster door, but the patient needs a secondary transfer that delays reperfusion.',
            nextChapterId: 'arrive-private',
          },
        ],
      },
      beats: [
        { at: 0, actorId: 'patient', action: 'On the stretcher — pale, post-arrest, responding to voice.', pos: { x: 170, y: 244 }, pose: 'collapsed', expression: 'pained', onSurface: true },
        { at: 0, actorId: 'paramedic', action: 'Arrives with EA. Hands over from CFR — ROSC, GCS 14.', pos: { x: 222, y: 246 }, pose: 'kneel', direction: 'W', expression: 'focused' },
        { at: 3, actorId: 'driver', action: 'Sets up the stretcher and clears the route to the EA.', pos: { x: 312, y: 238 }, pose: 'stand', direction: 'W', expression: 'focused', walking: true },
        { at: 5, actorId: 'paramedic', action: '12-lead ECG: ST elevation V1–V4. Calls STEMI alert.', pos: { x: 222, y: 246 }, pose: 'kneel', direction: 'W', expression: 'focused' },
        { at: 10, actorId: 'paramedic', action: 'IV access established. Aspirin 300 mg PO loaded.', pos: { x: 222, y: 246 }, pose: 'kneel', direction: 'W', expression: 'focused' },
        { at: 14, actorId: 'driver', action: 'Patient loaded. Code 3 transport. Pre-notifies receiving hospital.', pos: { x: 312, y: 238 }, pose: 'point', expression: 'focused', sfx: '🚨 SIREN' },
        { at: 18, actorId: 'paramedic', action: 'En route: O2 maintained, BP 102 / 64, HR 88. ECG re-checked.', pos: { x: 222, y: 240 }, pose: 'stand', direction: 'W', expression: 'focused' },
        { at: 24, actorId: 'paramedic', action: 'Cath team activation confirmed. ETA 4 minutes.', pos: { x: 222, y: 240 }, pose: 'stand', expression: 'relieved' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 3 (canonical) — Arrive SGH bypass bay; door-to-cath fast track
     * ──────────────────────────────────────────────────────────────────── */
    'arrive-sgh': {
      id: 'arrive-sgh',
      title: 'SGH STEMI bypass — 08:32',
      scene: 'resus',
      durationSec: 35,
      timeOfDay: '08:32 SGT',
      location: 'SGH ambulance bay → cath corridor',
      defaultNextChapterId: 'cath-activation',
      beats: [
        { at: 0, actorId: 'patient', action: 'On the resus trolley — anterior STEMI, post-arrest, GCS 14.', pos: { x: 250, y: 181 }, pose: 'collapsed', expression: 'pained' },
        { at: 0, actorId: 'driver', action: 'Pulls into the SGH bypass bay. "STEMI bypass" called overhead.', walking: true },
        { at: 5, actorId: 'paramedic', action: 'Verbal handover: ROSC 08:21, GCS 14, BP 102/64, ECG anterior STEMI.' },
        { at: 10, actorId: 'ed-hca', action: 'Patient transferred onto trolley. Repeat 12-lead leads attached.' },
        { at: 15, actorId: 'ed-doctor', action: 'Confirms anterior STEMI on the repeat ECG. Pages STEMI 7777.' },
        { at: 21, actorId: 'ed-nurse', action: 'Second IV, draws troponin + FBC + U&E + APTT in parallel.' },
        { at: 27, actorId: 'cath-cardio', action: 'Receives page in the cath lab; ETA to lab 4 minutes.' },
        { at: 32, actorId: 'ed-clerk', action: 'Registers patient via NRIC; calls Mrs Tan from the patient\'s mobile.' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 4 — Cath activation: family consent, gowning, transfer to table
     * ──────────────────────────────────────────────────────────────────── */
    'cath-activation': {
      id: 'cath-activation',
      title: 'Cath lab activation — 08:38',
      scene: 'cathlab',
      durationSec: 30,
      timeOfDay: '08:38 SGT',
      location: 'SGH cath lab anteroom',
      defaultNextChapterId: 'cath-procedure',
      beats: [
        { at: 0, actorId: 'patient', action: 'On the cath table — awake, draped, right wrist prepped.', pos: { x: 210, y: 187 }, pose: 'collapsed', expression: 'pained' },
        { at: 0, actorId: 'cath-cardio', action: 'Meets patient at the lab; brief introduction in dialect.' },
        { at: 6, actorId: 'cath-nurse', action: 'Gowns patient, attaches monitoring; right radial access prep.' },
        { at: 12, actorId: 'ed-clerk', action: 'Mrs Tan on the phone — verbal consent for emergency angiography captured.' },
        { at: 18, actorId: 'cath-radiog', action: 'Positions the C-arm; final dose-area-product check.' },
        { at: 24, actorId: 'cath-cardio', action: 'Patient on table. Ready to start. Door-to-balloon clock: 27 min.' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 5 — Diagnostic angiogram. Multivessel disease confirmed.
     * ──────────────────────────────────────────────────────────────────── */
    'cath-procedure': {
      id: 'cath-procedure',
      title: 'Diagnostic angiogram — 08:45',
      scene: 'cathlab',
      durationSec: 40,
      timeOfDay: '08:45 SGT',
      location: 'SGH cath lab',
      defaultNextChapterId: 'cardiac-cta',
      beats: [
        { at: 0, actorId: 'patient', action: 'On the cath table through the diagnostic study — haemodynamically stable.', pos: { x: 210, y: 187 }, pose: 'collapsed', expression: 'neutral' },
        { at: 0, actorId: 'cath-cardio', action: 'Radial puncture; JR4 catheter; selective RCA injection.' },
        { at: 7, actorId: 'cath-radiog', action: 'Fluoro: mid-RCA 70% stenosis, not acute.' },
        { at: 13, actorId: 'cath-cardio', action: 'JL4 to left system: LAD 95% proximal — the culprit lesion.' },
        { at: 20, actorId: 'cath-cardio', action: 'LCx 50% non-culprit. Multivessel pattern.' },
        { at: 27, actorId: 'cath-nurse', action: 'Records procedure log; haemodynamics stable on heparin.' },
        { at: 34, actorId: 'cath-cardio', action: 'Diagnostic angiogram complete. Pause for heart-team workup.' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 6 — Cardiac CTA for territory + calcium quantification
     * Branch: include cardiac MRI for viability (canonical) or skip
     * ──────────────────────────────────────────────────────────────────── */
    'cardiac-cta': {
      id: 'cardiac-cta',
      title: 'Cardiac CTA — 09:30',
      scene: 'imaging',
      durationSec: 30,
      timeOfDay: '09:30 SGT',
      location: 'SGH cardiac imaging suite',
      defaultNextChapterId: 'mri-scan',
      branchPoint: {
        prompt:
          'CTA shows triple-vessel disease with high calcium score. Include cardiac MRI for myocardial viability before the family conference?',
        options: [
          {
            label: 'Yes — add cardiac MRI now',
            hint: 'Viability assessment confirms whether revascularising the LAD territory will recover function. Adds ~30 min.',
            nextChapterId: 'mri-scan',
          },
          {
            label: 'No — proceed straight to family conference',
            hint: 'Faster to the decision conversation, but the team will be reasoning without LGE viability data.',
            nextChapterId: 'family-conference',
          },
        ],
      },
      beats: [
        { at: 0, actorId: 'patient', action: 'On the CT table, sliding into the gantry for the scan.', pos: { x: 195, y: 181 }, pose: 'collapsed', expression: 'neutral' },
        { at: 0, actorId: 'imaging-radiog', action: 'Patient slides into the CT scanner. Rate control with metoprolol IV.' },
        { at: 6, actorId: 'imaging-nurse', action: 'IV contrast 60 mL Iopromide. Breath-hold instructions in Mandarin.' },
        { at: 12, actorId: 'imaging-radiog', action: 'CTA acquired: triple-vessel disease, Agatston calcium score 480.' },
        { at: 19, actorId: 'cath-cardio', action: 'Reviews CTA with the heart team on the imaging viewer.' },
        { at: 25, actorId: 'cath-cardio', action: 'Pauses: cardiac MRI for viability? Decision for the team.' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 7 (canonical) — Cardiac MRI for viability
     * ──────────────────────────────────────────────────────────────────── */
    'mri-scan': {
      id: 'mri-scan',
      title: 'Cardiac MRI — 10:05',
      scene: 'imaging',
      durationSec: 30,
      timeOfDay: '10:05 SGT',
      location: 'SGH MRI 1.5 T',
      defaultNextChapterId: 'family-conference',
      beats: [
        { at: 0, actorId: 'patient', action: 'On the MRI table — cardiac coils placed, sliding into the bore.', pos: { x: 195, y: 181 }, pose: 'collapsed', expression: 'neutral' },
        { at: 0, actorId: 'imaging-radiog', action: 'Patient on the MRI table. Cardiac coils placed.' },
        { at: 6, actorId: 'imaging-nurse', action: 'Gadolinium IV for late gadolinium enhancement.' },
        { at: 12, actorId: 'imaging-radiog', action: 'Cine, T2, late-gad sequences acquired.', showpiece: { kind: 'svg', id: 'mri-bore-slide' } },
        { at: 18, actorId: 'cath-cardio', action: 'Reviews MRI: viable myocardium in LAD territory, minimal scar.' },
        { at: 24, actorId: 'cath-cardio', action: 'Viability confirmed. PCI is meaningful. Heart team to convene.' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 8 — Family conference. Heart team explains options.
     * Branch: recommend PCI (canonical) or recommend CABG (→ surgeon-decline)
     * ──────────────────────────────────────────────────────────────────── */
    'family-conference': {
      id: 'family-conference',
      title: 'Family conference — 11:00',
      scene: 'counsel',
      durationSec: 45,
      timeOfDay: '11:00 SGT',
      location: 'SGH cardiology counselling room',
      defaultNextChapterId: 'pci-procedure',
      branchPoint: {
        prompt: 'The heart team reviews findings. Multivessel disease, viable LAD territory. What does the team recommend?',
        options: [
          {
            label: 'Proceed to PCI now (DES to LAD)',
            hint: 'Single-lesion culprit, viable myocardium, time-sensitive. Non-culprit RCA managed medically.',
            nextChapterId: 'pci-procedure',
          },
          {
            label: 'Refer for CABG (multivessel)',
            hint: 'Diabetic + multivessel pattern can favour surgery. The CT surgeon will assess candidacy.',
            nextChapterId: 'surgeon-decline',
          },
        ],
      },
      beats: [
        { at: 0, actorId: 'family-wife', action: 'Arrives, anxious. Family-son interprets quietly.', pos: { x: 300, y: 226 }, pose: 'sit', expression: 'distressed' },
        { at: 2, actorId: 'family-son', action: 'Sits beside his mother, translating quietly.', pos: { x: 350, y: 232 }, pose: 'sit', expression: 'distressed' },
        { at: 5, actorId: 'consultant-cardio', action: 'Explains anterior STEMI in plain Mandarin. Opens the angiogram on screen.', pos: { x: 150, y: 222 }, pose: 'point', expression: 'neutral' },
        { at: 13, actorId: 'consultant-cardio', action: 'Shows the LAD lesion; describes the heart-team options.', pos: { x: 150, y: 222 }, pose: 'point', expression: 'focused' },
        { at: 22, actorId: 'ct-surgeon', action: 'Reviews the angiogram on screen; weighs surgical risk against PCI.', pos: { x: 110, y: 232 }, pose: 'stand', expression: 'focused' },
        { at: 30, actorId: 'cath-cardio', action: 'Describes PCI: angioplasty + drug-eluting stent, RCA managed medically.', pos: { x: 200, y: 230 }, pose: 'stand', expression: 'neutral' },
        { at: 38, actorId: 'family-wife', action: 'Asks about risk; consultant-cardio answers. Ready to decide.', pos: { x: 300, y: 226 }, pose: 'sit', expression: 'neutral' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 9 (off-canonical) — Surgeon reviews, declines CABG, routes to PCI
     * ──────────────────────────────────────────────────────────────────── */
    'surgeon-decline': {
      id: 'surgeon-decline',
      title: 'Surgeon declines CABG — 11:20',
      scene: 'counsel',
      durationSec: 25,
      timeOfDay: '11:20 SGT',
      location: 'SGH cardiology counselling room (continued)',
      defaultNextChapterId: 'pci-procedure',
      beats: [
        { at: 0, actorId: 'ct-surgeon', action: 'Reviews SYNTAX score, EuroSCORE II, patient age 58.' },
        { at: 6, actorId: 'ct-surgeon', action: 'Declines CABG: anatomy favours PCI; surgical risk is no better.' },
        { at: 13, actorId: 'cath-cardio', action: 'Accepts the patient back for primary PCI.' },
        { at: 19, actorId: 'consultant-cardio', action: 'Re-counsels family; single-lesion PCI proceeding now.' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 10 — PCI to the LAD with drug-eluting stent
     * ──────────────────────────────────────────────────────────────────── */
    'pci-procedure': {
      id: 'pci-procedure',
      title: 'PCI to LAD — 11:45',
      scene: 'cathlab',
      durationSec: 40,
      timeOfDay: '11:45 SGT',
      location: 'SGH cath lab',
      defaultNextChapterId: 'ccu-transfer',
      beats: [
        { at: 0, actorId: 'patient', action: 'Back on the cath table for the intervention — awake, monitored.', pos: { x: 210, y: 187 }, pose: 'collapsed', expression: 'neutral' },
        { at: 0, actorId: 'cath-cardio', action: 'Back on table. Wire across the LAD lesion.' },
        { at: 7, actorId: 'cath-cardio', action: 'Pre-dilatation balloon. Lesion opens; TIMI 2 flow restored.' },
        { at: 14, actorId: 'cath-nurse', action: 'Drug-eluting stent loaded: 3.5 × 24 mm.' },
        { at: 20, actorId: 'cath-cardio', action: 'Stent deployed; post-dilatation. Final injection — TIMI 3 flow.', showpiece: { kind: 'svg', id: 'stent-deployment' } },
        { at: 28, actorId: 'cath-radiog', action: 'Total fluoro time 12 min; dose 1.2 Gy.' },
        { at: 34, actorId: 'cath-cardio', action: 'Sheath haemostasis. Patient to CCU. Door-to-balloon: 89 min.' },
        { at: 38, actorId: 'cleaner-cath', action: 'Enters with turnover trolley; next case slot already booked.', walking: true },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 11 — Transfer to Coronary Care Unit
     * ──────────────────────────────────────────────────────────────────── */
    'ccu-transfer': {
      id: 'ccu-transfer',
      title: 'CCU transfer — 12:30',
      scene: 'ward',
      durationSec: 25,
      timeOfDay: '12:30 SGT',
      location: 'SGH Coronary Care Unit',
      defaultNextChapterId: 'ward-stay',
      beats: [
        { at: 0, actorId: 'patient', action: 'Settled into the CCU bed post-PCI — drowsy, comfortable, monitored.', pos: { x: 205, y: 183 }, pose: 'collapsed', expression: 'pained' },
        { at: 0, actorId: 'ward-nurse', action: 'Receives patient. Attaches CCU monitoring; arterial line maintained.' },
        { at: 6, actorId: 'ward-mo', action: 'Clerks admission. Insulin sliding scale (newly diagnosed diabetic).' },
        { at: 12, actorId: 'ward-pharm', action: 'Medication reconciliation: ASA, ticagrelor, atorvastatin, bisoprolol, ramipril.' },
        { at: 18, actorId: 'family-wife', action: 'Visits bedside. Holds her husband\'s hand. Brief and quiet.' },
        { at: 22, actorId: 'cleaner-ward', action: 'Mid-shift wipe-down of room edges. Discreet, efficient.' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 12 — Ward stay: morning ward round, AHP team, daily routine
     * ──────────────────────────────────────────────────────────────────── */
    'ward-stay': {
      id: 'ward-stay',
      title: 'Ward 73 — day 2 morning round',
      scene: 'ward',
      durationSec: 40,
      timeOfDay: '08:30 next day',
      location: 'SGH Ward 73 · Class B2',
      defaultNextChapterId: 'complications',
      beats: [
        { at: 0, actorId: 'patient', action: 'Day 2 — sitting up in bed, chest pain settled, troponin trending down.', pos: { x: 175, y: 184 }, pose: 'sit', expression: 'relieved' },
        { at: 0, actorId: 'ward-hca', action: '07:00 — vital signs round before the doctors arrive.' },
        { at: 6, actorId: 'ward-reg', action: 'Pre-rounds: troponin trending down, ECG resolved, no chest pain overnight.' },
        { at: 12, actorId: 'ward-consultant', action: '08:30 — leads the cardiology team round. Plan: mobilise, titrate ramipril.' },
        { at: 19, actorId: 'ward-physio', action: 'Phase I rehab: mobilise to bedside chair, breathing exercises.' },
        { at: 25, actorId: 'ward-ot', action: 'Home assessment; advises energy conservation for stairs at home.' },
        { at: 31, actorId: 'ward-dietitian', action: 'Cardiac-protective diet briefing: sodium < 5 g/day, lipid education.' },
        { at: 36, actorId: 'cook-kitchen', action: 'Delivers the dietitian-ordered tray (low-salt, low-fat).' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 13 — Complications: new chest pain, dynamic ECG, escalation
     * ──────────────────────────────────────────────────────────────────── */
    'complications': {
      id: 'complications',
      title: 'Overnight chest pain — 22:30',
      scene: 'ward',
      durationSec: 35,
      timeOfDay: '22:30 day 2',
      location: 'SGH Ward 73',
      defaultNextChapterId: 'discharge',
      beats: [
        { at: 0, actorId: 'patient', action: 'New chest tightness at rest; calls for the nurse.', pos: { x: 200, y: 183 }, pose: 'collapsed', expression: 'pained' },
        { at: 5, actorId: 'ward-nurse', action: 'GTN sublingual given; repeat ECG ordered urgently.', pos: { x: 235, y: 232 }, pose: 'stand', direction: 'W', expression: 'focused' },
        { at: 11, actorId: 'ward-mo', action: 'ECG: dynamic T-wave inversion in I + aVL. Stat troponin sent.' },
        { at: 18, actorId: 'ward-reg', action: 'Calls cath-cardio overnight; non-occlusive event, manage medically.' },
        { at: 25, actorId: 'ward-pharm', action: 'Optimises ticagrelor dose; adds long-acting nitrate.' },
        { at: 30, actorId: 'ward-consultant', action: 'Next morning: pattern settled. Discharge planning in 24 h if stable.' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 14 — Discharge round + case manager + financial counselling
     * ──────────────────────────────────────────────────────────────────── */
    'discharge': {
      id: 'discharge',
      title: 'Discharge day — day 4',
      scene: 'ward',
      durationSec: 30,
      timeOfDay: '10:00 day 4',
      location: 'SGH Ward 73',
      defaultNextChapterId: 'pharmacy',
      beats: [
        { at: 0, actorId: 'patient', action: 'Day 4 — up and dressed at the bedside, ready to go home.', pos: { x: 290, y: 214 }, pose: 'stand', direction: 'W', expression: 'relieved' },
        { at: 0, actorId: 'ward-consultant', action: 'Discharge round. Medication plan, follow-up, red flags walked through.' },
        { at: 7, actorId: 'discharge-coord', action: 'Books NHCS Phase II cardiac rehab; arranges outpatient cardiology in 8 weeks.' },
        { at: 14, actorId: 'ward-pharm', action: 'Counsels on each new med; ticagrelor dyspnoea caution; bleeding precautions.' },
        { at: 21, actorId: 'admin-billing', action: 'Itemised bill: MediShield Life claim filed; MediSave drawdown; subsidy applied.' },
        { at: 26, actorId: 'cleaner-ward', action: 'Bed turnover starts as Mr Tan dresses to leave.' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 15 — Outpatient pharmacy: dispensing + counselling
     * ──────────────────────────────────────────────────────────────────── */
    pharmacy: {
      id: 'pharmacy',
      title: 'Outpatient pharmacy — collect meds',
      scene: 'pharmacy',
      durationSec: 25,
      timeOfDay: '11:30 day 4',
      location: 'SGH outpatient pharmacy',
      defaultNextChapterId: 'cardiac-rehab',
      beats: [
        { at: 0, actorId: 'patient', action: 'At the pharmacy counter with his wife to collect the discharge meds.', pos: { x: 180, y: 236 }, pose: 'stand', expression: 'relieved' },
        { at: 0, actorId: 'outpatient-pharm', action: 'Verifies prescription against discharge summary.' },
        { at: 6, actorId: 'outpatient-pharm', action: 'Dispenses 4-week supply. Walks through dose, timing, side effects.' },
        { at: 14, actorId: 'family-wife', action: 'Pays the cash portion; receipts and refill plan handed over.' },
        { at: 19, actorId: 'outpatient-pharm', action: 'Confirms next refill at the 4-week mark.' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 16 — Cardiac rehab Phase II at NHCS
     * ──────────────────────────────────────────────────────────────────── */
    'cardiac-rehab': {
      id: 'cardiac-rehab',
      title: 'Cardiac rehab — 4 weeks post-PCI',
      scene: 'rehab',
      durationSec: 35,
      timeOfDay: '09:00 · 4 weeks later',
      location: 'NHCS Phase II rehab gym',
      defaultNextChapterId: 'outpatient-review',
      beats: [
        { at: 0, actorId: 'patient', action: 'On the treadmill for the first supervised, monitored session.', pos: { x: 305, y: 192 }, pose: 'walk', walking: true, direction: 'W', expression: 'focused' },
        { at: 0, actorId: 'rehab-physio', action: 'Greets Mr Tan for the first supervised session.' },
        { at: 6, actorId: 'rehab-physio', action: '6-minute walk test: 360 m, ~4.2 METs.' },
        { at: 13, actorId: 'rehab-physio', action: 'Prescribes monitored treadmill at 70% HR reserve.' },
        { at: 20, actorId: 'rehab-physio', action: 'Borg perceived-exertion check; BP unchanged.' },
        { at: 26, actorId: 'rehab-physio', action: 'Education: smoking cessation, diet review, Healthier-SG support group.' },
        { at: 32, actorId: 'rehab-physio', action: 'Schedules an 8-week monitored programme.' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 17 — Outpatient specialist review at 8 weeks
     * ──────────────────────────────────────────────────────────────────── */
    'outpatient-review': {
      id: 'outpatient-review',
      title: 'Specialist outpatient review — 8 weeks',
      scene: 'clinic',
      durationSec: 30,
      timeOfDay: '14:00 · 8 weeks later',
      location: 'SGH cardiology clinic',
      defaultNextChapterId: 'back-of-house',
      beats: [
        { at: 0, actorId: 'patient', action: 'Seated on the exam couch for his 8-week specialist review.', pos: { x: 330, y: 186 }, pose: 'sit', direction: 'W', expression: 'relieved' },
        { at: 0, actorId: 'clinic-cardio', action: 'Reviews symptoms, exercise tolerance, medication adherence.' },
        { at: 7, actorId: 'clinic-cardio', action: 'Repeat 12-lead and echo: LVEF improved from 35% to 50%.' },
        { at: 14, actorId: 'clinic-cardio', action: 'Continues DAPT to 12 months; statin titrated.' },
        { at: 20, actorId: 'clinic-cardio', action: 'Non-culprit RCA: medical management; target LDL < 1.4 mmol/L.' },
        { at: 26, actorId: 'clinic-cardio', action: 'Books 6-month review; encourages rehab maintenance.' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter 18 (terminal epilogue) — Back of house: how support staff
     * made the journey possible. Day-in-the-life montage.
     * ──────────────────────────────────────────────────────────────────── */
    'back-of-house': {
      id: 'back-of-house',
      title: 'Back of house — a day in the life',
      scene: 'backhouse',
      durationSec: 50,
      timeOfDay: '06:00 → 22:00',
      location: 'SGH back-of-house — kitchens, laundry, billing, cath turnover',
      beats: [
        { at: 0, actorId: 'cleaner-cath', action: '06:00 — cath lab daily prep. Up to 24 turnovers per day depends on tight disinfection.' },
        { at: 6, actorId: 'cook-kitchen', action: '06:30 — first meal cycle for Ward 73. Cardiac + halal + vegetarian + diabetic variants pre-prepped.' },
        { at: 13, actorId: 'laundry-staff', action: '07:00 — Ward 73 linen par recheck; replenished ahead of daily admissions.' },
        { at: 20, actorId: 'ward-hca', action: '08:00 — vitals round before the consultant round. Patients ready for the team.' },
        { at: 27, actorId: 'cleaner-ward', action: '09:00 — daily ward clean. High-touch surfaces with chlorine wipes.' },
        { at: 34, actorId: 'cook-kitchen', action: '12:00 — lunch service. Trays out via the tea trolley.' },
        { at: 40, actorId: 'admin-billing', action: '14:00 — mid-day batch. Insurance claims filed for the day\'s discharges.' },
        { at: 46, actorId: 'laundry-staff', action: '16:00 — dirty-linen pickup. Clean linen restocked for the night shift.' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter A (off-canonical) — Patient routed to nearest A&E
     * ──────────────────────────────────────────────────────────────────── */
    'arrive-private': {
      id: 'arrive-private',
      title: 'Private A&E — 08:28',
      scene: 'resus',
      durationSec: 25,
      timeOfDay: '08:28 SGT',
      location: 'Private hospital A&E',
      defaultNextChapterId: 'secondary-transfer',
      beats: [
        { at: 0, actorId: 'patient', action: 'On the A&E trolley — anterior STEMI confirmed, awaiting transfer.', pos: { x: 250, y: 181 }, pose: 'collapsed', expression: 'pained' },
        { at: 0, actorId: 'paramedic', action: 'Alternative routing: nearest A&E. ECG handed to A&E doctor.' },
        { at: 6, actorId: 'paramedic', action: 'A&E assesses; confirms anterior STEMI; no on-site cath service.' },
        { at: 12, actorId: 'paramedic', action: 'Secondary transfer to SGH cath lab activated; second alert sent.' },
        { at: 18, actorId: 'driver', action: 'Patient reloaded into the ambulance. Lights and siren for the transfer.' },
      ],
    },

    /* ──────────────────────────────────────────────────────────────────── *
     * Chapter B (off-canonical) — Secondary transfer rejoins SGH bypass
     * ──────────────────────────────────────────────────────────────────── */
    'secondary-transfer': {
      id: 'secondary-transfer',
      title: 'Secondary transfer to SGH — 08:42',
      scene: 'street',
      durationSec: 20,
      timeOfDay: '08:42 SGT',
      location: 'En route Private → SGH',
      defaultNextChapterId: 'arrive-sgh',
      beats: [
        { at: 0, actorId: 'patient', action: 'On the stretcher for the secondary transfer to SGH.', pos: { x: 150, y: 244 }, pose: 'collapsed', expression: 'pained', onSurface: true },
        { at: 0, actorId: 'paramedic', action: 'Re-runs ECG en route; no change.' },
        { at: 5, actorId: 'driver', action: 'Pre-notifies SGH bypass bay; ETA 8 minutes.' },
        { at: 11, actorId: 'paramedic', action: 'Door-to-balloon clock now over the 90-minute target due to the detour.' },
        { at: 16, actorId: 'paramedic', action: 'Handover prepared; SGH cath team confirms readiness.' },
      ],
    },
  },
};
