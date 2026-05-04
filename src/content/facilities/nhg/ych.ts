import type { Facility } from '../../../lib/types';
import { gridLayout } from '../_shared';

/**
 * Yishun Community Hospital — co-located with KTPH. NHG step-down /
 * sub-acute and rehab beds.
 */
export const YCH: Facility = {
  id: 'ych',
  name: 'Yishun Community Hospital',
  type: 'community',
  sector: 'public',
  cluster: 'nhg',
  departments: gridLayout(
    [
      { id: 'entrance', name: 'Lobby (linked to KTPH)', shortLabel: 'Lobby', colour: '#3aa6ff', description: 'Linkway to KTPH for seamless transfer.' },
      { id: 'subacute-ward', name: 'Sub-acute Ward', shortLabel: 'Sub-acute', colour: '#10b981', description: 'Patients medically stable but not yet ready for home: e.g. completing IV antibiotics, optimising HF.' },
      { id: 'ward', name: 'Rehabilitation Ward', shortLabel: 'Rehab Ward', colour: '#4ade80', description: 'Longer-stay rehab beds for stroke, post-orthopaedic, deconditioning.' },
      { id: 'rehab-gym', name: 'Therapy Gym', shortLabel: 'Gym', colour: '#fb923c', description: 'PT / OT / SLT shared therapy space; gait labs.' },
      { id: 'pharmacy', name: 'Pharmacy', shortLabel: 'Pharmacy', colour: '#38bdf8', description: 'Dispensing for inpatients and discharge medication reconciliation.' },
      { id: 'discharge', name: 'Discharge Lounge / AIC', shortLabel: 'Discharge', colour: '#a3e635', description: 'Coordination with home-care, day-rehab, nursing-home placement.' },
    ],
    { cols: 3 },
  ),
};
