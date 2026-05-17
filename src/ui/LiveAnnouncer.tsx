import { useEffect, useRef, useState } from 'react';
import { useGame } from '../state/gameStore';
import { useT, useTr } from '../lib/i18n';

/**
 * Visually-hidden aria-live region that narrates major status changes
 * for screen-reader users: new decision required, case completed, run
 * reset. Renders nothing visible; the messages are announced politely
 * via `aria-live="polite"`.
 */
export function LiveAnnouncer() {
  const t = useT();
  const tr = useTr();
  const status = useGame((s) => s.run.status);
  const pendingDecisionId = useGame((s) => s.run.pendingDecision?.decision.id ?? null);
  const caseDef = useGame((s) => s.caseDef);
  const [message, setMessage] = useState('');
  const prevStatus = useRef(status);

  useEffect(() => {
    let msg = '';
    if (status === 'awaiting-decision' && pendingDecisionId) {
      msg = t('a11y.announce.decisionRequired');
    } else if (status === 'completed' && prevStatus.current !== 'completed' && caseDef) {
      msg = t('a11y.announce.caseComplete', { title: tr(caseDef.title) });
    } else if (status === 'idle' && prevStatus.current !== 'idle') {
      msg = t('a11y.announce.runReset');
    }
    prevStatus.current = status;
    if (msg) setMessage(msg);
  }, [status, pendingDecisionId, caseDef, t, tr]);

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}
