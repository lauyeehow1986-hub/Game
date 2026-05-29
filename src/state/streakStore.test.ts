import { describe, it, expect, beforeEach } from 'vitest';
import { useStreak, currentStreakValue, bestStreakValue } from './streakStore';
import { localDateKey } from '../lib/streak';

describe('streakStore', () => {
  beforeEach(() => {
    useStreak.setState({ days: [] });
  });

  it('starts empty', () => {
    expect(useStreak.getState().days).toEqual([]);
    expect(currentStreakValue()).toBe(0);
    expect(bestStreakValue()).toBe(0);
  });

  it('recordToday adds the local day once', () => {
    useStreak.getState().recordToday();
    useStreak.getState().recordToday();
    const days = useStreak.getState().days;
    expect(days).toEqual([localDateKey()]);
    expect(currentStreakValue()).toBe(1);
  });

  it('reset clears all days', () => {
    useStreak.getState().recordToday();
    useStreak.getState().reset();
    expect(useStreak.getState().days).toEqual([]);
  });

  it('selectors read directly from passed state', () => {
    const days = ['2026-05-20', '2026-05-21', '2026-05-22'];
    // No "today" alignment so current streak is 0 unless today happens to be 05-22 or 05-23.
    expect(bestStreakValue({ days })).toBe(3);
  });
});
