import type { Facility } from '../../../lib/types';

/**
 * KK Women's and Children's Hospital — Bukit Timah Road. National
 * tertiary obstetrics, gynaecology, neonatology, and paediatrics.
 */
export const KKH: Facility = {
  id: 'kkh',
  name: "KK Women's and Children's Hospital",
  type: 'specialty',
  sector: 'public',
  cluster: 'singhealth',
  departments: [
    { id: 'entrance', name: "Children's Entrance", shortLabel: 'Lobby', position: { x: 100, y: 520 }, radius: 32, colour: '#3aa6ff', description: 'Family-friendly lobby. Separate paediatric and obstetric streams.' },
    { id: 'triage', name: 'Paediatric Triage', shortLabel: 'Paeds Triage', position: { x: 230, y: 480 }, radius: 30, colour: '#facc15', description: 'Paediatric emergency triage. PEWS scoring on arrival.' },
    { id: 'ed', name: "Children's Emergency", shortLabel: 'CE', position: { x: 370, y: 440 }, radius: 36, colour: '#f87171', description: 'High-volume paediatric ED with resus and short-stay observation.' },
    { id: 'imaging', name: 'Paeds Imaging', shortLabel: 'Imaging', position: { x: 510, y: 360 }, radius: 28, colour: '#8b5cf6', description: 'Child-sized scanners, sedation suite when needed.' },
    { id: 'icu', name: 'PICU / NICU', shortLabel: 'PICU', position: { x: 660, y: 240 }, radius: 32, colour: '#fb923c', description: 'Paediatric and neonatal ICU; HFOV, ECMO available.' },
    { id: 'ot', name: 'Obstetric Theatres', shortLabel: 'Obs OT', position: { x: 510, y: 200 }, radius: 30, colour: '#ec4899', description: 'Caesarean section theatres adjacent to delivery suite.' },
    { id: 'maternity-ward', name: 'Maternity Ward', shortLabel: 'Maternity', position: { x: 600, y: 110 }, radius: 32, colour: '#4ade80', description: 'A/B1/B2/C maternity ward classes.' },
    { id: 'ward', name: 'Paediatric Ward', shortLabel: 'Paeds Ward', position: { x: 380, y: 110 }, radius: 32, colour: '#10b981', description: 'General + sub-specialty paediatrics.' },
    { id: 'soc', name: "Women's & Children's SOC", shortLabel: 'SOC', position: { x: 220, y: 170 }, radius: 30, colour: '#22d3ee', description: 'Antenatal, gynae, paeds sub-specialties.' },
    { id: 'pharmacy', name: 'Pharmacy', shortLabel: 'Pharmacy', position: { x: 110, y: 280 }, radius: 26, colour: '#38bdf8', description: 'Paediatric dose-banding; weight-based dispensing checks.' },
    { id: 'discharge', name: 'Discharge', shortLabel: 'Discharge', position: { x: 110, y: 380 }, radius: 28, colour: '#a3e635', description: 'Mother-and-baby discharge planning; community midwife liaison.' },
  ],
};
