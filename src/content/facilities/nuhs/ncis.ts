import type { Facility } from '../../../lib/types';
import { gridLayout } from '../_shared';

/**
 * National University Cancer Institute, Singapore — NUHS oncology.
 */
export const NCIS: Facility = {
  id: 'ncis',
  name: 'National University Cancer Institute, Singapore',
  type: 'specialty',
  sector: 'public',
  cluster: 'nuhs',
  departments: gridLayout(
    [
      { id: 'entrance', name: 'NCIS Lobby', shortLabel: 'Lobby', colour: '#3aa6ff', description: 'Within NUH campus; integrated with NUS Medicine.' },
      { id: 'soc', name: 'Oncology SOC', shortLabel: 'Onc SOC', colour: '#22d3ee', description: 'Medical, surgical, radiation oncology, palliative.' },
      { id: 'imaging', name: 'Oncology Imaging', shortLabel: 'Imaging', colour: '#8b5cf6', description: 'PET-CT, MRI, theranostics.' },
      { id: 'lab', name: 'Cancer Genetics', shortLabel: 'Genetics', colour: '#facc15', description: 'Hereditary cancer panel testing and counselling.' },
      { id: 'ot', name: 'Day Therapy Centre', shortLabel: 'Day Tx', colour: '#ec4899', description: 'Outpatient chemotherapy, immunotherapy, CAR-T outpatient setup.' },
      { id: 'ward', name: 'Inpatient Oncology Ward', shortLabel: 'Onc Ward', colour: '#4ade80', description: 'Inpatient chemo, neutropenic sepsis, CAR-T monitoring.' },
      { id: 'rehab', name: 'Survivorship', shortLabel: 'Survivorship', colour: '#10b981', description: 'Cancer rehab, vocational return-to-work, lymphoedema.' },
      { id: 'pharmacy', name: 'Pharmacy', shortLabel: 'Pharmacy', colour: '#38bdf8', description: 'Cytotoxic admixture, biologics, MAF subsidy applied.' },
      { id: 'discharge', name: 'Care Coord', shortLabel: 'Coord', colour: '#a3e635', description: 'Treatment summary, GP / community palliative liaison.' },
    ],
    { cols: 3 },
  ),
};
