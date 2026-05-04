import type { CaseDefinition } from '../../lib/types';

const NICE_OA = {
  label: 'NICE NG226 (2022) — OA management',
  body: 'NICE guideline on osteoarthritis: care and management.',
};

const MOH_VTE = {
  label: 'MOH CPG VTE Prophylaxis (2018)',
  body: 'Singapore Ministry of Health guidance on venous thromboembolism prophylaxis.',
};

const ERAS = {
  label: 'ERAS Society Hip Replacement (2020)',
  body: 'Enhanced Recovery After Surgery consensus for total hip arthroplasty.',
};

const AGEING_PLAN = {
  label: 'AIC Step-down Pathways',
  body: 'Agency for Integrated Care framework for sub-acute / community hospital transfers.',
};

export const electiveTHR: CaseDefinition = {
  id: 'elective-thr',
  title: 'Elective Total Hip Replacement — 71 y/o female, severe right hip OA',
  blurb:
    'Mdm Lim, 71, retired. Right hip OA failed conservative management. Listed for elective right THR at TTSH. Lives with her daughter.',
  category: 'elective',
  primaryFacility: 'ttsh',
  involvedFacilities: ['ttsh'],
  profileKey: 'retiredAuntie',
  allowsWardChoice: true,
  guidelines: [NICE_OA, MOH_VTE, ERAS, AGEING_PLAN],
  pathway: [
    {
      id: 'preadmission',
      department: 'soc',
      durationMin: 90,
      costSGD: 220,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 4, financialWorry: 6 },
      framing: {
        patient:
          'You sit through ECG, bloods, and a long counselling session. The orthopaedic nurse is patient. You sign the consent form, hand still trembling.',
        caregiver:
          'You took a half-day to drive Mum here. The nurse hands you a checklist of things to bring on admission day.',
        staff:
          'Pre-admission clinic: ECG normal, Hb 12.4, eGFR 78, MRSA swab sent. Anaesthetist clears her — ASA 2.',
      },
      decision: {
        id: 'preop-medication-rec',
        prompt:
          'She is on aspirin 100 mg OD (primary prevention only) and bisoprolol for HTN. What do you advise pre-operatively?',
        weight: 1,
        reference: ERAS,
        options: [
          {
            id: 'stop-asa-cont-bb',
            label:
              'Stop aspirin 7 days pre-op (primary prevention only); continue bisoprolol with morning sip of water.',
            score: 10,
            rationale:
              'For primary-prevention aspirin without CV indication, stopping pre-op reduces bleeding without ischaemic harm. Continuing beta-blocker peri-op is class I in cardiac patients.',
            outcome: {
              patient: 'You write down the new instructions and tape them to the kitchen wall.',
              caregiver: 'Helps Mum mark the calendar with the stop date.',
              staff: 'Anaesthetist agrees, plan documented.',
            },
          },
          {
            id: 'continue-asa',
            label: 'Continue aspirin and bisoprolol up to surgery.',
            score: 4,
            rationale:
              'Acceptable in many centres for low-bleeding-risk surgery, but THR has higher transfusion risk. Defensible but suboptimal.',
            outcome: { patient: '', caregiver: '', staff: 'Surgeon prefers to stop ASA in primary prevention; flagged on round.' },
          },
          {
            id: 'stop-bb',
            label: 'Stop both aspirin and bisoprolol on the morning of surgery.',
            score: -4,
            rationale:
              'Stopping beta-blockers abruptly raises peri-op cardiac event risk (POISE).',
            outcome: { patient: '', caregiver: '', staff: 'Anaesthesia rejects plan.' },
          },
        ],
      },
    },
    {
      id: 'admission',
      department: 'entrance',
      durationMin: 30,
      framing: {
        patient: 'You arrive before 7am. The reception lady recognises you from last week.',
        caregiver: 'You hold the bag with her toiletries. The lift takes a long time.',
        staff: 'Patient registered, NEHR pulled, anaesthetic chart ready.',
      },
    },
    {
      id: 'ward-preop',
      department: 'ward',
      durationMin: 60,
      costSGD: 220,
      charge: 'inpatient-ward',
      caregiverBurden: { timeOffWorkHours: 6, financialWorry: 14, sleepDebt: 4 },
      framing: {
        patient: 'A nurse marks an arrow on your right thigh with a permanent marker.',
        caregiver: 'They ask you to wait downstairs at the family lounge once she goes in.',
        staff: 'WHO surgical safety checklist done, antibiotics charted, group-and-cross-match available.',
      },
      decision: {
        id: 'subsidy-class',
        prompt:
          'Mdm Lim is a Merdeka Generation citizen, per-capita household income S$950/mo, no IP rider. The MSW asks about ward class.',
        weight: 1,
        reference: AGEING_PLAN,
        options: [
          {
            id: 'class-c',
            label: 'Class C (highest subsidy ~85% with PG/MG top-up).',
            score: 10,
            rationale:
              'Means-test plus Merdeka Generation top-up gives the highest subsidy. Same surgeon, same prosthesis, same outcomes.',
            outcome: {
              patient: 'A 6-bedder cubicle. The auntie next bed offers you biscuits.',
              caregiver: 'You sigh — the bill estimate is manageable.',
              staff: 'MSW pleased; bill estimate ~S$2,200 patient share.',
            },
          },
          {
            id: 'class-b2',
            label: 'Class B2 (substantial subsidy ~65%).',
            score: 7,
            rationale:
              'Reasonable for a 4-bedder; still subsidised. Higher OOP than Class C without clinical benefit.',
            outcome: {
              patient: 'A 4-bedder, slightly more privacy.',
              caregiver: 'You squint at the bill estimate but it works.',
              staff: 'MSW notes Class C would have been cheaper.',
            },
          },
          {
            id: 'class-b1',
            label: 'Class B1 (modest subsidy ~20%).',
            score: 3,
            rationale: 'No clinical benefit, significantly higher OOP. Often chosen for amenity reasons only.',
            outcome: { patient: '', caregiver: '', staff: 'Family willing; MSW counsels on cost.' },
          },
          {
            id: 'class-a',
            label: 'Class A (no subsidy, single room).',
            score: -3,
            rationale: 'Punishing for a low-income MG senior with no IP rider. Avoidable financial toxicity.',
            outcome: { patient: 'A single room, but the bill at discharge is shocking.', caregiver: 'You consider Medifund application.', staff: 'MSW unhappy.' },
          },
        ],
      },
    },
    {
      id: 'ot',
      department: 'ot',
      durationMin: 110,
      costSGD: 6800,
      charge: 'inpatient-procedure',
      caregiverBurden: { timeOffWorkHours: 4, financialWorry: 16, sleepDebt: 12 },
      framing: {
        patient: 'A bright light. Someone says count backwards from ten. You don\'t make it past seven.',
        caregiver: 'You wait in the family lounge with your phone on silent. A volunteer offers tea.',
        staff: 'Spinal + light sedation. Posterior approach right THR, cementless cup, ceramic-on-PE bearing.',
      },
      decision: {
        id: 'vte-prophylaxis',
        prompt:
          'Surgery uneventful, EBL 350 mL. What VTE prophylaxis do you start post-op?',
        weight: 1,
        reference: MOH_VTE,
        options: [
          {
            id: 'lmwh',
            label: 'Mechanical (calf pumps) + LMWH (enoxaparin 40 mg SC OD) for 28–35 days.',
            score: 10,
            rationale:
              'Standard of care for THR. Extended chemoprophylaxis beats in-hospital-only regimens; mechanical adds incremental benefit.',
            outcome: {
              patient: 'A small jab on the abdomen each evening. You learn to do it yourself by day 3.',
              caregiver: 'You help with the injection at home for the first week.',
              staff: 'Plan charted; pharmacy delivers home LMWH supply.',
            },
          },
          {
            id: 'asa-only',
            label: 'Aspirin 100 mg OD + mechanical only.',
            score: 5,
            rationale:
              'Increasingly accepted for low-risk THR (PEPPER trial). Acceptable but less common locally for high-risk profiles; this patient is 71.',
            outcome: { patient: 'Just one tablet a day.', caregiver: '', staff: 'Surgeon accepts in selected patients; this patient borderline.' },
          },
          {
            id: 'mechanical-only',
            label: 'Mechanical (calf pumps) only.',
            score: -3,
            rationale:
              'Inadequate for THR; misses chemoprophylaxis benefit, raises symptomatic VTE rate.',
            outcome: { patient: '', caregiver: '', staff: 'Consultant queries the omission.' },
          },
        ],
      },
    },
    {
      id: 'ward-postop',
      department: 'ward',
      durationMin: 4320, // 3 days
      costSGD: 1400,
      charge: 'inpatient-ward',
      caregiverBurden: { timeOffWorkHours: 18, financialWorry: 10, sleepDebt: 14 },
      framing: {
        patient: 'Day 2: you stand for the first time. The physio holds your elbow. Tears, but you walk three steps.',
        caregiver: 'You bring her favourite porridge from home. She finishes half and smiles for the first time in days.',
        staff: 'POD2 — mobilised with frame, Hb 9.2 (no transfusion needed), wound clean.',
      },
      decision: {
        id: 'discharge-destination',
        prompt:
          'POD3, mobilising with a frame, pain controlled, lives in a 5th-floor walk-up with stairs at the void deck. Where does she go next?',
        weight: 1.5,
        reference: AGEING_PLAN,
        options: [
          {
            id: 'community-rehab',
            label:
              'Transfer to a community hospital (St Luke\'s / Ren Ci / OCH) for 2–3 weeks of inpatient rehab.',
            score: 10,
            rationale:
              'Step-down rehab for older adults with stairs at home reduces 90-day readmission and improves functional independence (TOC, AIC pathways).',
            outcome: {
              patient: 'You move to St Luke\'s. The physio there is encouraging. You begin to climb stairs.',
              caregiver: 'You get some sleep. The community-hospital social worker calls you with a plan.',
              staff: 'Bed booked at St Luke\'s; AIC referral submitted; NEHR records flow.',
            },
          },
          {
            id: 'home-therapy',
            label:
              'Discharge home with home-care therapy and a follow-up SOC review in 2 weeks.',
            score: 4,
            rationale:
              'Possible if family support is robust and home is wheelchair-accessible — but a 5th-floor walk-up with stairs is unsafe at this stage.',
            outcome: {
              patient: 'You go home. The first stairs feel insurmountable.',
              caregiver: 'You take 2 weeks unpaid leave. You worry about falls.',
              staff: 'PT/OT visit scheduled; risk of fall flagged.',
            },
          },
          {
            id: 'discharge-no-rehab',
            label: 'Discharge home with no rehab pathway.',
            score: -5,
            rationale:
              'High readmission risk, poor functional outcome, caregiver collapse.',
            outcome: { patient: 'A fall on day 5 at home; readmitted with dislocation.', caregiver: 'You blame yourself.', staff: 'Avoidable readmission.' },
          },
        ],
      },
    },
    {
      id: 'community-hospital',
      department: 'rehab',
      durationMin: 28800, // ~20 days
      costSGD: 2800,
      charge: 'community-hospital',
      caregiverBurden: { timeOffWorkHours: -6, financialWorry: 6, sleepDebt: -10 },
      framing: {
        patient: 'Mornings: physio. Afternoons: rest. Evenings: a volunteer reads the paper to you.',
        caregiver: 'You visit on weekends. You watch your mother climb six steps unaided. You cry quietly.',
        staff: 'Rehab progressing — TUG improved, independent transfers, stairs ×6 with rail.',
      },
    },
    {
      id: 'discharge',
      department: 'discharge',
      durationMin: 30,
      framing: {
        patient: 'The Grab driver helps you with the bag. Home smells of home.',
        caregiver: 'You take the rest of the afternoon off. You both eat porridge in silence.',
        staff: 'Discharge summary uploaded; HCA home-care nurse to visit in 3 days; SOC at 6 weeks.',
      },
    },
  ],
};
