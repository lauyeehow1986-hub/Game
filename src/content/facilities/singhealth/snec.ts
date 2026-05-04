import type { Facility } from '../../../lib/types';
import { gridLayout } from '../_shared';

/**
 * Singapore National Eye Centre — Outram campus.
 */
export const SNEC: Facility = {
  id: 'snec',
  name: 'Singapore National Eye Centre',
  type: 'specialty',
  sector: 'public',
  cluster: 'singhealth',
  departments: gridLayout(
    [
      { id: 'entrance', name: 'Lobby', shortLabel: 'Lobby', colour: '#3aa6ff', description: 'Outram campus eye centre. Visual-impairment friendly wayfinding.' },
      { id: 'screening', name: 'Pre-clinic Screening', shortLabel: 'Screening', colour: '#facc15', description: 'Visual acuity, IOP, fundus photography before consult.' },
      { id: 'soc', name: 'Ophthalmology Clinics', shortLabel: 'SOC', colour: '#22d3ee', description: 'Glaucoma, retina, cornea, paediatric, oculoplastic, neuro-ophthalmology.' },
      { id: 'imaging', name: 'Ocular Imaging', shortLabel: 'Imaging', colour: '#8b5cf6', description: 'OCT, FFA, ICG, B-scan US.' },
      { id: 'ot', name: 'Day-surgery OT', shortLabel: 'Day Proc', colour: '#ec4899', description: 'Cataract, vitrectomy, intravitreal injections, laser.' },
      { id: 'pharmacy', name: 'Pharmacy', shortLabel: 'Pharmacy', colour: '#38bdf8', description: 'Eye drops, anti-VEGF, post-op meds.' },
      { id: 'discharge', name: 'Care Coordinator', shortLabel: 'Coord', colour: '#a3e635', description: 'Right-siting stable patients to optometry / polyclinic / GP.' },
    ],
    { cols: 3 },
  ),
};
