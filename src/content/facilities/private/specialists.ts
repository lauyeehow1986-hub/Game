import type { Facility } from '../../../lib/types';
import { gridLayout } from '../_shared';

/**
 * Private specialist clinics and medical centres — represented as nodes
 * for outpatient consults, diagnostics, and minor procedures. Most also
 * hold appointments at the IHH/Parkway/Raffles/standalone hospitals.
 */
const specialistDepartments = (note: string) =>
  gridLayout(
    [
      { id: 'entrance', name: 'Reception', shortLabel: 'Reception', colour: '#3aa6ff', description: note },
      { id: 'soc', name: 'Specialist Consult', shortLabel: 'Consult', colour: '#22d3ee', description: 'Sub-specialist consultation; triple-suite billing (consult + investigations + procedures).' },
      { id: 'imaging', name: 'In-house Imaging', shortLabel: 'Imaging', colour: '#8b5cf6', description: 'Diagnostic imaging and ultrasound; reports rarely flow to NEHR.' },
      { id: 'lab', name: 'Phlebotomy', shortLabel: 'Lab', colour: '#facc15', description: 'Send-out to private labs (Innoquest / Pathlab / Parkway Lab).' },
      { id: 'ot', name: 'Day Procedures', shortLabel: 'Day Proc', colour: '#ec4899', description: 'Endoscopy, biopsies, minor injections, laser.' },
      { id: 'pharmacy', name: 'Dispensary', shortLabel: 'Dispensary', colour: '#38bdf8', description: 'In-clinic dispensing.' },
      { id: 'discharge', name: 'Billing', shortLabel: 'Billing', colour: '#a3e635', description: 'Bill collected up-front or via insurer LOA.' },
    ],
    { cols: 3 },
  );

export const SMG: Facility = {
  id: 'smg',
  name: 'Singapore Medical Group',
  type: 'private-specialist',
  sector: 'private',
  cluster: 'standalone',
  departments: specialistDepartments('Listed multi-specialty group; clinics across O&G, paediatrics, oncology, aesthetic.'),
};

export const ASIA_MEDIC: Facility = {
  id: 'asia-medic',
  name: 'Asia Medic',
  type: 'private-specialist',
  sector: 'private',
  cluster: 'standalone',
  departments: specialistDepartments('Diagnostic imaging and screening centre at Cuscaden Road.'),
};

export const CAMDEN_MEDICAL: Facility = {
  id: 'camden-medical',
  name: 'Camden Medical Centre (tenancy)',
  type: 'private-specialist',
  sector: 'private',
  cluster: 'standalone',
  departments: specialistDepartments('Premium medical-suite tenancy by Tanglin; many cosmetic, dental, sports-med and ID specialists.'),
};

export const NOVENA_MEDICAL: Facility = {
  id: 'novena-medical',
  name: 'Novena Medical Center / Royal Square (tenancy)',
  type: 'private-specialist',
  sector: 'private',
  cluster: 'standalone',
  departments: specialistDepartments('Two specialist-tenancy buildings adjacent to Mt Elizabeth Novena.'),
};

export const PRIVATE_SPECIALIST_ALL: Facility[] = [
  SMG,
  ASIA_MEDIC,
  CAMDEN_MEDICAL,
  NOVENA_MEDICAL,
];
