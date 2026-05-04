import type { Facility } from '../../../lib/types';

/**
 * Institute of Mental Health — Buangkok. National tertiary mental-health
 * centre under the NHG cluster.
 */
export const IMH: Facility = {
  id: 'imh',
  name: 'Institute of Mental Health',
  type: 'specialty',
  sector: 'public',
  cluster: 'nhg',
  departments: [
    { id: 'entrance', name: 'Main Lobby', shortLabel: 'Lobby', position: { x: 110, y: 510 }, radius: 32, colour: '#3aa6ff', description: 'Buangkok Green campus. Mood Disorders Unit, Early Psychosis Intervention.' },
    { id: 'triage', name: 'Crisis Assessment Unit', shortLabel: 'CAU', position: { x: 250, y: 460 }, radius: 32, colour: '#facc15', description: '24/7 walk-in crisis triage. Risk assessment and admission pathway.' },
    { id: 'ed', name: 'Emergency Service / Mobile Crisis', shortLabel: 'EMS', position: { x: 410, y: 410 }, radius: 32, colour: '#f87171', description: 'Acute mental-health emergencies. Mobile crisis teams attend community calls.' },
    { id: 'psych-ward', name: 'Acute Psychiatric Ward', shortLabel: 'Acute Ward', position: { x: 580, y: 360 }, radius: 32, colour: '#4ade80', description: 'Closed ward for acutely unwell patients; observation rooms.' },
    { id: 'subacute-ward', name: 'Sub-acute / Rehabilitation Ward', shortLabel: 'Sub-acute', position: { x: 700, y: 230 }, radius: 30, colour: '#10b981', description: 'Longer-stay rehab and step-down beds.' },
    { id: 'ect', name: 'ECT Suite', shortLabel: 'ECT', position: { x: 540, y: 140 }, radius: 28, colour: '#ec4899', description: 'Electroconvulsive therapy with anaesthetic team. For treatment-resistant depression and severe mania.' },
    { id: 'psych-clinic', name: 'Specialist Outpatient Clinic', shortLabel: 'Psych SOC', position: { x: 360, y: 130 }, radius: 32, colour: '#22d3ee', description: 'MDU, psychosis, addictions, child & adolescent, geriatric psychiatry sub-clinics.' },
    { id: 'pharmacy', name: 'Pharmacy', shortLabel: 'Pharmacy', position: { x: 200, y: 180 }, radius: 26, colour: '#38bdf8', description: 'Antipsychotic / mood stabiliser dispensing; clozapine monitoring.' },
    { id: 'discharge', name: 'Community Liaison', shortLabel: 'Liaison', position: { x: 110, y: 320 }, radius: 28, colour: '#a3e635', description: 'Link to Community Mental Health Teams, AIC, and the patient\'s polyclinic / Healthier-SG GP.' },
  ],
};
