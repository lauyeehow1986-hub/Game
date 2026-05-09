import { describe, it, expect } from 'vitest';
import { profileForFacility, recordsFlowBetween } from './referral';
import type { Facility } from './types';

const fac = (overrides: Partial<Facility>): Facility => ({
  id: 'x',
  name: 'X',
  type: 'acute',
  sector: 'public',
  cluster: 'nhg',
  departments: [],
  ...overrides,
});

describe('profileForFacility', () => {
  it('public restructured hospital is full NEHR participant', () => {
    const p = profileForFacility(fac({ type: 'acute', sector: 'public' }));
    expect(p.contributesToNehr).toBe(true);
    expect(p.consumesFromNehr).toBe(true);
    expect(p.visibleOnHealthHub).toBe(true);
  });

  it('private acute hospital consumes but does not contribute', () => {
    const p = profileForFacility(fac({ type: 'private-acute', sector: 'private' }));
    expect(p.contributesToNehr).toBe(false);
    expect(p.consumesFromNehr).toBe(true);
  });

  it('GP clinic is siloed (default no NEHR participation)', () => {
    const p = profileForFacility(fac({ type: 'gp', sector: 'private' }));
    expect(p.contributesToNehr).toBe(false);
    expect(p.consumesFromNehr).toBe(false);
  });

  it('telemed is siloed', () => {
    const p = profileForFacility(fac({ type: 'telemed', sector: 'private' }));
    expect(p.contributesToNehr).toBe(false);
  });
});

describe('recordsFlowBetween', () => {
  it('public → public uses NEHR', () => {
    const a = fac({ type: 'acute', sector: 'public' });
    const b = fac({ type: 'specialty', sector: 'public', id: 'y', name: 'Y' });
    expect(recordsFlowBetween(a, b)).toBe('nehr');
  });

  it('private GP → public hospital flows by memo (GP doesn\'t contribute)', () => {
    const gp = fac({ type: 'gp', sector: 'private' });
    const sgh = fac({ type: 'acute', sector: 'public', id: 'sgh', name: 'SGH' });
    expect(recordsFlowBetween(gp, sgh)).toBe('memo');
  });

  it('private specialist → public hospital is hand-carry (CDs)', () => {
    const spec = fac({ type: 'private-specialist', sector: 'private' });
    const sgh = fac({ type: 'acute', sector: 'public', id: 'sgh', name: 'SGH' });
    expect(recordsFlowBetween(spec, sgh)).toBe('hand-carry');
  });

  it('public → VWO step-down uses NEHR', () => {
    const sgh = fac({ type: 'acute', sector: 'public' });
    const slh = fac({ type: 'vwo', sector: 'vwo', id: 'slh', name: 'St Luke' });
    expect(recordsFlowBetween(sgh, slh)).toBe('nehr');
  });
});
