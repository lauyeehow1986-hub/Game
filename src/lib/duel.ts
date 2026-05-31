/**
 * Head-to-head duel — pure scoring.
 *
 * Two players alternate questions on a shared device (same seeded paper, so
 * both face the same N decisions). At the end, raw scores are clamped per
 * item (negatives -> 0) and compared. Pure: no UI, no state.
 */

export interface DuelPick {
  player: 0 | 1;
  score: number;
  max: number;
}

export interface DuelResult {
  p0: { earned: number; max: number; ratioPct: number };
  p1: { earned: number; max: number; ratioPct: number };
  winner: 0 | 1 | 'draw';
}

export function gradeDuel(picks: DuelPick[]): DuelResult {
  const totals = [
    { earned: 0, max: 0 },
    { earned: 0, max: 0 },
  ];
  for (const p of picks) {
    totals[p.player].earned += Math.max(0, p.score);
    totals[p.player].max += p.max;
  }
  const pct = (i: 0 | 1) => (totals[i].max > 0 ? (totals[i].earned / totals[i].max) * 100 : 0);
  const a = pct(0);
  const b = pct(1);
  let winner: DuelResult['winner'] = 'draw';
  if (a > b) winner = 0;
  else if (b > a) winner = 1;
  return {
    p0: { ...totals[0], ratioPct: Math.round(a) },
    p1: { ...totals[1], ratioPct: Math.round(b) },
    winner,
  };
}

/** Round-robin alternation: player 0 on even indices, player 1 on odd. */
export function whoIsUp(index: number): 0 | 1 {
  return (index % 2 === 0 ? 0 : 1);
}
