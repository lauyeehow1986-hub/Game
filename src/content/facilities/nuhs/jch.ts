import type { Facility } from '../../../lib/types';
import { gridLayout } from '../_shared';

/**
 * Jurong Community Hospital — co-located with NTFGH.
 */
export const JCH: Facility = {
  id: 'jch',
  name: 'Jurong Community Hospital',
  type: 'community',
  sector: 'public',
  cluster: 'nuhs',
  departments: gridLayout(
    [
      { id: 'entrance', name: 'Lobby (linked to NTFGH)', shortLabel: 'Lobby', colour: '#3aa6ff', description: 'Direct lift link to Ng Teng Fong General Hospital.' },
      { id: 'subacute-ward', name: 'Sub-acute Ward', shortLabel: 'Sub-acute', colour: '#10b981', description: 'Step-down from NTFGH acute beds.' },
      { id: 'ward', name: 'Rehab Ward', shortLabel: 'Rehab', colour: '#4ade80', description: 'Inpatient rehab beds.' },
      { id: 'rehab-gym', name: 'Therapy Gym', shortLabel: 'Gym', colour: '#fb923c', description: 'PT / OT / SLT.' },
      { id: 'pharmacy', name: 'Pharmacy', shortLabel: 'Pharmacy', colour: '#38bdf8', description: 'Med rec.' },
      { id: 'discharge', name: 'AIC / Discharge', shortLabel: 'AIC', colour: '#a3e635', description: 'Home-care, day-rehab, nursing-home placement.' },
    ],
    { cols: 3 },
  ),
};
