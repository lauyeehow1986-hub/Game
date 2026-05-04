import type { Facility } from '../../../lib/types';

/**
 * Tan Tock Seng Hospital — playable hospital map for v0.1.
 *
 * Department positions are laid out on an 800x600 logical canvas; the Phaser
 * scene scales this to fit the available viewport. Coordinates are chosen to
 * loosely echo TTSH's physical adjacency: ED at the front, ICU/wards in the
 * tower, OT/cathlab clustered, outpatient SOC and rehab to the side.
 */
export const TTSH: Facility = {
  id: 'ttsh',
  name: 'Tan Tock Seng Hospital',
  type: 'acute',
  sector: 'public',
  cluster: 'nhg',
  departments: [
    {
      id: 'entrance',
      name: 'Main Entrance / Ambulance Bay',
      shortLabel: '995 / Walk-in',
      position: { x: 70, y: 520 },
      radius: 36,
      colour: '#3aa6ff',
      description:
        'Where SCDF ambulances and walk-in patients arrive. Triage clerks and security are stationed here.',
    },
    {
      id: 'triage',
      name: 'Emergency Triage (P1–P4)',
      shortLabel: 'Triage',
      position: { x: 200, y: 480 },
      radius: 34,
      colour: '#facc15',
      description:
        'Nurses assign Priority 1–4 within minutes. P1 (resus) bypasses the queue; P3 may wait several hours.',
    },
    {
      id: 'ed',
      name: 'Emergency Department (Resus)',
      shortLabel: 'A&E Resus',
      position: { x: 330, y: 440 },
      radius: 38,
      colour: '#f87171',
      description:
        'Resus bay for P1 cases — ECG within 10 min, ED registrar review, IV access, point-of-care labs.',
    },
    {
      id: 'imaging',
      name: 'Diagnostic Imaging',
      shortLabel: 'Imaging',
      position: { x: 480, y: 360 },
      radius: 32,
      colour: '#8b5cf6',
      description:
        'CT, MRI, plain radiographs. Reports auto-flow into NEHR for downstream cluster facilities.',
    },
    {
      id: 'cathlab',
      name: 'Cardiac Cath Lab',
      shortLabel: 'Cath Lab',
      position: { x: 600, y: 280 },
      radius: 38,
      colour: '#ED2939',
      description:
        'Primary PCI suite. STEMI activation aims for door-to-balloon time ≤ 90 min.',
    },
    {
      id: 'icu',
      name: 'Cardiac ICU',
      shortLabel: 'CICU',
      position: { x: 690, y: 180 },
      radius: 36,
      colour: '#fb923c',
      description:
        'Post-PCI monitoring: telemetry, arterial line, frequent troponins, cardiologist round.',
    },
    {
      id: 'ot',
      name: 'Operating Theatres',
      shortLabel: 'OT',
      position: { x: 480, y: 200 },
      radius: 32,
      colour: '#ec4899',
      description:
        'Used here for emergency cardiac/vascular procedures if PCI complications occur.',
    },
    {
      id: 'ward',
      name: 'Cardiology Ward',
      shortLabel: 'Ward',
      position: { x: 540, y: 100 },
      radius: 36,
      colour: '#4ade80',
      description:
        'Step-down from CICU. Subsidy class (A/B1/B2/C) determines bed type and cost.',
    },
    {
      id: 'pharmacy',
      name: 'Outpatient Pharmacy',
      shortLabel: 'Pharmacy',
      position: { x: 380, y: 100 },
      radius: 30,
      colour: '#38bdf8',
      description:
        'Dispenses dual antiplatelet, statin, beta-blocker, ACE-i. Counsels on adherence and bleeding risk.',
    },
    {
      id: 'discharge',
      name: 'Discharge Lounge',
      shortLabel: 'Discharge',
      position: { x: 230, y: 140 },
      radius: 32,
      colour: '#a3e635',
      description:
        'Final paperwork, MC, follow-up appointments at SOC and Cardiac Rehab.',
    },
    {
      id: 'soc',
      name: 'Cardiology Specialist Outpatient Clinic',
      shortLabel: 'SOC',
      position: { x: 110, y: 240 },
      radius: 32,
      colour: '#22d3ee',
      description:
        'Two-week post-PCI review: titration of guideline-directed medical therapy.',
    },
    {
      id: 'rehab',
      name: 'Cardiac Rehab',
      shortLabel: 'Rehab',
      position: { x: 110, y: 360 },
      radius: 30,
      colour: '#10b981',
      description:
        'Phase II cardiac rehab — supervised exercise, risk-factor counselling, return-to-work planning.',
    },
  ],
};
