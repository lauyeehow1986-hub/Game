/**
 * Singapore healthcare financing model — v0.2
 *
 * Cascade modelled per pathway segment:
 *
 *   Gross bill (private rate)
 *     ↓ subsidy% (ward class + means-test + PG/MG flag)
 *   Subsidised bill
 *     ↓ MediShield Life claim (if inpatient and within MSHL limits)
 *   Patient share
 *     ↓ MediSave deduction (within MediSave withdrawal limits for the segment)
 *   Out-of-pocket (cash / IP rider)
 *
 * For outpatient subsidised pathways (polyclinics, SOC), CHAS tier or
 * Healthier SG enrolment can substitute / add to the subsidy.
 *
 * The numbers below are illustrative for an educational simulator and
 * deliberately simplified; they're not a billing engine.
 */

export type WardClass = 'A' | 'B1' | 'B2' | 'C' | 'na';

export type ChasTier = 'none' | 'green' | 'orange' | 'blue' | 'pg' | 'mg';

export interface PatientProfile {
  /** Display name for narrative panels. */
  name: string;
  /** Age in years; affects PG/MG eligibility heuristics. */
  age: number;
  /** Per-capita household income (S$). */
  perCapitaIncomeSGD: number;
  citizenship: 'citizen' | 'pr' | 'foreigner';
  chasTier: ChasTier;
  /** Currently selected ward class for any inpatient admission this run. */
  wardClass: WardClass;
  /** Has an Integrated Shield Plan (private rider). */
  hasIntegratedShield: boolean;
  /** MediSave balance (S$). */
  mediSaveBalanceSGD: number;
  /** Notes shown on the patient profile panel. */
  notes?: string;
}

export interface FinancingSegmentInput {
  /** Charge code class so we can apply the right rules. */
  charge: 'inpatient-ward' | 'inpatient-procedure' | 'icu' | 'imaging' | 'pharmacy' | 'soc' | 'polyclinic' | 'rehab' | 'community-hospital' | 'a&e';
  /** Gross bill at private rate (S$). */
  grossSGD: number;
  /**
   * Pricing tier for this segment.
   * - 'subsidised': public restructured / VWO charges with government subsidy
   *   eligibility, MediShield Life claim, MediSave drawdown, CHAS top-ups.
   * - 'private': private-hospital, private-specialist, or non-subsidised
   *   pathway. No government subsidy. Citizens/PRs can still claim
   *   MediShield Life up to standard limits; IP riders top up further.
   */
  tier?: 'subsidised' | 'private';
}

export interface FinancingSegmentResult extends FinancingSegmentInput {
  subsidyPct: number;
  subsidisedSGD: number;
  mediShieldSGD: number;
  mediSaveSGD: number;
  cashSGD: number;
}

export interface FinancingTotals {
  gross: number;
  subsidy: number;
  mediShield: number;
  mediSave: number;
  cash: number;
}

/** Subsidy% by ward class for citizens, before means-test. */
const baseWardSubsidy: Record<WardClass, number> = {
  A: 0,
  B1: 0.2,
  B2: 0.65,
  C: 0.8,
  na: 0,
};

/** SOC subsidy% by ward-class equivalent referral (subsidised vs private). */
const socSubsidy = {
  subsidised: 0.5,
  private: 0,
};

/** CHAS subsidy% applied at private GP / dental for chronic care. */
const chasSubsidyPct: Record<ChasTier, number> = {
  none: 0,
  green: 0.15,
  orange: 0.4,
  blue: 0.6,
  pg: 0.75,
  mg: 0.6,
};

/**
 * Means-test adjustment for B2 / C: per-capita household income tiers.
 * Reduces subsidy if income above thresholds (post-2020 framework, simplified).
 */
function meansTestModifier(p: PatientProfile, ward: WardClass): number {
  if (ward !== 'B2' && ward !== 'C') return 0;
  const i = p.perCapitaIncomeSGD;
  if (i <= 1500) return 0;
  if (i <= 2300) return -0.05;
  if (i <= 3300) return -0.1;
  if (i <= 4400) return -0.15;
  if (i <= 5600) return -0.2;
  return -0.25;
}

/** Pioneer / Merdeka top-up for outpatient & inpatient. */
function pgMgInpatientBoost(tier: ChasTier): number {
  if (tier === 'pg') return 0.1;
  if (tier === 'mg') return 0.05;
  return 0;
}

function citizenshipMultiplier(p: PatientProfile): number {
  if (p.citizenship === 'citizen') return 1;
  if (p.citizenship === 'pr') return 0.5; // PRs receive ~half the citizen subsidy
  return 0; // foreigners pay private
}

function effectiveSubsidy(p: PatientProfile, charge: FinancingSegmentInput['charge']): number {
  const ward = p.wardClass;
  switch (charge) {
    case 'inpatient-ward':
    case 'inpatient-procedure':
    case 'icu':
    case 'imaging':
    case 'pharmacy':
    case 'a&e': {
      const base = baseWardSubsidy[ward] + meansTestModifier(p, ward) + pgMgInpatientBoost(p.chasTier);
      return Math.max(0, Math.min(0.85, base)) * citizenshipMultiplier(p);
    }
    case 'soc': {
      const base = ward === 'A' ? socSubsidy.private : socSubsidy.subsidised;
      return base * citizenshipMultiplier(p);
    }
    case 'polyclinic':
      return 0.6 * citizenshipMultiplier(p);
    case 'rehab':
    case 'community-hospital':
      return Math.max(0.5, baseWardSubsidy[ward]) * citizenshipMultiplier(p);
    default:
      return 0;
  }
}

