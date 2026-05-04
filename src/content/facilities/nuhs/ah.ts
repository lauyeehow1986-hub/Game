import type { Facility } from '../../../lib/types';
import { gridLayout } from '../_shared';

/**
 * Alexandra Hospital — Queensway. NUHS acute hospital with a focus on
 * geriatric integrated care.
 */
export const AH: Facility = {
  id: 'ah',
  name: 'Alexandra Hospital',
  type: 'acute',
  sector: 'public',
  cluster: 'nuhs',
  departments: gridLayout(
    [
      { id: 'entrance', name: 'Lobby', shortLabel: 'Lobby', colour: '#3aa6ff', description: 'Heritage campus reorganised around hospital-at-home and integrated geriatrics.' },
      { id: 'triage', name: 'Triage', shortLabel: 'Triage', colour: '#facc15', description: 'ED triage with frailty fast-track.' },
      { id: 'ed', name: 'Emergency Department', shortLabel: 'A&E', colour: '#f87171', description: 'Acute ED + Geriatric Emergency Medicine area.' },
      { id: 'imaging', name: 'Imaging', shortLabel: 'Imaging', colour: '#8b5cf6', description: 'CT, MRI, US.' },
      { id: 'icu', name: 'ICU', shortLabel: 'ICU', colour: '#fb923c', description: 'Mixed ICU.' },
      { id: 'ot', name: 'Operating Theatres', shortLabel: 'OT', colour: '#ec4899', description: 'General, ortho.' },
      { id: 'ward', name: 'Inpatient Wards', shortLabel: 'Ward', colour: '#4ade80', description: 'Subsidy class A/B1/B2/C; integrated frailty wards.' },
      { id: 'rehab', name: 'Geriatric Rehab', shortLabel: 'Rehab', colour: '#10b981', description: 'Frailty rehab + AH@Home virtual ward.' },
      { id: 'pharmacy', name: 'Pharmacy', shortLabel: 'Pharmacy', colour: '#38bdf8', description: 'Polypharmacy review built into discharge.' },
      { id: 'soc', name: 'SOC', shortLabel: 'SOC', colour: '#22d3ee', description: 'Multi-specialty SOC.' },
      { id: 'discharge', name: 'Discharge / AIC', shortLabel: 'AIC', colour: '#a3e635', description: 'AIC + AH@Home enrolment.' },
    ],
    { cols: 4 },
  ),
};
