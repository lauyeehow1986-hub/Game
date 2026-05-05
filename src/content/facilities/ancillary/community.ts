import type { Facility } from '../../../lib/types';
import { gridLayout } from '../_shared';

/**
 * Generic nursing-home node (representing the 80+ nursing homes across
 * Singapore — VWO, government, and private operators).
 */
export const NURSING_HOME: Facility = {
  id: 'nursing-home',
  name: 'Nursing Home',
  type: 'ancillary',
  sector: 'community',
  cluster: 'na',
  departments: gridLayout(
    [
      { id: 'entrance', name: 'Reception', shortLabel: 'Reception', colour: '#3aa6ff', description: 'Generic node representing VWO / government / private nursing homes.' },
      { id: 'ward', name: 'Resident Rooms', shortLabel: 'Rooms', colour: '#4ade80', description: 'Long-term-care residency. 4-bedder, 6-bedder, single options.' },
      { id: 'treatment-room', name: 'Care Station', shortLabel: 'Care', colour: '#fb923c', description: 'Daily nursing care, wound management, feeding support.' },
      { id: 'rehab-gym', name: 'Therapy Room', shortLabel: 'Therapy', colour: '#10b981', description: 'PT / OT in-house or visiting therapist.' },
      { id: 'pharmacy', name: 'Medication Room', shortLabel: 'Meds', colour: '#38bdf8', description: 'Resident medications, blister-packed.' },
      { id: 'discharge', name: 'Family Liaison', shortLabel: 'Liaison', colour: '#a3e635', description: 'Coordinates with hospital admissions, GP visits, hospice transitions.' },
    ],
    { cols: 3 },
  ),
};

/**
 * Patient's home — used for caregiver scenes and home-care visits.
 */
export const HOME: Facility = {
  id: 'home',
  name: "Patient's Home",
  type: 'ancillary',
  sector: 'community',
  cluster: 'na',
  departments: gridLayout(
    [
      { id: 'entrance', name: 'Front Door', shortLabel: 'Door', colour: '#3aa6ff', description: 'Where caregivers, home nurses, and Meals-on-Wheels deliveries arrive.' },
      { id: 'ward', name: 'Bedroom', shortLabel: 'Bedroom', colour: '#4ade80', description: 'Where the patient spends most of the day. Hospital bed if rented.' },
      { id: 'treatment-room', name: 'Living Room', shortLabel: 'Living', colour: '#fb923c', description: 'Where caregivers manage feeds, medications, mobilisation.' },
      { id: 'pharmacy', name: 'Medicine Cabinet', shortLabel: 'Meds', colour: '#38bdf8', description: 'Discharge medications; home-hospice anticipatory drugs in a locked box.' },
      { id: 'discharge', name: 'Phone / Telecall', shortLabel: 'Telecall', colour: '#a3e635', description: 'Telephone advice line, telemed consults, AH@Home virtual ward.' },
    ],
    { cols: 3 },
  ),
};

/**
 * Generic outpatient pharmacy chain (Guardian / Watsons / Unity).
 */
export const RETAIL_PHARMACY: Facility = {
  id: 'retail-pharmacy',
  name: 'Retail Pharmacy (Guardian / Watsons / Unity)',
  type: 'ancillary',
  sector: 'private',
  cluster: 'na',
  departments: gridLayout(
    [
      { id: 'entrance', name: 'Storefront', shortLabel: 'Store', colour: '#3aa6ff', description: 'Walk-in OTC and prescription dispensing.' },
      { id: 'pharmacy', name: 'Dispensing Counter', shortLabel: 'Counter', colour: '#38bdf8', description: 'Pharmacist counsel, prescription dispensing.' },
      { id: 'treatment-room', name: 'OTC / Self-care', shortLabel: 'OTC', colour: '#fb923c', description: 'Self-purchase analgesia, vitamins, basic devices.' },
    ],
    { cols: 3 },
  ),
};
