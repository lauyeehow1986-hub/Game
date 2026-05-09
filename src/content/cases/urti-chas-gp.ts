import type { CaseDefinition } from '../../lib/types';

const HEALTHIER_SG = {
  label: 'Healthier SG (2023)',
  body: "MOH primary-care continuity programme; one-physician chronic-care relationship.",
};

const CHAS = {
  label: 'CHAS Subsidy Framework',
  body: 'Community Health Assist Scheme — tiered subsidies (Blue / Orange / Green + PG/MG) at participating private GPs and dentists.',
};

const TELEMED_GUIDE = {
  label: 'MOH Direct Telemedicine Services Guidelines',
  body: 'MOH guidance on safe telemedicine practice — scope, identity verification, prescribing limits, NEHR contribution.',
};

const ANTIBIOTIC_STEWARDSHIP = {
  label: 'MOH Antimicrobial Stewardship',
  body: 'Singapore primary-care guidance on URTI antibiotic prescribing — most viral, do not prescribe.',
};

export const urtiChasGP: CaseDefinition = {
  id: 'urti-chas-gp',
  title: 'URTI — adult patient choosing telemed vs CHAS GP vs polyclinic',
  blurb:
    'Mr Rajan, 62. Long-distance lorry driver, CHAS Orange, on metformin and SGLT2i for T2DM. Two days of cough, runny nose, mild fever. Wife wants him to "see someone today".',
  category: 'outpatient',
  primaryFacility: 'gp-healthway',
  involvedFacilities: ['home', 'telemed-doctor-anywhere', 'gp-healthway', 'nhgp-toa-payoh'],
  profileKey: 'diabeticUncle',
  allowsWardChoice: false,
  guidelines: [HEALTHIER_SG, CHAS, TELEMED_GUIDE, ANTIBIOTIC_STEWARDSHIP],
  pathway: [
    {
      id: 'home-decision',
      department: 'entrance',
      facility: 'home',
      durationMin: 10,
      framing: {
        patient: "You're tired. You'd rather sleep. Your wife is in the doorway with her phone.",
        caregiver: 'You scroll through three healthcare apps. The wait at the polyclinic is 90 minutes online.',
        staff: '(care coordinator perspective: most stable URTIs can be handled at primary care or via telemed safely)',
      },
      decision: {
        id: 'choose-entry-point',
        prompt:
          'Adult with mild URTI, on a chronic disease, CHAS Orange. Where should the wife route him for fastest, safest, cheapest care?',
        weight: 1.5,
        reference: HEALTHIER_SG,
        options: [
          {
            id: 'chas-gp',
            label:
              'CHAS-participating GP nearby (Healthway Medical) — same-day appointment, CHAS Orange subsidy applies; routine drop-off for metformin refill at the same visit.',
            score: 10,
            rationale:
              "Single visit handles acute symptoms + chronic prescription continuity at lowest patient cost (CHAS subsidy). Best fit for Healthier-SG continuity.",
            outcome: {
              patient: 'A 7-minute walk. The clinic remembers your name.',
              caregiver: 'You take 30 minutes off work.',
              staff: 'Patient seen, prescription refilled, NEHR contribution from CHAS clinic.',
            },
          },
          {
            id: 'telemed',
            label:
              'Doctor Anywhere telemed — instant video consult; e-prescription delivered in 2 hours.',
            score: 7,
            rationale:
              'Fast and convenient for clearly mild URTI. Cost is private rate (no CHAS via telemed providers); chronic-disease prescription via telemed only safe if recent labs available.',
            outcome: {
              patient: '(You answer questions on a video call from the sofa.)',
              caregiver: 'Resolved in 30 minutes.',
              staff: 'Telemed note may or may not flow into NEHR; chronic care continuity at risk if used as primary route.',
            },
          },
          {
            id: 'polyclinic',
            label:
              'Walk-in polyclinic (NHGP Toa Payoh) — most subsidised but long wait.',
            score: 6,
            rationale:
              "Cheapest but longest wait; polyclinic better used for chronic-disease reviews and complex acute presentations.",
            outcome: {
              patient: 'Two-hour wait. You both regret the choice.',
              caregiver: 'Half-day off work.',
              staff: 'Polyclinic capacity used on a self-limiting URTI.',
            },
          },
          {
            id: 'self-care-only',
            label: 'Self-medicate from a pharmacy; no consult.',
            score: 3,
            rationale:
              'Reasonable for very mild symptoms in a healthy adult — but he has T2DM, so threshold to seek care should be slightly lower.',
            outcome: { patient: 'You sleep better that afternoon.', caregiver: 'You worry quietly.', staff: '' },
          },
          {
            id: 'go-to-ed',
            label: '995 to TTSH / KTPH ED.',
            score: -8,
            rationale:
              'Wholly inappropriate for a mild URTI; clogs ED capacity and incurs major cost / time.',
            outcome: { patient: '', caregiver: '', staff: 'ED capacity squeezed unnecessarily.' },
          },
        ],
      },
    },
    {
      id: 'gp-consult',
      department: 'gp-room',
      facility: 'gp-healthway',
      durationMin: 20,
      costSGD: 65,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 1, financialWorry: 2 },
      framing: {
        patient: 'The doctor smells of coffee and listens to your chest carefully.',
        caregiver: 'You go for kopi while you wait.',
        staff: 'GP: T 37.6, clear chest, mild pharyngeal injection, no red flags. Reviews recent HbA1c (6.6%) — well controlled.',
      },
      decision: {
        id: 'antibiotic-choice',
        prompt:
          'Mild URTI, no red flags, T2DM well controlled, no consolidation on examination. What do you prescribe?',
        weight: 1.5,
        reference: ANTIBIOTIC_STEWARDSHIP,
        options: [
          {
            id: 'symptomatic-only',
            label:
              'Symptomatic care only: paracetamol PRN, hydration, salt-water gargle. Safety-net advice. No antibiotic. Continue diabetes meds; sick-day rules briefed.',
            score: 10,
            rationale:
              "Most URTIs are viral. Antibiotic stewardship matters — Singapore primary-care AMR rates rising. Sick-day rules for SGLT2i particularly important (hold if dehydrated to avoid euDKA).",
            outcome: {
              patient: 'A simple plan and a spare day.',
              caregiver: 'You thank the doctor.',
              staff: 'Adherent to MOH stewardship; brief diabetes safety check done.',
            },
          },
          {
            id: 'amoxiclav',
            label: 'Co-amoxiclav 625 mg TDS x 5 days.',
            score: -4,
            rationale:
              'Routine antibiotic for URTI is contrary to stewardship guidelines; adds adverse-effect risk and contributes to community AMR.',
            outcome: { patient: 'Diarrhoea on day 2.', caregiver: '', staff: 'Stewardship audit flag.' },
          },
          {
            id: 'sglt2-cont',
            label:
              'Symptomatic care + continue SGLT2i without sick-day brief.',
            score: 4,
            rationale:
              'Misses an important safety conversation: SGLT2i should be held if the patient is dehydrated / not eating to prevent euglycaemic DKA.',
            outcome: { patient: '', caregiver: '', staff: 'Patient told to come back if worse; no sick-day plan.' },
            effects: { setFlags: ['sglt2-sick-day-missed'] },
          },
        ],
      },
    },
    {
      id: 'eu-dka-readmission',
      department: 'ed',
      facility: 'ttsh',
      requiresAnyFlag: ['sglt2-sick-day-missed'],
      durationMin: 240,
      costSGD: 920,
      charge: 'a&e',
      caregiverBurden: { timeOffWorkHours: 8, financialWorry: 14, sleepDebt: 16 },
      framing: {
        patient: '(Day 4: nauseous, drowsy, breathing fast.)',
        caregiver: 'You panic when he is too tired to walk to the kitchen. You drive to TTSH ED.',
        staff: 'Euglycaemic DKA: glucose 9 but pH 7.18, ketones +++. Likely SGLT2i-related, dehydration, missed sick-day rules.',
      },
      decision: {
        id: 'eu-dka-management',
        prompt: 'eu-DKA on a routine URTI. Plan?',
        weight: 1.2,
        reference: ANTIBIOTIC_STEWARDSHIP,
        options: [
          {
            id: 'standard-dka',
            label: 'Stop SGLT2i; IV fluids + insulin infusion + dextrose; ICU admission. Endocrine review for restart timing.',
            score: 10,
            rationale: 'Standard eu-DKA management; SGLT2i must be paused; restart timed once euvolaemic and well.',
            outcome: { patient: '(IV running.)', caregiver: 'You re-learn the medication list.', staff: '' },
            effects: { clearFlags: ['sglt2-sick-day-missed'] },
          },
          {
            id: 'continue-sglt2',
            label: 'Continue SGLT2i; treat infection only.',
            score: -8,
            rationale: 'SGLT2i with active ketosis worsens the DKA loop.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
        ],
      },
    },
    {
      id: 'pharmacy-pickup',
      department: 'pharmacy',
      facility: 'gp-healthway',
      durationMin: 10,
      costSGD: 35,
      charge: 'pharmacy',
      framing: {
        patient: 'A small bag with a paracetamol box and a top-up of metformin.',
        caregiver: 'You walk home together; it is sunny and bright.',
        staff: 'CHAS Orange subsidy applied at counter; receipt notes Flexi-MediSave on chronic items.',
      },
    },
    {
      id: 'right-siting-decision',
      department: 'discharge',
      facility: 'gp-healthway',
      durationMin: 10,
      framing: {
        patient: 'The receptionist asks if you want to enrol with this GP under Healthier SG.',
        caregiver: 'You both look at each other.',
        staff: 'Healthier-SG enrolment discussion: continuity, CDMP, single-physician relationship.',
      },
      decision: {
        id: 'healthier-sg-enrol',
        prompt:
          "He has a chronic disease and uses different clinics. What's the long-term primary-care plan?",
        weight: 1,
        reference: HEALTHIER_SG,
        options: [
          {
            id: 'enrol-here',
            label:
              'Enrol under Healthier SG with this CHAS-GP for both acute and chronic care; maintain SOC at NUH endo for tougher decisions.',
            score: 10,
            rationale:
              "Healthier-SG enrolment delivers continuity, CDMP-subsidised chronics, and a single-physician relationship. SOC reserved for complexity.",
            outcome: {
              patient: 'You sign up. You\'re given a card.',
              caregiver: 'You add the GP to your phone contacts.',
              staff: 'Enrolment recorded in NEHR; care plan handover initiated.',
            },
          },
          {
            id: 'shop-around',
            label: 'Continue using whichever clinic is most convenient on the day.',
            score: 4,
            rationale:
              'Loses continuity; chronic care fragmented; misses Healthier-SG / CDMP optimisation.',
            outcome: { patient: '', caregiver: '', staff: 'Care plan harder to coordinate.' },
          },
          {
            id: 'telemed-only',
            label: 'Telemed for everything from now on.',
            score: 3,
            rationale:
              'Convenient but loses physical examination, in-clinic vaccinations, and (currently) full NEHR continuity.',
            outcome: { patient: '', caregiver: '', staff: 'Useful adjunct but not best as sole care channel.' },
          },
        ],
      },
    },
  ],
};
