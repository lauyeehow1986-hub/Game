/**
 * STEMI walkthrough — canonical scrubbable cinematic of a Singapore patient's
 * journey from out-of-hospital cardiac arrest through PCI and rehab.
 *
 * v9.4 ships the foundation (chapters 1–2 + a branch-point demo). Subsequent
 * versions (v9.5 → v9.9) extend the chapter list per ROADMAP.md.
 *
 * English-first; i18n keys for the title / role / action strings will be
 * added when the v10.0 multilingual capstone lands.
 */
import type { Walkthrough } from './walkthrough';

export const stemiWalkthrough: Walkthrough = {
  id: 'stemi-pathway-v1',
  title: 'STEMI — full patient journey',
  startChapterId: 'collapse',
  actors: {
    'patient': {
      id: 'patient',
      role: 'Mr Tan, 58',
      team: 'patient',
      bio: 'A 58-year-old retired SBS bus driver. No prior cardiac history. Collapses outside a coffee shop on his morning kopi run.',
      swatch: '#3aa6ff',
    },
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
    'paramedic': {
      id: 'paramedic',
      role: 'SCDF paramedic',
      team: 'ambulance',
      bio: 'SCDF Advanced Care Paramedic. Runs the 12-lead ECG in the ambulance and transmits the STEMI alert to the receiving hospital.',
      swatch: '#f87171',
    },
    'driver': {
      id: 'driver',
      role: 'SCDF EA driver',
      team: 'ambulance',
      bio: 'Emergency Ambulance driver. Routes via the optimal corridor and pre-notifies the ED for blue-call triage.',
      swatch: '#fb923c',
    },
    'support-cleaner': {
      id: 'support-cleaner',
      role: 'Coffee shop attendant',
      team: 'support',
      bio: 'Coffee shop attendant who clears the area around the patient and keeps onlookers back so the CFR can work. Singapore CPR culture in action.',
      swatch: '#94a3b8',
    },
  },
  chapters: {
    /* Chapter 1 — Collapse + bystander CPR + CFR with AED. */
    collapse: {
      id: 'collapse',
      title: 'Collapse — 08:15 at Bras Basah',
      durationSec: 30,
      timeOfDay: '08:15 SGT',
      location: 'Bras Basah kopitiam',
      defaultNextChapterId: 'ambulance',
      beats: [
        { at: 0, actorId: 'patient', action: 'Walking to the kopi counter — clutches chest, collapses.', focus: { x: 0.5, y: 0.55 } },
        { at: 2, actorId: 'bystander', action: 'Sees the collapse, shouts for help, dials 995.' },
        { at: 4, actorId: 'support-cleaner', action: 'Clears tables and keeps onlookers back so the area is safe.' },
        { at: 6, actorId: 'bystander', action: 'On 995: dispatcher confirms cardiac arrest. Starts hands-only CPR.' },
        { at: 10, actorId: 'patient', action: 'Pulseless. Receiving chest compressions at 100–120 / min.' },
        { at: 14, actorId: 'cfr', action: 'myResponder ping accepted — arrives with PAD AED from 280 m away.' },
        { at: 18, actorId: 'cfr', action: 'AED pads on. Shock advised. Stand clear, shock delivered.' },
        { at: 22, actorId: 'cfr', action: 'CPR resumed. Second cycle.' },
        { at: 26, actorId: 'patient', action: 'Return of spontaneous circulation. Groaning. Pulse palpable.' },
      ],
    },

    /* Chapter 2 — Ambulance arrival, ECG, hospital pre-notification. */
    ambulance: {
      id: 'ambulance',
      title: 'Ambulance on scene — 08:24',
      durationSec: 28,
      timeOfDay: '08:24 SGT',
      location: 'On scene — Bras Basah Road',
      branchPoint: {
        prompt:
          'The 12-lead shows anterior STEMI. The nearest centres differ on cath-lab readiness. Where does this patient go?',
        options: [
          {
            label: 'SGH — primary PCI centre, 6 min away, cath team activated',
            hint: 'STEMI network destination. Goes straight to the cath lab, bypassing the ED resus bay.',
            nextChapterId: 'arrive-sgh',
          },
          {
            label: 'Nearest A&E (private hospital) — 3 min away, no on-site cath',
            hint: 'Faster door, but the patient will need a secondary transfer that delays reperfusion.',
            nextChapterId: 'arrive-private',
          },
        ],
      },
      beats: [
        { at: 0, actorId: 'paramedic', action: 'Arrives with EA. Hands over from CFR — ROSC, GCS 12.' },
        { at: 3, actorId: 'driver', action: 'Sets up the stretcher and clears the route to the EA.' },
        { at: 5, actorId: 'paramedic', action: '12-lead ECG: ST elevation V1–V4. Calls STEMI alert.' },
        { at: 10, actorId: 'paramedic', action: 'IV access established. Aspirin 300 mg PO loaded.' },
        { at: 14, actorId: 'driver', action: 'Patient loaded. Code 3 transport. Pre-notifies receiving hospital.' },
        { at: 18, actorId: 'paramedic', action: 'En route: O2 maintained, BP 102 / 64, HR 88. ECG re-checked.' },
        { at: 24, actorId: 'paramedic', action: 'Cath team activation confirmed. ETA 4 minutes.' },
      ],
    },

    /* Chapter 3a (branch A) — SGH cath-lab fast-track. Placeholder stub. */
    'arrive-sgh': {
      id: 'arrive-sgh',
      title: 'SGH cath lab fast-track — coming v9.5',
      durationSec: 8,
      timeOfDay: '08:32 SGT',
      location: 'SGH cath lab',
      beats: [
        { at: 0, actorId: 'paramedic', action: 'Handover to interventional cardiologist. Patient on the cath table.' },
        { at: 4, actorId: 'paramedic', action: '(Full chapter content arrives in v9.5 — see ROADMAP.md.)' },
      ],
    },

    /* Chapter 3b (branch B) — private hospital + secondary transfer. */
    'arrive-private': {
      id: 'arrive-private',
      title: 'Private A&E + secondary transfer — coming v9.5',
      durationSec: 8,
      timeOfDay: '08:28 SGT',
      location: 'Private hospital A&E',
      beats: [
        { at: 0, actorId: 'paramedic', action: 'Patient unloaded at the A&E. Door-to-balloon clock now in jeopardy.' },
        { at: 4, actorId: 'paramedic', action: '(Full chapter content arrives in v9.5 — see ROADMAP.md.)' },
      ],
    },
  },
};
