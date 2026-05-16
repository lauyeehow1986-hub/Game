import type { CaseDefinition } from '../../lib/types';

const MOH_DM = {
  label: 'MOH CPG Diabetes Mellitus (2014, updated 2017)',
  body: 'Singapore MOH Clinical Practice Guidelines on diabetes mellitus.',
};

const ADA_EASD_2023 = {
  label: 'ADA/EASD Consensus 2023',
  body: 'Hyperglycaemia management in T2DM — incorporates organ-protective agents (SGLT2i, GLP-1RA).',
};

const HEALTHIER_SG = {
  label: 'MOH Healthier SG (2023)',
  body: 'Right-siting chronic care to a primary-care provider with one-physician continuity.',
};

const CDMP = {
  label: 'MOH CDMP / Flexi-MediSave',
  body: 'Chronic Disease Management Programme — outpatient subsidy + MediSave drawdown for chronic conditions.',
};

export const outpatientDiabetes: CaseDefinition = {
  id: 'outpatient-diabetes',
  title: {
    en: 'Outpatient T2DM — 62 y/o male, poorly controlled, polyclinic referral',
    zh: '门诊2型糖尿病 — 62岁男性,控制欠佳,综合诊疗所转诊',
  },
  blurb:
    'Mr Rajan, 62. Long-distance lorry driver. T2DM x10y, HbA1c 9.4%, on metformin only. Walked into Toa Payoh Polyclinic with painful numb feet for two weeks. The polyclinic refers him to TTSH endocrinology SOC.',
  category: 'outpatient',
  primaryFacility: 'ttsh',
  involvedFacilities: ['ttsh'],
  profileKey: 'diabeticUncle',
  allowsWardChoice: false,
  guidelines: [MOH_DM, ADA_EASD_2023, HEALTHIER_SG, CDMP],
  pathway: [
    {
      id: 'polyclinic',
      department: 'soc',
      durationMin: 60,
      costSGD: 65,
      charge: 'polyclinic',
      caregiverBurden: { timeOffWorkHours: 3, financialWorry: 5 },
      framing: {
        patient:
          'You queued at 7am. The polyclinic doctor types fast. She asks if you check your sugar at home — you don\'t.',
        caregiver:
          "Your wife came along. She's scared because Uncle next door went on dialysis last year.",
        staff:
          'GP at polyclinic: HbA1c 9.4, BP 152/92, foot exam — reduced monofilament, no ulcer. Refers to endocrine SOC.',
      },
      decision: {
        id: 'soc-or-private',
        prompt: 'Where do you refer him? He has CHAS Orange and no IP plan.',
        weight: 1,
        reference: HEALTHIER_SG,
        options: [
          {
            id: 'soc-subsidised',
            label: 'Subsidised SOC referral to TTSH endocrinology.',
            score: 10,
            rationale:
              'Subsidised tertiary endocrine care via SOC referral letter. CHAS Orange + CDMP keeps cost manageable.',
            outcome: {
              patient: 'A pink referral letter. Appointment next week.',
              caregiver: 'You write down the date.',
              staff: 'Subsidy preserved; appointment within 1 week as urgent referral.',
            },
          },
          {
            id: 'soc-private',
            label: 'Private referral to a private endocrinologist (Mt Elizabeth Novena).',
            score: 3,
            rationale:
              'Faster appointment and continuity, but full private rate. Without IP, this is significant OOP.',
            outcome: { patient: 'Faster appointment, but the bill stings.', caregiver: 'You worry.', staff: 'Acceptable; cost discussed.' },
          },
          {
            id: 'no-referral',
            label: 'Manage at polyclinic only — add second-line agent and review in 3 months.',
            score: 4,
            rationale:
              'Reasonable for stable T2DM, but with HbA1c 9.4% and foot symptoms specialist input is appropriate.',
            outcome: { patient: 'Two new tablets, review in 3 months.', caregiver: '', staff: 'Polyclinic family physician comfortable; specialist input still ideal.' },
          },
        ],
      },
    },
    {
      id: 'soc-visit',
      department: 'soc',
      durationMin: 60,
      costSGD: 240,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 4, financialWorry: 4 },
      framing: {
        patient: 'A long form to fill. The young doctor introduces herself. She asks about your work, your sleep, your family.',
        caregiver: 'You sit on a plastic chair in the corridor. The fluorescent light hums.',
        staff: 'Endocrine SOC: HbA1c 9.4, eGFR 62, ACR 80 (microalbuminuria), monofilament 4/10 sites both feet.',
      },
      decision: {
        id: 'second-line-agent',
        prompt:
          'On metformin 1g BD. eGFR 62, microalbuminuria, BMI 29. What do you add as second-line therapy?',
        weight: 1.2,
        reference: ADA_EASD_2023,
        options: [
          {
            id: 'sglt2i',
            label: 'Add an SGLT2 inhibitor (e.g. empagliflozin).',
            score: 10,
            rationale:
              'In T2DM with CKD or albuminuria, SGLT2 inhibitors confer renal and cardiovascular protection beyond glycaemic control (EMPA-KIDNEY, CREDENCE). Subsidised under MAF Standard Drug List.',
            outcome: {
              patient: 'A new tablet. The pharmacist warns you about UTIs and to drink water.',
              caregiver: 'You get told what side-effects to watch for.',
              staff: 'GDMT for diabetic kidney disease. Sensible long-term.',
            },
          },
          {
            id: 'glp1',
            label: 'Add a GLP-1 receptor agonist (e.g. semaglutide).',
            score: 8,
            rationale:
              'Powerful HbA1c lowering and CV benefit. Excellent choice but expensive and not on the standard subsidy drug list at full dose.',
            outcome: {
              patient: 'A weekly injection. Your wife is anxious about the cost.',
              caregiver: 'You ask about the cost. The pharmacist quotes the figure. You wince.',
              staff: 'Excellent agent; cost barrier discussed.',
            },
          },
          {
            id: 'sulfonylurea',
            label: 'Add a sulfonylurea (e.g. gliclazide).',
            score: 4,
            rationale:
              'Cheap and effective HbA1c reduction but raises hypoglycaemia and weight; no organ-protection benefit. Risky in a long-distance lorry driver.',
            outcome: {
              patient: 'You feel light-headed driving on the PIE that afternoon.',
              caregiver: 'You start checking up on him during the day.',
              staff: 'Hypo risk in a commercial driver — flagged.',
            },
          },
          {
            id: 'insulin',
            label: 'Start basal insulin immediately.',
            score: 3,
            rationale:
              'HbA1c 9.4% can often be brought down with oral therapy first; insulin is a step usually reserved for further failure or very high HbA1c.',
            outcome: { patient: 'A pen injector. You\'re scared.', caregiver: '', staff: 'Reasonable but escalates earlier than guidelines suggest.' },
          },
        ],
      },
    },
    {
      id: 'pharmacy-counsel',
      department: 'pharmacy',
      durationMin: 30,
      costSGD: 95,
      charge: 'pharmacy',
      caregiverBurden: { timeOffWorkHours: 1 },
      framing: {
        patient: 'The pharmacist asks if you want the cheaper option. You nod.',
        caregiver: 'You take photos of every pill.',
        staff: 'CDMP claim filed; Flexi-MediSave activated; foot-care leaflet given.',
      },
    },
    {
      id: 'right-siting',
      department: 'discharge',
      durationMin: 20,
      framing: {
        patient: 'They ask if you have a regular GP near home. You shake your head.',
        caregiver: 'A care coordinator hands you a list of nearby Healthier-SG GPs.',
        staff: 'Discharge plan: stable for primary-care management with shared NEHR.',
      },
      decision: {
        id: 'right-siting-choice',
        prompt: 'Long-term care plan for this stable, well-controlled patient?',
        weight: 1.2,
        reference: HEALTHIER_SG,
        options: [
          {
            id: 'enrol-gp-cdmp',
            label:
              'Enrol with a Healthier-SG GP under CDMP; SOC review in 6 months for HbA1c trend, then annually.',
            score: 10,
            rationale:
              'Continuity at a primary-care provider is the cornerstone of Healthier SG. CDMP plus Flexi-MediSave keeps OOP low. Frees up SOC capacity.',
            outcome: {
              patient: 'A GP near your block. You can drop in on the way back from the depot.',
              caregiver: 'You stop worrying about driving him to TTSH every quarter.',
              staff: 'NEHR populated; GP receives referral memo.',
            },
          },
          {
            id: 'soc-quarterly',
            label: 'Continue SOC quarterly indefinitely.',
            score: 4,
            rationale:
              'Specialist time better spent on uncontrolled / complex T2DM; for a now-stable patient, primary care is the right venue.',
            outcome: { patient: 'Long waits at SOC every 3 months.', caregiver: 'Half-days off work for each visit.', staff: 'SOC slots squeezed.' },
          },
          {
            id: 'no-followup',
            label: 'No structured follow-up — patient to self-manage.',
            score: -6,
            rationale:
              'Predictable HbA1c drift, microvascular and macrovascular harm.',
            outcome: { patient: 'You forget the SGLT2 after a month.', caregiver: '', staff: 'Re-presents with neuropathy and a foot ulcer in 18 months.' },
          },
        ],
      },
    },
  ],
};
