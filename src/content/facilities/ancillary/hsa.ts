import type { Facility } from '../../../lib/types';
import { gridLayout } from '../_shared';

/**
 * Health Sciences Authority — national agency for forensics, blood
 * services, and regulation. Patients touch HSA via blood transfusion
 * supply or forensic pathology referrals.
 */
export const HSA: Facility = {
  id: 'hsa',
  name: 'Health Sciences Authority',
  type: 'ancillary',
  sector: 'pre-hospital',
  cluster: 'national',
  departments: gridLayout(
    [
      { id: 'entrance', name: 'Outram HQ', shortLabel: 'HQ', colour: '#3aa6ff', description: 'Main HSA campus next to SGH.' },
      { id: 'lab', name: 'Blood Services', shortLabel: 'Blood Bank', colour: '#ED2939', description: 'National blood bank — collection, processing, distribution to all hospitals.' },
      { id: 'lab-forensic', name: 'Forensic Medicine', shortLabel: 'Forensic', colour: '#8b5cf6', description: 'Forensic pathology, toxicology, DNA testing.' },
    ],
    { cols: 2 },
  ),
};
