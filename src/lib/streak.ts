/**
 * Daily streak math — pure, side-effect free.
 *
 * A "day" is YYYY-MM-DD in the player's local timezone. The player extends their
 * streak by completing at least one case on a given day. Missing a day resets
 * the current streak (the best/longest streak is preserved).
 */

export function localDateKey(d: Date = new Date()): string {
  // YYYY-MM-DD in local timezone (en-CA gives ISO-like ordering).
  return d.toLocaleDateString('en-CA');
}

function addDays(key: string, delta: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  return localDateKey(dt);
}

/**
 * Returns the length of the streak that ends on `today` or the most recent day
 * present in `days`. If neither today nor yesterday is in the set, the current
 * streak is 0.
 */
export function currentStreak(days: readonly string[], today: string = localDateKey()): number {
  if (days.length === 0) return 0;
  const set = new Set(days);
  let cursor = today;
  if (!set.has(cursor)) {
    const yesterday = addDays(today, -1);
    if (!set.has(yesterday)) return 0;
    cursor = yesterday;
  }
  let n = 0;
  while (set.has(cursor)) {
    n += 1;
    cursor = addDays(cursor, -1);
  }
  return n;
}

/**
 * Longest run of consecutive days anywhere in the set.
 */
export function bestStreak(days: readonly string[]): number {
  if (days.length === 0) return 0;
  const sorted = [...new Set(days)].sort();
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i] === addDays(sorted[i - 1], 1)) {
      run += 1;
      if (run > best) best = run;
    } else {
      run = 1;
    }
  }
  return best;
}

/**
 * Adds `today` (deduped) and returns a new sorted array of date keys.
 */
export function recordDay(days: readonly string[], today: string = localDateKey()): string[] {
  const set = new Set(days);
  set.add(today);
  return [...set].sort();
}
