import type { Facility } from '../../../lib/types';
import { gridLayout } from '../_shared';

/**
 * Admiralty Medical Centre — ambulatory surgery and SOC, NHG cluster.
 * No inpatient beds; works with KTPH/WH for admissions.
 */
export const AdMC: Facility = {
  id: 'admc',
  name: 'Admiralty Medical Centre',
  type: 'specialty',
  sector: 'public',
  cluster: 'nhg',
  departments: gridLayout(
    [
      { id: 'entrance', name: 'Lobby', shortLabel: 'Lobby', colour: '#3aa6ff', description: 'One-stop ambulatory care centre at Kampung Admiralty integrated complex.' },
      { id: 'soc', name: 'SOC Consult Rooms', shortLabel: 'SOC', colour: '#22d3ee', description: 'Multi-specialty subsidised SOC; renal, ortho, eye, ENT, paeds.' },
      { id: 'imaging', name: 'Imaging', shortLabel: 'Imaging', colour: '#8b5cf6', description: 'X-ray, ultrasound; CT/MRI by transfer to KTPH.' },
      { id: 'ot', name: 'Day-Surgery Suite', shortLabel: 'Day Proc', colour: '#ec4899', description: 'Cataract, endoscopy, minor ortho. Inpatient cases routed to KTPH/WH.' },
      { id: 'pharmacy', name: 'Pharmacy', shortLabel: 'Pharmacy', colour: '#38bdf8', description: 'Dispensing.' },
      { id: 'discharge', name: 'Care Coordinator', shortLabel: 'Coordinator', colour: '#a3e635', description: 'Care planner for post-procedure follow-up; right-siting to polyclinic / GP.' },
    ],
    { cols: 3 },
  ),
};
