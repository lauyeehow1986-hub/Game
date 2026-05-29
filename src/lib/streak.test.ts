import { describe, it, expect } from 'vitest';
import { currentStreak, bestStreak, recordDay, localDateKey } from './streak';

describe('streak math', () => {
  it('localDateKey returns YYYY-MM-DD shape', () => {
    expect(localDateKey(new Date(2026, 4, 29))).toBe('2026-05-29');
  });

  it('empty history gives zero streaks', () => {
    expect(currentStreak([], '2026-05-29')).toBe(0);
    expect(bestStreak([])).toBe(0);
  });

  it('single day today is a streak of 1', () => {
    expect(currentStreak(['2026-05-29'], '2026-05-29')).toBe(1);
  });

  it('consecutive ending today counts up', () => {
    const days = ['2026-05-27', '2026-05-28', '2026-05-29'];
    expect(currentStreak(days, '2026-05-29')).toBe(3);
    expect(bestStreak(days)).toBe(3);
  });

  it('grace day — yesterday with no entry today still counts', () => {
    const days = ['2026-05-27', '2026-05-28'];
    expect(currentStreak(days, '2026-05-29')).toBe(2);
  });

  it('two days missed breaks current streak but preserves best', () => {
    const days = ['2026-05-20', '2026-05-21', '2026-05-22'];
    expect(currentStreak(days, '2026-05-29')).toBe(0);
    expect(bestStreak(days)).toBe(3);
  });

  it('best streak finds the longest run anywhere', () => {
    const days = [
      '2026-05-01',
      '2026-05-10', '2026-05-11', '2026-05-12', '2026-05-13',
      '2026-05-20', '2026-05-21',
    ];
    expect(bestStreak(days)).toBe(4);
  });

  it('recordDay is idempotent and sorted', () => {
    const next = recordDay(['2026-05-29'], '2026-05-29');
    expect(next).toEqual(['2026-05-29']);
    const extended = recordDay(next, '2026-05-30');
    expect(extended).toEqual(['2026-05-29', '2026-05-30']);
  });

  it('handles month/year rollovers', () => {
    expect(currentStreak(['2025-12-31', '2026-01-01'], '2026-01-01')).toBe(2);
  });
});
