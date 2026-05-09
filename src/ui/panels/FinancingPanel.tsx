import { useGame } from '../../state/gameStore';
import { useT } from '../../lib/i18n';

function Money({ label, value, colour }: { label: string; value: number; colour: string }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-clinical-subtle">{label}</span>
      <span className="font-mono" style={{ color: colour }}>
        S${value.toFixed(0)}
      </span>
    </div>
  );
}

export function FinancingPanel() {
  const t = useT();
  const totals = useGame((s) => s.totals);
  const profile = useGame((s) => s.profile);
  const burden = useGame((s) => s.caregiverBurden);
  const segments = useGame((s) => s.segments);

  if (!profile) {
    return (
      <section className="bg-clinical-panel border border-clinical-border rounded-lg p-3 space-y-2">
        <h3 className="text-sm font-semibold text-white">{t('fin.heading')}</h3>
        <p className="text-xs text-clinical-subtle">{t('patient.empty')}</p>
      </section>
    );
  }

  const toCash = totals.cash;
  const ratio = totals.gross > 0 ? Math.round((toCash / totals.gross) * 100) : 0;

  return (
    <section className="bg-clinical-panel border border-clinical-border rounded-lg p-3 space-y-3">
      <header className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-white">{t('fin.heading')}</h3>
        <span className="text-[10px] uppercase tracking-wider text-clinical-subtle">
          {profile.wardClass === 'na' ? t('fin.outpatient') : `Class ${profile.wardClass}`} ·{' '}
          {profile.chasTier === 'none' ? 'No CHAS' : profile.chasTier.toUpperCase()}
        </span>
      </header>

      <div className="space-y-1">
        <Money label={t('fin.gross')} value={totals.gross} colour="#cbd5f5" />
        <Money label={t('fin.subsidy')} value={totals.subsidy} colour="#4ade80" />
        <Money label={t('fin.mshl')} value={totals.mediShield} colour="#3aa6ff" />
        <Money label={t('fin.medisave')} value={totals.mediSave} colour="#a3e635" />
        <div className="border-t border-clinical-border pt-1 mt-1 flex justify-between text-xs">
          <span className="text-white font-semibold">{t('fin.cash')}</span>
          <span
            className="font-mono font-semibold"
            style={{
              color: ratio > 30 ? '#f87171' : ratio > 15 ? '#facc15' : '#4ade80',
            }}
          >
            S${toCash.toFixed(0)}
          </span>
        </div>
        <div className="text-[10px] text-clinical-subtle text-right">
          {t('fin.cashRatioOfGross', { pct: ratio })}
        </div>
      </div>

      {segments.length > 0 && (
        <details className="text-[11px]">
          <summary className="cursor-pointer text-clinical-subtle hover:text-white">
            {t('fin.perSegment')}
          </summary>
          <ul className="mt-2 space-y-1">
            {segments.map((s, i) => (
              <li key={i} className="flex justify-between font-mono text-[10px]">
                <span className="text-clinical-subtle truncate">{s.charge}</span>
                <span className="text-white">
                  S${s.grossSGD.toFixed(0)} → cash S${s.cashSGD.toFixed(0)}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="border-t border-clinical-border pt-2 space-y-1">
        <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
          {t('fin.caregiverBurden')}
        </div>
        <BurdenBar label={t('fin.timeOffWork')} value={burden.timeOffWorkHours} max={48} unit="h" />
        <BurdenBar label={t('fin.financialWorry')} value={burden.financialWorry} max={100} unit="" />
        <BurdenBar label={t('fin.sleepDebt')} value={burden.sleepDebt} max={100} unit="" />
      </div>
    </section>
  );
}

function BurdenBar({
  label,
  value,
  max,
  unit,
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const colour = pct > 70 ? '#f87171' : pct > 40 ? '#facc15' : '#4ade80';
  return (
    <div>
      <div className="flex justify-between text-[11px]">
        <span className="text-clinical-subtle">{label}</span>
        <span className="font-mono text-white">
          {value.toFixed(0)}
          {unit}
        </span>
      </div>
      <div className="h-1 bg-clinical-bg rounded overflow-hidden">
        <div className="h-full" style={{ width: `${pct}%`, backgroundColor: colour }} />
      </div>
    </div>
  );
}
