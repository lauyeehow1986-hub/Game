import type { Facility } from '../../../lib/types';
import { gridLayout } from '../_shared';

/**
 * National Skin Centre — Mandalay Road. National tertiary dermatology centre.
 */
export const NSC: Facility = {
  id: 'nsc',
  name: 'National Skin Centre',
  type: 'specialty',
  sector: 'public',
  cluster: 'nhg',
  departments: gridLayout(
    [
      { id: 'entrance', name: 'Lobby', shortLabel: 'Lobby', colour: '#3aa6ff', description: 'Walk-in registration. Self-help kiosks for repeat patients.' },
      { id: 'triage', name: 'Nursing Triage', shortLabel: 'Triage', colour: '#facc15', description: 'Skin photography, brief history; flags urgent suspected melanoma.' },
      { id: 'derm-clinic', name: 'Dermatology Consultation Rooms', shortLabel: 'Derm Clinic', colour: '#22d3ee', description: 'General and sub-specialty dermatology (paeds, contact dermatitis, lupus, hair, occupational).' },
      { id: 'phototherapy', name: 'Phototherapy Unit', shortLabel: 'Phototherapy', colour: '#fb923c', description: 'NB-UVB, PUVA, excimer for psoriasis, vitiligo, eczema.' },
      { id: 'lab', name: 'Skin Pathology Lab', shortLabel: 'Path Lab', colour: '#8b5cf6', description: 'Dermatopathology — biopsies, immunofluorescence.' },
      { id: 'ot', name: 'Day Procedure Suite', shortLabel: 'Day Proc', colour: '#ec4899', description: 'Excisions, Mohs surgery, cryotherapy, laser.' },
      { id: 'pharmacy', name: 'Pharmacy', shortLabel: 'Pharmacy', colour: '#38bdf8', description: 'Topical and biologic dispensing.' },
      { id: 'discharge', name: 'Care Plan Desk', shortLabel: 'Plan Desk', colour: '#a3e635', description: 'Right-siting back to GP / polyclinic for stable chronic eczema / psoriasis.' },
    ],
    { cols: 3 },
  ),
};
