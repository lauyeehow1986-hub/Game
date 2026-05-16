import type { CaseDefinition } from '../../lib/types';

const RCOG = {
  label: 'RCOG / NICE / KKH Antenatal Pathways',
  body: 'Antenatal screening, gestational diabetes, anaemia, foetal monitoring.',
};

const KKH_OBS = {
  label: "KKH Women's Health CPG",
  body: 'KKH practice for low- and intermediate-risk obstetrics: birth-suite care, epidural pathway, postpartum care.',
};

const HEALTHIER_SG = {
  label: 'Healthier SG (paeds & post-natal)',
  body: 'Right-siting healthy mother and baby to a Healthier-SG GP for routine post-natal and well-baby care.',
};

export const obstetricDeliveryCase: CaseDefinition = {
  id: 'obstetric-delivery',
  title: { en: 'Antenatal-to-delivery — private GP shared-care to KKH delivery', zh: '产前到分娩 — 私立家庭医生联合护理至KKH分娩' },
  blurb:
    "Mrs Lim, 31. First pregnancy. Antenatal care shared between Healthway (GP) and a private OBGYN at Mt Elizabeth Novena. Booked for delivery at KKH (subsidised, B2 ward) given developing GDM. Waters break at 39+2 at home.",
  category: 'elective',
  primaryFacility: 'kkh',
  involvedFacilities: ['gp-healthway', 'novena-medical', 'kkh', 'home', 'shp-tampines'],
  profileKey: 'taxiDriver',
  allowsWardChoice: true,
  guidelines: [RCOG, KKH_OBS, HEALTHIER_SG],
  pathway: [
    {
      id: 'gp-shared-care',
      department: 'gp-room',
      facility: 'gp-healthway',
      durationMin: 30,
      costSGD: 95,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 2, financialWorry: 4 },
      framing: {
        patient: 'You enrolled with this GP early. The receptionist remembers your name.',
        caregiver: 'Your husband attends every visit.',
        staff: 'GP shared-care 28-week visit: BP normal, OGTT 1h 11.4 mmol/L → GDM. Refers to private OBGYN; recommends KKH delivery.',
      },
      decision: {
        id: 'delivery-venue',
        prompt:
          'GDM diagnosed. Delivery venue?',
        weight: 1.5,
        reference: KKH_OBS,
        options: [
          {
            id: 'kkh-subsidised',
            label: 'KKH subsidised (B2/C); continue private OBGYN antenatally; switch to KKH team for delivery.',
            score: 10,
            rationale:
              'Best balance: continuity of antenatal care + tertiary delivery for GDM with neonatal back-up. Cost-aware for a young couple.',
            outcome: { patient: 'A clear plan.', caregiver: 'You note the dates.', staff: 'Cross-sector referral letter; KKH antenatal slots booked.' },
          },
          {
            id: 'mt-e-private',
            label: 'Continue private all the way through Mt Elizabeth Novena delivery.',
            score: 6,
            rationale:
              'Convenient and continuous but considerably higher cost; appropriate if IP rider supports it.',
            outcome: { patient: '', caregiver: 'You discuss the bill estimate.', staff: 'Acceptable.' },
          },
          {
            id: 'all-public',
            label: 'Switch all care to KKH antenatal SOC subsidised, drop private OBGYN.',
            score: 7,
            rationale: 'Cheapest; loses some continuity with the private OBGYN she trusted.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
        ],
      },
    },
    {
      id: 'obs-soc',
      department: 'soc',
      facility: 'novena-medical',
      durationMin: 45,
      costSGD: 280,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 3, financialWorry: 6 },
      framing: {
        patient: 'A reassuring scan. The OBGYN explains GDM diet and the KKH plan.',
        caregiver: 'You ask about glucose monitoring.',
        staff: 'GDM dietary trial; capillary glucose log given. KKH antenatal booking confirmed.',
      },
    },
    {
      id: 'home-rom',
      department: 'entrance',
      facility: 'home',
      durationMin: 30,
      framing: {
        patient: '(Waters break at 4am at home. Contractions every 7 minutes.)',
        caregiver: 'You\'re calm because you\'ve been to two antenatal classes.',
        staff: '(virtual triage suggests proceeding to KKH delivery suite.)',
      },
      decision: {
        id: 'route-to-delivery',
        prompt: '4am, ROM with regular contractions. Best route?',
        weight: 1,
        reference: KKH_OBS,
        options: [
          {
            id: 'grab-kkh',
            label: 'Drive (or Grab) to KKH labour ward; call ahead.',
            score: 10,
            rationale: 'Standard. KKH staff are warned; bag is packed.',
            outcome: { patient: 'A quick ride.', caregiver: 'You arrive together.', staff: 'Ward warned.' },
          },
          {
            id: '995',
            label: 'Call 995.',
            score: 5,
            rationale: 'Reasonable if precipitous, but EMS resource use is high for routine labour.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
          {
            id: 'wait-home',
            label: 'Wait at home until contractions are 3 min apart.',
            score: 3,
            rationale: 'Acceptable in early labour but ROM increases ascending infection risk; head in to be checked.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
        ],
      },
    },
    {
      id: 'kkh-labour',
      department: 'maternity-ward',
      facility: 'kkh',
      durationMin: 720,
      costSGD: 1800,
      charge: 'inpatient-ward',
      caregiverBurden: { timeOffWorkHours: 12, financialWorry: 6, sleepDebt: 12 },
      framing: {
        patient: 'A labour suite. The midwife has done this thousands of times.',
        caregiver: 'You hold her hand. The cup of ice chips becomes very important.',
        staff: 'Augmentation with oxytocin, epidural sited at 5 cm. Foetal monitoring reassuring.',
      },
      decision: {
        id: 'analgesia',
        prompt: 'Choose intrapartum analgesia plan.',
        weight: 1.2,
        reference: KKH_OBS,
        options: [
          {
            id: 'epidural',
            label: 'Epidural at 5 cm with patient request; gas-and-air pre-epidural.',
            score: 10,
            rationale: 'Excellent analgesia; KKH epidural rates among highest globally.',
            outcome: { patient: 'You smile through the second stage.', caregiver: 'You take a photo at every milestone.', staff: '' },
          },
          {
            id: 'pethidine',
            label: 'IV pethidine only.',
            score: 4,
            rationale: 'Older agent; respiratory depression risk for baby if given near delivery.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
          {
            id: 'no-analgesia',
            label: 'No pharmacological analgesia.',
            score: 5,
            rationale: 'Patient choice — perfectly acceptable if she prefers.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
        ],
      },
    },
    {
      id: 'delivery',
      department: 'ot',
      facility: 'kkh',
      durationMin: 90,
      costSGD: 2400,
      charge: 'inpatient-procedure',
      caregiverBurden: { timeOffWorkHours: 4, financialWorry: 4, sleepDebt: 6 },
      framing: {
        patient: 'You both cry the moment you hear her.',
        caregiver: 'You cut the cord.',
        staff: 'Spontaneous vertex delivery, female 3.1 kg, Apgar 9/10. Skin-to-skin done. EBL minimal.',
      },
    },
    {
      id: 'postnatal-ward',
      department: 'maternity-ward',
      facility: 'kkh',
      durationMin: 2880,
      costSGD: 1100,
      charge: 'inpatient-ward',
      caregiverBurden: { timeOffWorkHours: 24, financialWorry: 4, sleepDebt: 18 },
      framing: {
        patient: 'You learn to breastfeed. The midwife is patient.',
        caregiver: 'You bring teh-o.',
        staff: 'Mother and baby well; baby NIPS clear; vit K + hep B given; BCG before discharge.',
      },
    },
    {
      id: 'postnatal-discharge',
      department: 'discharge',
      facility: 'kkh',
      durationMin: 60,
      framing: {
        patient: 'You leave with a tiny human asleep on your chest.',
        caregiver: 'A new car-seat.',
        staff: 'D2 discharge; appointment with SHP for 6-week post-natal + well-baby; private OBGYN follow-up at 6 weeks.',
      },
      decision: {
        id: 'baby-followup',
        prompt: 'Plan for mother and baby?',
        weight: 1,
        reference: HEALTHIER_SG,
        options: [
          {
            id: 'shared-poly-gp',
            label: 'SHP polyclinic for routine baby + mother (vaccinations, weight checks); private OBGYN 6-week review.',
            score: 10,
            rationale: 'Routine well-baby and post-natal at primary care; specialist for the 6-week tie-off.',
            outcome: { patient: 'You schedule the 1-month appointments.', caregiver: '', staff: 'NEHR contains discharge summary; SHP receives via NEHR.' },
          },
          {
            id: 'kkh-everything',
            label: 'KKH SOC for everything baby + mother for the first year.',
            score: 4,
            rationale: 'Specialist time better used for complex cases; routine well-baby fits primary care.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
          {
            id: 'no-followup',
            label: 'No structured follow-up.',
            score: -4,
            rationale: 'Misses immunisations and post-natal mood screening.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
        ],
      },
    },
  ],
};
