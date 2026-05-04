import type { Facility } from '../../../lib/types';
import { gridLayout } from '../_shared';

/**
 * National Heart Centre Singapore — Outram campus. National tertiary
 * cardiology and cardiothoracic surgery centre. Receives STEMI / complex
 * cardiac referrals from across all clusters.
 */
export const NHCS: Facility = {
  id: 'nhcs',
  name: 'National Heart Centre Singapore',
  type: 'specialty',
  sector: 'public',
  cluster: 'singhealth',
  departments: gridLayout(
    [
      { id: 'entrance', name: 'NHCS Lobby', shortLabel: 'Lobby', colour: '#3aa6ff', description: 'Linked to SGH and the Outram MRT station. Walk-in cardiology assessments + scheduled day-procedures.' },
      { id: 'soc', name: 'Cardiology SOC', shortLabel: 'Cardio SOC', colour: '#22d3ee', description: 'Subspecialty clinics: HF, EP, valves, congenital, inherited cardiac conditions.' },
      { id: 'imaging', name: 'Cardiac Imaging', shortLabel: 'Cardiac Imaging', colour: '#8b5cf6', description: 'Echocardiography (TTE/TOE), cardiac MRI, cardiac CT, nuclear cardiology.' },
      { id: 'cathlab', name: 'Cardiac Cath Labs', shortLabel: 'Cath Lab', colour: '#ED2939', description: 'Multiple labs: PCI, structural heart (TAVI, MitraClip), EP ablation. Receives STEMI from SKH/CGH/SGH.' },
      { id: 'ot', name: 'Cardiothoracic OTs', shortLabel: 'CT OT', colour: '#ec4899', description: 'CABG, valve surgery, transplant.' },
      { id: 'icu', name: 'Cardiothoracic ICU', shortLabel: 'CTICU', colour: '#fb923c', description: 'Post-op cardiac surgery and post-PCI complex cases.' },
      { id: 'ward', name: 'Cardiology Ward', shortLabel: 'Ward', colour: '#4ade80', description: 'Step-down telemetry, valve clinic recovery.' },
      { id: 'pharmacy', name: 'Pharmacy', shortLabel: 'Pharmacy', colour: '#38bdf8', description: 'Cardiac-specific dispensing: DAPT, MRA, HF therapies.' },
      { id: 'rehab', name: 'Cardiac Rehab', shortLabel: 'Rehab', colour: '#10b981', description: 'Phase II/III supervised exercise + risk-factor counselling.' },
    ],
    { cols: 3 },
  ),
};
