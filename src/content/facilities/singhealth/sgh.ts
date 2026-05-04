import type { Facility } from '../../../lib/types';

/**
 * Singapore General Hospital — Outram campus. Largest tertiary public
 * hospital; SingHealth cluster flagship. Co-located with NHCS, NCCS,
 * NDCS, NNI@SGH, SNEC.
 */
export const SGH: Facility = {
  id: 'sgh',
  name: 'Singapore General Hospital',
  type: 'acute',
  sector: 'public',
  cluster: 'singhealth',
  departments: [
    { id: 'entrance', name: 'Bowyer Block Entrance', shortLabel: 'Lobby', position: { x: 80, y: 520 }, radius: 34, colour: '#3aa6ff', description: 'Main lobby / heritage Bowyer Block. Volunteer wayfinders to the Outram campus map.' },
    { id: 'triage', name: 'Emergency Triage', shortLabel: 'Triage', position: { x: 220, y: 480 }, radius: 32, colour: '#facc15', description: 'P1 to P4. SGH ED is one of the busiest in SG with major trauma intake.' },
    { id: 'ed', name: 'Emergency Department', shortLabel: 'A&E', position: { x: 360, y: 440 }, radius: 38, colour: '#f87171', description: 'Major trauma, resus, observation. Direct linkways to NHCS and NNI@SGH for stroke / STEMI activation.' },
    { id: 'imaging', name: 'Diagnostic Imaging', shortLabel: 'Imaging', position: { x: 510, y: 380 }, radius: 30, colour: '#8b5cf6', description: 'CT, MRI, fluoroscopy, interventional radiology suite.' },
    { id: 'cathlab', name: 'Cardiac Cath Lab (NHCS-linked)', shortLabel: 'Cath Lab', position: { x: 640, y: 290 }, radius: 34, colour: '#ED2939', description: 'Primary PCI; activated jointly with NHCS for STEMI. Direct lift from ED.' },
    { id: 'icu', name: 'Surgical ICU / MICU', shortLabel: 'ICU', position: { x: 700, y: 180 }, radius: 32, colour: '#fb923c', description: 'High-acuity ICU beds; ECMO, transplant aftercare.' },
    { id: 'ot', name: 'Operating Theatres', shortLabel: 'OT', position: { x: 510, y: 200 }, radius: 30, colour: '#ec4899', description: 'Multi-specialty ORs, transplant, robotic surgery.' },
    { id: 'ward', name: 'General + Subspecialty Wards', shortLabel: 'Ward', position: { x: 540, y: 100 }, radius: 36, colour: '#4ade80', description: 'A/B1/B2/C wards across multiple blocks.' },
    { id: 'pharmacy', name: 'Outpatient Pharmacy', shortLabel: 'Pharmacy', position: { x: 380, y: 100 }, radius: 28, colour: '#38bdf8', description: 'Multi-counter dispensing; MAF subsidy applied at point-of-sale.' },
    { id: 'soc', name: 'SOC Block (Outram)', shortLabel: 'SOC', position: { x: 220, y: 160 }, radius: 32, colour: '#22d3ee', description: 'Multi-specialty SOC. Linkways to NCCS, NHCS, NDCS, SNEC.' },
    { id: 'discharge', name: 'Discharge Lounge', shortLabel: 'Discharge', position: { x: 110, y: 280 }, radius: 30, colour: '#a3e635', description: 'Care coordination; AIC / community-hospital onward referral.' },
    { id: 'rehab', name: 'Inpatient Rehab', shortLabel: 'Rehab', position: { x: 110, y: 380 }, radius: 30, colour: '#10b981', description: 'Acute inpatient rehab; step-down to OCH on the same campus.' },
  ],
};
