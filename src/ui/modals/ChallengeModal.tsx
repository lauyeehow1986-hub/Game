import { useEffect, useMemo, useState } from 'react';
import type { CaseDefinition, DecisionOption } from '../../lib/types';
import { useT, useTr } from '../../lib/i18n';
import { useFocusTrap } from '../../lib/use-focus-trap';
import { GlossaryText } from '../GlossaryText';
import { maxScoreForDecision } from '../../lib/scoring';
import { buildExam } from '../../lib/exam';
import type { QuizItem } from '../../lib/quiz';
import {
  encodeChallenge,
  decodeChallenge,
  gradeChallenge,
  newChallengeSeed,
  type Challenge,
} from '../../lib/challenge-code';
import { Confetti } from '../Confetti';

interface Props {
  pool: CaseDefinition[];
  onClose: () => void;
}

type Phase =
  | { kind: 'menu' }
  | { kind: 'setup-create' }
  | { kind: 'setup-accept' }
  | { kind: 'play'; mode: 'create' | 'accept'; seed: number; count: number; name: string; challenge?: Challenge }
  | { kind: 'result-create'; code: string; earned: number; max: number }
  | { kind: 'result-accept'; challenge: Challenge; earned: number; max: number };

const LENGTHS = [8, 15, 20] as const;

/**
 * Challenge a friend — the PWA-safe asynchronous duel. The challenger plays a
 * seeded exam paper and shares a short code; the friend rebuilds the identical
 * paper from the seed, plays it, and the app scores them head-to-head. No
 * server, no shared device — all the state rides in the code.
 */
