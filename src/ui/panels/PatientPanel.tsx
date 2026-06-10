import { useGame } from '../../state/gameStore';
import { usePerspective } from '../../state/perspectiveStore';
import { getFacility } from '../../content';
import { useT, useTr, useLocale, tr as trAs } from '../../lib/i18n';
import { GlossaryText } from '../GlossaryText';
import {
  cancelSpeech,
  getVoiceSupport,
  isNarrationEnabled,
  isSpeechSupported,
  localeToBcp47,
  setNarrationEnabled,
  speak,
  subscribeVoicesChanged,
} from '../../lib/speech';
import { useEffect, useState } from 'react';
import type { WardClass } from '../../lib/financing';

export function PatientPanel() {
  const caseDef = useGame((s) => s.caseDef);
  const run = useGame((s) => s.run);
  const profile = useGame((s) => s.profile);
  const setWardClass = useGame((s) => s.setWardClass);
  const setIp = useGame((s) => s.setIntegratedShield);
  const perspective = usePerspective((s) => s.current);
  const tr = useTr();
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const [narration, setNarration] = useState(false);
  // Voice availability for the active locale — platform ms/ta voices are
  // frequently missing; re-checked when the async voice list lands.
  const [voiceSupport, setVoiceSupport] = useState(
    () => getVoiceSupport(localeToBcp47(locale)),
  );
  useEffect(() => {
    setNarration(isNarrationEnabled());
    return () => cancelSpeech();
  }, []);
  useEffect(() => {
    const refresh = () => setVoiceSupport(getVoiceSupport(localeToBcp47(locale)));
    refresh();
    return subscribeVoicesChanged(refresh);
  }, [locale]);
  // When the locale has no installed voice, narrate the English fallback
  // text rather than mangling ms/ta text through a wrong-language voice.
  const narrate = (value: Parameters<typeof trAs>[0]) => {
    if (voiceSupport === 'native') speak(trAs(value, locale), localeToBcp47(locale));
    else speak(trAs(value, 'en'), localeToBcp47('en'));
  };
  // Auto-narrate whenever the framing changes IF the user has opted in.
  useEffect(() => {
    if (!narration || !caseDef || !profile) return;
    const node = caseDef.pathway.find((n) => n.id === run.currentNodeId) ?? caseDef.pathway[0];
    const value = node.framing[perspective];
    if (voiceSupport === 'native') {
      const text = tr(value);
      if (text) speak(text, localeToBcp47(locale));
    } else {
      const text = trAs(value, 'en');
      if (text) speak(text, localeToBcp47('en'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [narration, run.currentNodeId, perspective, locale, caseDef, profile, tr, voiceSupport]);

  if (!caseDef || !profile) {
    return (
      <section className="bg-clinical-panel border border-clinical-border rounded-lg p-3 space-y-2">
        <h3 className="text-sm font-semibold text-white">{t('patient.heading')}</h3>
        <p className="text-xs text-clinical-subtle">{t('patient.empty')}</p>
      </section>
    );
  }

  const node = caseDef.pathway.find((n) => n.id === run.currentNodeId) ?? caseDef.pathway[0];
  const facility = getFacility(node.facility ?? caseDef.primaryFacility);
  const dept = facility?.departments.find((d) => d.id === node.department);
  const framing = tr(node.framing[perspective]);

  return (
    <section className="bg-clinical-panel border border-clinical-border rounded-lg p-3 space-y-2">
      <header>
        <h3 className="text-sm font-semibold text-white">{profile.name}</h3>
        {profile.notes && (
          <p className="text-[11px] text-clinical-subtle leading-snug">{profile.notes}</p>
        )}
      </header>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <Mini label="Citizenship" value={profile.citizenship.toUpperCase()} />
        <Mini label="CHAS" value={profile.chasTier === 'none' ? '—' : profile.chasTier.toUpperCase()} />
        <Mini label="Per-capita income" value={`S$${profile.perCapitaIncomeSGD}/mo`} />
        <Mini label="MediSave" value={`S$${profile.mediSaveBalanceSGD}`} />
      </div>

      <button
        onClick={() => setIp(!profile.hasIntegratedShield)}
        className={`w-full text-left px-2 py-1.5 rounded border text-[11px] transition ${
          profile.hasIntegratedShield
            ? 'border-clinical-accent bg-clinical-accent/15 text-white'
            : 'border-clinical-border text-clinical-subtle hover:text-white'
        }`}
      >
        <span className="block text-[9px] uppercase tracking-wider">Integrated Shield Plan</span>
        {profile.hasIntegratedShield ? 'Active — IP rider tops up to as-charged' : 'None — MediShield Life only'}
      </button>

      {caseDef.allowsWardChoice && (
        <div className="border-t border-clinical-border pt-2 space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
            Ward class
          </div>
          <div className="flex gap-1">
            {(['C', 'B2', 'B1', 'A'] as WardClass[]).map((w) => (
              <button
                key={w}
                onClick={() => setWardClass(w)}
                title={t(`ward.${w}`)}
                className={`flex-1 text-xs py-1 rounded border transition ${
                  profile.wardClass === w
                    ? 'bg-clinical-accent text-white border-clinical-accent font-semibold'
                    : 'border-clinical-border text-clinical-subtle hover:text-white'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
          <div className="text-[10px] text-clinical-subtle leading-snug">
            {t(`ward.${profile.wardClass}`)}
          </div>
        </div>
      )}

      <div className="border-t border-clinical-border pt-2 space-y-1">
        {facility && (
          <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
            {facility.name}
          </div>
        )}
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: dept?.colour ?? '#3aa6ff' }}
          />
          <span className="text-xs font-semibold text-white">{dept?.name ?? node.department}</span>
        </div>
        <p className="text-[11px] text-clinical-subtle leading-snug">{dept?.description}</p>
      </div>

      {framing && (
        <blockquote className="border-l-2 border-clinical-accent pl-3 text-xs text-white/90 italic leading-relaxed relative">
          <GlossaryText>{framing}</GlossaryText>
          {isSpeechSupported() && (
            <div className="flex gap-2 mt-1 not-italic items-center">
              <button
                onClick={() => narrate(node.framing[perspective])}
                aria-label={t('narration.speak')}
                title={voiceSupport === 'native' ? t('narration.speak') : t('narration.voiceFallback')}
                className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-clinical-border text-clinical-subtle hover:text-white"
              >
                {t('narration.speak')}
              </button>
              <button
                onClick={() => {
                  const next = !narration;
                  setNarrationEnabled(next);
                  setNarration(next);
                }}
                aria-pressed={narration}
                title={t('narration.auto')}
                className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                  narration
                    ? 'border-clinical-accent text-clinical-accent'
                    : 'border-clinical-border text-clinical-subtle hover:text-white'
                }`}
              >
                {t('narration.auto')}
              </button>
              {voiceSupport !== 'native' && locale !== 'en' && (
                <span
                  className="text-[9px] text-amber-400/90 leading-tight"
                  title={t('narration.voiceFallback')}
                >
                  {t('narration.voiceFallbackShort')}
                </span>
              )}
            </div>
          )}
        </blockquote>
      )}

      {(() => {
        const transit = run.journey
          .slice(0, -1)
          .map((id) => caseDef.pathway.find((n) => n.id === id))
          .filter((n): n is NonNullable<typeof n> => n != null);
        if (transit.length === 0) return null;
        return (
          <details className="border-t border-clinical-border pt-2 text-[11px]">
            <summary className="cursor-pointer text-clinical-subtle hover:text-white">
              Journey so far ({transit.length} {transit.length === 1 ? 'stop' : 'stops'})
            </summary>
            <ol className="mt-1 space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin pr-1">
              {transit.map((n, i) => {
                const f = getFacility(n.facility ?? caseDef.primaryFacility);
                const d = f?.departments.find((x) => x.id === n.department);
                const text = tr(n.framing[perspective]);
                if (!text) return null;
                return (
                  <li key={`${n.id}-${i}`} className="border-l-2 border-clinical-border pl-2">
                    <div className="text-[9px] uppercase tracking-wider text-clinical-subtle">
                      {f?.name ?? ''}{f && d ? ' · ' : ''}{d?.shortLabel ?? d?.name ?? n.department}
                    </div>
                    <div className="text-white/85 italic leading-snug">
                      <GlossaryText>{text}</GlossaryText>
                    </div>
                  </li>
                );
              })}
            </ol>
          </details>
        );
      })()}
    </section>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-clinical-border bg-clinical-bg/40 px-2 py-1">
      <div className="text-[9px] uppercase tracking-wider text-clinical-subtle">{label}</div>
      <div className="text-white font-mono text-[11px]">{value}</div>
    </div>
  );
}
