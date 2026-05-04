import type { Facility } from '../../../lib/types';
import { gridLayout } from '../_shared';

/**
 * National Neuroscience Institute @ TTSH — bi-located between TTSH and SGH.
 * Modelled here as the TTSH-side outpatient and procedural neuroscience hub.
 */
export const NNI_TTSH: Facility = {
  id: 'nni-ttsh',
  name: 'National Neuroscience Institute @ TTSH',
  type: 'specialty',
  sector: 'public',
  cluster: 'nhg',
  departments: gridLayout(
    [
      { id: 'entrance', name: 'Lobby', shortLabel: 'Lobby', colour: '#3aa6ff', description: 'Co-located with TTSH; lift access from TTSH ED for stroke pathway.' },
      { id: 'soc', name: 'Neurology / Neurosurgery SOC', shortLabel: 'SOC', colour: '#22d3ee', description: 'Stroke, epilepsy, MS, movement disorders, neurosurgical clinics.' },
      { id: 'imaging', name: 'Neuroimaging', shortLabel: 'Imaging', colour: '#8b5cf6', description: 'MRI, MRA, CTA, perfusion. Stroke triage via direct CT angio.' },
      { id: 'ot', name: 'Neurosurgical OT (interventional)', shortLabel: 'Neuro OT', colour: '#ec4899', description: 'Mechanical thrombectomy suite. EVT pathway from TTSH ED.' },
      { id: 'icu', name: 'Neuro ICU (TTSH)', shortLabel: 'NeuroICU', colour: '#fb923c', description: 'Co-managed with TTSH MICU; ICP monitoring, status epilepticus.' },
      { id: 'pharmacy', name: 'Pharmacy', shortLabel: 'Pharmacy', colour: '#38bdf8', description: 'Antiepileptics, immunosuppressants, MS therapeutics.' },
    ],
    { cols: 3 },
  ),
};
