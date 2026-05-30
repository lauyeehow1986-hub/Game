import { describe, it, expect } from 'vitest';
import {
  computeSegment,
  totalsFor,
  DEFAULT_PROFILES,
  type PatientProfile,
} from './financing';

const baseTaxiDriver: PatientProfile = {
  ...DEFAULT_PROFILES.taxiDriver,
};

describe('computeSegment — subsidised tier', () => {
  it('applies higher subsidy for Class C than Class A', () => {
    // Use a large gross so MediShield+MediSave can't zero out the bill in
    // both cases — keeps the cash comparison meaningful. (Raised after the
    // MSHL 2025 tiered-co-insurance reform lowered patient share on big bills.)
    const c = computeSegment({ ...baseTaxiDriver, wardClass: 'C' }, {
      charge: 'inpatient-procedure',
      grossSGD: 100000,
    });
    const a = computeSegment({ ...baseTaxiDriver, wardClass: 'A' }, {
      charge: 'inpatient-procedure',
      grossSGD: 100000,
    });
    expect(c.subsidyPct).toBeGreaterThan(a.subsidyPct);
    expect(c.subsidisedSGD).toBeLessThan(a.subsidisedSGD);
    expect(c.cashSGD).toBeLessThan(a.cashSGD);
  });

  it('Pioneer Generation flag adds an inpatient subsidy boost', () => {
    const noPg = computeSegment(
      { ...baseTaxiDriver, wardClass: 'C', chasTier: 'none' },
      { charge: 'inpatient-ward', grossSGD: 1000 },
    );
    const pg = computeSegment(
      { ...baseTaxiDriver, wardClass: 'C', chasTier: 'pg' },
      { charge: 'inpatient-ward', grossSGD: 1000 },
    );
    expect(pg.subsidyPct).toBeGreaterThan(noPg.subsidyPct);
  });

  it('foreigner gets zero government subsidy on subsidised tier', () => {
    const seg = computeSegment(
      { ...baseTaxiDriver, citizenship: 'foreigner', wardClass: 'C' },
      { charge: 'inpatient-ward', grossSGD: 1000 },
    );
    expect(seg.subsidyPct).toBe(0);
    expect(seg.mediShieldSGD).toBe(0);
  });

  it('MediShield Life claim only applies to inpatient categories', () => {
    const ip = computeSegment(baseTaxiDriver, {
      charge: 'inpatient-ward',
      grossSGD: 5000,
    });
    const op = computeSegment(baseTaxiDriver, {
      charge: 'soc',
      grossSGD: 5000,
    });
    expect(ip.mediShieldSGD).toBeGreaterThan(0);
    expect(op.mediShieldSGD).toBe(0);
  });

  it('MSHL 2025 tiered co-insurance: bigger bills get a higher claimable fraction', () => {
    // A large inpatient bill should be reimbursed at a higher fraction of
    // its claimable amount than a small one (co-insurance steps 10%->3%).
    const small = computeSegment(
      { ...baseTaxiDriver, wardClass: 'A' },
      { charge: 'inpatient-procedure', grossSGD: 8000 },
    );
    const large = computeSegment(
      { ...baseTaxiDriver, wardClass: 'A' },
      { charge: 'inpatient-procedure', grossSGD: 120000 },
    );
    const smallFrac = small.mediShieldSGD / small.subsidisedSGD;
    const largeFrac = large.mediShieldSGD / large.subsidisedSGD;
    expect(largeFrac).toBeGreaterThan(smallFrac);
  });
});

describe('computeSegment — private tier', () => {
  it('zero government subsidy regardless of citizenship + ward class', () => {
    const seg = computeSegment(
      { ...baseTaxiDriver, wardClass: 'C', citizenship: 'citizen' },
      { charge: 'inpatient-ward', grossSGD: 5000, tier: 'private' },
    );
    expect(seg.subsidyPct).toBe(0);
    expect(seg.subsidisedSGD).toBe(5000);
  });

  it('IP rider top-up reduces cash to near zero on private inpatient', () => {
    const noIp = computeSegment(
      { ...baseTaxiDriver, hasIntegratedShield: false },
      { charge: 'inpatient-ward', grossSGD: 5000, tier: 'private' },
    );
    const ip = computeSegment(
      { ...baseTaxiDriver, hasIntegratedShield: true },
      { charge: 'inpatient-ward', grossSGD: 5000, tier: 'private' },
    );
    expect(ip.cashSGD).toBeLessThan(noIp.cashSGD);
  });
});

describe('totalsFor', () => {
  it('sums every layer of the cascade across segments', () => {
    const segs = [
      computeSegment(baseTaxiDriver, { charge: 'a&e', grossSGD: 200 }),
      computeSegment(baseTaxiDriver, { charge: 'inpatient-ward', grossSGD: 1500 }),
    ];
    const t = totalsFor(segs);
    expect(t.gross).toBeCloseTo(1700, 5);
    // subsidy + mshl + medisave + cash should equal gross approximately.
    expect(t.subsidy + t.mediShield + t.mediSave + t.cash).toBeCloseTo(t.gross, 1);
  });

  it('empty segment list returns zeros', () => {
    expect(totalsFor([])).toEqual({ gross: 0, subsidy: 0, mediShield: 0, mediSave: 0, cash: 0 });
  });
});
