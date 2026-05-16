import type { CaseDefinition } from '../../lib/types';

const SARS_REPORT = {
  label: 'MOH Singapore: Lessons from SARS (2003)',
  body: 'Ministry of Health post-outbreak review identifying super-spreader recognition, ED isolation, PPE, and ring-fencing as core lessons.',
};

const NCID_HX = {
  label: 'NCID — A History',
  body: 'NCID was conceived in the wake of SARS 2003 to centralise outbreak response and isolate suspect cases away from general acute care.',
};

const WHO_SARS = {
  label: 'WHO Consensus Document SARS (2003)',
  body: 'WHO retrospective consensus on transmission, IPC failures and healthcare-worker mortality during the 2003 SARS outbreak.',
};

export const sars2003Case: CaseDefinition = {
  id: 'sars-2003-historical',
  title: { en: 'SARS 2003 — TTSH outbreak (historical educational scenario)', zh: '2003年SARS — 陈笃生医院疫情(历史教学情景)' },
  blurb:
    'Historical educational scenario. March 2003. A returning traveller with atypical pneumonia is admitted to TTSH general medical ward. Within days, dozens of healthcare workers are infected. Decisions modelled here are framed against MOH and WHO post-outbreak reviews.',
  category: 'acute',
  primaryFacility: 'ttsh',
  involvedFacilities: ['ttsh', 'ncid'],
  profileKey: 'taxiDriver',
  allowsWardChoice: false,
  historical: true,
  citations: [
    'Ministry of Health Singapore. SARS in Singapore — Challenges, Strategies and Lessons. 2004.',
    'Hsu LY et al. Severe Acute Respiratory Syndrome (SARS) in Singapore. Emerging Infectious Diseases. 2003;9(6):713-717.',
    'WHO. Consensus document on the epidemiology of severe acute respiratory syndrome (SARS). 2003.',
  ],
  guidelines: [SARS_REPORT, NCID_HX, WHO_SARS],
  pathway: [
    {
      id: 'ed-arrival',
      department: 'ed',
      facility: 'ttsh',
      durationMin: 60,
      costSGD: 240,
      charge: 'a&e',
      caregiverBurden: { timeOffWorkHours: 4, financialWorry: 8, sleepDebt: 8 },
      framing: {
        patient: '(Atypical pneumonia — fever, dry cough, myalgia. Recent travel.)',
        caregiver: '(Family worry about the new disease in the news.)',
        staff: 'TTSH ED 2003: case admitted with "atypical pneumonia". Travel history not yet linked nationally; airborne hypothesis not yet established.',
      },
      decision: {
        id: 'initial-isolation-2003',
        prompt:
          'March 2003. Pathogen unknown. PPE generic. With hindsight, what should have happened?',
        weight: 1.5,
        reference: SARS_REPORT,
        options: [
          {
            id: 'airborne-as-default',
            label:
              'Apply airborne + droplet precautions by default for any unidentified novel respiratory illness; segregate the patient from the general ward.',
            score: 10,
            rationale:
              'A core SARS lesson: when the pathogen is unknown, default to the highest plausible level of precaution. Today, NCID and DORSCON encode this — it didn\'t exist in March 2003.',
            outcome: { patient: '', caregiver: '', staff: 'Cohort cubicle, full PPE, smaller exposure footprint.' },
            effects: { pandemic: { dorsconShift: 1, ppeStockpilePctDelta: -8 } },
          },
          {
            id: 'standard-only',
            label: 'Manage on a general ward with standard precautions until aetiology known.',
            score: -10,
            rationale:
              'What actually happened in the early weeks. Resulted in extensive nosocomial spread to staff and patients.',
            outcome: { patient: '', caregiver: '', staff: 'Multiple HCW infections; outbreak amplified.' },
            effects: { setFlags: ['hcw-cluster'], pandemic: { dorsconShift: 1, ppeStockpilePctDelta: -20, surgeCapacityPctDelta: -20 } },
          },
        ],
      },
    },
    {
      id: 'ttsh-ringfence',
      department: 'ward',
      facility: 'ttsh',
      durationMin: 1440,
      costSGD: 1100,
      charge: 'inpatient-ward',
      caregiverBurden: { timeOffWorkHours: 24, financialWorry: 12, sleepDebt: 22 },
      framing: {
        patient: '(Worsening dyspnoea; oxygen requirements rising.)',
        caregiver: 'Visiting suspended.',
        staff: 'Cluster of healthcare-worker infections recognised; institutional response activated.',
      },
      decision: {
        id: 'ringfence-decision',
        prompt:
          'A cluster among ED + medical ward staff is recognised. With 2003 hindsight, what is the right institutional response?',
        weight: 1.5,
        reference: SARS_REPORT,
        options: [
          {
            id: 'ringfence-ttsh',
            label:
              'Ring-fence TTSH as the national SARS hospital: dedicated wards, no inter-hospital transfers, dedicated staff cohorts; no rotation, no movement; ED diversion to other hospitals.',
            score: 10,
            rationale:
              'This was the operational decision that broke the chain. Centralisation + ring-fencing + no rotation prevents seeding of other hospitals.',
            outcome: { patient: '', caregiver: '', staff: 'TTSH becomes the SARS hospital; other hospitals continue routine care.' },
            effects: { clearFlags: ['hcw-cluster'], pandemic: { dorsconShift: 1, surgeCapacityPctDelta: 20 } },
          },
          {
            id: 'distribute',
            label: 'Distribute SARS patients across hospitals to share the load.',
            score: -10,
            rationale: 'Multiplies seeding events — opposite of what the outbreak needed.',
            outcome: { patient: '', caregiver: '', staff: 'New clusters at SGH and NUH.' },
            effects: { setFlags: ['multi-cluster-seeded'], pandemic: { dorsconShift: 1, ppeStockpilePctDelta: -25, surgeCapacityPctDelta: -30 } },
          },
          {
            id: 'no-change',
            label: 'Continue routine workflow; advise enhanced PPE only.',
            score: -8,
            rationale: 'Inadequate; PPE alone without ring-fencing failed in early-2003 reality.',
            outcome: { patient: '', caregiver: '', staff: 'Spread continues.' },
            effects: { pandemic: { ppeStockpilePctDelta: -15, surgeCapacityPctDelta: -15 } },
          },
        ],
      },
    },
    {
      id: 'icu-2003',
      department: 'icu',
      facility: 'ttsh',
      durationMin: 4320,
      costSGD: 5400,
      charge: 'icu',
      caregiverBurden: { timeOffWorkHours: 30, financialWorry: 14, sleepDebt: 26 },
      framing: {
        patient: '(Intubated; prone position; respiratory failure.)',
        caregiver: 'Family briefings by speakerphone — they cannot enter.',
        staff: 'ICU team in cohort rota; full PPE; nebulised treatments minimised; dedicated equipment.',
      },
      decision: {
        id: 'aerosol-procedures',
        prompt:
          'High-flow oxygen and nebulised bronchodilators are routine on most wards. With SARS-era IPC understanding, what changes?',
        weight: 1.2,
        reference: WHO_SARS,
        options: [
          {
            id: 'minimise-agp',
            label:
              'Minimise aerosol-generating procedures (AGPs): MDI with spacer instead of nebs; closed-circuit ventilator suction; intubation by an experienced team in a negative-pressure room only.',
            score: 10,
            rationale:
              'AGP minimisation was a key SARS / COVID-era control measure to protect staff.',
            outcome: { patient: '', caregiver: '', staff: 'Lower HCW exposure events.' },
          },
          {
            id: 'routine-agp',
            label: 'Continue routine nebs, open-suction, etc.',
            score: -8,
            rationale: 'Aerosol generation = staff exposure.',
            outcome: { patient: '', caregiver: '', staff: 'Further cluster.' },
          },
        ],
      },
    },
    {
      id: 'post-outbreak-reform',
      department: 'discharge',
      facility: 'ttsh',
      durationMin: 60,
      framing: {
        patient: '(Recovers slowly; long convalescence.)',
        caregiver: '(Family and bereaved colleagues attend HCW memorials.)',
        staff: 'Post-outbreak review identifies system reforms — outpatient screening, NCID, DORSCON.',
      },
      decision: {
        id: 'system-reform',
        prompt:
          'After SARS, what reforms would best prepare for the next pathogen?',
        weight: 1.5,
        reference: NCID_HX,
        options: [
          {
            id: 'ncid-and-dorscon',
            label:
              'Build a national infectious-disease centre (NCID); create a colour-coded outbreak alert system (DORSCON); standing PPE stockpile and surge plans; mandatory IPC training across all healthcare workers.',
            score: 10,
            rationale:
              'These are the actual reforms Singapore implemented; they paid off during H1N1, MERS, COVID-19.',
            outcome: { patient: '', caregiver: '', staff: 'NCID groundbreaking 2014; DORSCON formalised; reusable surge plans authored.' },
          },
          {
            id: 'business-as-usual',
            label: 'Lessons documented but no structural reform.',
            score: -8,
            rationale: 'Without structural change, the next outbreak repeats the same pattern.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
        ],
      },
    },
  ],
};
