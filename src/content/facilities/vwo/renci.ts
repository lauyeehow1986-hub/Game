import type { Facility } from '../../../lib/types';
import { gridLayout } from '../_shared';

/**
 * Ren Ci Community Hospital — Buddhist welfare-organisation community
 * hospital with nursing-home and active-ageing services.
 */
export const RenCi: Facility = {
  id: 'renci',
  name: 'Ren Ci Community Hospital',
  type: 'vwo',
  sector: 'vwo',
  cluster: 'vwo',
  departments: gridLayout(
    [
      { id: 'entrance', name: 'Lobby', shortLabel: 'Lobby', colour: '#3aa6ff', description: 'Novena campus. Buddhist VWO; integrated nursing-home, day-rehab, hospice.' },
      { id: 'subacute-ward', name: 'Sub-acute Ward', shortLabel: 'Sub-acute', colour: '#10b981', description: 'Sub-acute medical step-down beds.' },
      { id: 'ward', name: 'Rehab / LTC Ward', shortLabel: 'Rehab/LTC', colour: '#4ade80', description: 'Rehab + long-term-care beds.' },
      { id: 'rehab-gym', name: 'Therapy Gym', shortLabel: 'Gym', colour: '#fb923c', description: 'PT / OT.' },
      { id: 'pharmacy', name: 'Pharmacy', shortLabel: 'Pharmacy', colour: '#38bdf8', description: 'Dispensing.' },
      { id: 'discharge', name: 'Care Coord / AIC', shortLabel: 'Coord', colour: '#a3e635', description: 'Coordinates with AIC, nursing home, hospice.' },
    ],
    { cols: 3 },
  ),
};
