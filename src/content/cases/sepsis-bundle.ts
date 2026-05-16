import type { CaseDefinition } from '../../lib/types';

const SSC = {
  label: 'Surviving Sepsis Campaign 2021',
  body: 'International guidance: hour-1 bundle, lactate, broad-spectrum antibiotics within 1h, fluids, vasopressors.',
};

const SG_AMS = {
  label: 'MOH Antimicrobial Stewardship',
  body: 'Singapore primary-care and hospital antimicrobial stewardship — early de-escalation once cultures return.',
};

const NEWS = {
  label: 'NEWS2 / qSOFA',
  body: 'Acute deterioration scoring; trigger sepsis pathway and ICU referral.',
};

export const sepsisCase: CaseDefinition = {
  id: 'sepsis-bundle',
  title: { en: 'Severe sepsis — 73 y/o auntie, fever and confusion', zh: '严重脓毒症 — 73岁阿姨,发烧伴神志不清' },
  blurb:
    'Mdm Lim, 73, retired, frail. Fever + confusion at the void deck this morning; family carried her to a Healthway GP. GP triaged her to the nearest ED at KTPH.',
  category: 'acute',
  primaryFacility: 'ktph',
  involvedFacilities: ['gp-healthway', 'scdf', 'ktph', 'ych'],
  profileKey: 'retiredAuntie',
  allowsWardChoice: true,
  randomiseProfile: true,
  acuteTimer: {
    goalMin: 60,
    goalLabel: 'Antibiotic by',
    missedFlag: 'abx-delayed',
  },
  guidelines: [SSC, SG_AMS, NEWS],
  pathway: [
    {
      id: 'gp-recognises',
      department: 'gp-room',
      facility: 'gp-healthway',
      durationMin: 15,
      costSGD: 65,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 2, financialWorry: 4, sleepDebt: 4 },
      framing: {
        patient: '(Drowsy, mumbling. T 39.1, BP 96/58.)',
        caregiver: 'You take her in and the GP\'s face changes when he sees her.',
        staff: 'GP: qSOFA 2 (RR 24, AMS), T 39.1, hypotensive. Calls 995.',
      },
      decision: {
        id: 'recognise-route',
        prompt: 'GP triage: confused, hypotensive, febrile elderly woman. What now?',
        weight: 1.5,
        reference: NEWS,
        options: [
          {
            id: '995-blue-light',
            label: 'Activate 995 with sepsis pre-notification; oxygen + 500 mL crystalloid bolus en route.',
            score: 10,
            rationale:
              'Pre-hospital recognition + ED pre-notification + early fluids meaningfully shorten time-to-antibiotics.',
            outcome: { patient: '(IV up; saline running.)', caregiver: 'You ride along.', staff: 'Pre-notification arrives at KTPH ED 4 min before patient.' },
          },
          {
            id: 'taxi',
            label: 'Family takes her by Grab to KTPH ED.',
            score: 3,
            rationale: 'Plausible if EMS not available, but loses pre-hospital time and pre-notification.',
            outcome: { patient: '(jolting along the PIE.)', caregiver: 'You arrive without warning to triage.', staff: 'Triage P1 only after registration.' },
          },
          {
            id: 'observe-clinic',
            label: 'Observe in clinic; antipyretic and IV fluids only.',
            score: -8,
            rationale: 'Sepsis with end-organ dysfunction needs ED resus, not GP observation.',
            outcome: { patient: '', caregiver: '', staff: 'Deteriorates; eventual transfer too late.' },
          },
        ],
      },
    },
    {
      id: 'ed-resus',
      department: 'ed',
      facility: 'ktph',
      durationMin: 30,
      costSGD: 320,
      charge: 'a&e',
      caregiverBurden: { timeOffWorkHours: 4, financialWorry: 6, sleepDebt: 8 },
      framing: {
        patient: '(O2 mask on, IV cannula in, blood draws.)',
        caregiver: 'You wait outside the resus bay. The senior nurse keeps you informed.',
        staff: 'BP 90/52, HR 118, SpO2 92% RA → 95% on 4L. Lactate 4.6. WBC 18, CRP 240. Urine dip leucs +ve.',
      },
      decision: {
        id: 'hour-1-bundle',
        prompt: 'Lactate 4.6, urinary source likely. What do you do in the first hour?',
        weight: 1.5,
        reference: SSC,
        options: [
          {
            id: 'full-bundle',
            label:
              'Cultures (blood + urine) → broad-spectrum antibiotics within 1h (e.g. piperacillin-tazobactam) → 30 mL/kg crystalloid → re-measure lactate.',
            score: 10,
            rationale:
              'Hour-1 bundle is the cornerstone of early sepsis care; each hour\'s delay in antibiotics raises mortality.',
            outcome: { patient: '(antibiotic running by 38 min from arrival.)', caregiver: 'You hold her hand.', staff: 'Bundle complete; ICU paged.' },
          },
          {
            id: 'antibiotics-first-skip-cultures',
            label: 'Give antibiotics first; skip cultures.',
            score: 5,
            rationale: 'Saves time but loses microbiology — harder to de-escalate later.',
            outcome: { patient: '', caregiver: '', staff: 'Stewardship audit hit.' },
            effects: { setFlags: ['no-cultures'] },
          },
          {
            id: 'wait-for-cultures',
            label: 'Wait for blood cultures and lactate to return before any antibiotics.',
            score: -8,
            rationale: 'Delaying antibiotics in hypotensive sepsis raises mortality; do not wait.',
            outcome: { patient: '', caregiver: '', staff: 'BP drops further before antibiotics.' },
            effects: { setFlags: ['abx-delayed', 'septic-deterioration'] },
          },
        ],
      },
    },
    {
      id: 'icu-admission',
      department: 'icu',
      facility: 'ktph',
      durationMin: 4320,
      costSGD: 6800,
      charge: 'icu',
      caregiverBurden: { timeOffWorkHours: 24, financialWorry: 18, sleepDebt: 28 },
      framing: {
        patient: '(Norepinephrine running. Sedated. Family on Zoom each evening.)',
        caregiver: 'You sleep at home but you don\'t really sleep.',
        staff: 'ICU course: vasopressors weaned by D3; antibiotic de-escalated to ceftriaxone after sensitivities. Mild AKI resolving.',
      },
      decision: {
        id: 'subsidy-class',
        prompt: 'Means-test eligible (MG card, low income, no IP rider). Ward class for step-down ward?',
        weight: 0.8,
        reference: SSC,
        options: [
          { id: 'class-c', label: 'Class C.', score: 10, rationale: 'Best subsidy + MG top-up.', outcome: { patient: '', caregiver: 'Affordable.', staff: 'MSW pleased.' }, effects: { wardClass: 'C' } },
          { id: 'class-b2', label: 'Class B2.', score: 6, rationale: 'Reasonable; smaller subsidy.', outcome: { patient: '', caregiver: '', staff: 'OK.' }, effects: { wardClass: 'B2' } },
          { id: 'class-a', label: 'Class A.', score: -3, rationale: 'No clinical benefit; financial harm.', outcome: { patient: '', caregiver: 'You apply for Medifund later.', staff: 'MSW counsels.' }, effects: { wardClass: 'A', setFlags: ['financial-distress'], caregiverBurden: { financialWorry: 24 } } },
        ],
      },
    },
    {
      id: 'septic-shock-deterioration',
      department: 'icu',
      facility: 'ktph',
      requiresAnyFlag: ['septic-deterioration', 'abx-delayed'],
      durationMin: 240,
      costSGD: 4200,
      charge: 'icu',
      caregiverBurden: { timeOffWorkHours: 8, financialWorry: 12, sleepDebt: 24 },
      framing: {
        patient: '(intubated; lactate 8; on noradrenaline + vasopressin.)',
        caregiver: 'You are warned to expect the worst overnight. The chaplain visits.',
        staff: 'Refractory septic shock. Hour-1 deviation amplifies mortality risk.',
      },
      decision: {
        id: 'shock-rescue',
        prompt: 'Refractory shock despite 60 mL/kg fluid + dual vasopressor. What now?',
        weight: 1.5,
        reference: SSC,
        options: [
          {
            id: 'broaden-and-hydro',
            label: 'Broaden antibiotics (add anti-pseudomonal cover); hydrocortisone 200 mg/day; source-control review.',
            score: 10,
            rationale: 'Standard escalation in refractory shock.',
            outcome: { patient: '', caregiver: '', staff: '' },
            effects: { clearFlags: ['septic-deterioration'] },
          },
          {
            id: 'palliate-now',
            label: 'Withdraw escalation; palliate.',
            score: -4,
            rationale: 'Premature without senior + family discussion or trial of corticosteroid + source control.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
        ],
      },
    },
    {
      id: 'step-down-ward',
      department: 'ward',
      facility: 'ktph',
      durationMin: 5760,
      costSGD: 1100,
      charge: 'inpatient-ward',
      caregiverBurden: { timeOffWorkHours: 12, financialWorry: 4, sleepDebt: -6 },
      framing: {
        patient: '(Eating, mobilising with frame, asking for kopi.)',
        caregiver: 'She tells you off for not bringing her hairbrush.',
        staff: 'Day 5: stable; complete 7-day antibiotic; physio for ICU-acquired weakness; geriatric review for frailty.',
      },
    },
    {
      id: 'community-step-down',
      department: 'rehab-gym',
      facility: 'ych',
      durationMin: 14400,
      costSGD: 1800,
      charge: 'community-hospital',
      caregiverBurden: { timeOffWorkHours: -8, financialWorry: 4, sleepDebt: -10 },
      framing: {
        patient: '(Stronger by day 7. The therapist is younger than your son.)',
        caregiver: 'You sleep through the night for the first time.',
        staff: 'YCH rehab: 2 weeks of frailty rehab; AIC enrolled for home modifications; smoke alarm fitted.',
      },
      decision: {
        id: 'home-with-support',
        prompt: 'Discharge plan?',
        weight: 1,
        reference: SSC,
        options: [
          { id: 'home-gp-sg', label: 'Home with home-care, AH@Home virtual ward, Healthier-SG GP enrolment.', score: 10, rationale: 'Best continuity for frail seniors; reduces 30-day readmission.', outcome: { patient: '', caregiver: 'Less travel.', staff: 'NEHR populated.' } },
          { id: 'soc-only', label: 'Geriatric SOC at KTPH only.', score: 4, rationale: 'Specialist time better used for complex cases.', outcome: { patient: '', caregiver: '', staff: '' } },
          { id: 'no-followup', label: 'No follow-up.', score: -4, rationale: 'High readmission risk in frail seniors.', outcome: { patient: '', caregiver: '', staff: '' } },
        ],
      },
    },
  ],
};
