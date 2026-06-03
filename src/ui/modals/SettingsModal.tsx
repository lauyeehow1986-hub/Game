import { useEffect, useRef, useState } from 'react';
import { useT, useLocale, LOCALES, type Locale } from '../../lib/i18n';
import { usePacing } from '../../state/pacingStore';
import { isMuted, setMuted } from '../../lib/audio';
import { useFocusTrap } from '../../lib/use-focus-trap';
import { collectBackup, applyBackup, backupFilename } from '../../lib/backup';
import { isNarrationEnabled, isSpeechSupported, setNarrationEnabled } from '../../lib/speech';
import { getContrast, setContrast } from '../../lib/contrast';

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * One place for every persisted preference: language, audio, motion-
 * reduction, real-time pacing + speed, and the nuclear reset button.
 * Each control reads + writes its own store so no plumbing is needed.
 */
export function SettingsModal({ open, onClose }: Props) {
  const t = useT();
  const cardRef = useFocusTrap<HTMLDivElement>(open);
  const locale = useLocale((s) => s.locale);
  const setLocale = useLocale((s) => s.setLocale);
  const realtime = usePacing((s) => s.realtime);
  const setRealtime = usePacing((s) => s.setRealtime);
  const sec = usePacing((s) => s.secondsPerGameMin);
  const setSec = usePacing((s) => s.setSpeed);
  const [audio, setAudioState] = useState(false);
  const [narration, setNarration] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [highContrast, setHighContrastState] = useState(false);
  const [backupMsg, setBackupMsg] = useState<string | null>(null);
  const backupMsgTimer = useRef<number | null>(null);

  // Single source of truth for clearing the backup toast — cancels any
  // outstanding timer and schedules a new one, so the late callback from a
  // previous toast doesn't reset a fresh one. Cleared on unmount.
  const flashBackupMsg = (msg: string) => {
    setBackupMsg(msg);
    if (backupMsgTimer.current !== null) window.clearTimeout(backupMsgTimer.current);
    backupMsgTimer.current = window.setTimeout(() => setBackupMsg(null), 3000);
  };

  useEffect(() => () => {
    if (backupMsgTimer.current !== null) window.clearTimeout(backupMsgTimer.current);
  }, []);

  const handleExport = () => {
    try {
      const env = collectBackup();
      const blob = new Blob([JSON.stringify(env, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backupFilename();
      a.click();
      URL.revokeObjectURL(url);
      flashBackupMsg(t('settings.backup.exported'));
    } catch {
      flashBackupMsg(t('settings.backup.exportFailed'));
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const res = applyBackup(text);
        if (res.ok) {
          alert(t('settings.backup.importedReload'));
          location.reload();
        } else {
          flashBackupMsg(t('settings.backup.importFailed'));
        }
      } catch {
        flashBackupMsg(t('settings.backup.importFailed'));
      }
    };
    input.click();
  };

  useEffect(() => {
    setAudioState(!isMuted());
    setNarration(isNarrationEnabled());
    setHighContrastState(getContrast() === 'high');
    if (typeof window !== 'undefined') {
      setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4"
    >
      <div
        ref={cardRef}
        className="bg-clinical-panel border border-clinical-border rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto scrollbar-thin shadow-2xl"
      >
        <header className="px-5 py-4 border-b border-clinical-border flex items-baseline justify-between">
          <h2 id="settings-title" className="text-base font-semibold text-white">
            {t('settings.heading')}
          </h2>
          <button
            onClick={onClose}
            className="text-[11px] text-clinical-subtle hover:text-white"
          >
            {t('common.close')}
          </button>
        </header>

        <div className="px-5 py-4 space-y-4 text-[12px]">
          {/* Language */}
          <Row label={t('hud.language')}>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              aria-label={t('hud.language')}
              className="bg-clinical-bg border border-clinical-border rounded px-2 py-1 text-white"
            >
              {LOCALES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.nativeName}
                </option>
              ))}
            </select>
          </Row>

          {/* Audio */}
          <Row label={t('settings.audio')} hint={t('settings.audio.hint')}>
            <Toggle
              checked={audio}
              label={t('settings.audio')}
              onChange={(v) => {
                setMuted(!v);
                setAudioState(v);
              }}
            />
          </Row>

          {/* Real-time pacing */}
          <Row label={t('settings.realtime')} hint={t('settings.realtime.hint')}>
            <Toggle checked={realtime} label={t('settings.realtime')} onChange={setRealtime} />
          </Row>

          {/* Voice narration */}
          {isSpeechSupported() && (
            <Row label={t('settings.narration')} hint={t('settings.narration.hint')}>
              <Toggle
                checked={narration}
                label={t('settings.narration')}
                onChange={(v) => {
                  setNarrationEnabled(v);
                  setNarration(v);
                }}
              />
            </Row>
          )}

          {realtime && (
            <Row label={t('settings.realtime.speed')} hint={t('settings.realtime.speedHint')}>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={sec}
                onChange={(e) => setSec(parseInt(e.target.value, 10))}
                className="accent-clinical-accent"
              />
              <span className="ml-2 font-mono text-clinical-subtle">{sec}s</span>
            </Row>
          )}

          {/* High-contrast theme */}
          <Row label={t('settings.contrast')} hint={t('settings.contrast.hint')}>
            <Toggle
              checked={highContrast}
              label={t('settings.contrast')}
              onChange={(v) => {
                setContrast(v ? 'high' : 'normal');
                setHighContrastState(v);
              }}
            />
          </Row>

          {/* Reduced motion (system) */}
          <Row label={t('settings.motion')} hint={t('settings.motion.hint')}>
            <span className="font-mono text-clinical-subtle">
              {reduced ? t('settings.motion.on') : t('settings.motion.off')}
            </span>
          </Row>

          {/* Backup / restore */}
          <section className="border border-clinical-border rounded p-3 bg-clinical-bg/30">
            <h3 className="text-sm font-semibold text-white mb-1">{t('settings.backup.h')}</h3>
            <p className="text-[11px] text-white/70 mb-2 leading-snug">{t('settings.backup.body')}</p>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="px-3 py-1.5 rounded border border-clinical-border text-clinical-subtle hover:text-white text-xs"
              >
                {t('settings.backup.export')}
              </button>
              <button
                onClick={handleImport}
                className="px-3 py-1.5 rounded border border-clinical-border text-clinical-subtle hover:text-white text-xs"
              >
                {t('settings.backup.import')}
              </button>
            </div>
            {backupMsg && (
              <div className="mt-2 text-[11px] text-clinical-accent">{backupMsg}</div>
            )}
          </section>

          {/* Reset everything */}
          <section className="border border-clinical-danger/30 rounded p-3 bg-clinical-danger/5 mt-2">
            <h3 className="text-sm font-semibold text-white mb-1">{t('about.reset.h')}</h3>
            <p className="text-[11px] text-white/80 mb-2 leading-snug">{t('about.reset.body')}</p>
            <button
              onClick={() => {
                if (!confirm(t('about.reset.confirm'))) return;
                try {
                  localStorage.clear();
                } catch {
                  /* ignore */
                }
                alert(t('about.reset.done'));
                location.reload();
              }}
              className="px-3 py-1.5 rounded border border-clinical-danger text-clinical-danger hover:bg-clinical-danger/10 text-xs"
            >
              {t('about.reset.button')}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-clinical-border/40 pb-3 last:border-b-0">
      <div className="flex-1 min-w-0">
        <div className="text-white text-[13px]">{label}</div>
        {hint && <div className="text-[10px] text-clinical-subtle mt-0.5 leading-snug">{hint}</div>}
      </div>
      <div className="shrink-0 flex items-center">{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`w-10 h-5 rounded-full p-0.5 transition ${
        checked ? 'bg-clinical-accent' : 'bg-clinical-bg border border-clinical-border'
      }`}
    >
      <span
        className={`block w-4 h-4 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}
