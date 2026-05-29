/**
 * Deterministic "case of the day" picker — pure, no globals.
 *
 * Hashes the local-day key into the candidate list so every player on a given
 * day gets the same case. We only pick from the player's unlocked-and-playable
 * pool, so the choice is stable per-player-per-day but can vary across players
 * by what they've unlocked.
 */

function hash(str: string): number {
  // FNV-1a 32-bit. Stable, distribution-good-enough for this use.
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function pickDailyCaseId(
  candidateIds: readonly string[],
  dayKey: string,
): string | null {
  if (candidateIds.length === 0) return null;
  const sorted = [...candidateIds].sort();
  const idx = hash(dayKey) % sorted.length;
  return sorted[idx];
}
