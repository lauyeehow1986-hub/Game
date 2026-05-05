import type { Facility } from '../../../lib/types';
import { gridLayout } from '../_shared';

/**
 * St Luke's Hospital — Bukit Batok. VWO partner community hospital.
 * Sub-acute, rehab, palliative.
 */
export const SLH: Facility = {
  id: 'slh',
  name: "St Luke's Hospital",
  type: 'vwo',
  sector: 'vwo',
  cluster: 'vwo',
  departments: gridLayout(
    [
      { id: 'entrance', name: 'Lobby', shortLabel: 'Lobby', colour: '#3aa6ff', description: 'Bukit Batok campus. Receives step-down from NUH / NTFGH / AH.' },
      { id: 'subacute-ward', name: 'Sub-acute Ward', shortLabel: 'Sub-acute', colour: '#10b981', description: 'Stable patients completing IV antibiotics, optimising HF, post-stroke.' },
      { id: 'ward', name: 'Rehab Ward', shortLabel: 'Rehab Ward', colour: '#4ade80', description: 'Inpatient rehab beds.' },
      { id: 'rehab-gym', name: 'Therapy Gym', shortLabel: 'Gym', colour: '#fb923c', description: 'PT / OT / SLT.' },
      { id: 'pharmacy', name: 'Pharmacy', shortLabel: 'Pharmacy', colour: '#38bdf8', description: 'Medication reconciliation; chronic-disease counselling.' },
      { id: 'discharge', name: 'AIC / Discharge', shortLabel: 'AIC', colour: '#a3e635', description: 'Home-care, day-rehab, nursing-home placement.' },
    ],
    { cols: 3 },
  ),
};
