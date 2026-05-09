import type { Facility } from './types';

/**
 * Records / data-exchange profile derived from a facility's sector + type.
 *
 * Captures Singapore's actual NEHR participation reality:
 *  - All restructured public hospitals contribute to and consume from NEHR.
 *  - HealthHub surfaces NEHR-derived records to patients.
 *  - VWO partner hospitals largely contribute to NEHR for shared patients.
 *  - CHAS-participating GPs are encouraged but not all contribute to NEHR.
 *  - Private hospitals' adoption is partial; many results stay siloed.
 *  - Telemed providers vary; some opt-in to NEHR.
 *
 * Numbers are deliberately illustrative — the educational point is that
 * data flow across sectors is not seamless and players should plan for it.
 */

export type RecordsFlow = 'nehr' | 'memo' | 'hand-carry' | 'fax' | 'none';

export interface DataExchangeProfile {
  contributesToNehr: boolean;
  consumesFromNehr: boolean;
  visibleOnHealthHub: boolean;
  labVendor: 'public-cluster' | 'innoquest' | 'pathlab' | 'parkway-lab' | 'quest' | 'in-house';
  imagingPacs: 'cluster' | 'private-cd' | 'shared';
  /** Free-text caveat shown in the UI. */
  note?: string;
}

const PUBLIC_FULL: DataExchangeProfile = {
  contributesToNehr: true,
  consumesFromNehr: true,
  visibleOnHealthHub: true,
  labVendor: 'public-cluster',
  imagingPacs: 'cluster',
  note: 'Full NEHR contributor and consumer; results visible on HealthHub.',
};

const POLYCLINIC: DataExchangeProfile = {
  ...PUBLIC_FULL,
  labVendor: 'public-cluster',
  imagingPacs: 'cluster',
  note: 'Cluster lab and imaging flow into NEHR within hours.',
};

const VWO_HOSPITAL: DataExchangeProfile = {
  contributesToNehr: true,
  consumesFromNehr: true,
  visibleOnHealthHub: true,
  labVendor: 'in-house',
  imagingPacs: 'shared',
  note: 'Most VWO partner hospitals participate in NEHR for shared patients.',
};

const PRIVATE_ACUTE: DataExchangeProfile = {
  contributesToNehr: false,
  consumesFromNehr: true,
  visibleOnHealthHub: false,
  labVendor: 'parkway-lab',
  imagingPacs: 'private-cd',
  note: 'Many private hospitals consume NEHR but do not contribute. Imaging often handed over as CD; patient hand-carries discharge summary.',
};

const PRIVATE_SPECIALIST: DataExchangeProfile = {
  contributesToNehr: false,
  consumesFromNehr: false,
  visibleOnHealthHub: false,
  labVendor: 'innoquest',
  imagingPacs: 'private-cd',
  note: 'Specialist suites usually don\'t share results with NEHR; reports go to the referring doctor by email or hand.',
};

const PRIVATE_GP: DataExchangeProfile = {
  contributesToNehr: false,
  consumesFromNehr: false,
  visibleOnHealthHub: false,
  labVendor: 'innoquest',
  imagingPacs: 'private-cd',
  note: 'CHAS participation does not require NEHR contribution. Memo-style referral letters are common.',
};

const TELEMED: DataExchangeProfile = {
  contributesToNehr: false,
  consumesFromNehr: false,
  visibleOnHealthHub: false,
  labVendor: 'innoquest',
  imagingPacs: 'private-cd',
  note: 'Telemed consult notes rarely flow into NEHR; e-prescriptions visible to the dispensing pharmacy only.',
};

const ANCILLARY: DataExchangeProfile = {
  contributesToNehr: false,
  consumesFromNehr: false,
  visibleOnHealthHub: false,
  labVendor: 'in-house',
  imagingPacs: 'shared',
  note: 'Pre-hospital / community / home node — varies. SCDF e-PCR contributes to NEHR; nursing-home records do not.',
};

export function profileForFacility(f: Facility): DataExchangeProfile {
  // Public restructured + national specialty + community + polyclinic
  if (f.sector === 'public' && f.type === 'polyclinic') return POLYCLINIC;
  if (f.sector === 'public') return PUBLIC_FULL;
  if (f.sector === 'vwo') return VWO_HOSPITAL;
  if (f.type === 'private-acute') return PRIVATE_ACUTE;
  if (f.type === 'private-specialist') return PRIVATE_SPECIALIST;
  if (f.type === 'gp') return PRIVATE_GP;
  if (f.type === 'telemed') return TELEMED;
  return ANCILLARY;
}

/**
 * Compute the records-flow type when a patient moves from one facility to
 * another. The simplification: if both ends contribute/consume NEHR, records
 * flow electronically; otherwise the most likely manual fallback applies.
 */
export function recordsFlowBetween(from: Facility, to: Facility): RecordsFlow {
  const a = profileForFacility(from);
  const b = profileForFacility(to);
  if (a.contributesToNehr && b.consumesFromNehr) return 'nehr';
  if (b.consumesFromNehr && from.sector === 'public' && to.sector === 'public') return 'nehr';
  if (a.contributesToNehr || b.consumesFromNehr) return 'memo';
  if (a.imagingPacs === 'private-cd' || b.imagingPacs === 'private-cd') return 'hand-carry';
  return 'memo';
}

export function describeFlow(flow: RecordsFlow): string {
  switch (flow) {
    case 'nehr':
      return 'Records flow electronically via NEHR.';
    case 'memo':
      return 'Referral memo accompanies the patient; selected results may flow.';
    case 'hand-carry':
      return 'Patient hand-carries imaging CDs and printed reports.';
    case 'fax':
      return 'Records arrive by fax / email — risk of incomplete handover.';
    case 'none':
      return 'No automatic records flow; receiving clinician starts from scratch.';
  }
}
