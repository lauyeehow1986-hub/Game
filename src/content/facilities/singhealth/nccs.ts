import type { Facility } from '../../../lib/types';
import { gridLayout } from '../_shared';

/**
 * National Cancer Centre Singapore — Outram campus. National tertiary
 * oncology referral centre.
 */
export const NCCS: Facility = {
  id: 'nccs',
  name: 'National Cancer Centre Singapore',
  type: 'specialty',
  sector: 'public',
  cluster: 'singhealth',
  departments: gridLayout(
    [
      { id: 'entrance', name: 'NCCS Lobby', shortLabel: 'Lobby', colour: '#3aa6ff', description: 'Walk-in registration; linked to SGH and Outram campus.' },
      { id: 'soc', name: 'Oncology SOC', shortLabel: 'Onc SOC', colour: '#22d3ee', description: 'Medical oncology, radiation oncology, surgical oncology, palliative.' },
      { id: 'imaging', name: 'Oncology Imaging', shortLabel: 'Imaging', colour: '#8b5cf6', description: 'PET-CT, MRI, CT staging.' },
      { id: 'lab', name: 'Cancer Genetic Service', shortLabel: 'Genetics', colour: '#facc15', description: 'BRCA, Lynch, Li-Fraumeni testing; hereditary cancer counselling.' },
      { id: 'ot', name: 'Day Therapy Centre', shortLabel: 'Day Tx', colour: '#ec4899', description: 'Outpatient chemotherapy and immunotherapy chairs.' },
      { id: 'ward', name: 'Inpatient Oncology Ward', shortLabel: 'Onc Ward', colour: '#4ade80', description: 'Inpatient chemo, neutropenic sepsis management, complex symptom control.' },
      { id: 'rehab', name: 'Survivorship & Rehab', shortLabel: 'Survivorship', colour: '#10b981', description: 'Lymphoedema, fatigue, cognitive rehab, vocational return-to-work.' },
      { id: 'pharmacy', name: 'Oncology Pharmacy', shortLabel: 'Pharmacy', colour: '#38bdf8', description: 'Cytotoxic admixture, biologics, oral oncolytics; MAF subsidy applied.' },
      { id: 'discharge', name: 'Care Coordination', shortLabel: 'Coord', colour: '#a3e635', description: 'Treatment-summary handover to GP / community palliative team.' },
    ],
    { cols: 3 },
  ),
};
