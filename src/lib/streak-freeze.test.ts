import { describe, expect, it } from 'vitest';
import { shieldStreak, weekKey } from './streak-freeze';

describe('streak-freeze', () => {
  it('returns 0 when there are no recorded days', () => {
    expect(shieldStreak([], '2026-06-03', 5)).toEqual({ value: 0, consumed: 0 });
  });

  it('matches the unshielded streak when no gaps exist', () => {
    const days = ['2026-06-01', '2026-06-02', '2026-06-03'];
    expect(shieldStreak(days, '2026-06-03', 0)).toEqual({ value: 3, consumed: 0 });
  });

  it('bridges a one-day gap with one freeze', () => {
    const days = ['2026-06-01', '2026-06-02']; // missed 03
    const r = shieldStreak(days, '2026-06-03', 1);
    expect(r.value).toBe(2);
    expect(r.consumed).toBe(1);
  });

  it('breaks when the gap exceeds the freeze budget', () => {
    const days = ['2026-06-01']; // missed 02 and 03
    const r = shieldStreak(days, '2026-06-03', 1);
    expect(r.value).toBe(0);
  });

  it('chains across multiple internal gaps within budget', () => {
    const days = ['2026-06-01', '2026-06-03']; // missed 02
    const r = shieldStreak(days, '2026-06-03', 1);
    expect(r.value).toBe(2);
    expect(r.consumed).toBe(1);
  });

  it('does not consume more freezes than required', () => {
    const days = ['2026-06-01', '2026-06-02', '2026-06-03'];
    expect(shieldStreak(days, '2026-06-03', 5).consumed).toBe(0);
  });

  it('weekKey returns the local-Monday key for the containing week', () => {
    // 2026-06-03 is a Wednesday; the containing-week Monday is 2026-06-01.
    const wed = new Date(2026, 5, 3, 12).getTime();
    expect(weekKey(wed)).toBe('2026-06-01');
  });

  it('weekKey rolls a Sunday back to the previous Monday', () => {
    const sun = new Date(2026, 5, 7, 12).getTime();
    expect(weekKey(sun)).toBe('2026-06-01');
  });
});
