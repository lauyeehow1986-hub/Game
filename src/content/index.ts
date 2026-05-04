import { TTSH } from './facilities/nhg/ttsh';
import { KTPH } from './facilities/nhg/ktph';
import { WH } from './facilities/nhg/wh';
import { NCID } from './facilities/nhg/ncid';
import { IMH } from './facilities/nhg/imh';
import { NSC } from './facilities/nhg/nsc';
import { NNI_TTSH } from './facilities/nhg/nni-ttsh';
import { YCH } from './facilities/nhg/ych';
import { AdMC } from './facilities/nhg/admc';
import { NHGP_ALL } from './facilities/nhg/nhgp';
import { stemiAcute } from './cases/stemi-acute';
import { electiveTHR } from './cases/elective-thr';
import { outpatientDiabetes } from './cases/outpatient-diabetes';
import { diseaseXOutbreak } from './cases/disease-x-outbreak';
import type { CaseDefinition, Facility } from '../lib/types';

const allFacilities: Facility[] = [
  TTSH,
  KTPH,
  WH,
  NCID,
  IMH,
  NSC,
  NNI_TTSH,
  YCH,
  AdMC,
  ...NHGP_ALL,
];

export const facilities: Record<string, Facility> = Object.fromEntries(
  allFacilities.map((f) => [f.id, f]),
);

export const cases: Record<string, CaseDefinition> = {
  [stemiAcute.id]: stemiAcute,
  [electiveTHR.id]: electiveTHR,
  [outpatientDiabetes.id]: outpatientDiabetes,
  [diseaseXOutbreak.id]: diseaseXOutbreak,
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

export function listFacilities(): Facility[] {
  return allFacilities;
}

export function facilitiesByCluster(cluster: string): Facility[] {
  return allFacilities.filter((f) => f.cluster === cluster);
}
