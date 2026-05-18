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

import { NUH } from './facilities/nuhs/nuh';
import { NTFGH } from './facilities/nuhs/ntfgh';
import { AH } from './facilities/nuhs/ah';
import { NCIS } from './facilities/nuhs/ncis';
import { NUHCS } from './facilities/nuhs/nuhcs';
import { NUCOHS } from './facilities/nuhs/nucohs';
import { JCH } from './facilities/nuhs/jch';
import { NUP_ALL } from './facilities/nuhs/nup';

import { SLH } from './facilities/vwo/slh';
import { RenCi } from './facilities/vwo/renci';
import { AMKH } from './facilities/vwo/amkh';
import { SACH } from './facilities/vwo/sach';

import { SCDF } from './facilities/ancillary/scdf';
import { HSA } from './facilities/ancillary/hsa';
import { NKF, KDF, FRESENIUS } from './facilities/ancillary/dialysis';
import { HCA, DOVER_PARK, ASSISI } from './facilities/ancillary/hospices';
import { NURSING_HOME, HOME, RETAIL_PHARMACY } from './facilities/ancillary/community';

import { GP_CHAINS } from './facilities/primary-care/gp-chains';
import { TELEMED_ALL } from './facilities/primary-care/telemed';
import { HPB_SCHOOL, WORKPLACE_HEALTH } from './facilities/primary-care/school-occ';

import { PRIVATE_ACUTE_ALL } from './facilities/private/hospitals';
import { PRIVATE_SPECIALIST_ALL } from './facilities/private/specialists';

import { stemiAcute } from './cases/stemi-acute';
import { electiveTHR } from './cases/elective-thr';
import { outpatientDiabetes } from './cases/outpatient-diabetes';
import { diseaseXOutbreak } from './cases/disease-x-outbreak';
import { paediatricFeverKKH } from './cases/paediatric-fever-kkh';
import { breastCancerCrossCluster } from './cases/breast-cancer-crosscluster';
import { strokeThrombectomy } from './cases/stroke-thrombectomy';
import { palliativeEndOfLife } from './cases/palliative-end-of-life';
import { urtiChasGP } from './cases/urti-chas-gp';
import { privateCataract } from './cases/private-cataract';
import { privateToPublicHandover } from './cases/private-to-public-handover';
import { sepsisCase } from './cases/sepsis-bundle';
import { majorTraumaCase } from './cases/major-trauma';
import { ckdDialysisCase } from './cases/ckd-dialysis';
import { imhFirstEpisodeCase } from './cases/imh-first-psychosis';
import { obstetricDeliveryCase } from './cases/obstetric-delivery';
import { geriatricFallsCase } from './cases/geriatric-falls';
import { heartFailureCase } from './cases/heart-failure-clinic';
import { sars2003Case } from './cases/sars-2003-historical';
import { covid19Case } from './cases/covid19-historical';
import { migrantWorkerInjuryCase } from './cases/migrant-worker-injury';
import { ipvDisclosureCase } from './cases/ipv-kkh-one-centre';
import type { CaseDefinition, Facility } from '../lib/types';

const allFacilities: Facility[] = [
  // NHG
  TTSH, KTPH, WH, NCID, IMH, NSC, NNI_TTSH, YCH, AdMC, ...NHGP_ALL,
  // SingHealth
  SGH, CGH, SKH, KKH, NHCS, NCCS, NDCS, NNI_SGH, SNEC, OCH, SKCH, BVH, ...SHP_ALL,
  // NUHS
  NUH, NTFGH, AH, NCIS, NUHCS, NUCOHS, JCH, ...NUP_ALL,
  // VWO partner hospitals
  SLH, RenCi, AMKH, SACH,
  // Ancillary / pre-hospital / community
  SCDF, HSA,
  NKF, KDF, FRESENIUS,
  HCA, DOVER_PARK, ASSISI,
  NURSING_HOME, HOME, RETAIL_PHARMACY,
  // Private primary care + telemed + occupational
  ...GP_CHAINS,
  ...TELEMED_ALL,
  HPB_SCHOOL, WORKPLACE_HEALTH,
  // Private hospitals + specialists
  ...PRIVATE_ACUTE_ALL,
  ...PRIVATE_SPECIALIST_ALL,
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
  [strokeThrombectomy.id]: strokeThrombectomy,
  [palliativeEndOfLife.id]: palliativeEndOfLife,
  [urtiChasGP.id]: urtiChasGP,
  [privateCataract.id]: privateCataract,
  [privateToPublicHandover.id]: privateToPublicHandover,
  [sepsisCase.id]: sepsisCase,
  [majorTraumaCase.id]: majorTraumaCase,
  [ckdDialysisCase.id]: ckdDialysisCase,
  [imhFirstEpisodeCase.id]: imhFirstEpisodeCase,
  [obstetricDeliveryCase.id]: obstetricDeliveryCase,
  [geriatricFallsCase.id]: geriatricFallsCase,
  [heartFailureCase.id]: heartFailureCase,
  [sars2003Case.id]: sars2003Case,
  [covid19Case.id]: covid19Case,
  [migrantWorkerInjuryCase.id]: migrantWorkerInjuryCase,
  [ipvDisclosureCase.id]: ipvDisclosureCase,
};

export function getFacility(id: string): Facility | undefined {
  return facilities[id];
}

export function getCase(id: string): CaseDefinition | undefined {
  if (cases[id]) return cases[id];
  // Fallthrough to custom cases imported by the player.
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('sg-pathway-custom-cases-v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        const custom = parsed?.state?.cases?.[id];
        if (custom) return custom as CaseDefinition;
      }
    } catch {
      /* ignore */
    }
  }
  return undefined;
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
