import type { CaseDefinition } from '../../lib/types';

const NCID_ISO = {
  label: 'NCID Outbreak Response Framework',
  body: 'National Centre for Infectious Diseases isolation, cohorting and PPE escalation guidance.',
};

const MOH_DORSCON = {
  label: 'MOH DORSCON system',
  body: 'Disease Outbreak Response System Condition — colour-coded national alert system.',
};

const WHO_IPC = {
  label: 'WHO Infection Prevention & Control (2022)',
  body: 'Global IPC guidance for novel respiratory pathogens.',
};

export const diseaseXOutbreak: CaseDefinition = {
  id: 'disease-x',
  title: { en: 'Disease X — 34 y/o returning traveller, severe respiratory illness', zh: 'X病 — 34岁回国旅客,严重呼吸道病症' },
  blurb:
    'Mr Wong, 34. Returned from a regional outbreak hotspot 5 days ago. Now febrile, hypoxic, dry cough. Walks into TTSH ED. DORSCON status was raised to Yellow that morning.',
  category: 'acute',
  primaryFacility: 'ttsh',
  involvedFacilities: ['ttsh', 'ncid'],
  profileKey: 'taxiDriver',
  allowsWardChoice: false,
  guidelines: [NCID_ISO, MOH_DORSCON, WHO_IPC],
  pathway: [
    {
      id: 'ttsh-arrival',
      department: 'entrance',
      facility: 'ttsh',
      durationMin: 5,
      framing: {
        patient: 'You feel dizzy at the entrance. The security guard asks about your travel history.',
        caregiver: 'Your wife waits outside; the entrance is now segregated.',
        staff: 'Front-line screener flags travel + fever + hypoxia. Activates outbreak protocol.',
      },
      decision: {
        id: 'initial-routing',
        prompt:
          'Walk-in with travel + fever + hypoxia at TTSH ED. DORSCON is Yellow. What do you do?',
        weight: 1.5,
        reference: NCID_ISO,
        options: [
          {
            id: 'isolate-then-transfer',
            label:
              'Move to TTSH negative-pressure cubicle in ED, full PPE, then transfer to NCID once stabilised.',
            score: 10,
            rationale:
              'Standard outbreak response — initial isolation at point of presentation, definitive cohorting at NCID. Limits cross-contamination in the general ED.',
            outcome: {
              patient: 'A staff member in a hood and gown wheels you to a side cubicle.',
              caregiver: 'You\'re asked to wait outside; given a mask and a leaflet.',
              staff: 'Outbreak protocol invoked; NCID infectious diseases on call paged.',
            },
          },
          {
            id: 'general-ed',
            label: 'Manage in the general ED stream — same as any pneumonia.',
            score: -8,
            rationale:
              'Risks seeding the ED with a novel pathogen — exactly the SARS 2003 failure mode at TTSH.',
            outcome: { patient: 'You wait in a packed ED cubicle.', caregiver: '', staff: 'Subsequent contact tracing identifies dozens of exposed patients and staff.' },
          },
          {
            id: 'send-home',
            label: 'Send home with safety-net advice; review in 48h.',
            score: -10,
            rationale: 'Hypoxic; ambulatory management is unsafe and risks community transmission.',
            outcome: { patient: 'Worsens overnight; collapses next morning.', caregiver: 'You panic.', staff: 'Cluster traced to community contacts.' },
          },
        ],
      },
    },
    {
      id: 'ttsh-isolation',
      department: 'ed',
      facility: 'ttsh',
      durationMin: 60,
      costSGD: 280,
      charge: 'a&e',
      caregiverBurden: { timeOffWorkHours: 6, financialWorry: 14, sleepDebt: 8 },
      framing: {
        patient: 'A doctor in goggles takes a swab. The cotton bud goes much deeper than you expected.',
        caregiver: 'You are texted not to come in. You stare at your phone.',
        staff: 'Bedside obs: SpO2 86% RA → 94% on 4L. CXR bilateral infiltrates. Multiplex PCR sent.',
      },
      decision: {
        id: 'ppe-level',
        prompt: 'What PPE level do you mandate for staff handling this patient?',
        weight: 1.2,
        reference: WHO_IPC,
        options: [
          {
            id: 'airborne-pre',
            label:
              'Airborne precautions: N95 + face shield + gown + gloves; AGP only in negative-pressure room.',
            score: 10,
            rationale:
              'For an unidentified novel respiratory pathogen, airborne precautions are the safe default until aetiology is known.',
            outcome: {
              patient: 'Staff appear in white hooded gowns and goggles. You feel both reassured and afraid.',
              caregiver: '',
              staff: 'PPE escalation logged; donning/doffing buddy assigned.',
            },
          },
          {
            id: 'droplet-only',
            label: 'Droplet precautions: surgical mask + gown + gloves only.',
            score: 2,
            rationale:
              'Inadequate for an unknown pathogen with possible airborne transmission.',
            outcome: { patient: '', caregiver: '', staff: 'Two staff develop symptoms a week later.' },
          },
          {
            id: 'standard-only',
            label: 'Standard precautions only.',
            score: -10,
            rationale: 'Healthcare-worker outbreak risk. SARS 2003 lesson learnt.',
            outcome: { patient: '', caregiver: '', staff: 'Multiple staff infections; ward closure.' },
          },
        ],
      },
    },
    {
      id: 'transfer-to-ncid',
      department: 'discharge',
      facility: 'ttsh',
      durationMin: 30,
      framing: {
        patient: 'A van comes to the back of the hospital. The staff are masked. You don\'t see the route.',
        caregiver: 'You receive a call from a Care Liaison Officer. They explain the transfer.',
        staff: 'Direct corridor transfer to NCID via dedicated bay; SCDF and NCID coordinated.',
      },
    },
    {
      id: 'ncid-isolation',
      department: 'isolation',
      facility: 'ncid',
      durationMin: 1440,
      costSGD: 1600,
      charge: 'inpatient-ward',
      caregiverBurden: { timeOffWorkHours: 14, financialWorry: 18, sleepDebt: 18 },
      framing: {
        patient: 'A new room. Even quieter. The door has two airlocks.',
        caregiver: 'Video call only. You see his face on a tablet.',
        staff: 'AIIR negative-pressure room. ID consultant rounds q12h. Empirical antivirals + supportive care.',
      },
      decision: {
        id: 'cohorting',
        prompt:
          'Six similar cases now in NCID. PCR suggests a novel coronavirus variant. How do you organise the ward?',
        weight: 1.2,
        reference: NCID_ISO,
        options: [
          {
            id: 'cohort-by-pcr',
            label:
              'Cohort confirmed cases on one floor, suspect/probable on another. Dedicated staff teams; no cross-floor movement.',
            score: 10,
            rationale:
              'Cohorting reduces nosocomial spread and protects the staff workforce — a core lesson from SARS and COVID-19.',
            outcome: {
              patient: 'You are moved to the confirmed-case floor. The view is the same as before.',
              caregiver: '',
              staff: 'Cohort plan published; staff rota fixed; cross-cover restricted.',
            },
          },
          {
            id: 'no-cohort',
            label: 'Mixed wards; rotating staff across all rooms.',
            score: -6,
            rationale: 'Cross-contamination and staff burnout.',
            outcome: { patient: '', caregiver: '', staff: 'Two HCW infections within a week.' },
          },
        ],
      },
    },
    {
      id: 'ncid-icu',
      department: 'icu',
      facility: 'ncid',
      durationMin: 4320,
      costSGD: 8400,
      charge: 'icu',
      caregiverBurden: { timeOffWorkHours: 30, financialWorry: 24, sleepDebt: 28 },
      framing: {
        patient: '(Sedated. The hum of the ventilator. Memory blank.)',
        caregiver: 'Daily 5-minute video calls. The consultant draws diagrams on a whiteboard.',
        staff: 'Day 3 — worsening hypoxia, intubated, prone-positioning, dexamethasone, antiviral.',
      },
    },
    {
      id: 'ncid-ward',
      department: 'ward',
      facility: 'ncid',
      durationMin: 7200,
      costSGD: 1800,
      charge: 'inpatient-ward',
      caregiverBurden: { timeOffWorkHours: 20, financialWorry: 8, sleepDebt: -10 },
      framing: {
        patient: 'You wake up. A nurse tells you it\'s been 8 days. You ask about your wife.',
        caregiver: 'You see him sit up for the first time. You both cry.',
        staff: 'Extubated. De-escalating O2. Two consecutive negative PCRs trigger de-isolation discussion.',
      },
    },
    {
      id: 'de-isolation',
      department: 'discharge',
      facility: 'ncid',
      durationMin: 60,
      framing: {
        patient: 'They unlock the door for you to walk through. The air on the other side smells different.',
        caregiver: 'You are allowed to bring his clothes. You hold his hand.',
        staff: 'Two negative PCRs ≥24h apart, afebrile ≥48h, clinically improved. De-isolation cleared.',
      },
      decision: {
        id: 'home-or-step-down',
        prompt:
          'He is medically stable but deconditioned, post-ICU. Where does he go next?',
        weight: 1,
        reference: NCID_ISO,
        options: [
          {
            id: 'community-rehab',
            label: 'Step-down to Yishun Community Hospital for 2 weeks of post-ICU rehab.',
            score: 10,
            rationale:
              'Post-ICU syndrome (ICU-acquired weakness, deconditioning) responds well to inpatient rehab; reduces 90-day readmission.',
            outcome: {
              patient: 'A new ward. The physio asks you to stand. You wobble but stand.',
              caregiver: 'You can finally visit in person. You sleep that night.',
              staff: 'YCH bed booked; AIC referral submitted; NEHR records flow.',
            },
          },
          {
            id: 'discharge-home',
            label: 'Discharge home with home-care therapy.',
            score: 5,
            rationale: 'Reasonable if home environment supports recovery; risk of falls and re-presentation.',
            outcome: { patient: 'Home feels strange.', caregiver: 'You take leave. You worry about every cough.', staff: 'PT/OT visits arranged.' },
          },
          {
            id: 'discharge-no-rehab',
            label: 'Discharge without rehab.',
            score: -3,
            rationale: 'Predictable functional decline after prolonged ICU stay.',
            outcome: { patient: '', caregiver: '', staff: 'Re-presents with a fall in 3 weeks.' },
          },
        ],
      },
    },
  ],
};
