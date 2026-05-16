import type { CaseDefinition } from '../../lib/types';

const KDIGO = {
  label: 'KDIGO 2024 CKD Guideline',
  body: 'International CKD guideline: ACR / eGFR staging, RAS-blockade, SGLT2i, dialysis preparation.',
};

const NKF_SG = {
  label: 'NKF Singapore Subsidy Framework',
  body: 'NKF and KDF dialysis centres provide means-tested subsidised haemodialysis for Singapore citizens.',
};

const PRE_DIALYSIS = {
  label: 'MOH Pre-Dialysis Care Pathway',
  body: 'Vascular access (AVF) creation 6–12 months before anticipated dialysis start; transplant work-up where eligible.',
};

export const ckdDialysisCase: CaseDefinition = {
  id: 'ckd-dialysis',
  title: { en: 'CKD progression — polyclinic → NUH renal SOC → NKF dialysis', zh: '慢性肾病进展 — 综合诊疗所 → 国立大学医院肾内科 → NKF透析' },
  blurb:
    'Mr Rajan, 62. Long-distance lorry driver, T2DM x12y, CKD stage 4 (eGFR 22), HbA1c 8.2%. NHGP polyclinic flags ACR rising; refers to NUH renal SOC.',
  category: 'outpatient',
  primaryFacility: 'nuh',
  involvedFacilities: ['nhgp-toa-payoh', 'nuh', 'nkf'],
  profileKey: 'diabeticUncle',
  allowsWardChoice: false,
  guidelines: [KDIGO, NKF_SG, PRE_DIALYSIS],
  pathway: [
    {
      id: 'polyclinic-flag',
      department: 'gp-room',
      facility: 'nhgp-toa-payoh',
      durationMin: 30,
      costSGD: 65,
      charge: 'polyclinic',
      caregiverBurden: { timeOffWorkHours: 3, financialWorry: 6 },
      framing: {
        patient: 'You feel fine. Just tired.',
        caregiver: 'Your wife notices the swelling around your ankles.',
        staff: 'Polyclinic: eGFR 22, ACR 92, K 4.8. Refers urgently to NUH renal SOC.',
      },
    },
    {
      id: 'nuh-soc',
      department: 'soc',
      facility: 'nuh',
      durationMin: 90,
      costSGD: 280,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 4, financialWorry: 8 },
      framing: {
        patient: 'A nurse explains how kidneys work using a kitchen-sink analogy.',
        caregiver: 'You write everything down.',
        staff: 'Renal SOC: eGFR 22 stable last 6 months. Anaemia, mild hyperphosphataemia. Discusses RRT options.',
      },
      decision: {
        id: 'medical-optimisation',
        prompt:
          'CKD G4 with diabetes. He is already on metformin (dose-reduced) and an ARB. Add what?',
        weight: 1.5,
        reference: KDIGO,
        options: [
          {
            id: 'sglt2-erythropoietin',
            label:
              'Add SGLT2i (dapagliflozin) at renal-protective dose; iron + erythropoietin for anaemia; phosphate binder; counselling on AVF creation.',
            score: 10,
            rationale:
              'KDIGO 2024 supports SGLT2i down to eGFR 20 for renal + cardiovascular benefit. EPO + iron for symptomatic anaemia. Early AVF planning prevents temporary catheter dialysis.',
            outcome: { patient: 'You start a new tablet and a fortnightly injection.', caregiver: 'You learn to give the injection.', staff: 'GDMT + AVF referral made.' },
          },
          {
            id: 'no-sglt2',
            label: 'Hold SGLT2i because eGFR < 30; only treat anaemia.',
            score: 4,
            rationale:
              'Outdated; SGLT2i has been shown safe and beneficial down to eGFR 20.',
            outcome: { patient: '', caregiver: '', staff: 'Senior reg adds SGLT2i.' },
          },
          {
            id: 'wait-and-see',
            label: 'Watch and wait; review in 6 months.',
            score: -4,
            rationale: 'CKD progression continues; misses both protective therapy and AVF lead time.',
            outcome: { patient: '', caregiver: '', staff: 'CKD progresses to G5 before AVF created.' },
          },
        ],
      },
    },
    {
      id: 'avf-creation',
      department: 'ot',
      facility: 'nuh',
      durationMin: 120,
      costSGD: 4200,
      charge: 'inpatient-procedure',
      caregiverBurden: { timeOffWorkHours: 6, financialWorry: 6 },
      framing: {
        patient: '(local anaesthesia; the surgeon talks you through every step.)',
        caregiver: 'You\'re told to feel for the "thrill" each morning.',
        staff: 'Brachiocephalic AVF created; maturation expected in 6–12 weeks.',
      },
    },
    {
      id: 'transplant-discussion',
      department: 'soc',
      facility: 'nuh',
      durationMin: 60,
      costSGD: 240,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 3, financialWorry: 4 },
      framing: {
        patient: 'A new doctor; she explains transplant lists and living donation.',
        caregiver: 'Your son volunteers to be tested.',
        staff: 'Transplant work-up initiated; cardiac, infection screen, HLA typing.',
      },
      decision: {
        id: 'rrt-modality',
        prompt:
          'Modality discussion: HD vs PD vs pre-emptive transplant. He is a working lorry driver, lives with wife and son.',
        weight: 1.2,
        reference: PRE_DIALYSIS,
        options: [
          {
            id: 'transplant-list',
            label:
              'List for transplant + start in-centre HD via AVF when needed; living donor work-up for son.',
            score: 10,
            rationale: 'Pre-emptive transplant is best; HD as bridge keeps him working flexibly.',
            outcome: { patient: 'A long road, but a clearer one.', caregiver: 'Your son begins testing.', staff: 'Transplant team takes over coordination.' },
          },
          {
            id: 'home-pd',
            label: 'Start home peritoneal dialysis immediately, defer transplant.',
            score: 7,
            rationale: 'PD is reasonable; preserves work + lifestyle. Transplant should still be discussed in parallel.',
            outcome: { patient: 'Bags and a cycler at home.', caregiver: 'You learn the protocol.', staff: 'Transplant deferred — minor opportunity cost.' },
          },
          {
            id: 'in-centre-hd-only',
            label: 'In-centre HD only; no transplant discussion.',
            score: 4,
            rationale: 'Misses the best long-term option for a fit 62-year-old.',
            outcome: { patient: '', caregiver: '', staff: 'Reg flags the gap.' },
          },
        ],
      },
    },
    {
      id: 'first-hd-session',
      department: 'treatment-room',
      facility: 'nkf',
      durationMin: 240,
      costSGD: 380,
      charge: 'community-hospital',
      caregiverBurden: { timeOffWorkHours: 12, financialWorry: 10, sleepDebt: 4 },
      framing: {
        patient: 'A reclining chair, four hours, the news on the TV opposite.',
        caregiver: 'You bring lunch in a tiffin.',
        staff: 'NKF dialysis centre: AVF cannulated; uneventful first session; subsidy + MediSave handled at counter.',
      },
    },
    {
      id: 'ongoing-care',
      department: 'discharge',
      facility: 'nkf',
      durationMin: 30,
      framing: {
        patient: 'Three days a week, four hours each. You learn to schedule trips around it.',
        caregiver: 'You drive him on Mondays.',
        staff: 'Stable; transplant work-up ongoing in parallel.',
      },
      decision: {
        id: 'continuity',
        prompt: 'Long-term care plan?',
        weight: 1,
        reference: KDIGO,
        options: [
          { id: 'shared-care', label: 'NKF for HD; NUH renal SOC quarterly; Healthier-SG GP for diabetes / BP / vaccines.', score: 10, rationale: 'Right-sited continuity.', outcome: { patient: '', caregiver: '', staff: '' } },
          { id: 'soc-only', label: 'NUH SOC for everything.', score: 5, rationale: 'Specialist-only; no primary care.', outcome: { patient: '', caregiver: '', staff: '' } },
          { id: 'no-followup', label: 'Dialysis only.', score: -4, rationale: 'Misses chronic-disease management.', outcome: { patient: '', caregiver: '', staff: '' } },
        ],
      },
    },
  ],
};
