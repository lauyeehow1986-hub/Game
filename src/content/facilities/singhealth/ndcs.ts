import type { Facility } from '../../../lib/types';
import { gridLayout } from '../_shared';

/**
 * National Dental Centre Singapore — Outram campus.
 */
export const NDCS: Facility = {
  id: 'ndcs',
  name: 'National Dental Centre Singapore',
  type: 'specialty',
  sector: 'public',
  cluster: 'singhealth',
  departments: gridLayout(
    [
      { id: 'entrance', name: 'Lobby', shortLabel: 'Lobby', colour: '#3aa6ff', description: 'Outram dental campus.' },
      { id: 'soc', name: 'Dental SOC', shortLabel: 'Dental Clinic', colour: '#22d3ee', description: 'Restorative, periodontics, paediatric dentistry, orthodontics.' },
      { id: 'imaging', name: 'Dental Imaging', shortLabel: 'Imaging', colour: '#8b5cf6', description: 'OPG, cone-beam CT for surgical planning.' },
      { id: 'ot', name: 'Oral & Maxillofacial OT', shortLabel: 'OMFS OT', colour: '#ec4899', description: 'Major OMFS procedures: orthognathic surgery, oral cancer resection.' },
      { id: 'ward', name: 'Day-stay Recovery', shortLabel: 'Recovery', colour: '#4ade80', description: 'Post-surgical day-stay observation.' },
      { id: 'pharmacy', name: 'Pharmacy', shortLabel: 'Pharmacy', colour: '#38bdf8', description: 'Dental analgesics, antibiotics, chlorhexidine.' },
    ],
    { cols: 3 },
  ),
};
