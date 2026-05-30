import { listCases } from '../content';
import { useProgress } from '../state/progressStore';
import { useGame } from '../state/gameStore';
import { useStreak } from '../state/streakStore';
import { currentStreak, localDateKey } from '../lib/streak';
import { pickDailyCaseId } from '../lib/daily-pick';
import { useT } from '../lib/i18n';

/**
 * Shown only when the player's streak is at risk: yesterday was active,
 * today is not yet active, and they have a streak ≥ 2 days. Clicking opens
 * Today's Challenge — a one-tap streak defence.
 */
export function StreakDefenseBanner() {
  const t = useT();
  const days = useStreak((s) => s.days);
  const unlocked = useProgress((s) => s.unlockedCaseIds);
  const startCase = useGame((s) => s.startCase);
  const resetRun = useGame((s) => s.resetRun);
  const status = useGame((s) => s.run.status);

  // localDateKey() is cheap — recomputing it each render is fine and saves
  // a useMemo whose dep (today) would change every render anyway.
  const today = localDateKey();
  const cur = currentStreak(days, today);
  const playedToday = days.includes(today);

  if (playedToday || cur < 2) return null;

  const handleDefend = () => {
    const playable = listCases().filter((c) => unlocked.includes(c.id));
    const id = pickDailyCaseId(playable.map((c) => c.id), today);
    const c = playable.find((x) => x.id === id);
    if (!c) return;
    if (status !== 'idle') resetRun();
    startCase(c);
  };

  return (
    <div
      role="status"
      className="px-3 py-2 bg-amber-500/10 border-b border-amber-500/30 text-[12px] flex items-center justify-between gap-3"
    >
      <span className="text-amber-200">
        🔥 {t('streak.defense.body', { days: cur })}
      </span>
      <button
        onClick={handleDefend}
        className="shrink-0 px-3 py-1 rounded bg-amber-500 text-clinical-bg font-semibold text-[11px] hover:brightness-110"
      >
        {t('streak.defense.cta')}
      </button>
    </div>
  );
}
