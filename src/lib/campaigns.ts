/**
 * Campaign mode — multi-case "shifts" played back-to-back with shared
 * state (cumulative cash, cumulative caregiver burden, running PPE /
 * surge if the campaign is pandemic-themed). Each campaign is a curated
 * sequence of existing case ids plus shift-wide scoring.
 *
 * Pure data + a couple of helpers. No state — see state/campaignStore.ts.
 */

export interface Campaign {
  id: string;
  title: string;
  blurb: string;
  /** What the player is roleplaying for the whole shift. */
  shiftRole: string;
  /** Ordered case ids — campaigns advance sequentially. */
  caseIds: string[];
  /** Tags shown in the campaign chip. */
  tags: string[];
  /** Distinction target — fraction of total max score across cases. */
  passRatio: number;
}

export const CAMPAIGNS: Campaign[] = [
  {
    id: 'ed-night-shift',
    title: 'TTSH Friday-night ED',
    blurb:
      'Eight hours on the ED floor. Acute STEMI, septic shock, then a major trauma — back-to-back. Cumulative cash OOP runs across all three patients\' families.',
    shiftRole: 'ED registrar',
    caseIds: ['stemi-acute', 'sepsis-bundle', 'major-trauma'],
    tags: ['acute', 'TTSH', 'time-pressure'],
    passRatio: 0.75,
  },
  {
    id: 'crosscluster-week',
    title: 'Cross-cluster oncology week',
    blurb:
      'A breast cancer journey across NHG → SGH → NCCS, a private cataract running in parallel at SNEC, and a private-to-public handover for a renal mass. Every records-flow gap costs the patient.',
    shiftRole: 'Care coordinator',
    caseIds: ['breast-ca-crosscluster', 'private-cataract', 'private-to-public-handover'],
    tags: ['cross-sector', 'records'],
    passRatio: 0.7,
  },
  {
    id: 'pandemic-surge',
    title: 'Outbreak week — NCID lead',
    blurb:
      'Disease X emerges. SARS 2003 reconstruction. COVID-19 multi-cluster surge. Three shifts, one country.',
    shiftRole: 'Infection-control lead',
    caseIds: ['disease-x', 'sars-2003-historical', 'covid19-historical', 'dengue-surge'],
    tags: ['pandemic', 'NCID', 'historical'],
    passRatio: 0.7,
  },
  {
    id: 'step-down-arc',
    title: 'Geriatric step-down arc',
    blurb:
      'A frail senior falls, lands in the ED, transitions to a community hospital for rehab, then home with virtual-ward support. Heart failure waits at the polyclinic on the back end. Care continuity is the whole point.',
    shiftRole: 'Geriatrician',
    caseIds: ['geriatric-falls', 'palliative-eol', 'hf-outpatient'],
    tags: ['geriatric', 'community-hospital', 'continuity'],
    passRatio: 0.7,
  },
  {
    id: 'reform-week',
    title: 'Healthcare reform week (2025-26)',
    blurb:
      'The system as it stands after the latest reforms: a young adult routed through Mindline 1771 and Tiered Care, a frail senior kept home by Age Well SG / HPC+, and a cancer patient financed under the 2025 MediShield Life changes.',
    shiftRole: 'System navigator',
    caseIds: ['mindline-young-adult', 'agewell-hpc', 'oncology-mshl-2025'],
    tags: ['policy', 'financing', 'community'],
    passRatio: 0.7,
  },
  {
    id: 'primary-care-day',
    title: 'Polyclinic morning clinic',
    blurb:
      'A diabetic with worsening control, an URTI walk-in, a community-acquired pneumonia that needs the ED. Right-siting decisions every fifteen minutes.',
    shiftRole: 'Polyclinic FP',
    caseIds: ['outpatient-diabetes', 'urti-chas-gp', 'cap-pneumonia'],
    tags: ['primary-care', 'right-siting'],
    passRatio: 0.75,
  },
];

export function getCampaign(id: string): Campaign | undefined {
  return CAMPAIGNS.find((c) => c.id === id);
}

export interface CampaignProgress {
  completed: number;
  total: number;
  ratio: number;
  /** Sum of best-score ratios for completed cases — between 0 and `completed`. */
  cumulativeScoreRatio: number;
}

export function campaignProgress(
  campaign: Campaign,
  bestScores: Record<string, { score: number; max: number }>,
): CampaignProgress {
  const total = campaign.caseIds.length;
  let completed = 0;
  let cumulative = 0;
  for (const id of campaign.caseIds) {
    const s = bestScores[id];
    if (s) {
      completed += 1;
      cumulative += s.max > 0 ? s.score / s.max : 0;
    }
  }
  return {
    completed,
    total,
    ratio: total > 0 ? completed / total : 0,
    cumulativeScoreRatio: cumulative,
  };
}

/**
 * Returns the next case id to play in the campaign, or null if every case
 * has at least one recorded best score.
 */
export function nextCaseInCampaign(
  campaign: Campaign,
  bestScores: Record<string, { score: number; max: number }>,
): string | null {
  for (const id of campaign.caseIds) {
    if (!bestScores[id]) return id;
  }
  return null;
}
