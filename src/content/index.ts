import { TTSH } from './facilities/nhg/ttsh';
import { stemiAcute } from './cases/stemi-acute';
import { electiveTHR } from './cases/elective-thr';
import { outpatientDiabetes } from './cases/outpatient-diabetes';
import type { CaseDefinition, Facility } from '../lib/types';

export const facilities: Record<string, Facility> = {
  [TTSH.id]: TTSH,
};

export const cases: Record<string, CaseDefinition> = {
  [stemiAcute.id]: stemiAcute,
  [electiveTHR.id]: electiveTHR,
  [outpatientDiabetes.id]: outpatientDiabetes,
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
