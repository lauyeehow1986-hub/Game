import type { Facility } from '../../../lib/types';
import { gridLayout } from '../_shared';

/**
 * National Neuroscience Institute @ SGH — bi-located with NNI@TTSH.
 * Tertiary stroke / neurosurgical service for SingHealth-side referrals.
 */
export const NNI_SGH: Facility = {
  id: 'nni-sgh',
  name: 'National Neuroscience Institute @ SGH',
  type: 'specialty',
  sector: 'public',
  cluster: 'singhealth',
  departments: gridLayout(
    [
      { id: 'entrance', name: 'Lobby', shortLabel: 'Lobby', colour: '#3aa6ff', description: 'Within SGH campus; rapid access from SGH ED for stroke pathway.' },
      { id: 'soc', name: 'Neuro SOC', shortLabel: 'Neuro SOC', colour: '#22d3ee', description: 'Stroke, epilepsy, MS, neurodegeneration.' },
      { id: 'imaging', name: 'Neuroimaging', shortLabel: 'Imaging', colour: '#8b5cf6', description: 'MRI, MRA, CTA, perfusion imaging for stroke triage.' },
      { id: 'ot', name: 'Endovascular Suite', shortLabel: 'Neuro OT', colour: '#ec4899', description: 'Mechanical thrombectomy, aneurysm coiling.' },
      { id: 'icu', name: 'NeuroICU (SGH)', shortLabel: 'NeuroICU', colour: '#fb923c', description: 'Co-managed with SGH SICU; ICP monitoring, status epilepticus.' },
      { id: 'ward', name: 'Stroke / Neurology Ward', shortLabel: 'Ward', colour: '#4ade80', description: 'Stroke unit + general neurology beds.' },
      { id: 'rehab', name: 'Inpatient Neuro Rehab', shortLabel: 'Rehab', colour: '#10b981', description: 'Acute stroke rehab; step-down to OCH/SACH.' },
    ],
    { cols: 3 },
  ),
};