export function ChallengeModal({ pool, onClose }: Props) {
  const t = useT();
  const cardRef = useFocusTrap<HTMLDivElement>(true);
  const [phase, setPhase] = useState<Phase>({ kind: 'menu' });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="challenge-title"
      className="fixed inset-0 z-[65] grid place-items-center bg-black/70 p-4"
    >
      <div
        ref={cardRef}
        className="bg-clinical-panel border border-clinical-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin shadow-2xl"
      >
        <header className="px-5 py-3 border-b border-clinical-border flex items-center justify-between gap-3">
          <h2 id="challenge-title" className="text-sm font-semibold text-white">
            {t('challenge.heading')}
          </h2>
          <button onClick={onClose} className="text-[11px] text-clinical-subtle hover:text-white">
            {t('common.close')}
          </button>
        </header>

        {phase.kind === 'menu' && (
          <div className="px-5 py-5 space-y-3">
            <p className="text-[12px] text-clinical-subtle">{t('challenge.intro')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => setPhase({ kind: 'setup-create' })}
                className="tap-target px-3 py-3 rounded border border-clinical-accent/60 text-clinical-accent hover:bg-clinical-accent/10 text-sm font-semibold"
              >
                {t('challenge.create')}
              </button>
              <button
                onClick={() => setPhase({ kind: 'setup-accept' })}
                className="tap-target px-3 py-3 rounded border border-amber-400/60 text-amber-300 hover:bg-amber-400/10 text-sm font-semibold"
              >
                {t('challenge.accept')}
              </button>
            </div>
          </div>
        )}

        {phase.kind === 'setup-create' && (
          <SetupCreate
            onStart={(name, count) =>
              setPhase({ kind: 'play', mode: 'create', seed: newChallengeSeed(), count, name })
            }
          />
        )}

        {phase.kind === 'setup-accept' && (
          <SetupAccept
            onStart={(name, challenge) =>
              setPhase({
                kind: 'play',
                mode: 'accept',
                seed: challenge.seed,
                count: challenge.count,
                name,
                challenge,
              })
            }
          />
        )}

        {phase.kind === 'play' && (
          <PlayPaper
            pool={pool}
            seed={phase.seed}
            count={phase.count}
            onDone={(earned, max) => {
              if (phase.mode === 'create') {
                const code = encodeChallenge({
                  seed: phase.seed,
                  count: phase.count,
                  challengerEarned: earned,
                  challengerMax: max,
                  challengerName: phase.name,
                });
                setPhase({ kind: 'result-create', code, earned, max });
              } else if (phase.challenge) {
                setPhase({ kind: 'result-accept', challenge: phase.challenge, earned, max });
              }
            }}
          />
        )}

        {phase.kind === 'result-create' && (
          <ResultCreate
            code={phase.code}
            earned={phase.earned}
            max={phase.max}
            onClose={onClose}
          />
        )}

        {phase.kind === 'result-accept' && (
          <ResultAccept
            challenge={phase.challenge}
            earned={phase.earned}
            max={phase.max}
            onAgain={() => setPhase({ kind: 'menu' })}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}

/* ── Create setup: name + paper length ──────────────────────────────────── */
function SetupCreate({ onStart }: { onStart: (name: string, count: number) => void }) {
  const t = useT();
  const [name, setName] = useState('');
  const [count, setCount] = useState<number>(15);
  return (
    <div className="px-5 py-5 space-y-4">
      <label className="block space-y-1">
        <span className="text-[11px] uppercase tracking-wider text-clinical-subtle">
          {t('challenge.yourName')}
        </span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('challenge.namePlaceholder')}
          maxLength={24}
          className="w-full bg-clinical-bg border border-clinical-border rounded px-2 py-1.5 text-sm text-white"
        />
      </label>
      <div className="space-y-1">
        <span className="text-[11px] uppercase tracking-wider text-clinical-subtle">
          {t('challenge.length')}
        </span>
        <div className="flex gap-2">
          {LENGTHS.map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`tap-target flex-1 px-2 py-2 rounded border text-sm ${
                count === n
                  ? 'border-clinical-accent bg-clinical-accent/10 text-white'
                  : 'border-clinical-border text-clinical-subtle hover:text-white'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={() => onStart(name.trim(), count)}
        className="tap-target w-full px-3 py-2 rounded bg-clinical-accent text-clinical-bg font-semibold text-sm hover:brightness-110"
      >
        {t('challenge.start')}
      </button>
    </div>
  );
}

/* ── Accept setup: paste code + name ────────────────────────────────────── */
function SetupAccept({ onStart }: { onStart: (name: string, c: Challenge) => void }) {
  const t = useT();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const challenge = useMemo(() => decodeChallenge(code), [code]);
  const showError = code.trim().length > 0 && !challenge;
  const challengerPct = challenge
    ? Math.round((Math.max(0, challenge.challengerEarned) / challenge.challengerMax) * 100)
    : 0;
  return (
    <div className="px-5 py-5 space-y-4">
      <label className="block space-y-1">
        <span className="text-[11px] uppercase tracking-wider text-clinical-subtle">
          {t('challenge.pasteCode')}
        </span>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t('challenge.codePlaceholder')}
          rows={2}
          className="w-full bg-clinical-bg border border-clinical-border rounded px-2 py-1.5 text-[12px] font-mono text-white break-all"
        />
      </label>
      {showError && <p className="text-[11px] text-clinical-danger">{t('challenge.invalidCode')}</p>}
      {challenge && (
        <div className="rounded border border-amber-400/40 bg-amber-400/5 p-2 text-[12px]">
          <div className="text-amber-300 font-semibold">
            {t('challenge.from', { name: challenge.challengerName || t('challenge.challenger') })}
          </div>
          <div className="text-clinical-subtle">
            {t('challenge.toBeat')}: <span className="font-mono text-white">{challengerPct}%</span>{' '}
            ({challenge.challengerEarned}/{challenge.challengerMax}) · {challenge.count}
          </div>
        </div>
      )}
      <label className="block space-y-1">
        <span className="text-[11px] uppercase tracking-wider text-clinical-subtle">
          {t('challenge.yourName')}
        </span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('challenge.namePlaceholder')}
          maxLength={24}
          className="w-full bg-clinical-bg border border-clinical-border rounded px-2 py-1.5 text-sm text-white"
        />
      </label>
      <button
        disabled={!challenge}
        onClick={() => challenge && onStart(name.trim(), challenge)}
        className="tap-target w-full px-3 py-2 rounded bg-amber-400 text-clinical-bg font-semibold text-sm hover:brightness-110 disabled:opacity-40"
      >
        {t('challenge.start')}
      </button>
    </div>
  );
}

/* ── The seeded paper player (no per-question feedback) ──────────────────── */
function PlayPaper({
  pool,
  seed,
  count,
  onDone,
}: {
  pool: CaseDefinition[];
  seed: number;
  count: number;
  onDone: (earned: number, max: number) => void;
}) {
  const t = useT();
  const tr = useTr();
  const items: QuizItem[] = useMemo(() => buildExam(pool, count, seed), [pool, count, seed]);
  const [index, setIndex] = useState(0);
  const [earned, setEarned] = useState(0);
  const [max, setMax] = useState(0);
  const [focusIdx, setFocusIdx] = useState(0);

  const item = items[index];
  const caseDef = item ? pool.find((c) => c.id === item.caseId) : null;
  const node = caseDef?.pathway.find((n) => n.decision?.id === item?.decisionId);
  const decision = node?.decision;

  // Empty paper (no decisions in pool): finish immediately rather than hang.
  useEffect(() => {
    if (items.length === 0) onDone(0, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const commit = (opt: DecisionOption) => {
    if (!decision) return;
    const m = maxScoreForDecision(decision);
    const nextEarned = earned + Math.max(0, opt.score * decision.weight);
    const nextMax = max + m;
    setFocusIdx(0);
    if (index + 1 >= items.length) {
      onDone(nextEarned, nextMax > 0 ? nextMax : 1);
    } else {
      setEarned(nextEarned);
      setMax(nextMax);
      setIndex(index + 1);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!decision) return;
      const opts = decision.options;
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        setFocusIdx((i) => Math.min(opts.length - 1, i + 1));
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        setFocusIdx((i) => Math.max(0, i - 1));
      } else if (/^[1-9]$/.test(e.key)) {
        const n = parseInt(e.key, 10) - 1;
        if (n < opts.length) setFocusIdx(n);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        commit(opts[focusIdx]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decision, focusIdx, index, earned, max]);

  if (!decision) return null;

  return (
    <div className="px-5 py-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-clinical-subtle">
          {caseDef ? tr(caseDef.title) : ''}
        </span>
        <span className="text-[11px] text-clinical-subtle font-mono">
          {t('challenge.q', { n: index + 1, total: items.length })}
        </span>
      </div>
      <p className="text-sm text-white font-medium">
        <GlossaryText>{tr(decision.prompt)}</GlossaryText>
      </p>
      <div className="space-y-1.5">
        {decision.options.map((opt, i) => (
          <button
            key={opt.id}
            onClick={() => commit(opt)}
            onMouseEnter={() => setFocusIdx(i)}
            className={`w-full text-left px-3 py-2 rounded border text-[12px] transition ${
              i === focusIdx
                ? 'border-clinical-accent bg-clinical-accent/10 text-white'
                : 'border-clinical-border text-clinical-subtle hover:text-white'
            }`}
          >
            <span className="font-mono text-[10px] text-clinical-subtle mr-1.5">{i + 1}</span>
            <GlossaryText>{tr(opt.label)}</GlossaryText>
          </button>
        ))}
      </div>
      <p className="text-[10px] text-clinical-subtle">{t('challenge.noFeedback')}</p>
    </div>
  );
}

/* ── Create result: show the code to copy ───────────────────────────────── */
function ResultCreate({
  code,
  earned,
  max,
  onClose,
}: {
  code: string;
  earned: number;
  max: number;
  onClose: () => void;
}) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const pct = Math.round((earned / max) * 100);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // No clipboard (file://) — the code is selectable in the box anyway.
    }
  };
  return (
    <div className="px-5 py-5 space-y-4 text-center">
      <div className="text-2xl font-extrabold text-white">{pct}%</div>
      <div className="text-[11px] text-clinical-subtle">
        {earned.toFixed(0)} / {max.toFixed(0)}
      </div>
      <div className="space-y-1 text-left">
        <span className="text-[11px] uppercase tracking-wider text-clinical-subtle">
          {t('challenge.yourCode')}
        </span>
        <div
          className="w-full bg-clinical-bg border border-clinical-border rounded px-2 py-2 text-[12px] font-mono text-clinical-accent break-all select-all"
          data-testid="challenge-code"
        >
          {code}
        </div>
      </div>
      <button
        onClick={copy}
        className="tap-target w-full px-3 py-2 rounded bg-clinical-accent text-clinical-bg font-semibold text-sm hover:brightness-110"
      >
        {copied ? t('challenge.copied') : t('challenge.copy')}
      </button>
      <p className="text-[11px] text-clinical-subtle">{t('challenge.share')}</p>
      <button
        onClick={onClose}
        className="tap-target px-4 py-2 rounded border border-clinical-border text-clinical-subtle hover:text-white text-xs"
      >
        {t('common.close')}
      </button>
    </div>
  );
}

/* ── Accept result: head-to-head verdict ────────────────────────────────── */
function ResultAccept({
  challenge,
  earned,
  max,
  onAgain,
  onClose,
}: {
  challenge: Challenge;
  earned: number;
  max: number;
  onAgain: () => void;
  onClose: () => void;
}) {
  const t = useT();
  const outcome = useMemo(() => gradeChallenge(challenge, earned, max), [challenge, earned, max]);
  const verdict =
    outcome.winner === 'friend'
      ? t('challenge.youWin')
      : outcome.winner === 'challenger'
      ? t('challenge.youLose')
      : t('challenge.draw');
  return (
    <div className="px-5 py-6 space-y-4 text-center">
      {outcome.winner === 'friend' && <Confetti active />}
      <div className="text-2xl font-extrabold text-white">{verdict}</div>
      <div className="grid grid-cols-2 gap-3">
        <div
          className={`rounded border p-3 ${
            outcome.winner === 'friend'
              ? 'border-clinical-accent text-clinical-accent ring-2 ring-current'
              : 'border-clinical-border text-clinical-subtle'
          }`}
        >
          <div className="text-[10px] uppercase tracking-wider">{t('challenge.you')}</div>
          <div className="text-2xl font-extrabold mt-1">{outcome.friendPct}%</div>
          <div className="text-[10px] text-clinical-subtle mt-0.5">
            {earned.toFixed(0)} / {max.toFixed(0)}
          </div>
        </div>
        <div
          className={`rounded border p-3 ${
            outcome.winner === 'challenger'
              ? 'border-amber-400 text-amber-300 ring-2 ring-current'
              : 'border-clinical-border text-clinical-subtle'
          }`}
        >
          <div className="text-[10px] uppercase tracking-wider">
            {challenge.challengerName || t('challenge.challenger')}
          </div>
          <div className="text-2xl font-extrabold mt-1">{outcome.challengerPct}%</div>
          <div className="text-[10px] text-clinical-subtle mt-0.5">
            {challenge.challengerEarned} / {challenge.challengerMax}
          </div>
        </div>
      </div>
      <div className="flex gap-2 justify-center">
        <button
          onClick={onAgain}
          className="tap-target px-4 py-2 rounded border border-clinical-accent/60 text-clinical-accent hover:bg-clinical-accent/10 text-xs"
        >
          {t('challenge.replay')}
        </button>
        <button
          onClick={onClose}
          className="tap-target px-4 py-2 rounded border border-clinical-border text-clinical-subtle hover:text-white text-xs"
        >
          {t('common.close')}
        </button>
      </div>
    </div>
  );
}
