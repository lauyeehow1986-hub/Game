import type { Facility } from '../../../lib/types';
import { gridLayout } from '../_shared';

/**
 * National University Heart Centre, Singapore — NUHS cardiology and
 * cardiothoracic surgery.
 */
export const NUHCS: Facility = {
  id: 'nuhcs',
  name: 'National University Heart Centre, Singapore',
  type: 'specialty',
  sector: 'public',
  cluster: 'nuhs',
  departments: gridLayout(
    [
      { id: 'entrance', name: 'NUHCS Lobby', shortLabel: 'Lobby', colour: '#3aa6ff', description: 'Within NUH campus; walk-in cardiology assessment + scheduled procedures.' },
      { id: 'soc', name: 'Cardiology SOC', shortLabel: 'Cardio SOC', colour: '#22d3ee', description: 'HF, EP, structural, congenital, transplant.' },
      { id: 'imaging', name: 'Cardiac Imaging', shortLabel: 'Cardiac Imaging', colour: '#8b5cf6', description: 'Echo, cardiac MRI, cardiac CT, nuclear cardiology.' },
      { id: 'cathlab', name: 'Cath Labs', shortLabel: 'Cath Lab', colour: '#ED2939', description: 'PCI, structural heart (TAVI, MitraClip), EP ablation. Receives from NTFGH and AH for complex cases.' },
      { id: 'ot', name: 'Cardiothoracic OTs', shortLabel: 'CT OT', colour: '#ec4899', description: 'CABG, valve, transplant.' },
      { id: 'icu', name: 'CTICU', shortLabel: 'CTICU', colour: '#fb923c', description: 'Post-CT-surgery and post-PCI complex cases.' },
      { id: 'ward', name: 'Cardio Ward', shortLabel: 'Ward', colour: '#4ade80', description: 'Step-down telemetry beds.' },
      { id: 'rehab', name: 'Cardiac Rehab', shortLabel: 'Rehab', colour: '#10b981', description: 'Phase II/III rehab.' },
      { id: 'pharmacy', name: 'Pharmacy', shortLabel: 'Pharmacy', colour: '#38bdf8', description: 'Cardiac-specific dispensing.' },
    ],
    { cols: 3 },
  ),
};
