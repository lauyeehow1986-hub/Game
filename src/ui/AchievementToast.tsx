import { useEffect } from 'react';
import { useAchievements } from '../state/achievementsStore';
import { getAchievement, type AchievementId } from '../lib/achievements';
import { useT } from '../lib/i18n';

const VISIBLE_MS = 4500;

export function AchievementToast() {
  const t = useT();
  const queue = useAchievements((s) => s.toastQueue);
  const dismiss = useAchievements((s) => s.dismissToast);

  useEffect(() => {
    if (queue.length === 0) return;
    const id = queue[0];
    const handle = window.setTimeout(() => dismiss(id), VISIBLE_MS);
    return () => window.clearTimeout(handle);
  }, [queue, dismiss]);

  if (queue.length === 0) return null;
  const id = queue[0];
  const def = getAchievement(id);
  if (!def) return null;
  const title = t(`ach.title.${id}`) || def.title;
  const description = t(`ach.desc.${id}`) || def.description;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-4 right-4 z-[80] max-w-xs animate-[fadeIn_0.25s_ease-out]"
    >
      <button
        onClick={() => dismiss(id)}
        className="block w-full text-left rounded-lg border border-amber-400/60 bg-clinical-panel/95 shadow-xl backdrop-blur p-3 hover:bg-clinical-panel"
      >
        <div className="flex items-start gap-2">
          <div
            className="shrink-0 w-9 h-9 rounded grid place-items-center bg-amber-500/20 text-amber-300 font-bold"
            aria-hidden="true"
          >
            <Badge id={id} />
          </div>
          <div className="min-w-0">
            <div className="text-[9px] uppercase tracking-wider text-amber-300 font-semibold">
              {t('ach.unlocked')}
            </div>
            <div className="text-sm text-white font-semibold truncate">{title}</div>
            <div className="text-[11px] text-clinical-subtle leading-snug">
              {description}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

const GLYPHS: Record<AchievementId, string> = {
  'first-case': '1',
  'distinction': 'A',
  'triple-distinction': '3',
  'curriculum-graduate': 'G',
  'streak-master': 'S',
  'daily-streak-3': '3',
  'daily-streak-7': '7',
  'daily-streak-30': '30',
  'shift-complete': '✓',
  'shift-passed': '★',
  'tycoon': '$',
  'tycoon-profit': '+',
  'polyglot': 'L',
  'open-mind': '?',
  'educator': 'E',
  'author': 'P',
  'completionist': '*',
  'walk-stemi': '🫀',
  'walk-stroke': '🧠',
  'walk-sepsis': '🦠',
  'walk-multi-pathway': '🏆',
};

function Badge({ id }: { id: AchievementId }) {
  return <span className="text-base leading-none">{GLYPHS[id]}</span>;
}