/** MediShield Life claim amount on subsidised bill (very simplified). */
function mediShieldClaim(p: PatientProfile, charge: FinancingSegmentInput['charge'], subsidised: number): number {
  if (p.citizenship === 'foreigner') return 0;
  // MediShield Life only for inpatient + day surgery + selected outpatient (oncology, dialysis).
  const eligible = charge === 'inpatient-ward' || charge === 'inpatient-procedure' || charge === 'icu';
  if (!eligible) return 0;
  // 90% of subsidised charge above a small deductible (simplified).
  const deductible = charge === 'icu' ? 800 : 400;
  const claimable = Math.max(0, subsidised - deductible);
  const claim = claimable * 0.9;
  // IP riders top up to "as-charged" — modelled as 100% of remaining for simplicity.
  if (p.hasIntegratedShield) {
    return Math.max(claim, subsidised * 0.95);
  }
  return claim;
}

/** MediSave withdrawal — daily limits & lifetime caps simplified to per-segment caps. */
function mediSaveDraw(p: PatientProfile, charge: FinancingSegmentInput['charge'], remainingPatientShare: number): number {
  if (p.citizenship === 'foreigner') return 0;
  const cap = (() => {
    switch (charge) {
      case 'inpatient-ward':
        return 550; // per day equivalent (illustrative)
      case 'inpatient-procedure':
      case 'icu':
        return 1500;
      case 'soc':
        return 700; // Flexi-MediSave / chronic care cap (illustrative)
      case 'polyclinic':
        return 200;
      case 'imaging':
        return 300;
      case 'rehab':
      case 'community-hospital':
        return 400;
      default:
        return 0;
    }
  })();
  const draw = Math.min(cap, remainingPatientShare, p.mediSaveBalanceSGD);
  return Math.max(0, draw);
}

export function computeSegment(
  profile: PatientProfile,
  segment: FinancingSegmentInput,
): FinancingSegmentResult {
  const isPrivate = segment.tier === 'private';

  // Government subsidy not applicable at private facilities.
  const subsidyPct = isPrivate ? 0 : effectiveSubsidy(profile, segment.charge);
  const subsidised = segment.grossSGD * (1 - subsidyPct);

  const mshl = mediShieldClaim(profile, segment.charge, subsidised);
  const afterMshl = Math.max(0, subsidised - mshl);

  // CHAS / Healthier SG only at subsidised outpatient categories.
  const chasPct =
    !isPrivate && (segment.charge === 'soc' || segment.charge === 'polyclinic')
      ? chasSubsidyPct[profile.chasTier] * 0.5
      : 0;
  const afterChas = Math.max(0, afterMshl - subsidised * chasPct);

  const ms = mediSaveDraw(profile, segment.charge, afterChas);
  const cash = Math.max(0, afterChas - ms);

  return {
    ...segment,
    tier: segment.tier ?? 'subsidised',
    subsidyPct,
    subsidisedSGD: subsidised,
    mediShieldSGD: mshl,
    mediSaveSGD: ms,
    cashSGD: cash,
  };
}

export function totalsFor(results: FinancingSegmentResult[]): FinancingTotals {
  return results.reduce<FinancingTotals>(
    (acc, r) => ({
      gross: acc.gross + r.grossSGD,
      subsidy: acc.subsidy + (r.grossSGD - r.subsidisedSGD),
      mediShield: acc.mediShield + r.mediShieldSGD,
      mediSave: acc.mediSave + r.mediSaveSGD,
      cash: acc.cash + r.cashSGD,
    }),
    { gross: 0, subsidy: 0, mediShield: 0, mediSave: 0, cash: 0 },
  );
}

export const DEFAULT_PROFILES: Record<string, PatientProfile> = {
  taxiDriver: {
    name: 'Mr Tan, 58',
    age: 58,
    perCapitaIncomeSGD: 1200,
    citizenship: 'citizen',
    chasTier: 'orange',
    wardClass: 'C',
    hasIntegratedShield: false,
    mediSaveBalanceSGD: 4200,
    notes: 'Taxi driver, household income S$2,400/mo, 2 dependants, smoker, no IP rider.',
  },
  retiredAuntie: {
    name: 'Mdm Lim, 71',
    age: 71,
    perCapitaIncomeSGD: 950,
    citizenship: 'citizen',
    chasTier: 'mg',
    wardClass: 'B2',
    hasIntegratedShield: false,
    mediSaveBalanceSGD: 8000,
    notes: 'Retired, lives with daughter. Merdeka Generation. Mild OA both knees, now severe right hip.',
  },
  diabeticUncle: {
    name: 'Mr Rajan, 62',
    age: 62,
    perCapitaIncomeSGD: 1700,
    citizenship: 'citizen',
    chasTier: 'orange',
    wardClass: 'C',
    hasIntegratedShield: false,
    mediSaveBalanceSGD: 3100,
    notes: 'Long-distance lorry driver. T2DM x10y, HbA1c 9.4%, BP 152/92, smoker, sedentary.',
  },
  migrantWorker: {
    name: 'Mr Hossain, 34',
    age: 34,
    perCapitaIncomeSGD: 700,
    citizenship: 'foreigner',
    chasTier: 'none',
    wardClass: 'C',
    hasIntegratedShield: false,
    mediSaveBalanceSGD: 0,
    notes:
      'Bangladeshi construction worker on Work Permit. 2 years in SG, lives in dorm. Foreign Worker Medical Insurance (FWMI) via employer; no MediShield Life eligibility; no MediSave.',
  },
};
