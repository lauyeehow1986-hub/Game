import type { Facility } from '../../../lib/types';
import { gridLayout } from '../_shared';

/**
 * Ang Mo Kio – Thye Hua Kwan Hospital — VWO community hospital in
 * Ang Mo Kio. Step-down for SingHealth / NHG patients in the central
 * region.
 */
export const AMKH: Facility = {
  id: 'amkh',
  name: 'Ang Mo Kio – Thye Hua Kwan Hospital',
  type: 'vwo',
  sector: 'vwo',
  cluster: 'vwo',
  departments: gridLayout(
    [
      { id: 'entrance', name: 'Lobby', shortLabel: 'Lobby', colour: '#3aa6ff', description: 'Ang Mo Kio campus. Receives step-down from SGH / TTSH / KTPH.' },
      { id: 'subacute-ward', name: 'Sub-acute Ward', shortLabel: 'Sub-acute', colour: '#10b981', description: 'Stable medical step-down.' },
      { id: 'ward', name: 'Rehab Ward', shortLabel: 'Rehab', colour: '#4ade80', description: 'Inpatient rehab beds.' },
      { id: 'rehab-gym', name: 'Therapy Gym', shortLabel: 'Gym', colour: '#fb923c', description: 'PT / OT / SLT.' },
      { id: 'pharmacy', name: 'Pharmacy', shortLabel: 'Pharmacy', colour: '#38bdf8', description: 'Dispensing.' },
      { id: 'discharge', name: 'AIC / Discharge', shortLabel: 'AIC', colour: '#a3e635', description: 'Care planning.' },
    ],
    { cols: 3 },
  ),
};
