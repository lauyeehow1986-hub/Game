import type { Facility } from '../../../lib/types';

/**
 * Woodlands Health — opened 2023. Newest NHG acute hospital, integrated
 * acute + community + long-term care campus.
 */
export const WH: Facility = {
  id: 'wh',
  name: 'Woodlands Health',
  type: 'acute',
  sector: 'public',
  cluster: 'nhg',
  departments: [
    { id: 'entrance', name: 'Main Lobby', shortLabel: 'Lobby', position: { x: 110, y: 510 }, radius: 32, colour: '#3aa6ff', description: 'New campus opened 2023. Integrated acute, community and long-term-care wings.' },
    { id: 'triage', name: 'Emergency Triage', shortLabel: 'Triage', position: { x: 240, y: 470 }, radius: 30, colour: '#facc15', description: '24/7 ED triage.' },
    { id: 'ed', name: 'Emergency Department', shortLabel: 'A&E', position: { x: 380, y: 430 }, radius: 36, colour: '#f87171', description: 'Acute ED for the north-west; integrated geriatric and observation areas.' },
    { id: 'imaging', name: 'Diagnostic Imaging', shortLabel: 'Imaging', position: { x: 520, y: 360 }, radius: 28, colour: '#8b5cf6', description: 'CT, MR, ultrasound, X-ray.' },
    { id: 'icu', name: 'ICU', shortLabel: 'ICU', position: { x: 660, y: 280 }, radius: 32, colour: '#fb923c', description: 'Mixed ICU.' },
    { id: 'ot', name: 'Operating Theatres', shortLabel: 'OT', position: { x: 510, y: 200 }, radius: 28, colour: '#ec4899', description: 'General, orthopaedic, day-surgery suites.' },
    { id: 'ward', name: 'Inpatient Wards', shortLabel: 'Ward', position: { x: 600, y: 110 }, radius: 32, colour: '#4ade80', description: 'Acute and step-down wards on the same campus.' },
    { id: 'subacute-ward', name: 'Sub-acute / Community Ward', shortLabel: 'Sub-acute', position: { x: 380, y: 110 }, radius: 30, colour: '#10b981', description: 'Co-located community-hospital beds — enables rapid downgrade without inter-hospital transport.' },
    { id: 'soc', name: 'SOC', shortLabel: 'SOC', position: { x: 220, y: 160 }, radius: 28, colour: '#22d3ee', description: 'Multi-specialty outpatient clinics.' },
    { id: 'pharmacy', name: 'Pharmacy', shortLabel: 'Pharmacy', position: { x: 110, y: 280 }, radius: 26, colour: '#38bdf8', description: 'Dispensing.' },
    { id: 'discharge', name: 'Discharge Lounge', shortLabel: 'Discharge', position: { x: 110, y: 380 }, radius: 28, colour: '#a3e635', description: 'Care coordination + AIC desk.' },
  ],
};
