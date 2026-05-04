import type { Facility } from '../../../lib/types';
import { gridLayout } from '../_shared';

/**
 * Outram Community Hospital — co-located with SGH on Outram campus.
 */
export const OCH: Facility = {
  id: 'och',
  name: 'Outram Community Hospital',
  type: 'community',
  sector: 'public',
  cluster: 'singhealth',
  departments: gridLayout(
    [
      { id: 'entrance', name: 'Lobby (linked to SGH)', shortLabel: 'Lobby', colour: '#3aa6ff', description: 'Bridge to SGH for seamless step-down.' },
      { id: 'subacute-ward', name: 'Sub-acute Ward', shortLabel: 'Sub-acute', colour: '#10b981', description: 'Stable patients completing IV antibiotics, optimising HF, post-stroke.' },
      { id: 'ward', name: 'Rehab Ward', shortLabel: 'Rehab Ward', colour: '#4ade80', description: 'Inpatient rehab beds.' },
      { id: 'rehab-gym', name: 'Therapy Gym', shortLabel: 'Gym', colour: '#fb923c', description: 'PT / OT / SLT therapy gym; gait labs.' },
      { id: 'pharmacy', name: 'Pharmacy', shortLabel: 'Pharmacy', colour: '#38bdf8', description: 'Discharge med rec.' },
      { id: 'discharge', name: 'AIC / Care Coord', shortLabel: 'AIC', colour: '#a3e635', description: 'Home-care, day-rehab, nursing-home placement.' },
    ],
    { cols: 3 },
  ),
};
