import type { Facility } from '../../../lib/types';
import { gridLayout } from '../_shared';

const polyclinicDepartments = () =>
  gridLayout(
    [
      { id: 'entrance', name: 'Reception', shortLabel: 'Reception', colour: '#3aa6ff', description: 'Walk-in or booked appointments. NRIC / FIN scan auto-pulls NEHR.' },
      { id: 'triage', name: 'Nurse Triage', shortLabel: 'Triage', colour: '#facc15', description: 'BP, BMI, urine dip, brief history. Acute red flags routed to nearest ED.' },
      { id: 'gp-room', name: 'Family Physician Consult', shortLabel: 'GP Room', colour: '#22d3ee', description: 'Acute walk-in and chronic-disease management. CDMP-eligible conditions get Flexi-MediSave.' },
      { id: 'treatment-room', name: 'Treatment Room', shortLabel: 'Treatment', colour: '#fb923c', description: 'Wound dressings, injections, ECGs, simple procedures.' },
      { id: 'lab', name: 'Phlebotomy / Lab Counter', shortLabel: 'Phlebotomy', colour: '#8b5cf6', description: 'Bloods drawn here; assays at the cluster lab — results in NEHR within 24h.' },
      { id: 'pharmacy', name: 'Pharmacy', shortLabel: 'Pharmacy', colour: '#38bdf8', description: 'Subsidised generics; CHAS / PG / MG discounts applied.' },
    ],
    { cols: 3 },
  );

function makePolyclinic(id: string, name: string): Facility {
  return {
    id,
    name,
    type: 'polyclinic',
    sector: 'public',
    cluster: 'nhg',
    departments: polyclinicDepartments(),
  };
}

export const NHGP_AMK = makePolyclinic('nhgp-amk', 'Ang Mo Kio Polyclinic');
export const NHGP_BUKIT_BATOK = makePolyclinic('nhgp-bukit-batok', 'Bukit Batok Polyclinic');
export const NHGP_HOUGANG = makePolyclinic('nhgp-hougang', 'Hougang Polyclinic');
export const NHGP_TOA_PAYOH = makePolyclinic('nhgp-toa-payoh', 'Toa Payoh Polyclinic');
export const NHGP_WOODLANDS = makePolyclinic('nhgp-woodlands', 'Woodlands Polyclinic');
export const NHGP_YISHUN = makePolyclinic('nhgp-yishun', 'Yishun Polyclinic');
export const NHGP_GEYLANG = makePolyclinic('nhgp-geylang', 'Geylang Polyclinic');
export const NHGP_KALLANG = makePolyclinic('nhgp-kallang', 'Kallang Polyclinic');
export const NHGP_KHATIB = makePolyclinic('nhgp-khatib', 'Khatib Polyclinic');
export const NHGP_NEE_SOON = makePolyclinic('nhgp-nee-soon', 'Nee Soon Polyclinic');

export const NHGP_ALL: Facility[] = [
  NHGP_AMK,
  NHGP_BUKIT_BATOK,
  NHGP_HOUGANG,
  NHGP_TOA_PAYOH,
  NHGP_WOODLANDS,
  NHGP_YISHUN,
  NHGP_GEYLANG,
  NHGP_KALLANG,
  NHGP_KHATIB,
  NHGP_NEE_SOON,
];
