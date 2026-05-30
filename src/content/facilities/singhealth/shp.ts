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
    cluster: 'singhealth',
    departments: polyclinicDepartments(),
  };
}

export const SHP_BEDOK = makePolyclinic('shp-bedok', 'Bedok Polyclinic');
export const SHP_BUKIT_MERAH = makePolyclinic('shp-bukit-merah', 'Bukit Merah Polyclinic');
export const SHP_MARINE_PARADE = makePolyclinic('shp-marine-parade', 'Marine Parade Polyclinic');
export const SHP_OUTRAM = makePolyclinic('shp-outram', 'Outram Polyclinic');
export const SHP_PASIR_RIS = makePolyclinic('shp-pasir-ris', 'Pasir Ris Polyclinic');
export const SHP_PUNGGOL = makePolyclinic('shp-punggol', 'Punggol Polyclinic');
export const SHP_SENGKANG = makePolyclinic('shp-sengkang', 'Sengkang Polyclinic');
export const SHP_TAMPINES = makePolyclinic('shp-tampines', 'Tampines Polyclinic');
export const SHP_TAMPINES_NORTH = makePolyclinic('shp-tampines-north', 'Tampines North Polyclinic');
// Eunos opened Dec 2021 — SingHealth Polyclinics' 10th polyclinic.
export const SHP_EUNOS = makePolyclinic('shp-eunos', 'Eunos Polyclinic');

export const SHP_ALL: Facility[] = [
  SHP_BEDOK,
  SHP_BUKIT_MERAH,
  SHP_MARINE_PARADE,
  SHP_OUTRAM,
  SHP_PASIR_RIS,
  SHP_PUNGGOL,
  SHP_SENGKANG,
  SHP_TAMPINES,
  SHP_TAMPINES_NORTH,
  SHP_EUNOS,
];
