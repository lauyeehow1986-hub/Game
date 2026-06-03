import { useEffect, useState, lazy, Suspense } from 'react';
import { useGame } from '../state/gameStore';
import { usePerspective } from '../state/perspectiveStore';
import { useMode, type AppMode } from '../state/modeStore';
import { usePacing } from '../state/pacingStore';
import type { Perspective } from '../lib/types';
import { isMuted, setMuted } from '../lib/audio';
import { LOCALES, useLocale, useT, type Locale } from '../lib/i18n';
import { OfflineIndicator } from './OfflineIndicator';
import { useAchievements } from '../state/achievementsStore';
import { useStreak, currentStreakValue, bestStreakValue } from '../state/streakStore';
import { useCampaign } from '../state/campaignStore';
import { getCampaign, campaignProgress } from '../lib/campaigns';
import { useProgress } from '../state/progressStore';
import { computeStability, type StabilityBand } from '../lib/patient-state';

const AboutModal = lazy(() =>
  import('./modals/AboutModal').then((m) => ({ default: m.AboutModal })),
);
const SettingsModal = lazy(() =>
  import('./modals/SettingsModal').then((m) => ({ default: m.SettingsModal })),
);

const labels: Record<Perspective, { tag: string; colour: string }> = {
  patient: { tag: 'POV', colour: 'bg-rose-500/80' },
  caregiver: { tag: 'POV', colour: 'bg-amber-500/80' },
  staff: { tag: 'POV', colour: 'bg-sky-500/80' },
};

