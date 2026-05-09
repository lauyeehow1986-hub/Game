import type { CaseDefinition } from '../../lib/types';

const EPIP = {
  label: 'IMH Early Psychosis Intervention Programme (EPIP)',
  body: 'Singapore programme for early identification and treatment of first-episode psychosis with assertive community follow-up.',
};

const NICE_PSY = {
  label: 'NICE CG178 — Psychosis and Schizophrenia',
  body: 'Antipsychotic monotherapy, psychosocial intervention, family involvement.',
};

const CMHT = {
  label: 'AIC Community Mental Health',
  body: 'Community Mental Health Teams + polyclinic mental-health services for stable patients.',
};

export const imhFirstEpisodeCase: CaseDefinition = {
  id: 'imh-first-psychosis',
  title: 'First-episode psychosis — 22 y/o, family brings him to ED',
  blurb:
    'Mr Lee, 22. NS-completed. Last 3 months: withdrawal, paranoid ideation, hearing voices, sleep loss. Mum and elder sister bring him to TTSH ED at 11pm after he locked himself in his bedroom for two days.',
  category: 'acute',
  primaryFacility: 'imh',
  involvedFacilities: ['ttsh', 'imh', 'shp-bukit-merah'],
  profileKey: 'taxiDriver',
  allowsWardChoice: false,
  guidelines: [EPIP, NICE_PSY, CMHT],
  pathway: [
    {
      id: 'ttsh-ed',
      department: 'ed',
      facility: 'ttsh',
      durationMin: 90,
      costSGD: 220,
      charge: 'a&e',
      caregiverBurden: { timeOffWorkHours: 8, financialWorry: 12, sleepDebt: 18 },
      framing: {
        patient: '(quiet, watchful, refusing to make eye contact.)',
        caregiver: 'You both haven\'t slept properly in days.',
        staff: 'ED: medically clear; toxicology negative. Psychiatric assessment done; high suicide risk screen flag.',
      },
      decision: {
        id: 'admit-or-divert',
        prompt: 'Acutely psychotic, family-supported, no current overt aggression. Where to admit?',
        weight: 1.5,
        reference: EPIP,
        options: [
          {
            id: 'imh-admit',
            label: 'Voluntary admission to IMH; EPIP team activated.',
            score: 10,
            rationale:
              'IMH is the national tertiary mental-health centre with EPIP for first-episode psychosis. Voluntary preserves engagement.',
            outcome: { patient: '(quietly accepts admission with mum present.)', caregiver: 'You sign forms; you cry quietly.', staff: 'IMH bed booked; transfer arranged.' },
          },
          {
            id: 'ttsh-psych',
            label: 'Admit to TTSH general medical ward; await psych consult.',
            score: 4,
            rationale: 'Acute psychosis better managed in a dedicated mental-health ward.',
            outcome: { patient: '', caregiver: '', staff: 'TTSH refers to IMH next morning.' },
          },
          {
            id: 'home-ed',
            label: 'Discharge home with crisis line; review at IMH outpatient in a week.',
            score: -4,
            rationale: 'High-risk first-episode psychosis; family unable to monitor 24/7. Inpatient care safer for full assessment.',
            outcome: { patient: '', caregiver: '', staff: 'Returns 3 days later in crisis.' },
          },
        ],
      },
    },
    {
      id: 'imh-acute-ward',
      department: 'psych-ward',
      facility: 'imh',
      durationMin: 14400,
      costSGD: 1200,
      charge: 'inpatient-ward',
      caregiverBurden: { timeOffWorkHours: 24, financialWorry: 8, sleepDebt: -10 },
      framing: {
        patient: '(starts engaging on D3; less guarded.)',
        caregiver: 'Family meeting on D5. The team explains psychosis carefully.',
        staff: 'EPIP team: started risperidone 2 mg, titrated to 4 mg by D7; PRN lorazepam; psychoeducation begun.',
      },
      decision: {
        id: 'antipsychotic-choice',
        prompt: 'First-episode psychosis. Antipsychotic selection?',
        weight: 1.2,
        reference: NICE_PSY,
        options: [
          {
            id: 'risperidone',
            label: 'Risperidone — second-generation, balance of efficacy + tolerability.',
            score: 10,
            rationale: 'Standard first-line in many SG centres for first-episode; metabolic monitoring built in.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
          {
            id: 'aripiprazole',
            label: 'Aripiprazole — partial agonist, lower metabolic side-effects.',
            score: 9,
            rationale: 'Reasonable choice; particularly attractive for younger patients concerned about weight gain.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
          {
            id: 'haloperidol',
            label: 'Haloperidol — first-generation.',
            score: 4,
            rationale: 'Effective but higher EPS; usually not first-line in early psychosis.',
            outcome: { patient: 'Stiffness develops on D4.', caregiver: '', staff: 'Switched.' },
          },
          {
            id: 'no-medication',
            label: 'Hold antipsychotics; psychotherapy alone.',
            score: -8,
            rationale: 'Active psychosis with risk; pharmacotherapy is part of the standard package.',
            outcome: { patient: '', caregiver: '', staff: 'Risk escalates.' },
          },
        ],
      },
    },
    {
      id: 'imh-step-down',
      department: 'subacute-ward',
      facility: 'imh',
      durationMin: 14400,
      costSGD: 800,
      charge: 'inpatient-ward',
      caregiverBurden: { timeOffWorkHours: 8, financialWorry: 0, sleepDebt: -8 },
      framing: {
        patient: '(joining ward groups; doing OT activities.)',
        caregiver: 'Visiting on weekends.',
        staff: 'Sub-acute ward: psychoeducation, family therapy sessions, vocational planning.',
      },
    },
    {
      id: 'discharge',
      department: 'discharge',
      facility: 'imh',
      durationMin: 60,
      framing: {
        patient: 'Quieter; tells you he wants to go back to NS reservist work eventually.',
        caregiver: 'You exhale.',
        staff: 'EPIP outreach assigned; CMHT and polyclinic mental-health linkage done.',
      },
      decision: {
        id: 'community-followup',
        prompt: 'Two-year EPIP outreach available. Best ongoing arrangement?',
        weight: 1.2,
        reference: CMHT,
        options: [
          {
            id: 'epip-cmht-poly',
            label: 'EPIP outreach (assertive community follow-up) + SHP polyclinic mental-health team for stable medication review.',
            score: 10,
            rationale:
              'Assertive community team prevents relapse; polyclinic right-sites stable maintenance.',
            outcome: { patient: 'A case manager calls weekly.', caregiver: 'You have a hotline that works.', staff: 'NEHR populated.' },
          },
          {
            id: 'imh-soc-only',
            label: 'IMH SOC only; no community team.',
            score: 5,
            rationale: 'Misses the relapse-prevention benefit of assertive outreach.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
          {
            id: 'no-followup',
            label: 'Discharge to GP only with phone numbers.',
            score: -6,
            rationale: 'High relapse risk; first-episode psychosis benefits from intensive specialist follow-up for ≥2 years.',
            outcome: { patient: '', caregiver: '', staff: 'Relapse within 6 months.' },
          },
        ],
      },
    },
  ],
};
