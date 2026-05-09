import type { CaseDefinition } from '../../lib/types';

const ESC_HF = {
  label: 'ESC HF Guidelines 2023',
  body: 'European HF guidelines: four-pillar therapy (ACE-i / ARB / ARNI + beta-blocker + MRA + SGLT2i).',
};

const SHF_CPG = {
  label: 'Singapore Heart Foundation HF Pathway',
  body: 'SHF / NHCS / NUHCS local guidance for HF management and right-siting.',
};

const HEALTHIER_SG = {
  label: 'Healthier SG (HF chronic care)',
  body: 'Right-siting stable HF to a Healthier-SG GP after specialist initiation.',
};

export const heartFailureCase: CaseDefinition = {
  id: 'hf-outpatient',
  title: 'New-onset heart failure — polyclinic to NHCS HF clinic',
  blurb:
    'Mr Tan, 64. Three weeks of breathlessness and ankle swelling; can\'t finish his usual NTUC walk. NHGP polyclinic flags JVP raised and bibasal crackles; refers to NHCS HF clinic urgently.',
  category: 'outpatient',
  primaryFacility: 'nhcs',
  involvedFacilities: ['nhgp-amk', 'nhcs', 'gp-healthway'],
  profileKey: 'taxiDriver',
  allowsWardChoice: false,
  guidelines: [ESC_HF, SHF_CPG, HEALTHIER_SG],
  pathway: [
    {
      id: 'polyclinic-flag',
      department: 'gp-room',
      facility: 'nhgp-amk',
      durationMin: 30,
      costSGD: 65,
      charge: 'polyclinic',
      caregiverBurden: { timeOffWorkHours: 2, financialWorry: 4 },
      framing: {
        patient: 'You finally accepted you\'ve been getting more breathless.',
        caregiver: 'Your wife noticed first.',
        staff: 'NHGP: BP 152/88, HR 96, JVP +5, bibasal crackles. NT-proBNP 1,800. Refers to NHCS HF clinic.',
      },
      decision: {
        id: 'route-to-hf-clinic',
        prompt: 'Where to refer?',
        weight: 1,
        reference: SHF_CPG,
        options: [
          {
            id: 'nhcs-hf',
            label: 'Subsidised NHCS HF clinic (cross-cluster from NHG to SingHealth).',
            score: 10,
            rationale: 'NHCS runs a high-volume HF clinic; cluster boundaries don\'t gatekeep.',
            outcome: { patient: 'A 1-week appointment.', caregiver: 'You note it.', staff: 'Cross-cluster e-referral; NEHR populated.' },
          },
          {
            id: 'ttsh-cardio',
            label: 'NHG-internal: TTSH cardiology SOC.',
            score: 8,
            rationale: 'Reasonable; same-cluster routing. Either centre acceptable.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
          {
            id: 'private',
            label: 'Private cardiology consult.',
            score: 5,
            rationale: 'Faster but private rate; no MAF for HF medications.',
            outcome: { patient: '', caregiver: 'Cost concerns.', staff: '' },
          },
        ],
      },
    },
    {
      id: 'nhcs-hf-clinic',
      department: 'soc',
      facility: 'nhcs',
      durationMin: 90,
      costSGD: 320,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 4, financialWorry: 6 },
      framing: {
        patient: 'A cardiologist explains your heart\'s pumping function with a diagram.',
        caregiver: 'You ask how long the medications will be needed.',
        staff: 'Echo: LVEF 32%; mild MR; LV dilated. Diagnosis: HFrEF.',
      },
      decision: {
        id: 'four-pillar',
        prompt: 'HFrEF (LVEF 32%). Four-pillar GDMT — start how?',
        weight: 1.5,
        reference: ESC_HF,
        options: [
          {
            id: 'all-four',
            label:
              'Start sacubitril/valsartan (ARNI) + bisoprolol + spironolactone + dapagliflozin together at low doses; titrate over 4–6 weeks.',
            score: 10,
            rationale:
              'STRONG-HF and current ESC guidance support rapid simultaneous initiation rather than sequential. Up-titration follow-up matters.',
            outcome: { patient: 'Four new tablets.', caregiver: 'You photograph each one.', staff: 'Ambulatory titration plan.' },
          },
          {
            id: 'sequential',
            label: 'Start ACE-i + beta-blocker; add MRA + SGLT2i sequentially over months.',
            score: 7,
            rationale:
              'Old paradigm; many patients never reach the 4-pillar combination. Acceptable but slower.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
          {
            id: 'diuretic-only',
            label: 'Frusemide only; lifestyle advice.',
            score: -6,
            rationale:
              'Diuretic for symptoms but does not address mortality. Misses the four-pillar foundation.',
            outcome: { patient: '', caregiver: '', staff: 'Reg adds GDMT.' },
            effects: { setFlags: ['hf-undertreated'] },
          },
        ],
      },
    },
    {
      id: 'hf-decompensation',
      department: 'ed',
      facility: 'ttsh',
      requiresAnyFlag: ['hf-undertreated'],
      durationMin: 180,
      costSGD: 540,
      charge: 'a&e',
      caregiverBurden: { timeOffWorkHours: 6, financialWorry: 12, sleepDebt: 14 },
      framing: {
        patient: '(orthopnoea, ankle swelling, can\'t finish his sentences.)',
        caregiver: 'You drive him to the ED at midnight.',
        staff: 'Acute decompensation: predictable when the four-pillar therapy was withheld; admit, IV diuretic, escalate GDMT now.',
      },
      decision: {
        id: 'rescue-gdmt',
        prompt: 'Diuretic-only patient now in acute decompensation. Action?',
        weight: 1.2,
        reference: SHF_CPG,
        options: [
          {
            id: 'rescue-init-four',
            label: 'IV frusemide + start ARNI/BB/MRA/SGLT2i during admission per STRONG-HF; titrate at HF nurse follow-up.',
            score: 10,
            rationale: 'STRONG-HF showed early in-hospital initiation reduces 6-month death/HFH.',
            outcome: { patient: '', caregiver: '', staff: '' },
            effects: { clearFlags: ['hf-undertreated'] },
          },
          {
            id: 'discharge-quickly',
            label: 'IV diuretic, then discharge with diuretic-only and GP review.',
            score: -4,
            rationale: 'Misses the in-hospital window; high re-admission risk.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
        ],
      },
    },
    {
      id: 'titration-clinic',
      department: 'soc',
      facility: 'nhcs',
      durationMin: 45,
      costSGD: 150,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 3, financialWorry: 2 },
      framing: {
        patient: 'You feel better. The walks are easier.',
        caregiver: 'You go to the supermarket together again.',
        staff: 'Up-titration: bisoprolol 5 mg, ARNI 49/51 BD; eGFR stable; K 4.4.',
      },
    },
    {
      id: 'right-site-gp',
      department: 'discharge',
      facility: 'gp-healthway',
      durationMin: 30,
      framing: {
        patient: 'A familiar clinic.',
        caregiver: 'You understand the plan now.',
        staff: 'Stable on optimised GDMT. Right-sited to Healthway GP under Healthier SG; NHCS surveillance annually.',
      },
      decision: {
        id: 'right-siting',
        prompt: 'Long-term care plan once optimised?',
        weight: 1,
        reference: HEALTHIER_SG,
        options: [
          { id: 'shared', label: 'Healthier-SG GP + NHCS HF clinic annually.', score: 10, rationale: 'Right-sited continuity; NHCS for complex events only.', outcome: { patient: '', caregiver: '', staff: '' } },
          { id: 'soc-only', label: 'NHCS HF clinic every 3 months indefinitely.', score: 4, rationale: 'Unnecessary specialist load for a stable patient.', outcome: { patient: '', caregiver: '', staff: '' } },
          { id: 'no-followup', label: 'No follow-up.', score: -6, rationale: 'High decompensation risk; titration needed.', outcome: { patient: '', caregiver: '', staff: '' } },
        ],
      },
    },
  ],
};
