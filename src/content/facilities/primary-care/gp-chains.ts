import type { Facility } from '../../../lib/types';
import { gridLayout } from '../_shared';

/**
 * Generic GP-clinic factory. Each chain instantiates this template with a
 * different display name and id; the same departments are reused so the
 * Phaser scene can render any GP clinic without per-chain content work.
 *
 * Chains modelled here:
 *  - Healthway Medical Group (large GP chain, broad CHAS participation)
 *  - Parkway Shenton (IHH; corporate medicine focus)
 *  - Raffles Medical Clinics (RMG; integrated with Raffles Hospital)
 *  - Northeast Medical Group (NEMG; community GP cluster)
 *  - IHH–Parkway clinics (IHH; integrated with Parkway hospitals)
 *  - Generic solo-GP / family clinic (single doctor practice)
 *  - Many of the above are CHAS-participating, with tier varying by
 *    practice. The financing engine already applies CHAS / PG / MG
 *    subsidies based on the patient profile.
 */

const gpDepartments = () =>
  gridLayout(
    [
      { id: 'entrance', name: 'Reception', shortLabel: 'Reception', colour: '#3aa6ff', description: 'Walk-in registration; CHAS / PG / MG cards scanned at counter; NEHR pulled where the clinic contributes.' },
      { id: 'triage', name: 'Vitals Bay', shortLabel: 'Vitals', colour: '#facc15', description: 'BP, weight, brief screen by clinic assistant.' },
      { id: 'gp-room', name: 'Family Physician Consult', shortLabel: 'GP Room', colour: '#22d3ee', description: 'Acute walk-in care, CDMP chronic-disease management, vaccinations, medical certificates.' },
      { id: 'treatment-room', name: 'Treatment Room', shortLabel: 'Treatment', colour: '#fb923c', description: 'Wound care, ECG, injections, simple procedures.' },
      { id: 'pharmacy', name: 'In-clinic Dispensary', shortLabel: 'Dispensary', colour: '#38bdf8', description: 'Most Singapore GPs dispense in-clinic. CHAS / PG / MG discounts applied at the counter.' },
      { id: 'discharge', name: 'Reception (exit)', shortLabel: 'Exit', colour: '#a3e635', description: 'Bill payment; referral letter printing; appointment-card for follow-up.' },
    ],
    { cols: 3 },
  );

function makeGP(id: string, name: string): Facility {
  return {
    id,
    name,
    type: 'gp',
    sector: 'private',
    cluster: 'na',
    departments: gpDepartments(),
  };
}

export const HEALTHWAY = makeGP('gp-healthway', 'Healthway Medical Group (Generic Branch)');
export const PARKWAY_SHENTON = makeGP('gp-parkway-shenton', 'Parkway Shenton Clinic');
export const RAFFLES_MEDICAL = makeGP('gp-raffles', 'Raffles Medical Group Clinic');
export const NEMG = makeGP('gp-nemg', 'Northeast Medical Group Clinic');
export const IHH_PARKWAY_GP = makeGP('gp-ihh-parkway', 'IHH–Parkway Clinic');
export const SOLO_GP = makeGP('gp-solo', 'Solo Family Practice (Generic)');

export const GP_CHAINS: Facility[] = [
  HEALTHWAY,
  PARKWAY_SHENTON,
  RAFFLES_MEDICAL,
  NEMG,
  IHH_PARKWAY_GP,
  SOLO_GP,
];
