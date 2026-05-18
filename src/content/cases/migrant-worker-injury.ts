import type { CaseDefinition } from '../../lib/types';

const MOM_WICA = {
  label: 'MOM Work Injury Compensation Act (WICA)',
  body: 'Employer must report work injuries within 10 days; insurer pays medical leave wages, medical expenses, and lump-sum for permanent incapacity. Workers cannot sue employer if WICA claim is filed.',
};

const FWMI = {
  label: 'MOM Foreign Worker Medical Insurance (FWMI)',
  body: 'Employers must purchase ≥ S$60,000/year medical insurance per Work Permit / S Pass holder. Covers inpatient care up to limit; outpatient is employer-paid. From Jul 2023 employer co-pay applies for the first S$15,000.',
};

const ATLS = {
  label: 'ATLS 10th — Spinal precautions',
  body: 'Immobilise suspected spinal injuries with rigid collar + log-roll; imaging by CT in adults with mechanism, neurology, or distracting injury. Avoid unnecessary plain films before CT in significant mechanism.',
};

const NEXUS = {
  label: 'NEXUS / Canadian C-Spine Rule',
  body: 'Clinical decision rules to exclude clinically significant cervical-spine injury without imaging in alert, non-intoxicated patients with no midline tenderness, no neurology, and no dangerous mechanism.',
};

