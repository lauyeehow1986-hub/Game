/**
 * Curated case sequences for educators. A curriculum is an ordered list
 * of case ids with a name, blurb, and learning objectives. Progress is
 * tracked via the player's bestScores (a case counts as "completed" once
 * it has a recorded score).
 */

export interface Curriculum {
  id: string;
  title: string;
  blurb: string;
  /** Bulleted learning objectives shown when the curriculum is opened. */
  objectives: string[];
  /** Ordered case ids. Curriculum advances through these in sequence. */
  caseIds: string[];
}

export const CURRICULA: Curriculum[] = [
  {
    id: 'cardio',
    title: 'Cardiology pathway',
    blurb:
      'Acute cardiac care from chest pain to chronic-disease right-siting. Five cases spanning ED, cath lab, ICU, ward, and primary-care continuity.',
    objectives: [
      'Recognise STEMI and run a door-to-balloon < 90 min pathway.',
      'Apply the four-pillar HFrEF GDMT (ARNI / BB / MRA / SGLT2i).',
      'Choose ward class with means-test, MediShield Life and CHAS / PG / MG context.',
      'Right-site stable post-MI / post-HF patients to a Healthier-SG GP.',
    ],
    caseIds: ['stemi-acute', 'hf-outpatient', 'outpatient-diabetes', 'urti-chas-gp'],
  },
  {
    id: 'acute-emergencies',
    title: 'Acute emergencies',
    blurb:
      'Time-pressured acute care: STEMI, sepsis, stroke, trauma. The four cases that exercise the door-to-X timer most.',
    objectives: [
      'Run the Surviving Sepsis hour-1 bundle.',
      'Activate stroke fast-track to thrombectomy in eligible patients.',
      'Use the SCDF major-trauma destination protocol.',
      'Recognise when delayed action triggers deterioration branches.',
    ],
    caseIds: ['stemi-acute', 'sepsis-bundle', 'stroke-thrombectomy', 'major-trauma'],
  },
  {
    id: 'cross-sector',
    title: 'Cross-sector pathways',
    blurb:
      'How patients flow between public, private, primary, and community sectors. Includes hand-carry CD scenes when records don\'t flow.',
    objectives: [
      'Decide between subsidised SOC and private referral routes.',
      'Plan a private → public handover when imaging is on a CD.',
      'Coordinate across NHG / SingHealth / NUHS for a cancer pathway.',
      'Choose primary-care entry routing (CHAS GP vs telemed vs polyclinic vs ED).',
    ],
    caseIds: ['breast-ca-crosscluster', 'private-to-public-handover', 'private-cataract', 'urti-chas-gp'],
  },
  {
    id: 'end-of-life',
    title: 'End-of-life and frailty',
    blurb:
      'Advance care planning, home hospice, frailty rehab, geriatric falls. The cases that most reward asking what the patient actually wants.',
    objectives: [
      'Honour an Advance Care Plan when the patient presents acutely.',
      'Build a home-hospice anticipatory medication kit + 24/7 plan.',
      'Use AH@Home virtual ward for a community-dwelling frail senior.',
      'Engage AIC and step-down to St Luke\'s / OCH / SLH after acute care.',
    ],
    caseIds: ['palliative-eol', 'geriatric-falls', 'elective-thr', 'ckd-dialysis'],
  },
  {
    id: 'pandemic',
    title: 'Outbreak response',
    blurb:
      'DORSCON, NCID, ED isolation, and the SARS 2003 / COVID-19 historical reconstructions.',
    objectives: [
      'Default to airborne precautions for unidentified novel respiratory illness.',
      'Ring-fence outbreaks at NCID; cohort wards and rotate staff.',
      'Mobilise PHPC + dormitory on-site care during a multi-cluster surge.',
      'Use DORSCON escalation as a tool, not a label — connect to PPE, surge, ED diversion.',
    ],
    caseIds: ['disease-x', 'sars-2003-historical', 'covid19-historical', 'dengue-surge'],
  },
  {
    id: 'primary-care',
    title: 'Primary care + Healthier SG',
    blurb:
      'How the polyclinic / Healthier-SG GP front-line decides who can stay in primary care and who needs the hospital. Right-siting, chronic-disease management, vaccination, and CHAS subsidy in play.',
    objectives: [
      'Use CURB-65 + clinical judgement to decide polyclinic vs ED for respiratory cases.',
      'Coordinate CHAS GP + polyclinic for URTI, chronic disease, and post-hospital follow-up.',
      'Embed NAIS vaccination and HPB I-Quit smoking-cessation referral into convalescent visits.',
      'Right-site stable chronic-disease patients onto Healthier-SG GP enrolment.',
    ],
    caseIds: ['urti-chas-gp', 'cap-pneumonia', 'outpatient-diabetes', 'hf-outpatient'],
  },
  {
    id: 'paeds-and-women',
    title: "Paediatrics and women's health",
    blurb:
      'KKH paediatric and obstetric pathways. The cases where the parent / partner perspective bites hardest.',
    objectives: [
      'Use PEWS to escalate a febrile young child.',
      'Coordinate antenatal shared care with a private OBGYN + KKH delivery.',
      'Right-site the well baby + post-natal mother to a polyclinic / Healthier-SG GP.',
    ],
    caseIds: ['paeds-fever-kkh', 'obstetric-delivery'],
  },
];

export function getCurriculum(id: string): Curriculum | undefined {
  return CURRICULA.find((c) => c.id === id);
}

/**
 * For a given curriculum + bestScores map, return the next case id the
 * player should play (the first one without a score), or null if all
 * cases are complete.
 */
export function nextCaseInCurriculum(
  curr: Curriculum,
  bestScores: Record<string, { score: number; max: number }>,
): string | null {
  for (const id of curr.caseIds) {
    if (!bestScores[id]) return id;
  }
  return null;
}

export function curriculumProgress(
  curr: Curriculum,
  bestScores: Record<string, { score: number; max: number }>,
): { completed: number; total: number; ratio: number } {
  const total = curr.caseIds.length;
  const completed = curr.caseIds.filter((id) => bestScores[id]).length;
  return { completed, total, ratio: total > 0 ? completed / total : 0 };
}
