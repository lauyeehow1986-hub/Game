import { describe, it, expect } from 'vitest';
import { competency } from './competency';

describe('competency', () => {
  it('returns novice with very few cases', () => {
    expect(competency({ distinctCasesPlayed: 0, meanRatio: 0, distinctions: 0 }).tier).toBe('novice');
    expect(competency({ distinctCasesPlayed: 2, meanRatio: 1, distinctions: 1 }).tier).toBe('novice');
  });

  it('advanced-beginner when 3-7 cases or ratio < 0.6', () => {
    expect(competency({ distinctCasesPlayed: 5, meanRatio: 0.7, distinctions: 0 }).tier).toBe('advanced-beginner');
    expect(competency({ distinctCasesPlayed: 10, meanRatio: 0.4, distinctions: 0 }).tier).toBe('advanced-beginner');
  });

  it('competent at 8-13 cases with ≥ 0.6 ratio', () => {
    expect(competency({ distinctCasesPlayed: 10, meanRatio: 0.7, distinctions: 0 }).tier).toBe('competent');
  });

  it('proficient at 14+ cases with ≥ 0.75 ratio but few distinctions', () => {
    expect(competency({ distinctCasesPlayed: 16, meanRatio: 0.8, distinctions: 2 }).tier).toBe('proficient');
  });

  it('expert with ≥ 14 cases, ratio ≥ 0.85, distinctions ≥ 5', () => {
    expect(competency({ distinctCasesPlayed: 20, meanRatio: 0.9, distinctions: 8 }).tier).toBe('expert');
  });

  it('calibration bonus promotes a borderline proficient to expert', () => {
    const r = competency({ distinctCasesPlayed: 14, meanRatio: 0.82, distinctions: 3, wellCalibrated: 1 });
    expect(r.tier).toBe('expert');
    expect(r.reason).toBe('competency.reason.calibrationBonus');
  });

  it('nextTier is null for expert', () => {
    expect(competency({ distinctCasesPlayed: 20, meanRatio: 0.95, distinctions: 9 }).nextTier).toBeNull();
  });
});