function formatGameTime(min: number, dayPrefix: string): string {
  const h = Math.floor(min / 60);
  const d = Math.floor(h / 24);
  const hr = h % 24;
  const mm = min % 60;
  if (d > 0) return `${dayPrefix} ${d + 1} · ${String(hr).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  return `${String(hr).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export function HUD() {
  const t = useT();
  const current = usePerspective((s) => s.current);
  const setPerspective = usePerspective((s) => s.set);
  const elapsed = useGame((s) => s.run.elapsedGameMin);
  const status = useGame((s) => s.run.status);
  const cost = useGame((s) => s.run.totalCostSGD);
  const caseDef = useGame((s) => s.caseDef);
  const flags = useGame((s) => s.run.flags);
  const log = useGame((s) => s.run.log);
  const mode = useMode((s) => s.mode);
  const setMode = useMode((s) => s.setMode);
  const locale = useLocale((s) => s.locale);
  const setLocale = useLocale((s) => s.setLocale);
  const fireAchievement = useAchievements((s) => s.fire);
  const streakDays = useStreak((s) => s.days);
  const streakNow = currentStreakValue({ days: streakDays });
  const streakBest = bestStreakValue({ days: streakDays });
  const activeCampaignId = useCampaign((s) => s.activeId);
  const bestScores = useProgress((s) => s.bestScores);
  const activeCampaign = activeCampaignId ? getCampaign(activeCampaignId) : null;
  const cp = activeCampaign ? campaignProgress(activeCampaign, bestScores) : null;
  const realtime = usePacing((s) => s.realtime);
  const setRealtime = usePacing((s) => s.setRealtime);
  const [muted, setMutedState] = useState(true);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const timer = caseDef?.acuteTimer;
  const exceeded = timer && elapsed > timer.goalMin;
  const flagAlreadySet = timer && flags.includes(timer.missedFlag);

  // Derived clinical-stability index from the decisions made so far.
  const showVitals = mode === 'case' && caseDef && (status === 'running' || status === 'awaiting-decision') && log.length > 0;
  const stability = computeStability(log, {
    acuteTimerMissed: !!(timer && flags.includes(timer.missedFlag)),
  });
  const vitalsColour: Record<StabilityBand, string> = {
    stable: 'text-clinical-ok border-clinical-ok/50',
    guarded: 'text-clinical-warn border-clinical-warn/50',
    critical: 'text-clinical-danger border-clinical-danger/60',
  };

  useEffect(() => {
    setMutedState(isMuted());
  }, []);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  };

  const replayTutorial = () => {
    localStorage.removeItem('sg-pathway-tutorial-seen-v1');
    localStorage.removeItem('sg-pathway-tutorial-seen-v2');
    localStorage.removeItem('sg-pathway-tutorial-seen-v3');
    localStorage.removeItem('sg-pathway-tutorial-seen-v4');
    localStorage.removeItem('sg-pathway-tutorial-seen-v5');
    localStorage.removeItem('sg-pathway-tutorial-seen-v6');
    location.reload();
  };

  const statusLabel =
    status === 'idle'
      ? t('hud.status.idle')
      : status === 'running'
      ? t('hud.status.running')
      : status === 'awaiting-decision'
      ? t('hud.status.awaiting')
      : t('hud.status.completed');

  return (
    <header className="flex flex-wrap items-center gap-2 sm:gap-4 bg-clinical-panel border-b border-clinical-border px-3 sm:px-5 py-2 sm:py-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded bg-sgRed grid place-items-center text-white font-bold">+</div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-white">{t('app.brand.short')}</div>
          <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
            {t('app.brand.subtitle')}
          </div>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-3 ml-4 text-xs">
        <span className="px-2 py-1 rounded bg-clinical-bg border border-clinical-border text-clinical-subtle">
          {t('hud.gameTime')}:{' '}
          <span className="text-white font-mono">{formatGameTime(elapsed, 'Day')}</span>
        </span>
        <span className="px-2 py-1 rounded bg-clinical-bg border border-clinical-border text-clinical-subtle">
          {t('hud.status')}:{' '}
          <span
            className={
              status === 'awaiting-decision'
                ? 'text-clinical-warn font-semibold'
                : status === 'completed'
                ? 'text-clinical-ok font-semibold'
                : status === 'running'
                ? 'text-clinical-accent'
                : 'text-clinical-subtle'
            }
          >
            {statusLabel}
          </span>
        </span>
        <span className="px-2 py-1 rounded bg-clinical-bg border border-clinical-border text-clinical-subtle">
          {t('hud.cashOop')}: <span className="text-white font-mono">S${cost.toFixed(0)}</span>
        </span>
        {showVitals && (
          <span
            className={`px-2 py-1 rounded bg-clinical-bg border font-mono ${vitalsColour[stability.band]}`}
            title={t(`hud.vitals.${stability.band}`)}
            aria-label={`${t('hud.vitals')}: ${stability.value}`}
          >
            {t('hud.vitals')}: {stability.value} · {t(`hud.vitals.${stability.band}`)}
          </span>
        )}
        {timer && (
          <button
            onClick={() => setRealtime(!realtime)}
            className={`px-2 py-1 rounded border font-mono cursor-pointer text-left ${
              exceeded
                ? 'bg-clinical-danger/20 border-clinical-danger text-clinical-danger'
                : elapsed > timer.goalMin * 0.7
                ? 'bg-clinical-warn/15 border-clinical-warn/50 text-clinical-warn'
                : 'bg-clinical-bg border-clinical-border text-clinical-ok'
            } ${realtime ? 'ring-1 ring-clinical-accent' : ''}`}
            title={`${timer.goalLabel} — ${
              realtime
                ? t('hud.timer.realtimeOn')
                : t('hud.timer.realtimeOff')
            }`}
            aria-pressed={realtime}
          >
            {timer.goalLabel}: {elapsed}/{timer.goalMin} min
            {realtime && ' ⏱'}
            {exceeded && !flagAlreadySet && ` — ${t('hud.timer.exceeded')}`}
          </button>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2 flex-wrap justify-end">
        <div data-tour="mode-toggle" className="flex items-center gap-1 bg-clinical-bg border border-clinical-border rounded-full p-1">
          {(['case', 'ops'] as AppMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={`px-3 py-1 min-h-[36px] sm:min-h-0 text-xs rounded-full transition ${
                mode === m
                  ? 'bg-clinical-accent text-white font-semibold'
                  : 'text-clinical-subtle hover:text-white'
              }`}
            >
              {m === 'case' ? t('hud.mode.case') : t('hud.mode.ops')}
            </button>
          ))}
        </div>
        {mode === 'case' && (
          <div data-tour="perspective" className="flex items-center gap-1 bg-clinical-bg border border-clinical-border rounded-full p-1">
            {(['patient', 'caregiver', 'staff'] as Perspective[]).map((p) => (
              <button
                key={p}
                onClick={() => setPerspective(p)}
                aria-pressed={current === p}
                className={`px-3 py-1 min-h-[36px] sm:min-h-0 text-xs rounded-full transition ${
                  current === p
                    ? `${labels[p].colour} text-white font-semibold`
                    : 'text-clinical-subtle hover:text-white'
                }`}
              >
                {t(`hud.perspective.${p}`)}
              </button>
            ))}
          </div>
        )}
        {cp && activeCampaign && (
          <span
            title={`${activeCampaign.title} — ${cp.completed}/${cp.total}`}
            aria-label={`${t('campaigns.heading')}: ${cp.completed}/${cp.total}`}
            className="inline-flex h-8 items-center gap-1 px-2 rounded border border-clinical-accent/40 bg-clinical-accent/10 text-[11px] font-medium text-clinical-accent"
          >
            <span aria-hidden="true">🩺</span>
            <span className="font-mono">{cp.completed}/{cp.total}</span>
          </span>
        )}
        {streakNow > 0 && (
          <span
            title={`${t('hud.streak.tooltip')} (${t('hud.streak.best')}: ${streakBest})`}
            aria-label={`${t('hud.streak')}: ${streakNow}`}
            className="inline-flex h-8 items-center gap-1 px-2 rounded border border-clinical-border bg-clinical-bg text-[11px] font-medium text-clinical-warn"
          >
            <span aria-hidden="true">🔥</span>
            <span className="font-mono">{streakNow}</span>
            <span className="text-clinical-subtle">d</span>
          </span>
        )}
        <OfflineIndicator />
        <select
          data-tour="lang"
          value={locale}
          onChange={(e) => {
            const next = e.target.value as Locale;
            setLocale(next);
            fireAchievement({ kind: 'locale-changed', locale: next });
          }}
          aria-label={t('hud.language')}
          title={t('hud.language')}
          className="h-8 px-2 rounded border border-clinical-border bg-clinical-bg text-clinical-subtle text-[11px]"
        >
          {LOCALES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.nativeName}
            </option>
          ))}
        </select>
        <button
          onClick={toggleMute}
          aria-label={muted ? t('hud.audio.off') : t('hud.audio.on')}
          title={muted ? t('hud.audio.off') : t('hud.audio.on')}
          className="hidden sm:inline-flex h-8 px-2 items-center justify-center rounded border border-clinical-border text-clinical-subtle hover:text-white text-[11px] font-medium"
        >
          {muted ? t('hud.audio.off') : t('hud.audio.on')}
        </button>
        <button
          onClick={replayTutorial}
          aria-label={t('hud.tutorial')}
          title={t('hud.tutorial')}
          className="hidden sm:inline-flex h-8 px-2 items-center justify-center rounded border border-clinical-border text-clinical-subtle hover:text-white text-[11px] font-medium"
        >
          {t('hud.tutorial')}
        </button>
        <button
          onClick={() => setSettingsOpen(true)}
          aria-label={t('settings.heading')}
          title={t('settings.heading')}
          className="hidden sm:inline-flex h-8 w-8 items-center justify-center rounded border border-clinical-border text-clinical-subtle hover:text-white text-[12px]"
        >
          ⚙
        </button>
        <button
          onClick={() => setAboutOpen(true)}
          aria-label={t('hud.about')}
          title={t('hud.about')}
          className="hidden sm:inline-flex h-8 px-2 items-center justify-center rounded border border-clinical-border text-clinical-subtle hover:text-white text-[11px] font-medium"
        >
          {t('hud.about')}
        </button>
        <button
          data-tour="kbd"
          onClick={() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }));
          }}
          aria-label={t('a11y.kbd.open')}
          title={t('a11y.kbd.open')}
          className="hidden sm:inline-flex h-8 w-8 items-center justify-center rounded border border-clinical-border text-clinical-subtle hover:text-white text-[12px] font-mono"
        >
          ?
        </button>
      </div>

      <Suspense fallback={null}>
        {aboutOpen && <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />}
        {settingsOpen && <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />}
      </Suspense>
    </header>
  );
}
