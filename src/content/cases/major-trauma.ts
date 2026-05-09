import type { CaseDefinition } from '../../lib/types';

const ATLS = {
  label: 'ATLS 10th Edition',
  body: 'Advanced Trauma Life Support: ABCDE primary survey, FAST, massive haemorrhage protocol.',
};

const SCDF_TRAUMA = {
  label: 'SCDF Trauma Protocol',
  body: 'Pre-hospital trauma routing — direct transport to a major trauma centre when haemodynamically unstable.',
};

const TXA = {
  label: 'CRASH-2 / SG Trauma CPG',
  body: 'Tranexamic acid within 3h of injury for actively bleeding trauma patients.',
};

export const majorTraumaCase: CaseDefinition = {
  id: 'major-trauma',
  title: 'Motorcycle accident — 28 y/o, blunt abdominal trauma',
  blurb:
    'Mr Lim, 28. Motorcycle vs taxi at Holland Road junction. Helmeted but thrown ~6 m. Unstable obs at scene. SCDF on scene with crew of 3.',
  category: 'acute',
  primaryFacility: 'sgh',
  involvedFacilities: ['scdf', 'sgh'],
  profileKey: 'taxiDriver',
  allowsWardChoice: true,
  guidelines: [ATLS, SCDF_TRAUMA, TXA],
  pathway: [
    {
      id: 'on-scene',
      department: 'treatment-room',
      facility: 'scdf',
      durationMin: 12,
      caregiverBurden: { timeOffWorkHours: 2, financialWorry: 6, sleepDebt: 6 },
      framing: {
        patient: '(Pale; abdomen tender; GCS 14.)',
        caregiver: '(not yet aware — wife is at work.)',
        staff: 'SCDF: BP 92/60, HR 118, SpO2 95% RA. Helmet on, no LOC reported. C-spine immobilised.',
      },
      decision: {
        id: 'destination',
        prompt: 'SCDF destination decision: nearest centre is NUH; major trauma centre is SGH.',
        weight: 1.5,
        reference: SCDF_TRAUMA,
        options: [
          {
            id: 'sgh-trauma',
            label: 'Bypass nearest; transport direct to SGH major trauma centre with pre-notification.',
            score: 10,
            rationale:
              'Singapore protocol routes haemodynamically unstable blunt trauma to a major trauma centre with full surgical / IR / neurosurgical capability.',
            outcome: { patient: '(blue light to SGH.)', caregiver: 'A friend calls his wife.', staff: 'SGH trauma team activated; OT and IR on standby.' },
          },
          {
            id: 'nuh-nearest',
            label: 'Nearest hospital (NUH) for stabilisation.',
            score: 5,
            rationale: 'Reasonable if patient peri-arrest; otherwise direct routing to a designated trauma centre is preferred.',
            outcome: { patient: '', caregiver: '', staff: 'Stabilised then transferred — incurs an extra 45 min.' },
          },
          {
            id: 'long-route',
            label: 'Drive to a private hospital his insurance prefers.',
            score: -10,
            rationale: 'Private hospitals do not run trauma teams at this acuity; pure delay.',
            outcome: { patient: '', caregiver: '', staff: 'Refuses transfer at private; loses time.' },
          },
        ],
      },
    },
    {
      id: 'sgh-trauma-bay',
      department: 'ed',
      facility: 'sgh',
      durationMin: 25,
      costSGD: 480,
      charge: 'a&e',
      caregiverBurden: { timeOffWorkHours: 6, financialWorry: 14, sleepDebt: 8 },
      framing: {
        patient: '(BP 84/52 on arrival. Confused.)',
        caregiver: 'Wife arrives 15 min in; led to a quiet relatives\' room.',
        staff: 'Trauma team: ABCDE; FAST positive — free fluid Morrison\'s pouch + pelvis. Activate massive haemorrhage protocol.',
      },
      decision: {
        id: 'damage-control',
        prompt: 'FAST positive, hypotensive. What now?',
        weight: 1.5,
        reference: ATLS,
        options: [
          {
            id: 'mhp-tranexamic-ot',
            label:
              'Massive haemorrhage protocol: 1:1:1 blood + plasma + platelets, tranexamic acid 1g, straight to OT for damage-control laparotomy.',
            score: 10,
            rationale:
              'Damage-control surgery for an unstable abdomen. CRASH-2 supports TXA within 3h. Crystalloid-only resus is harmful.',
            outcome: { patient: '(in OT in 22 min.)', caregiver: 'You watch the door close.', staff: 'OT booked; blood arriving in coolers.' },
          },
          {
            id: 'ct-first',
            label: 'Stabilise with crystalloid; CT trauma series first.',
            score: 3,
            rationale:
              'CT acceptable in haemodynamically responsive patients but unsafe in persistent hypotension.',
            outcome: { patient: '', caregiver: '', staff: 'Patient deteriorates en route to CT.' },
          },
          {
            id: 'crystalloid-only',
            label: 'Aggressive crystalloid resuscitation; no blood products yet.',
            score: -8,
            rationale:
              'Worsens dilutional coagulopathy and hypothermia; current trauma practice is balanced product resuscitation.',
            outcome: { patient: '', caregiver: '', staff: 'Coagulopathy worsens.' },
          },
        ],
      },
    },
    {
      id: 'damage-control-ot',
      department: 'ot',
      facility: 'sgh',
      durationMin: 90,
      costSGD: 14500,
      charge: 'inpatient-procedure',
      caregiverBurden: { timeOffWorkHours: 4, financialWorry: 18, sleepDebt: 6 },
      framing: {
        patient: '(intubated, sedated.)',
        caregiver: 'You see the surgeon afterwards. He looks tired but says it went OK.',
        staff: 'Splenectomy + pelvic packing; abdomen left open with VAC for second look.',
      },
    },
    {
      id: 'ct-icu',
      department: 'icu',
      facility: 'sgh',
      durationMin: 4320,
      costSGD: 8400,
      charge: 'icu',
      caregiverBurden: { timeOffWorkHours: 32, financialWorry: 14, sleepDebt: 26 },
      framing: {
        patient: '(Stable on D2; second-look laparotomy planned.)',
        caregiver: 'Family meeting in the SICU. You meet the social worker.',
        staff: 'D2: stable; warmed; coags corrected; second-look D3; abdomen closed.',
      },
    },
    {
      id: 'ward-rehab',
      department: 'ward',
      facility: 'sgh',
      durationMin: 7200,
      costSGD: 1300,
      charge: 'inpatient-ward',
      caregiverBurden: { timeOffWorkHours: 16, financialWorry: 8, sleepDebt: -4 },
      framing: {
        patient: '(walking with a frame on D7; deep breath still painful.)',
        caregiver: 'You learn to dress the surgical wound at the kitchen table.',
        staff: 'Stable; pneumovax + meningococcal post-splenectomy; trauma psychology referral.',
      },
      decision: {
        id: 'discharge-plan',
        prompt: 'Discharge planning for a young splenectomised trauma survivor with PTSD risk.',
        weight: 1,
        reference: ATLS,
        options: [
          {
            id: 'rehab-and-psych',
            label: 'OCH inpatient rehab → home; vaccinations done; trauma psychology referral; GP for splenectomy lifelong care.',
            score: 10,
            rationale: 'Functional + psychological recovery + lifelong infection prophylaxis education.',
            outcome: { patient: '', caregiver: '', staff: 'AIC referral submitted.' },
          },
          {
            id: 'home-no-rehab',
            label: 'Home directly; no rehab; outpatient surgical review only.',
            score: 4,
            rationale: 'Misses functional + psychological recovery opportunity.',
            outcome: { patient: '', caregiver: 'You manage; sometimes you don\'t.', staff: '' },
          },
        ],
      },
    },
  ],
};
