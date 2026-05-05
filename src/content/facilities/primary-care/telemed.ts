import type { Facility } from '../../../lib/types';
import { gridLayout } from '../_shared';

/**
 * Telemedicine providers — virtual primary-care entry nodes. They share
 * a department template, but each is a separate facility so cases can
 * specify which app the patient used (and resulting NEHR data flow may
 * differ).
 */
const telemedDepartments = () =>
  gridLayout(
    [
      { id: 'entrance', name: 'App Login', shortLabel: 'App', colour: '#3aa6ff', description: 'Patient logs in via mobile app; SingPass verifies identity; brief intake form.' },
      { id: 'triage', name: 'AI Pre-screen', shortLabel: 'Pre-screen', colour: '#facc15', description: 'Symptom checker; red-flag triage redirects to ED if needed.' },
      { id: 'gp-room', name: 'Video Consult', shortLabel: 'Video', colour: '#22d3ee', description: '15-minute video consult with a registered GP; e-prescription generated; MC issued where appropriate.' },
      { id: 'pharmacy', name: 'Last-mile Pharmacy', shortLabel: 'Delivery', colour: '#38bdf8', description: 'Medications delivered same-day; controlled drugs not dispensed via telemed.' },
      { id: 'discharge', name: 'NEHR Note', shortLabel: 'NEHR', colour: '#a3e635', description: 'Some providers contribute consult notes to NEHR; some do not (data-availability gap).' },
    ],
    { cols: 3 },
  );

function makeTelemed(id: string, name: string): Facility {
  return {
    id,
    name,
    type: 'telemed',
    sector: 'private',
    cluster: 'na',
    departments: telemedDepartments(),
  };
}

export const MANADR = makeTelemed('telemed-manadr', 'MaNaDr (Telemed)');
export const DOCTOR_ANYWHERE = makeTelemed('telemed-doctor-anywhere', 'Doctor Anywhere (Telemed)');
export const WHITECOAT = makeTelemed('telemed-whitecoat', 'WhiteCoat (Telemed)');
export const SPEEDOC = makeTelemed('telemed-speedoc', 'Speedoc (Telemed + Home Visits)');

export const TELEMED_ALL: Facility[] = [
  MANADR,
  DOCTOR_ANYWHERE,
  WHITECOAT,
  SPEEDOC,
];
