import type { CaseDefinition } from '../../lib/types';

const ACP = {
  label: 'AIC Advance Care Planning (Singapore)',
  body: 'Agency for Integrated Care framework for advance care planning conversations.',
};

const SPC = {
  label: 'Singapore Palliative Care CPG',
  body: 'Local clinical practice guidance on adult palliative symptom control and end-of-life pathways.',
};

const HOME_HOSPICE = {
  label: 'HCA / SHC Home Hospice Standards',
  body: 'Home hospice service standards including 24/7 telephone support, anticipatory medication boxes, and bereavement follow-up.',
};

export const palliativeEndOfLife: CaseDefinition = {
  id: 'palliative-eol',
  title: { en: 'Advanced metastatic lung cancer — end-of-life pathway', zh: '晚期转移性肺癌 — 临终关怀路径' },
  blurb:
    'Mr Tan, 67. Stage IV NSCLC, on 3rd-line therapy, increasing dyspnoea and cachexia. Brought to TTSH ED at 2am with severe breathlessness. Wife and son frightened.',
  category: 'acute',
  primaryFacility: 'ttsh',
  involvedFacilities: ['ttsh', 'amkh', 'hca', 'home'],
  profileKey: 'taxiDriver',
  allowsWardChoice: true,
  guidelines: [ACP, SPC, HOME_HOSPICE],
  pathway: [
    {
      id: 'ed-arrival',
      department: 'ed',
      facility: 'ttsh',
      durationMin: 60,
      costSGD: 320,
      charge: 'a&e',
      caregiverBurden: { timeOffWorkHours: 6, financialWorry: 8, sleepDebt: 14 },
      framing: {
        patient: '(Sitting forward, mouth open, knuckles white on the sides of the trolley.)',
        caregiver: 'You wonder if this is it. Your son cries silently in the corner.',
        staff: 'Stage IV NSCLC, KPS 50, on osimertinib. SpO2 89% on RA → 94% on 2L. Mild fluid in pleural effusion on lung US.',
      },
      decision: {
        id: 'aim-of-care',
        prompt:
          "ACP on file: 'no escalation to ICU; comfort-focused, prefers home or hospice'. NEHR-stored. What do you do?",
        weight: 1.5,
        reference: ACP,
        options: [
          {
            id: 'comfort-care',
            label:
              "Honour the ACP. Symptom-focused care: low-flow O2, opioid for dyspnoea, anxiolytic. Engage palliative team and AIC for hospice / home transition.",
            score: 10,
            rationale:
              'Following a documented ACP is the central principle. Comfort-focused care reduces ICU days at end of life and improves caregiver bereavement outcomes.',
            outcome: {
              patient: '(A small dose of morphine; eyes soften within 20 minutes.)',
              caregiver: 'You exhale for the first time in two hours.',
              staff: 'Pall care team paged; AIC notified for community-hospital or hospice routing.',
            },
          },
          {
            id: 'full-escalation',
            label: 'Intubate, central line, ICU admission for full life-prolonging care.',
            score: -10,
            rationale:
              'Directly contradicts a clear ACP. Causes harm and prolongs suffering; legal and ethical breach.',
            outcome: { patient: '', caregiver: 'Family devastated.', staff: 'Critical incident; legal review.' },
          },
          {
            id: 'discharge-home',
            label: 'Reassure and discharge home with a GP follow-up letter.',
            score: -6,
            rationale:
              'Severely symptomatic; no plan for symptom control or anticipatory care; high risk of re-attendance and crisis death at home.',
            outcome: { patient: '', caregiver: '', staff: 'Re-presents within 12h in distress.' },
          },
        ],
      },
    },
    {
      id: 'ttsh-symptom-control',
      department: 'ward',
      facility: 'ttsh',
      durationMin: 2880,
      costSGD: 1100,
      charge: 'inpatient-ward',
      caregiverBurden: { timeOffWorkHours: 12, financialWorry: 8, sleepDebt: -4 },
      framing: {
        patient: '(Quieter today. Eats half a bowl of porridge. Asks his wife about the cat.)',
        caregiver: 'You sleep on the recliner beside him. The nurse brings you a blanket.',
        staff: 'Pall care team review: subcut PRN morphine + midazolam; bowel care; spiritual care request received.',
      },
      decision: {
        id: 'place-of-care',
        prompt:
          'Symptoms now controlled on subcut PRN. Patient and family prefer home if possible; some hesitation about caregiver capacity.',
        weight: 1.5,
        reference: HOME_HOSPICE,
        options: [
          {
            id: 'home-hospice',
            label:
              'Discharge home with HCA Home Hospice; anticipatory medication box + 24/7 phone line; respite admission booked at AMKH if needed.',
            score: 10,
            rationale:
              'Home hospice with structured 24/7 support and a respite plan respects preferences while protecting against caregiver burnout.',
            outcome: {
              patient: '(Home. The window of his bedroom faces east; he watches the morning light.)',
              caregiver: 'A home-hospice nurse visits in 18 hours and teaches you the syringe driver.',
              staff: 'HCA enrolment activated; AMKH respite slot held; NEHR updated.',
            },
          },
          {
            id: 'inpatient-hospice',
            label: 'Direct transfer to Dover Park Hospice.',
            score: 8,
            rationale:
              'Reasonable if home is not feasible. Inpatient hospice provides excellent symptom control but loses preference for home.',
            outcome: {
              patient: '(A new room. Quiet.)',
              caregiver: 'You visit daily; you sleep at home.',
              staff: 'DPH admits; care plan handed over.',
            },
          },
          {
            id: 'community-hospital',
            label: 'Transfer to AMKH (community hospital) for ongoing palliative care without home plan.',
            score: 6,
            rationale:
              "Acceptable — VWO community hospitals provide palliative beds. Doesn't actualise the home preference but ensures expert symptom control.",
            outcome: { patient: '', caregiver: 'You worry about going home.', staff: 'AMKH bed booked.' },
          },
          {
            id: 'wait-and-see',
            label: 'Continue inpatient management at TTSH indefinitely.',
            score: 2,
            rationale:
              'Acute hospital not the right environment for prolonged EOL care; high cost, lower quality of life.',
            outcome: { patient: '', caregiver: 'Family stressed by hospital noise.', staff: 'Bed-day cost mounts.' },
          },
        ],
      },
    },
    {
      id: 'home-hospice-period',
      department: 'ward',
      facility: 'home',
      durationMin: 14400, // ~10 days
      costSGD: 320,
      charge: 'community-hospital',
      caregiverBurden: { timeOffWorkHours: 60, financialWorry: 6, sleepDebt: 22 },
      framing: {
        patient: '(In his own bed. The cat sleeps by his feet most afternoons.)',
        caregiver: 'You set up a routine. The hospice nurse calls each morning and visits twice a week. You get used to the syringe driver.',
        staff: 'HCA visits 3x/week; symptoms stable on subcut driver; family supported with bereavement counsellor introduction.',
      },
    },
    {
      id: 'final-days',
      department: 'ward',
      facility: 'home',
      durationMin: 4320,
      caregiverBurden: { timeOffWorkHours: 24, financialWorry: 0, sleepDebt: 12 },
      framing: {
        patient: '(Mostly sleeping; brief moments of recognition; squeezes his wife\'s hand at the right moments.)',
        caregiver: 'You play his favourite Teresa Teng songs softly. Your son flies back from KL.',
        staff: 'HCA on-call; anticipatory medications given at appropriate times; family briefed on changes to expect.',
      },
      decision: {
        id: 'crisis-call',
        prompt:
          "At 3am the patient becomes restless and tachypnoeic. Family panics and considers calling 995. What's the home-hospice plan?",
        weight: 1.2,
        reference: HOME_HOSPICE,
        options: [
          {
            id: 'phone-line',
            label:
              'Use the 24/7 home-hospice phone line; on-call team advises subcut midazolam from the anticipatory box; nurse visits within an hour.',
            score: 10,
            rationale:
              'Anticipatory medications + 24/7 support are designed exactly for this moment. Avoids unwanted ambulance transfer to ED at end of life.',
            outcome: {
              patient: '(Settles within 15 minutes; breathing softens.)',
              caregiver: 'You both cry, but quietly, holding his hands.',
              staff: 'Nurse arrives at 4am; vigil supported.',
            },
          },
          {
            id: 'call-995',
            label: '995 to TTSH ED.',
            score: -3,
            rationale:
              'Avoidable ambulance ride and ED attendance at the very end of life; contradicts the plan and patient\'s wishes.',
            outcome: { patient: '', caregiver: 'Stress of strangers and bright lights.', staff: 'ED palliative review and return home, but trauma incurred.' },
          },
          {
            id: 'no-action',
            label: 'Do nothing; hope it passes.',
            score: -2,
            rationale: 'Symptom control needed; family distress not addressed.',
            outcome: { patient: '(Distressed for hours.)', caregiver: 'Traumatic memory.', staff: 'Quality of dying compromised.' },
          },
        ],
      },
    },
    {
      id: 'after-death',
      department: 'discharge',
      facility: 'home',
      durationMin: 60,
      caregiverBurden: { timeOffWorkHours: 8, financialWorry: -4, sleepDebt: -10 },
      framing: {
        patient: '(Peaceful at home with his wife and son holding his hands.)',
        caregiver: 'You sit for an hour before calling anyone. The morning is quiet.',
        staff: 'Home-hospice nurse confirms death; certifies via teleconsult per protocol; bereavement support kicks in.',
      },
      decision: {
        id: 'bereavement',
        prompt: "What's the post-death plan for the family?",
        weight: 1,
        reference: ACP,
        options: [
          {
            id: 'structured-bereavement',
            label: 'Structured bereavement: HCA bereavement counsellor at week 2, week 6, month 6; GP follow-up for the spouse.',
            score: 10,
            rationale:
              'Bereavement is a recognised health outcome. Spouses of cancer decedents have higher mortality / morbidity in the year after; structured support reduces this.',
            outcome: {
              patient: '',
              caregiver: 'You are not alone afterwards. You see your GP about your sleep.',
              staff: 'Bereavement schedule activated; spouse risk-flagged on NEHR.',
            },
          },
          {
            id: 'ad-hoc',
            label: 'Hand over to family; ad-hoc support if requested.',
            score: 5,
            rationale: "Acceptable but doesn't capture spouses who silently struggle.",
            outcome: { patient: '', caregiver: 'You manage; sometimes you don\'t.', staff: 'No flag.' },
          },
          {
            id: 'no-followup',
            label: 'No bereavement follow-up.',
            score: -3,
            rationale: 'Misses preventable spouse morbidity.',
            outcome: { patient: '', caregiver: 'You isolate.', staff: 'Spouse re-presents 6 months later with depression.' },
          },
        ],
      },
    },
  ],
};
