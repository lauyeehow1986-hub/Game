import type { CaseDefinition } from '../../lib/types';

const NCCN_BREAST = {
  label: 'NCCN Breast Cancer (v.2024)',
  body: 'NCCN guidelines for breast cancer screening, diagnosis and treatment.',
};

const MOH_CANCER = {
  label: 'MOH National Cancer Strategy',
  body: 'Singapore strategy on early detection, equitable treatment access, and survivorship.',
};

const MAF = {
  label: 'MOH Medication Assistance Fund (MAF)',
  body: 'Subsidies for selected high-cost cancer drugs at restructured hospitals.',
};

const HEALTHIER_SG = {
  label: 'Healthier SG',
  body: 'Right-siting stable post-treatment patients to a primary-care provider.',
};

export const breastCancerCrossCluster: CaseDefinition = {
  id: 'breast-ca-crosscluster',
  title: 'Cross-cluster Breast Cancer — polyclinic referral, NHG → SingHealth',
  blurb:
    'Mdm Lim, 54. Felt a right breast lump while showering 4 weeks ago. Visited Toa Payoh Polyclinic (NHG). Referred to SGH Breast Centre (SingHealth) for triple assessment, then NCCS for treatment.',
  category: 'outpatient',
  primaryFacility: 'sgh',
  involvedFacilities: ['nhgp-toa-payoh', 'sgh', 'nccs'],
  profileKey: 'retiredAuntie',
  allowsWardChoice: false,
  guidelines: [NCCN_BREAST, MOH_CANCER, MAF, HEALTHIER_SG],
  pathway: [
    {
      id: 'polyclinic-presentation',
      department: 'gp-room',
      facility: 'nhgp-toa-payoh',
      durationMin: 30,
      costSGD: 65,
      charge: 'polyclinic',
      caregiverBurden: { timeOffWorkHours: 3, financialWorry: 6 },
      framing: {
        patient:
          'You sat in the carpark for ten minutes before going in. The doctor examines you, says little. You overhear the word "lump".',
        caregiver: 'Your daughter took the morning off to come with you.',
        staff: 'NHGP FP: 2 cm hard, fixed lump R UOQ. No skin tethering. Refers to a Breast Centre via subsidised SOC referral.',
      },
      decision: {
        id: 'referral-routing',
        prompt:
          'Subsidised referral letter being written. Which centre, and how urgent?',
        weight: 1.5,
        reference: MOH_CANCER,
        options: [
          {
            id: 'sgh-2-week',
            label:
              'Subsidised cross-cluster referral to SGH Breast Centre, 2-week-wait pathway (suspected cancer).',
            score: 10,
            rationale:
              'MOH cancer pathway prioritises 2-week assessment for clinically suspicious lumps. Cross-cluster referral is routine — SGH Breast Centre offers triple assessment in one visit; cluster does not gatekeep cancer pathways.',
            outcome: {
              patient: 'Appointment in 8 days. You write it on the calendar in pen and circle it.',
              caregiver: 'You set a reminder.',
              staff: 'NEHR populated; receiving end notified via cross-cluster e-referral.',
            },
          },
          {
            id: 'ttsh-routine',
            label: 'NHG-internal referral to TTSH Breast Surgery, routine 6-week.',
            score: 5,
            rationale:
              'Cluster-internal is administratively simpler but routine timeframe is too slow for a clinically suspicious lump. Speed matters more than cluster.',
            outcome: { patient: 'Six weeks of waiting.', caregiver: 'You both don\'t sleep well.', staff: 'Routine slot booked; not optimal.' },
          },
          {
            id: 'private',
            label: 'Private referral to a Mt Elizabeth surgeon.',
            score: 6,
            rationale:
              'Faster appointment but full private cost. Defensible if patient prefers, but loses MAF / subsidy advantage if treatment is needed.',
            outcome: { patient: 'Appointment next week, but the bill begins.', caregiver: 'You worry about the cost.', staff: 'Acceptable; cost discussed.' },
          },
          {
            id: 'wait-and-watch',
            label: 'Reassure and review in 6 weeks.',
            score: -8,
            rationale:
              'A clinically hard, fixed lump in a 54-year-old must be assessed urgently.',
            outcome: { patient: '', caregiver: '', staff: 'Returns 3 months later with worsening symptoms.' },
          },
        ],
      },
    },
    {
      id: 'sgh-triple-assessment',
      department: 'soc',
      facility: 'sgh',
      durationMin: 120,
      costSGD: 380,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 5, financialWorry: 10, sleepDebt: 4 },
      framing: {
        patient: 'A nurse meets you with a one-stop guide. Examination, then mammogram, then ultrasound. You see the radiographer\'s face change.',
        caregiver: 'Long corridors. Your daughter holds your hand on the second one.',
        staff: 'Triple assessment: clinical (suspicious), mammogram (BI-RADS 5), US (irregular hypoechoic mass). Core biopsy taken under US guidance.',
      },
      decision: {
        id: 'staging',
        prompt:
          'Histology returns 4 days later: invasive ductal carcinoma, ER+/PR+/HER2−, grade 2. Clinically T2, palpable axillary nodes. What is your staging plan?',
        weight: 1.2,
        reference: NCCN_BREAST,
        options: [
          {
            id: 'mri-axus',
            label:
              'Breast MRI for extent + axillary US ± FNA. Refer to NCCS multi-disciplinary tumour board for treatment plan.',
            score: 10,
            rationale:
              'Standard staging for a node-positive locally-advanced breast cancer. MDT discussion ensures coordinated surgical / oncology / radiation planning. NCCS hosts national MDT for complex cases.',
            outcome: {
              patient: 'Another scan, but the staff are gentle and explain each step.',
              caregiver: 'You take notes during the MDT explanation.',
              staff: 'MRI booked, axillary FNA positive, tumour board scheduled in 5 days.',
            },
          },
          {
            id: 'just-surgery',
            label: 'Proceed straight to mastectomy, defer staging.',
            score: 0,
            rationale:
              'Staging informs neoadjuvant decisions; node-positive locally-advanced disease often benefits from neoadjuvant systemic therapy.',
            outcome: { patient: '', caregiver: '', staff: 'Senior reviews and adds staging.' },
          },
          {
            id: 'pet-routine',
            label: 'PET-CT routinely for stage I-II.',
            score: 4,
            rationale:
              'Reasonable for symptomatic / locally advanced cases but not first-line for asymptomatic stage I-II disease per NCCN.',
            outcome: { patient: '', caregiver: '', staff: 'Reasonable; cost-benefit discussed at MDT.' },
          },
        ],
      },
    },
    {
      id: 'nccs-mdt',
      department: 'soc',
      facility: 'nccs',
      durationMin: 60,
      costSGD: 240,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 4, financialWorry: 8 },
      framing: {
        patient: 'A new building. Ribbons on the lobby art. The oncologist draws on a card with the diagnosis and the plan.',
        caregiver: 'You film the explanation on your phone (with consent) so you can replay it later.',
        staff: 'MDT decision: neoadjuvant chemo (AC-T) → surgery (mastectomy + axillary clearance) → adjuvant radiotherapy → endocrine therapy x 5 years.',
      },
      decision: {
        id: 'subsidy-and-drug-list',
        prompt:
          'Patient is means-test-eligible for subsidised treatment. AC-T is on the Standard Drug List. Trastuzumab not indicated (HER2−). What financing plan do you advise?',
        weight: 1,
        reference: MAF,
        options: [
          {
            id: 'subsidised-mdt',
            label:
              'Subsidised NCCS treatment; MediShield Life + MediSave + MAF; refer to medical social worker for further bill review.',
            score: 10,
            rationale:
              'Standard pathway: maximise subsidy + MediSave + MediShield + MAF for Standard Drug List agents. MSW review captures any unmet financial need; Medifund as last resort.',
            outcome: {
              patient: 'The MSW spends an hour with you. The bill estimate is workable.',
              caregiver: 'You take photos of all the forms.',
              staff: 'Subsidy class confirmed; MAF claim filed.',
            },
          },
          {
            id: 'private',
            label: 'Switch to a private oncologist for faster turnaround.',
            score: 2,
            rationale:
              'Faster scheduling but loses subsidy and MAF; unless IP rider with as-charged plan, cost is significant.',
            outcome: { patient: 'The bill grows.', caregiver: 'You consider selling investments.', staff: 'Acceptable; financial counselling done.' },
          },
          {
            id: 'no-insurance-talk',
            label: 'Skip financial counselling — discuss only the medical plan.',
            score: -3,
            rationale:
              'Financial toxicity is a major contributor to non-completion of cancer therapy. Counselling at the start prevents mid-treatment crises.',
            outcome: { patient: 'Halfway through, you receive an unexpected bill.', caregiver: 'Family stress.', staff: 'MSW pulled in late.' },
          },
        ],
      },
    },
    {
      id: 'nccs-day-tx',
      department: 'ot',
      facility: 'nccs',
      durationMin: 240,
      costSGD: 1800,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 8, financialWorry: 4, sleepDebt: 6 },
      framing: {
        patient: 'A reclining chair. A volunteer brings you mee siam from the kitchen. The drip runs slow.',
        caregiver: 'Your daughter brings you crochet wool. You finish a sleeve over four hours.',
        staff: 'Cycle 1 AC chemotherapy; granisetron + dexamethasone; G-CSF schedule explained.',
      },
    },
    {
      id: 'sgh-surgery',
      department: 'ot',
      facility: 'sgh',
      durationMin: 240,
      costSGD: 9200,
      charge: 'inpatient-procedure',
      caregiverBurden: { timeOffWorkHours: 16, financialWorry: 14, sleepDebt: 12 },
      framing: {
        patient: 'Same Outram campus, different building. The mastectomy team is the same surgeon you met at the Breast Centre.',
        caregiver: 'You wait in the family lounge. Hours pass.',
        staff: 'Right mastectomy + axillary clearance after neoadjuvant chemo. Path: ypT1c ypN1, complete surgical margins.',
      },
    },
    {
      id: 'nccs-radiotherapy',
      department: 'soc',
      facility: 'nccs',
      durationMin: 1200,
      costSGD: 3200,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 25, financialWorry: 6, sleepDebt: 8 },
      framing: {
        patient: 'Daily radiotherapy for 3 weeks. The drive is shorter than chemo days.',
        caregiver: 'You drop her off and pick her up; you both find a routine.',
        staff: 'Hypofractionated chest-wall + axillary RT; 15 fractions; mild skin reaction managed.',
      },
    },
    {
      id: 'right-site',
      department: 'discharge',
      facility: 'nccs',
      durationMin: 30,
      framing: {
        patient: 'You ring the survivorship bell.',
        caregiver: 'Your daughter cries. You both laugh.',
        staff: 'Survivorship summary uploaded. Endocrine therapy x 5y. Surveillance plan: annual mammogram + clinical review.',
      },
      decision: {
        id: 'survivorship-plan',
        prompt:
          'Stable, on letrozole. What survivorship plan do you adopt?',
        weight: 1,
        reference: HEALTHIER_SG,
        options: [
          {
            id: 'shared-care',
            label:
              'Shared survivorship: annual NCCS surveillance + quarterly Healthier-SG GP for endocrine therapy + chronic disease.',
            score: 10,
            rationale:
              'Shared-care models reduce SOC load, improve continuity, and maintain specialist surveillance for recurrence. Healthier-SG GP enrolment maximises CDMP / Flexi-MediSave for ongoing chronic care.',
            outcome: {
              patient: 'Your GP near home becomes the centre of your medical world.',
              caregiver: 'Less travel; less time off work.',
              staff: 'Treatment summary handed to GP; cluster annual review remains.',
            },
          },
          {
            id: 'soc-only',
            label: 'NCCS SOC every 3 months indefinitely.',
            score: 4,
            rationale: 'Specialist time better used for active treatment; stable patients fit shared care.',
            outcome: { patient: '', caregiver: 'Repeated time off.', staff: 'SOC slots clogged.' },
          },
          {
            id: 'discharge-noplan',
            label: 'Discharge to GP with no surveillance.',
            score: -4,
            rationale: 'Misses recurrence and contralateral disease.',
            outcome: { patient: '', caregiver: '', staff: 'Avoidable late detection.' },
          },
        ],
      },
    },
  ],
};
