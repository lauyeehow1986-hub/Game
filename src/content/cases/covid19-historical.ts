import type { CaseDefinition } from '../../lib/types';

const MOH_COVID = {
  label: 'MOH Singapore: COVID-19 Response',
  body: 'Public Health Preparedness Clinics, NCID lead, DORSCON Orange/Red, mass testing strategy, vaccine rollout.',
};

const NCID_COVID = {
  label: 'NCID COVID-19 Operations',
  body: 'NCID activated as the national isolation centre; cluster wards opened; HCW cohorting and rotation managed.',
};

const MOM_DORM = {
  label: 'MOM / MOH Dormitory Outbreak Response',
  body: 'Migrant-worker dormitory outbreaks 2020 — segregation, healthcare-on-site, vaccination drives.',
};

const VAX_ROLLOUT = {
  label: 'MOH Vaccination Rollout (2021)',
  body: 'mRNA-first nationwide rollout, vaccinated travel lanes, eldercare priority, paediatric subsequently.',
};

export const covid19Case: CaseDefinition = {
  id: 'covid19-historical',
  title: { en: 'COVID-19 — multi-cluster surge (historical educational scenario)', zh: 'COVID-19 — 多集群激增(历史教学情景)' },
  blurb:
    'Historical educational scenario. 2020-2022. SARS-CoV-2 multi-cluster surge in Singapore. Decisions span DORSCON escalation, NCID activation, dormitory outbreaks, ICU surge planning, and vaccine rollout — referenced to MOH and NCID public communications.',
  category: 'acute',
  primaryFacility: 'ncid',
  involvedFacilities: ['ttsh', 'ncid', 'home', 'gp-healthway'],
  profileKey: 'taxiDriver',
  allowsWardChoice: false,
  historical: true,
  citations: [
    'Ministry of Health Singapore. COVID-19 situational reports & press releases (2020-2022).',
    'NCID. Reflections from the COVID-19 frontline. NCID Annual Report 2020-2021.',
    'Ministry of Manpower / MOH. Joint statement on dormitory outbreak response, April 2020.',
    'Lai SHS et al. Lessons from Singapore: COVID-19 vaccine rollout and equity. The Lancet Regional Health, 2022.',
  ],
  guidelines: [MOH_COVID, NCID_COVID, MOM_DORM, VAX_ROLLOUT],
  pathway: [
    {
      id: 'first-import',
      department: 'screening',
      facility: 'ncid',
      durationMin: 30,
      framing: {
        patient: '(Returning traveller, mild fever, runny nose. PCR positive.)',
        caregiver: 'You watch the news evolve hour by hour.',
        staff: 'January 2020. First imported cases routed straight to NCID isolation. DORSCON Yellow.',
      },
      decision: {
        id: 'dorscon-escalation',
        prompt:
          'Imported cases growing; first community transmission cluster identified at the church. DORSCON action?',
        weight: 1.5,
        reference: MOH_COVID,
        options: [
          {
            id: 'orange',
            label:
              'Escalate to DORSCON Orange: ED visitor restrictions, staff splits, temperature screening, suspend large gatherings.',
            score: 10,
            rationale:
              'Matches what Singapore did in February 2020 once a transmission cluster was detected. Pre-emptive escalation buys time.',
            outcome: { patient: '', caregiver: 'Schools begin home-based learning briefly.', staff: 'Hospital visitor restrictions activated within hours.' },
            effects: { pandemic: { dorsconShift: 1, surgeCapacityPctDelta: 25 } },
          },
          {
            id: 'stay-yellow',
            label: 'Hold DORSCON Yellow; rely on NCID isolation alone.',
            score: -6,
            rationale: 'Misses the early-window opportunity to slow community transmission.',
            outcome: { patient: '', caregiver: '', staff: '' },
            effects: { setFlags: ['delayed-escalation'], pandemic: { ppeStockpilePctDelta: -15, surgeCapacityPctDelta: -10 } },
          },
        ],
      },
    },
    {
      id: 'pphc-and-gp',
      department: 'gp-room',
      facility: 'gp-healthway',
      durationMin: 30,
      costSGD: 60,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 2, financialWorry: 4, sleepDebt: 4 },
      framing: {
        patient: '(URTI symptoms. Worried.)',
        caregiver: '(Worried more.)',
        staff: 'Public Health Preparedness Clinic (PHPC) — subsidised respiratory consult during the outbreak; PCR / ART arranged.',
      },
      decision: {
        id: 'phpc-mobilisation',
        prompt:
          'Outpatient respiratory load is overwhelming polyclinics and EDs. What\'s the right system response?',
        weight: 1.2,
        reference: MOH_COVID,
        options: [
          {
            id: 'phpc-network',
            label:
              "Activate the Public Health Preparedness Clinic network: subsidised consults at GP chains and selected solo clinics; offload polyclinics; capture data into NEHR via PHPC e-claims.",
            score: 10,
            rationale:
              'PHPC was Singapore\'s answer to surge — geographically distributed primary-care capacity, integrated billing, and data flow.',
            outcome: { patient: 'You see your local GP for $10.', caregiver: 'You don\'t need to queue at the polyclinic.', staff: 'PHPC e-claim flows; data informs national modelling.' },
          },
          {
            id: 'centralise',
            label: 'Centralise all respiratory care at NCID and the polyclinics.',
            score: -4,
            rationale: 'Bottlenecks form; community transmission worsens; people delay seeking care.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
        ],
      },
    },
    {
      id: 'dorm-outbreak',
      department: 'ward',
      facility: 'home',
      durationMin: 1440,
      framing: {
        patient: '(Migrant worker, dormitory resident, fever and cough. Roommate also unwell.)',
        caregiver: '(Family overseas. Friends share information on phone group chats.)',
        staff: 'April 2020. Dormitory outbreak. Tens of thousands at risk in dense living conditions.',
      },
      decision: {
        id: 'dorm-response',
        prompt:
          'Dormitory clusters expanding. Best joint MOH / MOM response?',
        weight: 1.5,
        reference: MOM_DORM,
        options: [
          {
            id: 'on-site-care',
            label:
              "Stand up on-site clinics + isolation accommodation + active case-finding + segregation by floor; bring healthcare workers and meals to the dorms; vaccinate as supply arrives.",
            score: 10,
            rationale:
              'What Singapore eventually did: on-site Migrant Worker Medical Centres, segregation, mass testing, vaccination. Hospital surge protected.',
            outcome: { patient: 'You receive care in your dorm; meals delivered.', caregiver: 'Family overseas video-call you nightly.', staff: 'Acute hospitals not overwhelmed by dorm referrals.' },
            effects: { pandemic: { surgeCapacityPctDelta: 30 } },
          },
          {
            id: 'hospitalise-all',
            label: 'Transfer every dorm case to acute hospitals.',
            score: -8,
            rationale: 'Would have collapsed the hospital system. Community-based isolation was the right answer.',
            outcome: { patient: '', caregiver: '', staff: 'Hospitals overwhelmed.' },
            effects: { setFlags: ['system-strain'], pandemic: { surgeCapacityPctDelta: -40, ppeStockpilePctDelta: -20 } },
          },
          {
            id: 'no-action',
            label: 'No active intervention; rely on dorm operators.',
            score: -10,
            rationale: 'Equity failure and public-health failure.',
            outcome: { patient: '', caregiver: '', staff: '' },
            effects: { setFlags: ['system-strain'], pandemic: { surgeCapacityPctDelta: -30, dorsconShift: 1 } },
          },
        ],
      },
    },
    {
      id: 'icu-surge',
      department: 'icu',
      facility: 'ttsh',
      durationMin: 7200,
      costSGD: 12000,
      charge: 'icu',
      caregiverBurden: { timeOffWorkHours: 40, financialWorry: 10, sleepDebt: 30 },
      framing: {
        patient: '(Severe COVID-19, intubated, prone-positioned, dexamethasone, remdesivir.)',
        caregiver: 'Briefings by phone; cluster of relatives also unwell; iPad for family video calls organised.',
        staff: 'ICU surge: TTSH stands up additional ICU beds with redeployed staff; cluster-wide triage protocol.',
      },
      decision: {
        id: 'icu-surge-strategy',
        prompt:
          'Surge model — what works best when ICU demand outstrips baseline capacity?',
        weight: 1.2,
        reference: NCID_COVID,
        options: [
          {
            id: 'cluster-surge',
            label:
              "Cluster-wide surge: NCID leads; flexed ICU beds at TTSH/SGH/NUH; pause elective surgery; redeploy anaesthetic + theatre staff to ICU; cohort wards.",
            score: 10,
            rationale:
              'Multi-hospital cluster surge with flexible workforce was the operational model that held.',
            outcome: { patient: '', caregiver: '', staff: 'ICU bed availability stretched but maintained; elective backlog grows but acute care holds.' },
          },
          {
            id: 'no-elective-pause',
            label: 'Continue elective surgery to maintain throughput.',
            score: -6,
            rationale: 'Resource competition; elective patients displaced anyway.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
        ],
      },
    },
    {
      id: 'vax-rollout',
      department: 'treatment-room',
      facility: 'gp-healthway',
      durationMin: 45,
      costSGD: 0,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 1, financialWorry: -4, sleepDebt: -4 },
      framing: {
        patient: 'You queue at a vaccination centre. They give you a sticker.',
        caregiver: 'You text photos of stickers across the family chat.',
        staff: 'mRNA rollout: eldercare → adults → adolescents → paeds, with ART self-tests distributed nationally.',
      },
      decision: {
        id: 'vax-prioritisation',
        prompt:
          'Limited initial vaccine supply. Prioritisation strategy?',
        weight: 1.5,
        reference: VAX_ROLLOUT,
        options: [
          {
            id: 'elderly-hcw-first',
            label:
              'Healthcare workers first → community-care residents → 70+ → 60+ → step down by age + comorbidity. Public dashboards, multi-language outreach.',
            score: 10,
            rationale:
              'Mortality benefit and system-protection benefit maximised; matches Singapore actual rollout.',
            outcome: { patient: 'You get your first dose at month 6.', caregiver: 'Older relatives vaccinated weeks earlier.', staff: 'Coverage reaches >90% adults by 2H 2021.' },
          },
          {
            id: 'first-come-first-served',
            label: 'First-come-first-served regardless of risk.',
            score: -6,
            rationale: 'Younger lower-risk cohorts tend to capture early supply; mortality benefit lost.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
        ],
      },
    },
    {
      id: 'endemic-transition',
      department: 'discharge',
      facility: 'ncid',
      durationMin: 60,
      framing: {
        patient: 'You return to work. Masks slowly become optional.',
        caregiver: 'Family overseas visit again.',
        staff: 'October 2022 onwards: endemic transition; DORSCON drops to Yellow then Green; long-COVID clinic stands up at NCID and NUH.',
      },
      decision: {
        id: 'endemic-transition-plan',
        prompt:
          'Transition to endemic phase. Best long-term plan?',
        weight: 1,
        reference: MOH_COVID,
        options: [
          {
            id: 'right-site-and-surveillance',
            label:
              'Right-site stable patients to GP / polyclinic; maintain genomic surveillance; long-COVID clinics; standing dormitory + eldercare-facility outbreak protocols; vaccine boosters by risk group.',
            score: 10,
            rationale: 'Sustainable — preserves capacity and embeds preparedness.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
          {
            id: 'forget-everything',
            label: 'Stand down all surge protocols; assume the next outbreak is far away.',
            score: -6,
            rationale: 'The lesson of SARS was the lesson of COVID. Don\'t forget twice.',
            outcome: { patient: '', caregiver: '', staff: '' },
          },
        ],
      },
    },
  ],
};
