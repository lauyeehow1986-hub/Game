import type { Facility } from '../../../lib/types';
import { gridLayout } from '../_shared';

/**
 * National University Centre for Oral Health Singapore — NUHS dental.
 */
export const NUCOHS: Facility = {
  id: 'nucohs',
  name: 'National University Centre for Oral Health Singapore',
  type: 'specialty',
  sector: 'public',
  cluster: 'nuhs',
  departments: gridLayout(
    [
      { id: 'entrance', name: 'Lobby', shortLabel: 'Lobby', colour: '#3aa6ff', description: 'Kent Ridge campus; teaching with NUS Faculty of Dentistry.' },
      { id: 'soc', name: 'Dental SOC', shortLabel: 'Dental Clinic', colour: '#22d3ee', description: 'Restorative, periodontics, orthodontics, paeds dentistry, prosthodontics.' },
      { id: 'imaging', name: 'Dental Imaging', shortLabel: 'Imaging', colour: '#8b5cf6', description: 'OPG, cone-beam CT.' },
      { id: 'ot', name: 'OMFS OT', shortLabel: 'OMFS OT', colour: '#ec4899', description: 'Major OMFS surgery, orthognathic.' },
      { id: 'ward', name: 'Day Recovery', shortLabel: 'Recovery', colour: '#4ade80', description: 'Day-stay observation.' },
      { id: 'pharmacy', name: 'Pharmacy', shortLabel: 'Pharmacy', colour: '#38bdf8', description: 'Dental analgesics, antibiotics.' },
    ],
    { cols: 3 },
  ),
};
