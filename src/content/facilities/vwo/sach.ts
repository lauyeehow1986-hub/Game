import type { Facility } from '../../../lib/types';
import { gridLayout } from '../_shared';

/**
 * St Andrew's Community Hospital — Anglican VWO community hospital
 * in Simei, integrated with CGH.
 */
export const SACH: Facility = {
  id: 'sach',
  name: "St Andrew's Community Hospital",
  type: 'vwo',
  sector: 'vwo',
  cluster: 'vwo',
  departments: gridLayout(
    [
      { id: 'entrance', name: 'Lobby (linked to CGH)', shortLabel: 'Lobby', colour: '#3aa6ff', description: 'Simei campus. Anglican VWO. Co-located with Changi General Hospital.' },
      { id: 'subacute-ward', name: 'Sub-acute Ward', shortLabel: 'Sub-acute', colour: '#10b981', description: 'Step-down from CGH.' },
      { id: 'ward', name: 'Rehab Ward', shortLabel: 'Rehab', colour: '#4ade80', description: 'Inpatient rehab beds; palliative beds.' },
      { id: 'rehab-gym', name: 'Therapy Gym', shortLabel: 'Gym', colour: '#fb923c', description: 'PT / OT / SLT.' },
      { id: 'pharmacy', name: 'Pharmacy', shortLabel: 'Pharmacy', colour: '#38bdf8', description: 'Dispensing.' },
      { id: 'discharge', name: 'AIC / Discharge', shortLabel: 'AIC', colour: '#a3e635', description: 'Care planning, hospice / home-care liaison.' },
    ],
    { cols: 3 },
  ),
};

/**
 * St Andrew's Community Hospital (Bedok) — second SACH campus, opened
 * 20 Nov 2025 with 240 beds. Singapore's 11th community hospital,
 * integrated with the eastern acute network ahead of Eastern General
 * Hospital coming online ~2029-2030.
 */
export const SACH_BEDOK: Facility = {
  id: 'sach-bedok',
  name: "St Andrew's Community Hospital (Bedok)",
  type: 'vwo',
  sector: 'vwo',
  cluster: 'vwo',
  departments: gridLayout(
    [
      { id: 'entrance', name: 'Lobby', shortLabel: 'Lobby', colour: '#3aa6ff', description: 'Bedok campus (opened Nov 2025, 240 beds). Anglican VWO. Serves the eastern catchment.' },
      { id: 'subacute-ward', name: 'Sub-acute Ward', shortLabel: 'Sub-acute', colour: '#10b981', description: 'Step-down from CGH and (from ~2030) Eastern General Hospital.' },
      { id: 'ward', name: 'Rehab Ward', shortLabel: 'Rehab', colour: '#4ade80', description: 'Inpatient rehab beds; dementia and palliative beds.' },
      { id: 'rehab-gym', name: 'Therapy Gym', shortLabel: 'Gym', colour: '#fb923c', description: 'PT / OT / SLT.' },
      { id: 'pharmacy', name: 'Pharmacy', shortLabel: 'Pharmacy', colour: '#38bdf8', description: 'Dispensing.' },
      { id: 'discharge', name: 'AIC / Discharge', shortLabel: 'AIC', colour: '#a3e635', description: 'Care planning, Age Well SG / home-care liaison.' },
    ],
    { cols: 3 },
  ),
};
