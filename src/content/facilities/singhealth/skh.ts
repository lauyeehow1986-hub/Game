import type { Facility } from '../../../lib/types';

/**
 * Sengkang General Hospital — opened 2018. SingHealth acute hospital
 * serving the north-east; co-located with Sengkang Community Hospital.
 */
export const SKH: Facility = {
  id: 'skh',
  name: 'Sengkang General Hospital',
  type: 'acute',
  sector: 'public',
  cluster: 'singhealth',
  departments: [
    { id: 'entrance', name: 'Main Lobby', shortLabel: 'Lobby', position: { x: 100, y: 520 }, radius: 32, colour: '#3aa6ff', description: 'Direct lift link to Sengkang Community Hospital.' },
    { id: 'triage', name: 'Emergency Triage', shortLabel: 'Triage', position: { x: 230, y: 480 }, radius: 30, colour: '#facc15', description: '24/7 triage; family-zone area.' },
    { id: 'ed', name: 'Emergency Department', shortLabel: 'A&E', position: { x: 370, y: 440 }, radius: 36, colour: '#f87171', description: 'Acute ED for north-east; observation, fast-track, paeds corner.' },
    { id: 'imaging', name: 'Imaging', shortLabel: 'Imaging', position: { x: 510, y: 360 }, radius: 28, colour: '#8b5cf6', description: 'CT, MRI, US.' },
    { id: 'cathlab', name: 'Cath Lab', shortLabel: 'Cath Lab', position: { x: 640, y: 270 }, radius: 30, colour: '#ED2939', description: 'PCI capable; some STEMIs may transfer to SGH/NHCS for complex cases.' },
    { id: 'icu', name: 'ICU', shortLabel: 'ICU', position: { x: 700, y: 180 }, radius: 30, colour: '#fb923c', description: 'Mixed ICU.' },
    { id: 'ot', name: 'Operating Theatres', shortLabel: 'OT', position: { x: 500, y: 200 }, radius: 28, colour: '#ec4899', description: 'General, ortho, day-surgery.' },
    { id: 'ward', name: 'Inpatient Wards', shortLabel: 'Ward', position: { x: 580, y: 110 }, radius: 32, colour: '#4ade80', description: 'Integrated A/B1/B2/C wards.' },
    { id: 'subacute-ward', name: 'Sub-acute (linked SKCH)', shortLabel: 'Sub-acute', position: { x: 380, y: 110 }, radius: 28, colour: '#10b981', description: 'Direct transfer to Sengkang Community Hospital next door.' },
    { id: 'soc', name: 'SOC', shortLabel: 'SOC', position: { x: 220, y: 170 }, radius: 28, colour: '#22d3ee', description: 'Multi-specialty SOC.' },
    { id: 'pharmacy', name: 'Pharmacy', shortLabel: 'Pharmacy', position: { x: 110, y: 280 }, radius: 26, colour: '#38bdf8', description: 'Dispensing.' },
    { id: 'discharge', name: 'Discharge Lounge', shortLabel: 'Discharge', position: { x: 110, y: 380 }, radius: 28, colour: '#a3e635', description: 'AIC / community pathway.' },
  ],
};
