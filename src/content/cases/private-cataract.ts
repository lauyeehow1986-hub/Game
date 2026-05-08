import type { CaseDefinition } from '../../lib/types';

const NICE_CATARACT = {
  label: 'NICE NG77 — Cataracts in adults',
  body: 'NICE guideline on cataract management; surgery indicated when cataract impacts function or quality of life.',
};

const MOH_DAY_SURGERY = {
  label: 'MOH Day-Surgery Subsidy Framework',
  body: 'Day-surgery procedures including cataract phacoemulsification are eligible for ward-class-equivalent subsidy at restructured hospitals.',
};

const IP_RIDERS = {
  label: 'MOH Integrated Shield Plan / Rider Reform (2018)',
  body: 'Co-payment requirements on IP riders; private as-charged plans subject to claim-based pricing and panel network.',
};

const HEALTHIER_SG = {
  label: 'Healthier SG',
  body: 'Right-siting stable post-op patients to a primary-care provider for follow-up.',
};

export const privateCataract: CaseDefinition = {
  id: 'private-cataract',
  title: 'Cataract — public SNEC vs private (Mt Elizabeth Novena)',
  blurb:
    'Mdm Lim, 71. Right-eye cataract, vision down to 6/24, struggling with reading and night driving. CHAS Orange + Merdeka Generation; her son insists on a private surgeon she found online. She has an IP rider on a Class B1/A plan.',
  category: 'elective',
  primaryFacility: 'snec',
  involvedFacilities: ['snec', 'mt-elizabeth-novena', 'novena-medical', 'gp-healthway'],
  profileKey: 'retiredAuntie',
  allowsWardChoice: true,
  guidelines: [NICE_CATARACT, MOH_DAY_SURGERY, IP_RIDERS, HEALTHIER_SG],
  pathway: [
    {
      id: 'gp-referral',
      department: 'gp-room',
      facility: 'gp-healthway',
      durationMin: 25,
      costSGD: 65,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 2, financialWorry: 4 },
      framing: {
        patient: 'You squint at the eye chart. The doctor confirms what you suspected.',
        caregiver: 'Your son is on his phone reading reviews of private eye surgeons.',
        staff: 'GP confirms cataract; offers subsidised SNEC referral or private referral.',
      },
      decision: {
        id: 'venue-choice',
        prompt:
          'Where to refer? She has CHAS Orange + MG card; IP rider B1/A integrated plan with co-payment.',
        weight: 1.5,
        reference: IP_RIDERS,
        options: [
          {
            id: 'snec-subsidised',
            label:
              'Subsidised referral to SNEC; expect day-surgery phaco at ~S$1,200 patient share post-subsidy and MediShield.',
            score: 10,
            rationale:
              'Best value for a low-income MG senior. SNEC volumes among highest in the world; outcomes equivalent to private. Honour IP only when value-add justifies it.',
            outcome: {
              patient: 'A pink referral letter; appointment in 5 weeks.',
              caregiver: 'You grumble about the wait but accept the bill estimate.',
              staff: 'NEHR populated; SNEC accepts.',
            },
          },
          {
            id: 'private-mt-e',
            label:
              "Private referral to Mt Elizabeth Novena (son's choice); will rely on IP rider.",
            score: 5,
            rationale:
              'Choice of surgeon and short wait, but private day-surgery cataract is ~S$5,000–8,000 — IP rider co-payment plus excess can still be material; avoidable cost for a routine procedure.',
            outcome: {
              patient: 'A consult in 2 weeks; an immaculate clinic.',
              caregiver: 'You feel reassured; the bill arrives later.',
              staff: 'Private referral letter issued; cost discussed.',
            },
          },
          {
            id: 'wait-watch',
            label: 'Defer surgery, prescribe new spectacles only.',
            score: 3,
            rationale:
              'Reasonable if function is acceptable, but vision 6/24 is well below driving threshold; quality-of-life impact warrants surgery.',
            outcome: { patient: 'You stop driving at night.', caregiver: 'You drive her around.', staff: 'Conservative; revisit in 6 months.' },
          },
        ],
      },
    },
    {
      id: 'private-consult',
      department: 'soc',
      facility: 'novena-medical',
      durationMin: 45,
      costSGD: 350,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 3, financialWorry: 8 },
      framing: {
        patient: 'A bright suite, soft music. The receptionist offers tea.',
        caregiver: 'You scan the bill at the front desk.',
        staff: 'Private OT&A: dense nuclear cataract right; mild on left. Consents signed; surgery booked at MEN day-surgery.',
      },
      decision: {
        id: 'lens-choice',
        prompt:
          'IOL choice: monofocal vs multifocal vs toric. Strong family pressure for the most premium lens.',
        weight: 1.2,
        reference: NICE_CATARACT,
        options: [
          {
            id: 'monofocal',
            label:
              'Monofocal IOL (standard, fully covered by IP for the lens; reading glasses for near).',
            score: 10,
            rationale:
              'Excellent visual outcomes at any centre; standard of care. Premium lenses charge a non-claimable upgrade; not justified by clinical benefit in most patients.',
            outcome: {
              patient: 'You will need reading glasses afterwards. You are fine with that.',
              caregiver: 'Bill comes down significantly.',
              staff: 'Sensible; patient counselled.',
            },
          },
          {
            id: 'multifocal',
            label:
              'Multifocal premium IOL — patient pays substantial out-of-pocket upgrade.',
            score: 6,
            rationale:
              'Acceptable in selected patients comfortable with halos / glare and able to afford the upgrade; not better outcomes for everyone.',
            outcome: { patient: 'No more glasses for most things — but halos at night.', caregiver: 'Bill grows.', staff: 'Counselled on glare.' },
          },
          {
            id: 'toric',
            label:
              'Toric IOL for astigmatism (≥1.5 D corneal astigmatism on biometry).',
            score: 8,
            rationale:
              'Indicated when corneal astigmatism is significant; refractive outcomes better than monofocal here. Some upgrade cost.',
            outcome: { patient: '', caregiver: '', staff: 'Reasonable when astigmatism present.' },
          },
        ],
      },
    },
    {
      id: 'private-surgery',
      department: 'ot',
      facility: 'mt-elizabeth-novena',
      durationMin: 60,
      costSGD: 6800,
      charge: 'inpatient-procedure',
      caregiverBurden: { timeOffWorkHours: 6, financialWorry: 8, sleepDebt: 4 },
      framing: {
        patient: 'A short procedure. Bright lights, drops, your eye numb. You watch a colour change you can\'t describe.',
        caregiver: 'You wait in a quiet lounge with a magazine.',
        staff: 'Phacoemulsification + monofocal IOL implant right eye. Uneventful. Day-surgery discharge.',
      },
    },
    {
      id: 'private-followup',
      department: 'soc',
      facility: 'novena-medical',
      durationMin: 20,
      costSGD: 220,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 2 },
      framing: {
        patient: 'Day-1 review. The chart now shows 6/9. You read the numbers aloud.',
        caregiver: 'You both laugh.',
        staff: 'POD1 — uncorrected VA 6/9 right; quiet AC; IOP 14. Drops schedule reinforced.',
      },
    },
    {
      id: 'right-siting',
      department: 'discharge',
      facility: 'novena-medical',
      durationMin: 10,
      framing: {
        patient: 'They ask about your other eye. You say not yet.',
        caregiver: 'You note the next review date.',
        staff: 'Long-term plan: GP for chronic eye drops if needed; second eye when ready.',
      },
      decision: {
        id: 'long-term',
        prompt: 'Long-term plan for the second eye and ongoing eye health?',
        weight: 1,
        reference: HEALTHIER_SG,
        options: [
          {
            id: 'snec-second-eye',
            label:
              "Subsidised SNEC for the second eye when ready; GP for routine optometry / hypertension; revisit in 12 months.",
            score: 10,
            rationale:
              'Once private convenience served the urgent eye, the second eye does not need the same premium; SNEC offers the same outcome at lower cost.',
            outcome: {
              patient: 'You agree.',
              caregiver: 'Your wallet thanks you.',
              staff: 'NEHR populated; subsidised pathway re-engaged.',
            },
          },
          {
            id: 'private-everything',
            label: 'Continue private for second eye and routine review.',
            score: 4,
            rationale: 'Convenient but doubles cost without clinical advantage.',
            outcome: { patient: '', caregiver: 'Cost climbs.', staff: 'OK.' },
          },
          {
            id: 'no-followup',
            label: 'No structured plan; come back when symptomatic.',
            score: -3,
            rationale: 'Misses the opportunity to plan the second eye and detect glaucoma / AMD early.',
            outcome: { patient: '', caregiver: '', staff: 'Missed surveillance.' },
          },
        ],
      },
    },
  ],
};