export const migrantWorkerInjuryCase: CaseDefinition = {
  id: 'migrant-worker-injury',
  title: {
    en: 'Construction fall — migrant worker, FWMI + WICA pathway',
    zh: '工地坠落 — 客工,FWMI与工伤赔偿路径',
  },
  blurb:
    'Mr Hossain, 34, falls 2m from scaffolding at a Bukit Merah BTO site. Conscious, complaining of lower-back pain and right-ankle pain. Employer foreman calls. Site clinic is 5 minutes away; NUH ED is 8 minutes by ambulance.',
  category: 'acute',
  primaryFacility: 'nuh',
  involvedFacilities: ['scdf', 'nuh', 'ah', 'home', 'workplace-health'],
  profileKey: 'migrantWorker',
  allowsWardChoice: false,
  guidelines: [MOM_WICA, FWMI, ATLS, NEXUS],
  pathway: [
    {
      id: 'site-triage',
      department: 'triage',
      facility: 'workplace-health',
      durationMin: 8,
      framing: {
        patient: 'Your colleagues lay you flat on the dusty ground; the foreman is on the phone in Bengali and English.',
        caregiver: 'Your wife is in Bangladesh; the WhatsApp group at the dorm starts pinging.',
        staff: 'Foreman: "He fell from second level. He moved his legs. Back hurts." Mechanism is significant.',
      },
      decision: {
        id: 'site-disposition',
        prompt: 'Initial site decision?',
        weight: 1.5,
        reference: ATLS,
        options: [
          {
            id: 'scdf-spinal',
            label:
              'Call 995 (SCDF EMS) with spinal precautions; keep him flat; collar if available; do NOT let him walk.',
            score: 10,
            rationale:
              "Significant mechanism + axial pain → assume spinal injury until imaging clears it. SCDF can immobilise and transport. Site clinic isn't equipped for spinal imaging.",
            outcome: {
              patient: 'SCDF arrives in 7 minutes. A collar goes on; you are scooped onto a board.',
              caregiver: '',
              staff: 'EMS departs NUH ED, pre-alerts trauma team.',
            },
            effects: { setFlags: ['scdf-activated'] },
          },
          {
            id: 'private-ambulance',
            label: 'Call employer\'s contracted private ambulance to bring him to the site clinic for review.',
            score: 4,
            rationale:
              'Slower for a possible spinal injury; clinic cannot CT the spine. Employer may prefer this to control billing — but clinically wrong here.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
          {
            id: 'walk-in',
            label: 'Two colleagues help him walk to the site clinic; assess there first.',
            score: -8,
            rationale: 'Movement of an unstable spine risks catastrophic cord injury. Never let a suspected spinal injury walk.',
            outcome: { patient: '', caregiver: '', staff: 'Foreman ignored the spinal mechanism.' },
            effects: { setFlags: ['mobilised-unsafely'] },
          },
        ],
      },
    },
    {
      id: 'nuh-ed',
      department: 'ed',
      facility: 'nuh',
      durationMin: 45,
      costSGD: 380,
      charge: 'a&e',
      framing: {
        patient: 'Bright lights. A nurse asks your full name, work permit number, and employer.',
        caregiver: '',
        staff:
          'NUH ED: GCS 15, BP 132/84, HR 96, SpO2 99%. Tender L1 area, no neurology, painful right-ankle eversion. NEXUS positive for midline tenderness.',
      },
      decision: {
        id: 'imaging-choice',
        prompt: 'Imaging strategy?',
        weight: 1.5,
        reference: ATLS,
        options: [
          {
            id: 'ct-spine-ankle-xr',
            label:
              'CT thoracolumbar spine + plain right-ankle radiographs. Mobilise off the board only after CT clears.',
            score: 10,
            rationale:
              'CT is the modality of choice for adult trauma spine with significant mechanism + tenderness. Plain ankle film is appropriate before CT-ing every joint.',
            outcome: {
              patient: 'The scanner is loud; they explain in Bengali via an interpreter line.',
              caregiver: '',
              staff: 'CT: stable L1 wedge compression fracture, < 25% loss of height, no canal compromise. Ankle: lateral malleolus avulsion.',
            },
            effects: { setFlags: ['l1-wedge-fracture'] },
          },
          {
            id: 'plain-films-only',
            label: 'Plain films of T-L spine + ankle; reserve CT only if plain films abnormal.',
            score: 3,
            rationale:
              'Plain films miss occult vertebral injury and add radiation if you end up CT-ing anyway. NICE / ATLS prefer CT for significant mechanism.',
            outcome: { patient: '', caregiver: '', staff: 'Plain T-L film reported "no fracture"; symptoms persist.' },
            effects: { setFlags: ['delayed-diagnosis'] },
          },
          {
            id: 'mri-first',
            label: 'MRI whole spine + ankle MRI now.',
            score: 0,
            rationale: 'MRI is for spinal-cord injury / ligamentous concern; not the first-line for bony spinal trauma. Slow and expensive.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
          {
            id: 'discharge-clinical',
            label: 'Discharge with analgesia; clinical follow-up by site clinic.',
            score: -10,
            rationale: 'Missed unstable spinal injury risks paralysis. Standard of care requires imaging here.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
        ],
      },
    },
    {
      id: 'admission-choice',
      department: 'ward',
      facility: 'nuh',
      durationMin: 4320,
      costSGD: 1800,
      charge: 'inpatient-ward',
      requiresAnyFlag: ['l1-wedge-fracture'],
      caregiverBurden: { timeOffWorkHours: 12, financialWorry: 18 },
      framing: {
        patient: '',
        caregiver: '',
        staff:
          'L1 wedge fracture, neurologically intact, stable on CT. Plan: TLSO brace, mobilise within 48h, 3-day admission.',
      },
      decision: {
        id: 'admit-class',
        prompt:
          'Worker is a foreigner: no MShL, no MediSave, no subsidy. How to bill the admission?',
        weight: 1.4,
        reference: FWMI,
        options: [
          {
            id: 'fwmi-direct-bill',
            label:
              'Admit Class C ward; bill the employer\'s FWMI insurer directly (Letter of Guarantee from employer).',
            score: 10,
            rationale:
              'FWMI requires the employer to insure for ≥ S$60,000/year. Direct billing avoids the worker paying out-of-pocket. Class C is the cheapest ward — keeps the FWMI claim within limits.',
            outcome: {
              patient: 'A six-bed room. The dorm WhatsApp group sends prayers.',
              caregiver: '',
              staff: 'FWMI claim opened; LoG faxed by employer HR.',
            },
            effects: { wardClass: 'C', setFlags: ['fwmi-direct-bill'] },
          },
          {
            id: 'private-class-b1',
            label: 'Admit Class B1 — employer can claim later if they wish.',
            score: 4,
            rationale:
              'B1 is far more expensive at full private rate. May exhaust the FWMI cap on a single admission and leave the worker liable for the excess if the employer disputes.',
            outcome: { patient: '', caregiver: '', staff: '' },
            effects: { wardClass: 'B1' },
          },
          {
            id: 'worker-pays-cash',
            label: 'Bill the worker directly; he can recover from the employer later.',
            score: -6,
            rationale:
              'WICA Section 14 says employer is liable for medical expenses for work injuries. Demanding payment from the worker undermines the protection MOM built. Also impractical — worker has no MediSave.',
            outcome: { patient: '', caregiver: 'You stop sleeping; your wife sends you the family savings.', staff: '' },
            effects: { caregiverBurden: { financialWorry: 25, sleepDebt: 20 } },
          },
        ],
      },
    },
    {
      id: 'discharge-mc',
      department: 'discharge',
      facility: 'nuh',
      durationMin: 60,
      requiresAnyFlag: ['l1-wedge-fracture'],
      framing: {
        patient: 'You can sit, walk a few steps in the brace. The MC paper is in your hand.',
        caregiver: '',
        staff: 'Discharge: TLSO brace 8 weeks, no lifting > 5 kg, follow-up at ortho-spine SOC in 2 weeks.',
      },
      decision: {
        id: 'medical-leave',
        prompt: 'Medical leave (MC) duration + MOM reporting?',
        weight: 1.3,
        reference: MOM_WICA,
        options: [
          {
            id: 'mc-21d-wica',
            label:
              '21-day MC; employer must file MOM iReport within 10 days; insurer pays MC wages at 2/3 average earnings.',
            score: 10,
            rationale:
              'WICA-compliant. > 3 days MC + work injury triggers mandatory employer notification to MOM. Worker gets 2/3 wages during MC, 100% of medical bills via insurer.',
            outcome: {
              patient: 'You go back to the dorm in a brace, with a fan and a copy of the MC.',
              caregiver: '',
              staff: 'iReport filed; insurer claim pending.',
            },
            effects: { setFlags: ['wica-filed'] },
          },
          {
            id: 'mc-3d-pressure',
            label: 'Give 3 days MC only — employer asked to "keep it short". Worker can come back on light duties.',
            score: -7,
            rationale:
              'Pressuring a clinically inadequate MC for cost reasons is unethical and dangerous for an L1 fracture in a brace. Also legally exposes the employer if injury progresses.',
            outcome: { patient: 'You return to the site after 4 days, in pain.', caregiver: '', staff: '' },
            effects: { setFlags: ['inadequate-mc'] },
          },
          {
            id: 'mc-no-report',
            label: 'Issue MC; tell the employer they don\'t need to report — it\'s a "minor injury".',
            score: -10,
            rationale:
              'Mandatory under WICA Section 11. Employer failing to report is a criminal offence up to S$5,000 fine for first offence. Active concealment exposes both clinician and employer.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
        ],
      },
    },
    {
      id: 'followup',
      department: 'soc',
      facility: 'nuh',
      durationMin: 30,
      costSGD: 220,
      charge: 'soc',
      framing: {
        patient: 'Two weeks later. The brace is hot. You ask when you can fly home to see your family.',
        caregiver: '',
        staff: 'Ortho SOC: tender L1, no neurology, ankle healing. Imaging unchanged.',
      },
      decision: {
        id: 'social-plan',
        prompt: 'Discharge / repatriation considerations?',
        weight: 1,
        reference: MOM_WICA,
        options: [
          {
            id: 'continue-mc-rehab',
            label:
              'Continue MC + brace 6 more weeks; arrange physiotherapy via FWMI; flag dorm-based light-duty plan with employer.',
            score: 10,
            rationale:
              'Standard fracture recovery. Light-duty work is permissible only when bone-healing allows. Many employers offer in-dorm rehab arrangements with HCPs.',
            outcome: { patient: 'You video-call your daughter. She asks if you can come home.', caregiver: '', staff: '' },
          },
          {
            id: 'repatriate-now',
            label:
              'Recommend immediate repatriation to Bangladesh for continued care — employer wants to "close the case".',
            score: 2,
            rationale:
              'Repatriation before MOM signs off on permanent-incapacity assessment can void the worker\'s WICA entitlement. MOM frowns on premature repatriation for active claims.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
          {
            id: 'discharge-no-followup',
            label: 'Discharge to GP; no further hospital follow-up.',
            score: -3,
            rationale: 'Vertebral fracture warrants specialist surveillance until healing is documented.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
        ],
      },
    },
  ],
};
