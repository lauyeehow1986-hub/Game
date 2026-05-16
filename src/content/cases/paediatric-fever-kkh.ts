import type { CaseDefinition } from '../../lib/types';

const NICE_FEBRILE = {
  label: 'NICE NG143 — Fever in under 5s',
  body: 'NICE guideline on assessment and initial management of fever in young children.',
};

const KKH_PEWS = {
  label: 'KKH Paediatric Early Warning Score',
  body: 'KK Hospital paediatric early warning score and escalation pathway.',
};

const MOH_HEALTHIER_SG = {
  label: 'MOH Healthier SG',
  body: 'Right-siting paediatric chronic / well-child care to a primary-care provider.',
};

export const paediatricFeverKKH: CaseDefinition = {
  id: 'paeds-fever-kkh',
  title: { en: 'Febrile Toddler — 18 mo with fever for 3 days, lethargy', zh: '发热幼儿 — 18个月,持续发烧3天,精神倦怠' },
  blurb:
    'Aaisha, 18 months. Fever 39.6°C for 3 days, off feeds, parents brought her to the polyclinic at 8am where the nurse advised KKH Children\'s Emergency.',
  category: 'acute',
  primaryFacility: 'kkh',
  involvedFacilities: ['shp-tampines', 'kkh'],
  profileKey: 'taxiDriver', // proxy household profile for financing
  allowsWardChoice: false,
  guidelines: [NICE_FEBRILE, KKH_PEWS, MOH_HEALTHIER_SG],
  pathway: [
    {
      id: 'polyclinic',
      department: 'gp-room',
      facility: 'shp-tampines',
      durationMin: 30,
      costSGD: 70,
      charge: 'polyclinic',
      caregiverBurden: { timeOffWorkHours: 4, financialWorry: 4, sleepDebt: 8 },
      framing: {
        patient: '(non-verbal — restless, flushed cheeks, refusing the bottle)',
        caregiver:
          "She's been crying since 4am. The polyclinic doctor measures her temperature, frowns, and writes a referral letter to KKH.",
        staff:
          'Polyclinic FP: T 39.6, HR 165, cap refill 3s, lethargic between cries. Refers immediately to KKH CE.',
      },
    },
    {
      id: 'kkh-arrival',
      department: 'entrance',
      facility: 'kkh',
      durationMin: 5,
      framing: {
        patient: '(carried in arms)',
        caregiver: 'You queue at the Children\'s Emergency reception. The receptionist scans the referral.',
        staff: 'Triage nurse acknowledges referral; ushers family into paediatric triage.',
      },
    },
    {
      id: 'kkh-triage',
      department: 'triage',
      facility: 'kkh',
      durationMin: 10,
      framing: {
        patient: '(wails when finger-prick)',
        caregiver: 'You hold her tiny hand while the nurse measures everything again.',
        staff: 'PEWS calculated: HR 168, RR 38, T 39.4, SpO2 96%, alert when stimulated. PEWS = 4.',
      },
      decision: {
        id: 'pews-action',
        prompt:
          'PEWS 4 with lethargy and prolonged fever. What is your next step?',
        weight: 1.5,
        reference: KKH_PEWS,
        options: [
          {
            id: 'urgent-resus',
            label:
              'Move to resus / acute observation; FBC + CRP + blood culture + urine MC&S; antipyretic; IV access.',
            score: 10,
            rationale:
              'PEWS ≥ 4 with lethargy in a child < 3y warrants urgent escalation. Septic screen with blood culture before antibiotics is standard. Urine MC&S is essential — UTI is a leading cause of fever without source in this age group.',
            outcome: {
              patient: '(IV cannula goes in. Cries. Then quietens with mum.)',
              caregiver: 'You watch four staff move around her. You feel both scared and looked after.',
              staff: 'Resus bay opened. Bloods sent. Paeds reg paged.',
            },
          },
          {
            id: 'paracetamol-discharge',
            label: 'Give paracetamol, observe for 30 min, send home if afebrile.',
            score: -8,
            rationale:
              'Misses occult bacteraemia / UTI / meningitis. NICE traffic-light "amber" features (no smile, dry mucous membranes) require senior review and investigations.',
            outcome: { patient: '', caregiver: '', staff: 'Returns 6 hours later in shock.' },
          },
          {
            id: 'admit-but-no-screen',
            label: 'Admit to ward without septic screen.',
            score: 3,
            rationale:
              'Safer than discharge but delays diagnosis. Blood and urine cultures should be sent before any antibiotic.',
            outcome: { patient: '', caregiver: '', staff: 'Senior reg orders the screen on the ward.' },
          },
        ],
      },
    },
    {
      id: 'kkh-resus',
      department: 'ed',
      facility: 'kkh',
      durationMin: 90,
      costSGD: 280,
      charge: 'a&e',
      caregiverBurden: { timeOffWorkHours: 2, financialWorry: 8, sleepDebt: 6 },
      framing: {
        patient: '(latched on to a small bottle of dilute apple juice; tearful but feeding)',
        caregiver: 'You haven\'t eaten since dinner last night. A volunteer brings you a sandwich.',
        staff: 'Bloods: WBC 18.4 (neutrophilic), CRP 92. Urine dip: leuks 3+, nitrites +. UTI presumed.',
      },
      decision: {
        id: 'empirical-abx',
        prompt:
          'Urine dip strongly positive. Catheter-specimen-of-urine sent for MC&S. What empirical antibiotic do you start?',
        weight: 1.2,
        reference: NICE_FEBRILE,
        options: [
          {
            id: 'iv-cefotaxime',
            label: 'IV cefotaxime (or ceftriaxone) — admit for 48–72h IV cover, then step down to oral.',
            score: 10,
            rationale:
              'Standard in pyelonephritis < 3y. Local Singapore E. coli sensitivity supports 3rd-gen cephalosporin first-line; switch to oral once afebrile and tolerating feeds.',
            outcome: {
              patient: '(IV antibiotic running. Drifts to sleep on mum.)',
              caregiver: 'You finally exhale.',
              staff: 'Admitted to paeds ward. Renal US scheduled if recurrent.',
            },
          },
          {
            id: 'oral-augmentin',
            label: 'Oral co-amoxiclav at home; review in 48h.',
            score: 2,
            rationale:
              'Acceptable for older children with pyelonephritis but a lethargic 18-month-old with PEWS 4 should receive IV in-hospital therapy.',
            outcome: { patient: '', caregiver: '', staff: 'Senior overrules — admits.' },
          },
          {
            id: 'no-abx-await-cultures',
            label: 'Await culture sensitivities before starting antibiotics.',
            score: -6,
            rationale:
              'Delaying antibiotics in a clinically septic child of this age increases bacteraemia / pyelonephritis morbidity.',
            outcome: { patient: '', caregiver: '', staff: 'Worsens over 12h; converted to broad-spectrum.' },
          },
        ],
      },
    },
    {
      id: 'kkh-ward',
      department: 'ward',
      facility: 'kkh',
      durationMin: 4320,
      costSGD: 1100,
      charge: 'inpatient-ward',
      caregiverBurden: { timeOffWorkHours: 24, financialWorry: 12, sleepDebt: 22 },
      framing: {
        patient: '(playing with a soft toy by day 2; afebrile)',
        caregiver: 'You sleep on the foldout bed beside her cot. Hospital nights are loud.',
        staff: 'Day 2 — afebrile 24h, feeding, urine culture: E. coli sensitive. Step-down to oral co-amoxiclav.',
      },
    },
    {
      id: 'kkh-discharge',
      department: 'discharge',
      facility: 'kkh',
      durationMin: 30,
      framing: {
        patient: '(running circles around the discharge nurse, wearing only a nappy)',
        caregiver: 'You\'re tired but laughing for the first time in days.',
        staff: 'Discharge summary uploaded; SHP follow-up arranged; renal US booked.',
      },
      decision: {
        id: 'followup-plan',
        prompt:
          'First febrile UTI in an 18-month-old girl with E. coli on urine culture. What follow-up plan?',
        weight: 1,
        reference: NICE_FEBRILE,
        options: [
          {
            id: 'rus-mcug',
            label:
              'Renal ultrasound during admission, MCUG only if recurrent / atypical; SOC review at 6 weeks; right-site to SHP for general well-child after.',
            score: 10,
            rationale:
              'NICE recommends ultrasound for atypical / recurrent UTIs in this age group; routine MCUG no longer first-line. Right-siting to polyclinic / GP supports Healthier SG.',
            outcome: {
              patient: '(running back and forth in the corridor; wholly recovered)',
              caregiver: 'You add the polyclinic appointment to your phone.',
              staff: 'NEHR records visible to SHP; vaccinations confirmed up to date.',
            },
          },
          {
            id: 'soc-only',
            label: 'KKH SOC quarterly indefinitely.',
            score: 4,
            rationale:
              'Specialist time better used for atypical / recurrent UTIs. Stable post-UTI children should return to primary care.',
            outcome: { patient: '', caregiver: 'Repeated half-days off work.', staff: 'SOC slots squeezed.' },
          },
          {
            id: 'no-followup',
            label: 'No structured follow-up.',
            score: -4,
            rationale:
              'Misses occult VUR / recurrent UTI which can drive renal scarring.',
            outcome: { patient: '', caregiver: '', staff: 'Re-presents with a 2nd UTI 6 months later.' },
          },
        ],
      },
    },
  ],
};
