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

import { SGH } from './facilities/singhealth/sgh';
import { CGH } from './facilities/singhealth/cgh';
import { SKH } from './facilities/singhealth/skh';
import { KKH } from './facilities/singhealth/kkh';
import { NHCS } from './facilities/singhealth/nhcs';
import { NCCS } from './facilities/singhealth/nccs';
import { NDCS } from './facilities/singhealth/ndcs';
import { NNI_SGH } from './facilities/singhealth/nni-sgh';
import { SNEC } from './facilities/singhealth/snec';
import { OCH } from './facilities/singhealth/och';
import { SKCH } from './facilities/singhealth/skch';
import { BVH } from './facilities/singhealth/bvh';
import { SHP_ALL } from './facilities/singhealth/shp';

import { stemiAcute } from './cases/stemi-acute';
import { electiveTHR } from './cases/elective-thr';
import { outpatientDiabetes } from './cases/outpatient-diabetes';
import { diseaseXOutbreak } from './cases/disease-x-outbreak';
import { paediatricFeverKKH } from './cases/paediatric-fever-kkh';
import { breastCancerCrossCluster } from './cases/breast-cancer-crosscluster';
import type { CaseDefinition, Facility } from '../lib/types';

const allFacilities: Facility[] = [
  // NHG
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
  // SingHealth
  SGH,
  CGH,
  SKH,
  KKH,
  NHCS,
  NCCS,
  NDCS,
  NNI_SGH,
  SNEC,
  OCH,
  SKCH,
  BVH,
  ...SHP_ALL,
];

export const facilities: Record<string, Facility> = Object.fromEntries(
  allFacilities.map((f) => [f.id, f]),
);

export const cases: Record<string, CaseDefinition> = {
  [stemiAcute.id]: stemiAcute,
  [electiveTHR.id]: electiveTHR,
  [outpatientDiabetes.id]: outpatientDiabetes,
  [diseaseXOutbreak.id]: diseaseXOutbreak,
  [paediatricFeverKKH.id]: paediatricFeverKKH,
  [breastCancerCrossCluster.id]: breastCancerCrossCluster,
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
