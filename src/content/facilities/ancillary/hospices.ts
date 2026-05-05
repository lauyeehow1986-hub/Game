import type { Facility } from '../../../lib/types';
import { gridLayout } from '../_shared';

const hospiceDepartments = (homeCareLabel = 'Home Hospice') =>
  gridLayout(
    [
      { id: 'entrance', name: 'Lobby', shortLabel: 'Lobby', colour: '#3aa6ff', description: 'Family-friendly hospice lobby. Quiet rooms.' },
      { id: 'ward', name: 'Inpatient Hospice Ward', shortLabel: 'Hospice Ward', colour: '#4ade80', description: 'Single rooms with family camp-bed; 24/7 palliative team.' },
      { id: 'treatment-room', name: 'Symptom Control', shortLabel: 'Symptom', colour: '#fb923c', description: 'Pain, dyspnoea, agitation, secretions management. Subcut infusion drivers.' },
      { id: 'discharge', name: homeCareLabel, shortLabel: 'Home Hospice', colour: '#a3e635', description: 'Home-hospice nursing visits, telephone support, on-call medical cover.' },
      { id: 'pharmacy', name: 'Pharmacy', shortLabel: 'Pharmacy', colour: '#38bdf8', description: 'Opioids, anti-emetics, anxiolytics; EOL anticipatory medications.' },
    ],
    { cols: 3 },
  );

/** HCA Hospice Care — Singapore's largest home-hospice provider. */
export const HCA: Facility = {
  id: 'hca',
  name: 'HCA Hospice Care',
  type: 'ancillary',
  sector: 'community',
  cluster: 'vwo',
  departments: hospiceDepartments('HCA Home Hospice'),
};

/** Dover Park Hospice — inpatient hospice on Outram campus. */
export const DOVER_PARK: Facility = {
  id: 'dover-park',
  name: 'Dover Park Hospice',
  type: 'ancillary',
  sector: 'community',
  cluster: 'vwo',
  departments: hospiceDepartments(),
};

/** Assisi Hospice — inpatient + day-hospice, Catholic VWO. */
export const ASSISI: Facility = {
  id: 'assisi',
  name: 'Assisi Hospice',
  type: 'ancillary',
  sector: 'community',
  cluster: 'vwo',
  departments: hospiceDepartments(),
};
