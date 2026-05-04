import type { Facility } from '../../../lib/types';
import { gridLayout } from '../_shared';

/**
 * Bright Vision Hospital — Lorong Napiri. Long-term care and rehab; part
 * of SingHealth as community hospital.
 */
export const BVH: Facility = {
  id: 'bvh',
  name: 'Bright Vision Hospital',
  type: 'community',
  sector: 'public',
  cluster: 'singhealth',
  departments: gridLayout(
    [
      { id: 'entrance', name: 'Lobby', shortLabel: 'Lobby', colour: '#3aa6ff', description: 'Hougang campus.' },
      { id: 'subacute-ward', name: 'Sub-acute Ward', shortLabel: 'Sub-acute', colour: '#10b981', description: 'Sub-acute medical beds.' },
      { id: 'ward', name: 'Long-term Care Ward', shortLabel: 'LTC', colour: '#4ade80', description: 'Long-stay rehab and chronic care.' },
      { id: 'rehab-gym', name: 'Therapy Gym', shortLabel: 'Gym', colour: '#fb923c', description: 'PT / OT.' },
      { id: 'pharmacy', name: 'Pharmacy', shortLabel: 'Pharmacy', colour: '#38bdf8', description: 'Dispensing.' },
      { id: 'discharge', name: 'Discharge / AIC', shortLabel: 'AIC', colour: '#a3e635', description: 'Care planning.' },
    ],
    { cols: 3 },
  ),
};
