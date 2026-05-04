import type { Facility } from '../../../lib/types';
import { gridLayout } from '../_shared';

/**
 * Sengkang Community Hospital — co-located with SKH.
 */
export const SKCH: Facility = {
  id: 'skch',
  name: 'Sengkang Community Hospital',
  type: 'community',
  sector: 'public',
  cluster: 'singhealth',
  departments: gridLayout(
    [
      { id: 'entrance', name: 'Lobby (linked to SKH)', shortLabel: 'Lobby', colour: '#3aa6ff', description: 'Direct lift link to Sengkang General Hospital.' },
      { id: 'subacute-ward', name: 'Sub-acute Ward', shortLabel: 'Sub-acute', colour: '#10b981', description: 'Step-down from SKH acute beds.' },
      { id: 'ward', name: 'Rehab Ward', shortLabel: 'Rehab', colour: '#4ade80', description: 'Inpatient rehab beds.' },
      { id: 'rehab-gym', name: 'Therapy Gym', shortLabel: 'Gym', colour: '#fb923c', description: 'PT / OT / SLT.' },
      { id: 'pharmacy', name: 'Pharmacy', shortLabel: 'Pharmacy', colour: '#38bdf8', description: 'Discharge med rec.' },
      { id: 'discharge', name: 'AIC / Discharge', shortLabel: 'AIC', colour: '#a3e635', description: 'Home-care + community placement.' },
    ],
    { cols: 3 },
  ),
};
