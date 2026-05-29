import { describe, it, expect } from 'vitest';
import { buildHeatmap } from './streak-heatmap';

describe('buildHeatmap', () => {
  it('returns the requested number of weeks × 7 days', () => {
    const grid = buildHeatmap([], 12, new Date(2026, 4, 29));
    expect(grid).toHaveLength(12);
    for (const col of grid) expect(col).toHaveLength(7);
  });

  it('marks active days that are in the days set', () => {
    const today = new Date(2026, 4, 29);
    const grid = buildHeatmap(['2026-05-28', '2026-05-29'], 4, today);
    const flat = grid.flat();
    expect(flat.find((c) => c.date === '2026-05-29')?.active).toBe(true);
    expect(flat.find((c) => c.date === '2026-05-28')?.active).toBe(true);
    expect(flat.find((c) => c.date === '2026-05-27')?.active).toBe(false);
  });

  it('marks future days as out of the rolling window', () => {
    const today = new Date(2026, 4, 29);
    const grid = buildHeatmap([], 2, today);
    const flat = grid.flat();
    const future = flat.filter((c) => c.date > '2026-05-29');
    expect(future.every((c) => !c.inWindow)).toBe(true);
  });

  it('keeps past days within the rolling window', () => {
    const today = new Date(2026, 4, 29);
    const grid = buildHeatmap([], 4, today);
    const flat = grid.flat();
    const past = flat.filter((c) => c.date < '2026-05-29');
    expect(past.every((c) => c.inWindow)).toBe(true);
  });

  it('the most recent column contains today', () => {
    const today = new Date(2026, 4, 29);
    const grid = buildHeatmap([], 3, today);
    const lastCol = grid[grid.length - 1];
    const todays = lastCol.find((c) => c.date === '2026-05-29');
    expect(todays).toBeDefined();
  });
});
