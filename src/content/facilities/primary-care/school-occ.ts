import type { Facility } from '../../../lib/types';
import { gridLayout } from '../_shared';

/**
 * Health Promotion Board school health screening — annual / cyclical
 * screening at primary and secondary schools. Patients enter the
 * network via a referral letter from the school health team (e.g.
 * scoliosis, BMI, vision, hearing) to a polyclinic / hospital SOC.
 */
export const HPB_SCHOOL: Facility = {
  id: 'hpb-school',
  name: 'HPB School Health Screening',
  type: 'ancillary',
  sector: 'community',
  cluster: 'national',
  departments: gridLayout(
    [
      { id: 'entrance', name: 'School Hall', shortLabel: 'Hall', colour: '#3aa6ff', description: 'Annual cycle — visiting nurse and dental teams screen at primary and secondary schools.' },
      { id: 'screening', name: 'Vision / Hearing / BMI', shortLabel: 'Screening', colour: '#facc15', description: 'Visual acuity, audiometry, anthropometry, scoliosis check, dental.' },
      { id: 'discharge', name: 'Referral Desk', shortLabel: 'Referral', colour: '#a3e635', description: 'Generates referral letters to polyclinic / KKH / SNEC / NDCS as needed.' },
    ],
    { cols: 3 },
  ),
};

/**
 * Generic MOM-mandated workplace clinic / occupational-health provider
 * (e.g. shipyard medical, factory medical, MOM stat-board screening).
 */
export const WORKPLACE_HEALTH: Facility = {
  id: 'workplace-health',
  name: 'Workplace Occupational Health Clinic',
  type: 'ancillary',
  sector: 'private',
  cluster: 'na',
  departments: gridLayout(
    [
      { id: 'entrance', name: 'Reception', shortLabel: 'Reception', colour: '#3aa6ff', description: 'Pre-employment / annual statutory medicals (MOM SHENS, food handlers, divers, drivers).' },
      { id: 'triage', name: 'Vitals + Audiometry', shortLabel: 'Screening', colour: '#facc15', description: 'BP, weight, audiometry, lung-function for occupational hazards.' },
      { id: 'gp-room', name: 'Doctor Consult', shortLabel: 'Doctor', colour: '#22d3ee', description: 'Statutory examination, fitness-to-work, work-injury reporting.' },
      { id: 'lab', name: 'Lab', shortLabel: 'Lab', colour: '#8b5cf6', description: 'Bloods, urine — biological monitoring for hazardous exposures.' },
      { id: 'discharge', name: 'Cert / Referral', shortLabel: 'Cert', colour: '#a3e635', description: 'Fit-to-work certificate; referral to specialist if abnormal.' },
    ],
    { cols: 3 },
  ),
};
