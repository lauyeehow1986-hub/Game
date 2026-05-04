import type { Facility } from '../../../lib/types';

/**
 * Changi General Hospital — Simei. SingHealth acute hospital serving
 * the eastern population.
 */
export const CGH: Facility = {
  id: 'cgh',
  name: 'Changi General Hospital',
  type: 'acute',
  sector: 'public',
  cluster: 'singhealth',
  departments: [
    { id: 'entrance', name: 'Main Lobby', shortLabel: 'Lobby', position: { x: 100, y: 520 }, radius: 32, colour: '#3aa6ff', description: 'Sheltered drop-off; integrated taxi stand.' },
    { id: 'triage', name: 'Emergency Triage', shortLabel: 'Triage', position: { x: 230, y: 480 }, radius: 30, colour: '#facc15', description: '24/7 triage P1-P4.' },
    { id: 'ed', name: 'Emergency Department', shortLabel: 'A&E', position: { x: 370, y: 440 }, radius: 36, colour: '#f87171', description: 'High-volume ED for the east. Major trauma centre.' },
    { id: 'imaging', name: 'Diagnostic Imaging', shortLabel: 'Imaging', position: { x: 510, y: 360 }, radius: 30, colour: '#8b5cf6', description: 'CT, MRI, US, IR.' },
    { id: 'cathlab', name: 'Cardiac Cath Lab', shortLabel: 'Cath Lab', position: { x: 640, y: 270 }, radius: 32, colour: '#ED2939', description: '24/7 primary PCI for east-side STEMI.' },
    { id: 'icu', name: 'ICU', shortLabel: 'ICU', position: { x: 700, y: 180 }, radius: 30, colour: '#fb923c', description: 'Mixed med-surg ICU.' },
    { id: 'ot', name: 'Operating Theatres', shortLabel: 'OT', position: { x: 500, y: 190 }, radius: 28, colour: '#ec4899', description: 'General, ortho, vascular, day-surgery.' },
    { id: 'ward', name: 'Inpatient Wards', shortLabel: 'Ward', position: { x: 580, y: 110 }, radius: 32, colour: '#4ade80', description: 'A/B1/B2/C wards; integrated geriatric ward.' },
    { id: 'soc', name: 'SOC', shortLabel: 'SOC', position: { x: 360, y: 130 }, radius: 30, colour: '#22d3ee', description: 'Multi-specialty SOC.' },
    { id: 'pharmacy', name: 'Pharmacy', shortLabel: 'Pharmacy', position: { x: 220, y: 200 }, radius: 28, colour: '#38bdf8', description: 'Outpatient + inpatient dispensing.' },
    { id: 'rehab', name: 'CGH Rehab', shortLabel: 'Rehab', position: { x: 110, y: 320 }, radius: 28, colour: '#10b981', description: 'Outpatient rehab + step-down planning.' },
    { id: 'discharge', name: 'Discharge / AIC', shortLabel: 'Discharge', position: { x: 110, y: 420 }, radius: 28, colour: '#a3e635', description: 'AIC desk for community / nursing-home onward care.' },
  ],
};
