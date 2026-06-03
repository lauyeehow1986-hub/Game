/**
 * Streak freeze tokens — pure.
 *
 * A freeze "shields" a missed day so a single-day lapse doesn't break the
 * streak. The shield is applied lazily and idempotently from data we already
 * persist: `days` (recorded YYYY-MM-DD strings) + `available` (token count).
 *
 * The shielded-streak length is computed by walking back from today and
 * tolerating up to `available` non-recorded days. We never mutate the day
 * array; the store decides separately when to debit a token.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

function addDays(key: string, delta: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  return dt.toLocaleDateString('en-CA');
}

export interface ShieldedStreak {
  value: number;
  /** How many freezes the shield consumed to bridge gaps. */
  consumed: number;
}

/**
 * Length of the streak ending on `today` after applying up to `available`
 * single-day freezes. Multi-day gaps still break the streak past the
 * available budget.
 */
export function shieldStreak(
  days: readonly string[],
  today: string,
  available: number,
): ShieldedStreak {
  if (days.length === 0) return { value: 0, consumed: 0 };
  const set = new Set(days);
  const earliest = [...set].sort()[0];
  let cursor = today;
  let consumed = 0;
  // Allow the walk to start at today, yesterday, or any freeze-shielded gap
  // before that. If we can't reach a recorded day within the freeze budget,
  // the streak is 0.
  while (!set.has(cursor)) {
    if (consumed >= available || cursor < earliest) return { value: 0, consumed: 0 };
    consumed += 1;
    cursor = addDays(cursor, -1);
  }
  let n = 0;
  while (cursor >= earliest) {
    if (set.has(cursor)) {
      n += 1;
      cursor = addDays(cursor, -1);
      continue;
    }
    if (consumed < available) {
      consumed += 1;
      cursor = addDays(cursor, -1);
      continue;
    }
    break;
  }
  return { value: n, consumed };
}

/** YYYY-MM-DD for the local-Monday week containing `now`. */
export function weekKey(now: number = Date.now()): string {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  const day = (d.getDay() + 6) % 7;
  const monday = new Date(d.getTime() - day * DAY_MS);
  return monday.toLocaleDateString('en-CA');
}
