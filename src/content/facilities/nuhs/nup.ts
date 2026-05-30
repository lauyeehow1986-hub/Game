import type { Facility } from '../../../lib/types';
import { gridLayout } from '../_shared';

const polyclinicDepartments = () =>
  gridLayout(
    [
      { id: 'entrance', name: 'Reception', shortLabel: 'Reception', colour: '#3aa6ff', description: 'Walk-in or appointment; NRIC / FIN scan auto-pulls NEHR.' },
      { id: 'triage', name: 'Nurse Triage', shortLabel: 'Triage', colour: '#facc15', description: 'BP, BMI, urine dip, brief history. Acute red flags routed to nearest ED.' },
      { id: 'gp-room', name: 'Family Physician Consult', shortLabel: 'GP Room', colour: '#22d3ee', description: 'Acute walk-in and chronic-disease management.' },
      { id: 'treatment-room', name: 'Treatment Room', shortLabel: 'Treatment', colour: '#fb923c', description: 'Wound dressings, ECG, injections, simple procedures.' },
      { id: 'lab', name: 'Phlebotomy', shortLabel: 'Phlebotomy', colour: '#8b5cf6', description: 'Bloods drawn; cluster lab returns results to NEHR.' },
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
    cluster: 'nuhs',
    departments: polyclinicDepartments(),
  };
}

export const NUP_BUKIT_BATOK = makePolyclinic('nup-bukit-batok', 'Bukit Batok Polyclinic');
export const NUP_CHOA_CHU_KANG = makePolyclinic('nup-choa-chu-kang', 'Choa Chu Kang Polyclinic');
export const NUP_CLEMENTI = makePolyclinic('nup-clementi', 'Clementi Polyclinic');
export const NUP_JURONG = makePolyclinic('nup-jurong', 'Jurong Polyclinic');
export const NUP_PIONEER = makePolyclinic('nup-pioneer', 'Pioneer Polyclinic');
export const NUP_QUEENSTOWN = makePolyclinic('nup-queenstown', 'Queenstown Polyclinic');
export const NUP_BUKIT_PANJANG = makePolyclinic('nup-bukit-panjang', 'Bukit Panjang Polyclinic');
// Tengah opened 28 Feb 2026 — NUP's 8th polyclinic. (Taman Jurong is an
// announced future site, not yet operational, so it is not listed.)
export const NUP_TENGAH = makePolyclinic('nup-tengah', 'Tengah Polyclinic');

export const NUP_ALL: Facility[] = [
  NUP_BUKIT_BATOK,
  NUP_CHOA_CHU_KANG,
  NUP_CLEMENTI,
  NUP_JURONG,
  NUP_PIONEER,
  NUP_QUEENSTOWN,
  NUP_BUKIT_PANJANG,
  NUP_TENGAH,
];
