import { describe, it, expect } from 'vitest';
import { pickDailyCaseId } from './daily-pick';

describe('pickDailyCaseId', () => {
  it('returns null for an empty pool', () => {
    expect(pickDailyCaseId([], '2026-05-29')).toBeNull();
  });

  it('always returns the only candidate', () => {
    expect(pickDailyCaseId(['solo'], '2026-05-29')).toBe('solo');
    expect(pickDailyCaseId(['solo'], '2030-01-01')).toBe('solo');
  });

  it('is deterministic for the same input', () => {
    const pool = ['a', 'b', 'c', 'd', 'e'];
    const a = pickDailyCaseId(pool, '2026-05-29');
    const b = pickDailyCaseId(pool, '2026-05-29');
    expect(a).toBe(b);
  });

  it('is independent of input order (sorts internally)', () => {
    const forward = pickDailyCaseId(['a', 'b', 'c'], '2026-05-29');
    const reverse = pickDailyCaseId(['c', 'b', 'a'], '2026-05-29');
    expect(forward).toBe(reverse);
  });

  it('changes across days, statistically', () => {
    const pool = Array.from({ length: 20 }, (_, i) => `case-${i}`);
    const days = Array.from({ length: 60 }, (_, i) => {
      const d = new Date(2026, 0, 1 + i);
      return d.toLocaleDateString('en-CA');
    });
    const picks = new Set(days.map((d) => pickDailyCaseId(pool, d)));
    // At least 8 distinct picks in 60 days from a pool of 20 — sanity.
    expect(picks.size).toBeGreaterThanOrEqual(8);
  });
});
