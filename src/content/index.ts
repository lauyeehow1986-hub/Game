import { TTSH } from './facilities/nhg/ttsh';
import { stemiAcute } from './cases/stemi-acute';
import type { CaseDefinition, Facility } from '../lib/types';

export const facilities: Record<string, Facility> = {
  [TTSH.id]: TTSH,
};

export const cases: Record<string, CaseDefinition> = {
  [stemiAcute.id]: stemiAcute,
};

export function getFacility(id: string): Facility | undefined {
  return facilities[id];
}

export function getCase(id: string): CaseDefinition | undefined {
  return cases[id];
}

export function listCases(): CaseDefinition[] {
  return Object.values(cases);
}
