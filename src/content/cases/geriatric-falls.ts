import type { CaseDefinition } from '../../lib/types';

const FRAILTY = {
  label: 'AIC Frailty Pathway',
  body: 'Singapore Agency for Integrated Care frailty assessment and intervention pathway.',
};

const NICE_FALLS = {
  label: 'NICE CG161 — Falls in older people',
  body: 'Multifactorial falls risk assessment, strength and balance training, home safety review.',
};

const AHHOME = {
  label: 'AH@Home Virtual Ward',
  body: 'Alexandra Hospital virtual-ward programme — hospital-level acute care delivered at home with home visits and remote monitoring.',
};

export const geriatricFallsCase: CaseDefinition = {
  id: 'geriatric-falls',
  title: { en: 'Falls + frailty — 81 y/o uncle, repeated falls, AH@Home pathway', zh: '跌倒与衰弱 — 81岁伯伯,反复跌倒,AH@Home路径' },
  blurb:
    'Mr Chua, 81. Lives alone in a 4-room HDB. Three falls in 6 months. Latest fall last night — bruising, no fracture on AH ED radiographs. AH@Home virtual ward offered.',
  category: 'acute',
  primaryFacility: 'ah',
  involvedFacilities: ['scdf', 'ah', 'home', 'slh', 'shp-bukit-merah'],
  profileKey: 'retiredAuntie',
  allowsWardChoice: true,
  guidelines: [FRAILTY, NICE_FALLS, AHHOME],
  pathway: [
    {
      id: 'ah-ed',
      department: 'ed',
      facility: 'ah',
      durationMin: 60,
      costSGD: 240,
      charge: 'a&e',
      caregiverBurden: { timeOffWorkHours: 6, financialWorry: 4, sleepDebt: 8 },
      framing: {
        patient: '(bruise on the right hip, walking with a slow shuffle.)',
        caregiver: 'Your daughter takes leave; she doesn\'t live with you.',
        staff: 'AH ED: no fracture; postural hypotension; polypharmacy (8 meds); CFS 5 (mild frailty).',
      },
      decision: {
        id: 'admit-or-aatomh',
        prompt: 'Stable; could be admitted or sent on AH@Home pathway. Which?',
        weight: 1.5,
        reference: AHHOME,
        options: [
          {
            id: 'ah-at-home',
            label: 'AH@Home virtual ward: home visits + remote monitoring + medication review at home.',
            score: 10,
            rationale:
              "Right setting for a fragile community-dwelling senior; reduces hospital-acquired risks and supports independence.",
            outcome: { patient: '(home that evening, with a kit on the kitchen table.)', caregiver: 'You take the next 3 days off; the team visits twice.', staff: 'AH@Home enrolled; vitals app paired.' },
          },
          {
            id: 'admit-ward',
            label: 'Admit to AH geriatric ward for full inpatient frailty work-up.',
            score: 7,
            rationale:
              'Reasonable for complex frailty; risks deconditioning. AH@Home achieves much of the same with better outcomes for many.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
          {
            id: 'discharge-no-plan',
            label: 'Discharge home with GP follow-up.',
            score: 2,
            rationale: 'Misses falls intervention package; high recurrence risk.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
        ],
      },
    },
    {
      id: 'home-visit-1',
      department: 'treatment-room',
      facility: 'home',
      durationMin: 90,
      costSGD: 220,
      charge: 'community-hospital',
      caregiverBurden: { timeOffWorkHours: 4, financialWorry: 2 },
      framing: {
        patient: 'A nurse shows you how to use the app and the BP machine.',
        caregiver: 'You take notes; you photograph every prescription.',
        staff: 'Home visit: medication reconciliation; rationalised from 8 to 5 meds. Identifies a loose rug and missing grab-rails.',
      },
      decision: {
        id: 'falls-intervention',
        prompt: 'Multifactorial falls intervention components — pick best package.',
        weight: 1.2,
        reference: NICE_FALLS,
        options: [
          {
            id: 'all-bundle',
            label:
              'Strength + balance program; OT home modifications; vitamin D + calcium check; BP standing-and-supine review; deprescribing; vision check via SNEC referral.',
            score: 10,
            rationale: 'Multifactorial bundle is what works in older adults — single interventions less effective.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
          {
            id: 'exercise-only',
            label: 'Exercise program only.',
            score: 5,
            rationale: 'Helpful but misses environmental + medication contributors.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
          {
            id: 'sedative-prn',
            label: 'PRN benzodiazepine for sleep concerns.',
            score: -8,
            rationale: 'Falls + benzodiazepine = higher fall risk and confusion. Avoid.',
            outcome: { patient: '', caregiver: '', staff: 'Reverted on consultant review.' },
          },
        ],
      },
    },
    {
      id: 'rehab-step-down',
      department: 'rehab-gym',
      facility: 'slh',
      durationMin: 14400,
      costSGD: 1800,
      charge: 'community-hospital',
      caregiverBurden: { timeOffWorkHours: -6, financialWorry: 4, sleepDebt: -10 },
      framing: {
        patient: '(stronger, walking unaided after 2 weeks.)',
        caregiver: 'You sleep better; she goes home with confidence.',
        staff: "St Luke's frailty rehab: 2 weeks; functional independence regained.",
      },
    },
    {
      id: 'long-term-care',
      department: 'discharge',
      facility: 'shp-bukit-merah',
      durationMin: 30,
      framing: {
        patient: 'A regular polyclinic for chronic check-ups.',
        caregiver: 'A weekly call schedule between you and the GP.',
        staff: 'SHP polyclinic shared-care plan with AIC Active Ageing Centre referral.',
      },
      decision: {
        id: 'long-term-plan',
        prompt: 'Long-term plan?',
        weight: 1,
        reference: FRAILTY,
        options: [
          {
            id: 'shared-aic',
            label: 'SHP polyclinic + AIC Active Ageing Centre + 6-monthly geriatrician review at AH.',
            score: 10,
            rationale: 'Continuity in primary care; community engagement; specialist surveillance for frailty progression.',
            outcome: { patient: 'You join a brisk-walk group at the AAC.', caregiver: 'You worry less.', staff: 'NEHR populated.' },
          },
          {
            id: 'soc-only',
            label: 'AH geriatrics SOC quarterly indefinitely.',
            score: 5,
            rationale: 'Specialist-only is unsustainable for the population.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
          {
            id: 'no-followup',
            label: 'No follow-up.',
            score: -4,
            rationale: 'High readmission risk.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
        ],
      },
    },
  ],
};
