import type { Facility } from '../../../lib/types';
import { gridLayout } from '../_shared';

/**
 * SCDF Emergency Medical Services — pre-hospital care abstract node.
 */
export const SCDF: Facility = {
  id: 'scdf',
  name: 'SCDF Emergency Medical Services (995)',
  type: 'ancillary',
  sector: 'pre-hospital',
  cluster: 'national',
  departments: gridLayout(
    [
      { id: 'entrance', name: 'Dispatch Centre', shortLabel: 'Dispatch', colour: '#3aa6ff', description: 'Operations Centre at HQ Bishan. Handles 995 calls and coordinates ambulance + fire dispatch.' },
      { id: 'triage', name: 'Pre-hospital Triage', shortLabel: 'EMD', colour: '#facc15', description: 'Caller-side triage with structured questions; advance pre-arrival instructions (CPR, choking).' },
      { id: 'treatment-room', name: 'Ambulance Treatment Bay', shortLabel: 'Ambulance', colour: '#ED2939', description: 'Paramedic + EMT crew. Defib, drugs, splinting, 12-lead ECG, pre-notification to hospital.' },
      { id: 'discharge', name: 'Hospital Handover', shortLabel: 'Handover', colour: '#a3e635', description: 'Structured ATMIST handover at the receiving ED.' },
    ],
    { cols: 2 },
  ),
};
