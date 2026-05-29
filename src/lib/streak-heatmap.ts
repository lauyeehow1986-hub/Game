/**
 * Pure builder for a streak heatmap grid.
 *
 * Returns an array of week-columns, each week being 7 day-cells (Mon→Sun) so
 * the grid is rectangular for CSS-grid rendering. Newest week is last in the
 * returned array; days strictly in the future or before the rolling window
 * are marked `inWindow: false` so the renderer can grey them out.
 */

export interface HeatmapCell {
  date: string; // YYYY-MM-DD
  active: boolean;
  inWindow: boolean;
}

export type HeatmapGrid = HeatmapCell[][];

function dateKey(d: Date): string {
  return d.toLocaleDateString('en-CA');
}

/**
 * Build a grid of `weeks` weeks (default 12) ending on `today`. Day 0 of each
 * week is Monday (ISO). Cells outside the rolling window (future) are marked
 * inWindow=false but still rendered for grid alignment.
 */
export function buildHeatmap(
  days: readonly string[],
  weeks: number = 12,
  today: Date = new Date(),
): HeatmapGrid {
  const active = new Set(days);
  const todayKey = dateKey(today);

  // Align "end" to the Sunday at-or-after today, so the last column is the
  // current week.
  const end = new Date(today);
  const dow = (end.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
  end.setDate(end.getDate() + (6 - dow));
  end.setHours(0, 0, 0, 0);

  const grid: HeatmapGrid = [];
  for (let w = weeks - 1; w >= 0; w -= 1) {
    const col: HeatmapCell[] = [];
    for (let d = 0; d < 7; d += 1) {
      const cell = new Date(end);
      cell.setDate(end.getDate() - (w * 7) - (6 - d));
      const key = dateKey(cell);
      col.push({
        date: key,
        active: active.has(key),
        inWindow: key <= todayKey,
      });
    }
    grid.push(col);
  }
  return grid;
}
