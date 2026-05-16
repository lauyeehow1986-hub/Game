import type { CaseDefinition } from '../../lib/types';

const NEHR_RULES = {
  label: 'MOH National Electronic Health Record (NEHR)',
  body: 'NEHR participation is mandatory for restructured public providers; voluntary for private and primary-care providers.',
};

const RIGHT_SITING = {
  label: 'MOH Right-Siting / Healthier SG',
  body: 'Stable disease should be managed at the appropriate care setting; transfers between sectors require complete records hand-over.',
};

const RIBA = {
  label: 'NCCN / SG Renal CPG',
  body: 'Workup of suspected renal mass: dedicated CT urogram or MR urogram, urine cytology, urology referral.',
};

export const privateToPublicHandover: CaseDefinition = {
  id: 'private-to-public-handover',
  title: { en: 'Renal Mass — private → public handover with hand-carry CD', zh: '肾占位 — 私立转公立移交,患者自携影像光盘' },
  blurb:
    'Mr Tan, 58 (Healthway Medical CHAS Orange GP). Routine private-clinic ultrasound for low back pain incidentally found a 4 cm right renal mass. Private radiologist recommended CT urogram, then escalation to a urologist. He transfers to subsidised SGH urology to manage costs. The CT report and images live on the private radiology PACS — not on NEHR.',
  category: 'outpatient',
  primaryFacility: 'gp-healthway',
  involvedFacilities: ['gp-healthway', 'asia-medic', 'sgh', 'home', 'gp-healthway'],
  profileKey: 'taxiDriver',
  allowsWardChoice: true,
  guidelines: [NEHR_RULES, RIGHT_SITING, RIBA],
  pathway: [
    {
      id: 'gp-incidental-finding',
      department: 'gp-room',
      facility: 'gp-healthway',
      durationMin: 25,
      costSGD: 65,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 1, financialWorry: 6 },
      framing: {
        patient: 'You came for back pain. The doctor mentions something on the scan you don\'t fully understand.',
        caregiver: 'You re-read the report at home. The phrase "complex cystic mass" is on the second page.',
        staff: 'Healthway GP: Bosniak III renal lesion on US incidental. Recommend CT urogram + urology.',
      },
      decision: {
        id: 'next-step-imaging',
        prompt:
          'Where to send him for the CT urogram and urology consult?',
        weight: 1.5,
        reference: NEHR_RULES,
        options: [
          {
            id: 'private-ct-then-public-soc',
            label:
              'Asia Medic for private CT urogram (fast), then subsidised SGH urology SOC referral.',
            score: 7,
            rationale:
              "Pragmatic: private imaging is quick and the bulk of cost (treatment) goes through subsidised pathway. But the private CT will sit on a CD — not NEHR — so the patient must hand-carry images / report to SGH.",
            outcome: {
              patient: 'You go to Asia Medic for the scan. The private radiologist explains carefully.',
              caregiver: 'You collect a CD and a printed report. The receptionist puts them in a paper bag.',
              staff: 'CT report + images on CD; referral letter generated.',
            },
          },
          {
            id: 'public-imaging-and-soc',
            label:
              'Subsidised SGH urology SOC referral; let SGH order their own CT under cluster lab/PACS.',
            score: 9,
            rationale:
              'Cleanest record-flow pathway. CT and clinic both in NEHR; nothing for the patient to hand-carry. Slightly slower turnaround.',
            outcome: {
              patient: 'You wait 3-4 weeks for the slot.',
              caregiver: 'You worry but trust the system.',
              staff: 'SGH urology accepts; CT booked in their slot.',
            },
          },
          {
            id: 'private-everything',
            label: 'Continue private at Mt Elizabeth Novena urology end-to-end.',
            score: 4,
            rationale:
              'Fast and continuous, but full private rate; no MAF subsidy if treatment escalates.',
            outcome: { patient: 'A consult next week.', caregiver: 'You worry about the bill.', staff: 'Acceptable; cost discussed.' },
          },
          {
            id: 'no-followup',
            label: 'Reassure, repeat US in 6 months.',
            score: -8,
            rationale: 'Bosniak III lesion needs urgent characterisation — surveillance only is inappropriate.',
            outcome: { patient: '', caregiver: '', staff: 'Returns 1y later with a 6 cm mass.' },
          },
        ],
      },
    },
    {
      id: 'private-ct',
      department: 'imaging',
      facility: 'asia-medic',
      durationMin: 60,
      costSGD: 950,
      charge: 'imaging',
      caregiverBurden: { timeOffWorkHours: 3, financialWorry: 14 },
      framing: {
        patient: 'A new place. The radiographer explains the contrast injection. Your arm warms briefly.',
        caregiver: 'You collect the CD and report on the way out — you don\'t know if it\'s the original.',
        staff: 'Triphasic CT urogram performed; report concludes likely Bosniak IV cystic RCC right kidney.',
      },
    },
    {
      id: 'home-prep',
      department: 'discharge',
      facility: 'home',
      durationMin: 60,
      framing: {
        patient: 'You hold the CD case in your hand. You read the report twice.',
        caregiver: 'You photograph every page; you take the CD to your laptop and check it opens.',
        staff: '(care coordinator: this is the moment data flow can fail — physical media + memory rather than NEHR.)',
      },
      decision: {
        id: 'records-handover-strategy',
        prompt:
          'Day before SGH appointment. CT not on NEHR. What do you advise the patient bring / arrange?',
        weight: 1.5,
        reference: NEHR_RULES,
        options: [
          {
            id: 'cd-plus-photos-plus-portal',
            label:
              "Bring CD + paper report + photographs of the report; ask Healthway to upload referral letter to NEHR; check HealthHub on arrival.",
            score: 10,
            rationale:
              'Belt-and-braces. CD is sometimes unreadable on hospital workstations; photographs as backup; uploading the referral letter via HealthHub or memo ensures the receiving clinician has at least the structured findings.',
            outcome: {
              patient: 'You arrive prepared.',
              caregiver: 'You feel less anxious.',
              staff: 'The reg loads the CD on the second workstation that accepts it; everything fits.',
            },
          },
          {
            id: 'cd-only',
            label: 'Bring the CD only; trust SGH to load it.',
            score: 4,
            rationale:
              'Often works but sometimes the disc is unreadable; if SGH cannot load images they may need to repeat the CT — duplication of cost and radiation.',
            outcome: {
              patient: 'CD won\'t load on the first workstation.',
              caregiver: 'You feel embarrassed.',
              staff: 'IT support paged; eventually loads on a different machine.',
            },
          },
          {
            id: 'verbal-only',
            label: 'Trust verbal hand-over.',
            score: -4,
            rationale: 'Loss of detail; inevitable repeat imaging at unnecessary cost.',
            outcome: { patient: '', caregiver: '', staff: 'CT repeated at SGH; financial and radiation burden.' },
          },
        ],
      },
    },
    {
      id: 'sgh-soc-visit',
      department: 'soc',
      facility: 'sgh',
      durationMin: 75,
      costSGD: 220,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 4, financialWorry: 6, sleepDebt: 4 },
      framing: {
        patient: 'A different building. Different smell. The doctor pulls up images you brought on a CD.',
        caregiver: 'You sit through the discussion. Every minute counts.',
        staff: 'SGH urology: reviews private CT (now on cluster PACS via CD import), confirms Bosniak IV. Plans for partial nephrectomy + MDT review.',
      },
      decision: {
        id: 'subsidy-class-soc',
        prompt: 'Eligible for subsidised SGH care. He has CHAS Orange. Ward class for inpatient stay?',
        weight: 0.8,
        reference: RIGHT_SITING,
        options: [
          {
            id: 'class-c',
            label: 'Class C (highest subsidy).',
            score: 10,
            rationale: 'Best fit given income and CHAS tier.',
            outcome: { patient: '', caregiver: 'You exhale.', staff: 'MSW happy.' },
          },
          {
            id: 'class-b1',
            label: 'Class B1.',
            score: 4,
            rationale: 'Reasonable; smaller subsidy.',
            outcome: { patient: '', caregiver: '', staff: 'OK.' },
          },
        ],
      },
    },
    {
      id: 'right-sited-back-to-gp',
      department: 'discharge',
      facility: 'gp-healthway',
      durationMin: 30,
      framing: {
        patient: 'After surgery and recovery, you come back to the same clinic for follow-up bloods.',
        caregiver: 'You bring the SGH discharge summary along — easier than relying on it pinging through.',
        staff: 'Healthway GP receives discharge summary by email; updates patient record. NEHR pulls SGH segments.',
      },
      decision: {
        id: 'continuity',
        prompt:
          'Surveillance plan: post-partial-nephrectomy follow-up. How to share data?',
        weight: 1,
        reference: NEHR_RULES,
        options: [
          {
            id: 'shared-care-with-nehr',
            label:
              'Shared care: SGH urology surveillance imaging quarterly → annual; GP for chronic disease + repeat bloods. Patient enrolled in HealthHub for personal record copy.',
            score: 10,
            rationale:
              'NEHR captures SGH segments; HealthHub gives the patient a personal copy he can show his GP. GP records remain offline but the SGH records are viewable to him.',
            outcome: {
              patient: 'You learn to log in.',
              caregiver: 'You set up his account.',
              staff: 'Everything visible to GP through patient or NEHR.',
            },
          },
          {
            id: 'soc-only',
            label: 'SGH SOC only; GP doesn\'t need to know.',
            score: 4,
            rationale: 'Misses chronic disease management; fragmented.',
            outcome: { patient: '', caregiver: '', staff: 'BP / cholesterol drift.' },
          },
        ],
      },
    },
  ],
};
