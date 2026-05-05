import type { Facility } from '../../../lib/types';
import { gridLayout } from '../_shared';

const dialysisDepartments = () =>
  gridLayout(
    [
      { id: 'entrance', name: 'Reception', shortLabel: 'Reception', colour: '#3aa6ff', description: 'Walk-in registration; subsidised slots for ESRD patients on referral.' },
      { id: 'triage', name: 'Pre-dialysis Assessment', shortLabel: 'Pre-Dx', colour: '#facc15', description: 'Weight, BP, AVF check, pre-treatment review.' },
      { id: 'treatment-room', name: 'Dialysis Floor', shortLabel: 'HD Floor', colour: '#ED2939', description: 'Haemodialysis chairs; 4-hour session 3x/week is standard.' },
      { id: 'pharmacy', name: 'Pharmacy', shortLabel: 'Pharmacy', colour: '#38bdf8', description: 'Phosphate binders, ESA, IV iron stocked.' },
      { id: 'discharge', name: 'Coord Desk', shortLabel: 'Coord', colour: '#a3e635', description: 'Coordinates with renal SOC at NUH/SGH for medical review.' },
    ],
    { cols: 3 },
  );

export const NKF: Facility = {
  id: 'nkf',
  name: 'National Kidney Foundation Dialysis Centre',
  type: 'ancillary',
  sector: 'community',
  cluster: 'na',
  departments: dialysisDepartments(),
};

export const KDF: Facility = {
  id: 'kdf',
  name: 'Kidney Dialysis Foundation Centre',
  type: 'ancillary',
  sector: 'community',
  cluster: 'na',
  departments: dialysisDepartments(),
};

export const FRESENIUS: Facility = {
  id: 'fresenius',
  name: 'Fresenius Medical Care (Private Dialysis)',
  type: 'ancillary',
  sector: 'private',
  cluster: 'na',
  departments: dialysisDepartments(),
};
