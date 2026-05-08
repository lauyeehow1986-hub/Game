import type { Facility } from '../../../lib/types';
import { gridLayout } from '../_shared';

/**
 * IHH / Parkway Pantai private hospitals (4) — share a department template.
 * Each has its own id and display name; the financing engine bills at
 * private rate for any node anchored here.
 */
const privateHospitalDepartments = (note: string) =>
  gridLayout(
    [
      { id: 'entrance', name: 'Concierge / Lobby', shortLabel: 'Concierge', colour: '#3aa6ff', description: note },
      { id: 'triage', name: 'Triage / Admission', shortLabel: 'Triage', colour: '#facc15', description: 'Insurance / Integrated Shield Plan verified at admission; pre-authorisation arranged.' },
      { id: 'ed', name: 'Emergency / 24h Clinic', shortLabel: 'A&E', colour: '#f87171', description: '24/7 acute care; some private hospitals stabilise then transfer complex cases to public ICU.' },
      { id: 'imaging', name: 'Imaging', shortLabel: 'Imaging', colour: '#8b5cf6', description: 'CT, MRI, ultrasound. Reports usually do NOT auto-flow to NEHR — patient often hand-carries CDs.' },
      { id: 'cathlab', name: 'Cardiac Cath Lab', shortLabel: 'Cath Lab', colour: '#ED2939', description: 'PCI capability; some sites do TAVI; complex transfers to NHCS / NUHCS.' },
      { id: 'icu', name: 'ICU', shortLabel: 'ICU', colour: '#fb923c', description: 'Mixed ICU; specialist consultants on call.' },
      { id: 'ot', name: 'Operating Theatres', shortLabel: 'OT', colour: '#ec4899', description: 'Multi-specialty including robotic; cosmetic + bariatric programmes.' },
      { id: 'ward', name: 'Inpatient Wards', shortLabel: 'Ward', colour: '#4ade80', description: 'Single / twin / quad rooms — no subsidy; rate billed as-charged.' },
      { id: 'soc', name: 'Specialist Suites', shortLabel: 'Suites', colour: '#22d3ee', description: 'Visiting consultants in tenancy suites; many specialists also have public-hospital appointments.' },
      { id: 'pharmacy', name: 'Pharmacy', shortLabel: 'Pharmacy', colour: '#38bdf8', description: 'Private-rate dispensing; no MAF subsidy; covered by IP rider where applicable.' },
      { id: 'discharge', name: 'Billing & Discharge', shortLabel: 'Billing', colour: '#a3e635', description: 'Bill finalisation; LOA from insurer; copay collected; treatment summary handed over.' },
    ],
    { cols: 4 },
  );

export const MT_ELIZABETH: Facility = {
  id: 'mt-elizabeth',
  name: 'Mount Elizabeth Hospital (Orchard)',
  type: 'private-acute',
  sector: 'private',
  cluster: 'ihh-parkway',
  departments: privateHospitalDepartments(
    'IHH/Parkway flagship in the Orchard belt; international-patient programme.',
  ),
};

export const MT_ELIZABETH_NOVENA: Facility = {
  id: 'mt-elizabeth-novena',
  name: 'Mount Elizabeth Novena Hospital',
  type: 'private-acute',
  sector: 'private',
  cluster: 'ihh-parkway',
  departments: privateHospitalDepartments(
    'Newer IHH campus at Novena; co-located with Novena Medical Center specialist suites.',
  ),
};

export const GLENEAGLES: Facility = {
  id: 'gleneagles',
  name: 'Gleneagles Hospital',
  type: 'private-acute',
  sector: 'private',
  cluster: 'ihh-parkway',
  departments: privateHospitalDepartments(
    'IHH hospital at Napier Road; major obstetrics, orthopaedics, oncology programmes.',
  ),
};

export const PARKWAY_EAST: Facility = {
  id: 'parkway-east',
  name: 'Parkway East Hospital',
  type: 'private-acute',
  sector: 'private',
  cluster: 'ihh-parkway',
  departments: privateHospitalDepartments(
    'Smaller IHH community private hospital in the east; obstetrics, paediatrics, gen surg.',
  ),
};

export const RAFFLES_HOSPITAL: Facility = {
  id: 'raffles-hospital',
  name: 'Raffles Hospital',
  type: 'private-acute',
  sector: 'private',
  cluster: 'raffles',
  departments: privateHospitalDepartments(
    'Raffles Medical Group flagship at North Bridge Road; integrated with Raffles GP clinics.',
  ),
};

export const MT_ALVERNIA: Facility = {
  id: 'mt-alvernia',
  name: 'Mount Alvernia Hospital',
  type: 'private-acute',
  sector: 'private',
  cluster: 'standalone',
  departments: privateHospitalDepartments(
    'Catholic not-for-profit private hospital at Thomson Road. Strong O&G and paeds.',
  ),
};

export const THOMSON_MEDICAL: Facility = {
  id: 'thomson-medical',
  name: 'Thomson Medical Centre',
  type: 'private-acute',
  sector: 'private',
  cluster: 'standalone',
  departments: privateHospitalDepartments(
    "Thomson Medical Group's hospital; strong women's and children's services.",
  ),
};

export const FARRER_PARK: Facility = {
  id: 'farrer-park',
  name: 'Farrer Park Hospital',
  type: 'private-acute',
  sector: 'private',
  cluster: 'standalone',
  departments: privateHospitalDepartments(
    'Integrated medical complex with Farrer Park Medical Centre specialist suites.',
  ),
};

export const CRAWFURD: Facility = {
  id: 'crawfurd',
  name: 'Crawfurd Hospital',
  type: 'private-acute',
  sector: 'private',
  cluster: 'standalone',
  departments: privateHospitalDepartments(
    'Smaller private hospital (formerly Concord International).',
  ),
};

export const PRIVATE_ACUTE_ALL: Facility[] = [
  MT_ELIZABETH,
  MT_ELIZABETH_NOVENA,
  GLENEAGLES,
  PARKWAY_EAST,
  RAFFLES_HOSPITAL,
  MT_ALVERNIA,
  THOMSON_MEDICAL,
  FARRER_PARK,
  CRAWFURD,
];
