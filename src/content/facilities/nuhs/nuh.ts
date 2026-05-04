import type { Facility } from '../../../lib/types';

/**
 * National University Hospital — Kent Ridge. NUHS cluster flagship and
 * teaching hospital of NUS Yong Loo Lin School of Medicine. Co-located
 * with NCIS, NUHCS, NUCOHS on the Kent Ridge campus.
 */
export const NUH: Facility = {
  id: 'nuh',
  name: 'National University Hospital',
  type: 'acute',
  sector: 'public',
  cluster: 'nuhs',
  departments: [
    { id: 'entrance', name: 'Main Lobby', shortLabel: 'Lobby', position: { x: 90, y: 520 }, radius: 34, colour: '#3aa6ff', description: 'Kent Ridge campus. Linkways to NUS Medicine, NCIS, NUHCS, NUCOHS.' },
    { id: 'triage', name: 'Emergency Triage', shortLabel: 'Triage', position: { x: 230, y: 480 }, radius: 32, colour: '#facc15', description: 'P1-P4 triage; integrated paediatric corner (Khoo Teck Puat Children\'s Medical Centre).' },
    { id: 'ed', name: 'Emergency Department', shortLabel: 'A&E', position: { x: 360, y: 440 }, radius: 38, colour: '#f87171', description: 'Adult + paediatric ED. Major trauma, stroke, STEMI activation routes direct to imaging / cath lab / endovascular suite.' },
    { id: 'imaging', name: 'Diagnostic Imaging', shortLabel: 'Imaging', position: { x: 510, y: 380 }, radius: 30, colour: '#8b5cf6', description: 'CT, MRI, IR; direct CTA / perfusion for stroke triage; multimodal stroke imaging suite.' },
    { id: 'cathlab', name: 'Cardiac Cath Lab (NUHCS-linked)', shortLabel: 'Cath Lab', position: { x: 640, y: 290 }, radius: 32, colour: '#ED2939', description: '24/7 PCI; structural heart programme jointly with NUHCS.' },
    { id: 'icu', name: 'Medical / Surgical ICU', shortLabel: 'ICU', position: { x: 700, y: 180 }, radius: 32, colour: '#fb923c', description: 'High-acuity ICU; transplant aftercare; ECMO.' },
    { id: 'ot', name: 'Operating Theatres', shortLabel: 'OT', position: { x: 510, y: 200 }, radius: 30, colour: '#ec4899', description: 'Multi-specialty ORs including transplant and robotic surgery; endovascular thrombectomy suite.' },
    { id: 'ward', name: 'Inpatient Wards', shortLabel: 'Ward', position: { x: 540, y: 100 }, radius: 36, colour: '#4ade80', description: 'A/B1/B2/C wards across multiple blocks; integrated stroke unit.' },
    { id: 'pharmacy', name: 'Pharmacy', shortLabel: 'Pharmacy', position: { x: 380, y: 100 }, radius: 28, colour: '#38bdf8', description: 'Outpatient + inpatient dispensing.' },
    { id: 'soc', name: 'SOC Block', shortLabel: 'SOC', position: { x: 220, y: 170 }, radius: 30, colour: '#22d3ee', description: 'Multi-specialty subsidised SOC; linkways to NCIS / NUHCS.' },
    { id: 'discharge', name: 'Discharge / AIC', shortLabel: 'Discharge', position: { x: 110, y: 280 }, radius: 28, colour: '#a3e635', description: 'AIC / community-hospital onward referral.' },
    { id: 'rehab', name: 'Inpatient Rehab', shortLabel: 'Rehab', position: { x: 110, y: 380 }, radius: 28, colour: '#10b981', description: 'Acute stroke / post-surgical rehab; step-down to JCH or SLH.' },
  ],
};
