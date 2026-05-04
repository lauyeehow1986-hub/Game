import type { Facility } from '../../../lib/types';

/**
 * National Centre for Infectious Diseases — purpose-built isolation campus
 * adjacent to TTSH. Activated nationally during DORSCON-Orange and above.
 */
export const NCID: Facility = {
  id: 'ncid',
  name: 'National Centre for Infectious Diseases',
  type: 'specialty',
  sector: 'public',
  cluster: 'nhg',
  departments: [
    { id: 'entrance', name: 'Screening Vestibule', shortLabel: 'Screening', position: { x: 110, y: 510 }, radius: 32, colour: '#3aa6ff', description: 'Front-line screening with thermal imaging, TraceTogether check, declaration forms.' },
    { id: 'triage', name: 'Cohort Triage', shortLabel: 'Triage', position: { x: 250, y: 470 }, radius: 30, colour: '#facc15', description: 'Splits suspect / probable / unlikely cases into segregated streams.' },
    { id: 'isolation', name: 'Negative-Pressure Isolation Bay', shortLabel: 'Isolation', position: { x: 410, y: 410 }, radius: 36, colour: '#f87171', description: 'Single-patient AIIRs (airborne infection isolation rooms). PPE donning anteroom.' },
    { id: 'lab', name: 'BSL-3 Laboratory', shortLabel: 'BSL-3', position: { x: 580, y: 350 }, radius: 32, colour: '#8b5cf6', description: 'PCR / culture / sequencing on Cat-3 pathogens. National Public Health Laboratory next door.' },
    { id: 'icu', name: 'High-Level Isolation ICU', shortLabel: 'HLI ICU', position: { x: 700, y: 230 }, radius: 32, colour: '#fb923c', description: 'Negative-pressure ICU with ECMO capability for high-consequence pathogens.' },
    { id: 'ward', name: 'Cohort Isolation Ward', shortLabel: 'Cohort Ward', position: { x: 540, y: 130 }, radius: 32, colour: '#4ade80', description: 'Cohort wards segregated by pathogen and stage of illness.' },
    { id: 'pharmacy', name: 'Antiviral Pharmacy', shortLabel: 'Pharmacy', position: { x: 350, y: 130 }, radius: 28, colour: '#38bdf8', description: 'Stockpiled antivirals, immunoglobulins, experimental therapeutics.' },
    { id: 'soc', name: 'Travel & Tropical Medicine Clinic', shortLabel: 'TTM', position: { x: 200, y: 180 }, radius: 28, colour: '#22d3ee', description: 'Pre- and post-travel review; chronic ID outpatient (HIV, TB, hepatitis).' },
    { id: 'discharge', name: 'De-isolation Lounge', shortLabel: 'De-iso', position: { x: 110, y: 320 }, radius: 28, colour: '#a3e635', description: 'Clearance swabs and discharge planning for recovered patients.' },
  ],
};
