import { listCases } from '../../content';
import { useCustomCases } from '../../state/customCasesStore';
import { useProgress } from '../../state/progressStore';
import { useGame } from '../../state/gameStore';
import { useAchievements } from '../../state/achievementsStore';
import { useStreak, currentStreakValue, bestStreakValue } from '../../state/streakStore';
import { buildHeatmap } from '../../lib/streak-heatmap';
import { useMemo, useState, lazy, Suspense } from 'react';
import { computePersonalTrends, computeDecisionWeaknesses, gradeBandLabel } from '../../lib/personal-trends';
import { coachSuggestion } from '../../lib/coach';
import { competency } from '../../lib/competency';
import { computeWeekReport } from '../../lib/learning-goals';
import { useLearningGoals } from '../../state/learningGoalsStore';
import { useBookmarks } from '../../state/bookmarksStore';
import { useLocale, useT, useTr } from '../../lib/i18n';
import { ACHIEVEMENTS } from '../../lib/achievements';
import { CURRICULA } from '../../lib/curricula';
import { buildRandomQuiz, buildQuizFromDecisions, type QuizItem } from '../../lib/quiz';
import { buildExam, EXAM_PRESETS, type ExamConfig } from '../../lib/exam';
import { dueItems } from '../../lib/spaced-repetition';
import { buildFlashcards, shuffleFlashcards } from '../../lib/flashcards';
import { masteryReport } from '../../lib/mastery';
import { buildPortfolio } from '../../lib/portfolio';
import { exportRunHistoryCsv } from '../../lib/csv-export';
import type { CaseDefinition } from '../../lib/types';

const PracticeDecisionModal = lazy(() =>
  import('../modals/PracticeDecisionModal').then((m) => ({ default: m.PracticeDecisionModal })),
);
const QuizModal = lazy(() =>
  import('../modals/QuizModal').then((m) => ({ default: m.QuizModal })),
);
const ExamModal = lazy(() =>
  import('../modals/ExamModal').then((m) => ({ default: m.ExamModal })),
);
const EducatorModal = lazy(() =>
  import('../modals/EducatorModal').then((m) => ({ default: m.EducatorModal })),
);
const AnalyticsModal = lazy(() =>
  import('../modals/AnalyticsModal').then((m) => ({ default: m.AnalyticsModal })),
);
const DuelModal = lazy(() =>
  import('../modals/DuelModal').then((m) => ({ default: m.DuelModal })),
);
const FlashcardsModal = lazy(() =>
  import('../modals/FlashcardsModal').then((m) => ({ default: m.FlashcardsModal })),
);

const CATEGORY_COLOURS: Record<'acute' | 'elective' | 'outpatient', string> = {
  acute: '#f87171',
  elective: '#38bdf8',
  outpatient: '#4ade80',
};

const gradeColour = (ratio: number): string => {
  if (ratio >= 0.9) return '#4ade80';
  if (ratio >= 0.75) return '#a3e635';
  if (ratio >= 0.5) return '#facc15';
  return '#f87171';
};

/**
 * Renders a tiny CSS-only sparkline of recent case ratios. Newest on the
 * right; bars colour-graded by ratio band.
 */
function Sparkline({ ratios }: { ratios: number[] }) {
  if (ratios.length === 0) return null;
  // Show last 12 entries (oldest -> newest).
  const shown = ratios.slice(-12);
  return (
    <div className="flex items-end gap-0.5 h-6">
      {shown.map((r, i) => (
        <div
          key={i}
          className="w-1.5 rounded-t"
          style={{
            height: `${Math.max(8, r * 100)}%`,
            backgroundColor: gradeColour(r),
          }}
          title={`${(r * 100).toFixed(0)}%`}
        />
      ))}
    </div>
  );
}

export function TrendsPanel() {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const tr = useTr();
  const bestScores = useProgress((s) => s.bestScores);
  const decisionsMade = useProgress((s) => s.decisionsMade);
  const casesCompleted = useProgress((s) => s.casesCompleted);
  const customCases = useCustomCases((s) => s.cases);
  const startCase = useGame((s) => s.startCase);
  const resetRun = useGame((s) => s.resetRun);
  const status = useGame((s) => s.run.status);
  const unlockedAchievements = useAchievements((s) => s.unlocked);
  const streakDays = useStreak((s) => s.days);
  const streakNow = currentStreakValue({ days: streakDays });
  const streakBest = bestStreakValue({ days: streakDays });
  const decisionNotes = useProgress((s) => s.decisionNotes);
  const setDecisionNote = useProgress((s) => s.setDecisionNote);
  const [practice, setPractice] = useState<{ caseDef: CaseDefinition; decisionId: string } | null>(null);
  const [quiz, setQuiz] = useState<QuizItem[] | null>(null);
  const [exam, setExam] = useState<{ items: QuizItem[]; config: ExamConfig; preset: string } | null>(null);
  const [educatorOpen, setEducatorOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [duelOpen, setDuelOpen] = useState(false);
  const [goalsOpen, setGoalsOpen] = useState(false);
  const [flashcardsOpen, setFlashcardsOpen] = useState(false);
  const goalTargets = useLearningGoals((s) => s.targets);
  const setGoalTargets = useLearningGoals((s) => s.setTargets);
  const bookmarks = useBookmarks((s) => s.items);
  const removeBookmark = useBookmarks((s) => s.remove);

  const runHistory = useProgress((s) => s.runHistory);
  const catalogue = useMemo(
    () => [...listCases(), ...Object.values(customCases)],
    [customCases],
  );
  const trends = useMemo(
    () => computePersonalTrends(
      bestScores,
      catalogue,
      (c) => tr(c.title),
      CURRICULA.map((cur) => ({ id: cur.id, caseIds: cur.caseIds })),
      runHistory,
    ),
    [bestScores, catalogue, tr, runHistory],
  );
  const decisionWeaknesses = useMemo(
    () => computeDecisionWeaknesses(
      runHistory,
      catalogue,
      (v) => tr(v as Parameters<typeof tr>[0]),
    ),
    [runHistory, catalogue, tr],
  );
  // Build a chronological list of ratios (oldest -> newest) for the sparkline.
  const ratiosOldFirst = useMemo(
    () => [...trends.caseTrends].sort((a, b) => a.at - b.at).map((c) => c.ratio),
    [trends.caseTrends],
  );
  const meanGrade = gradeBandLabel(trends.meanRatio);

  return (
    <section data-tour="trends" className="bg-clinical-panel border border-clinical-border rounded-lg p-3 space-y-3">
      <header className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-white">{t('trends.heading')}</h3>
        <span className="text-[10px] uppercase tracking-wider text-clinical-subtle">
          {t('lb.runs', { runs: casesCompleted, decisions: decisionsMade })}
        </span>
      </header>

      {(() => {
        const distinctCases = Object.keys(bestScores).length;
        if (distinctCases === 0) return null;
        const distinctions = Object.values(bestScores).filter((b) => b.max > 0 && b.score / b.max >= 0.9).length;
        const meanRatio = distinctCases > 0
          ? Object.values(bestScores).reduce((acc, b) => acc + (b.max > 0 ? b.score / b.max : 0), 0) / distinctCases
          : 0;
        const c = competency({
          distinctCasesPlayed: distinctCases,
          meanRatio,
          distinctions,
        });
        const tierColour: Record<string, string> = {
          'novice': 'border-clinical-subtle/40 text-clinical-subtle',
          'advanced-beginner': 'border-clinical-warn/40 text-clinical-warn',
          'competent': 'border-clinical-accent/40 text-clinical-accent',
          'proficient': 'border-clinical-ok/40 text-clinical-ok',
          'expert': 'border-amber-400/60 text-amber-300',
        };
        return (
          <div className={`rounded border ${tierColour[c.tier]} p-2 space-y-1`}>
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] uppercase tracking-wider">{t('competency.label')}</span>
              <span className="text-[12px] font-semibold">{t(`competency.tier.${c.tier}`)}</span>
            </div>
            <div className="h-1.5 bg-clinical-bg rounded overflow-hidden">
              <div className="h-full bg-current" style={{ width: `${Math.round(c.progress * 100)}%` }} />
            </div>
            <p className="text-[11px] leading-snug">{t(c.reason)}</p>
          </div>
        );
      })()}

      {(() => {
        const w = computeWeekReport(runHistory, goalTargets);
        const bar = (p: number) => (
          <div className="h-1.5 bg-clinical-bg rounded overflow-hidden">
            <div
              className="h-full"
              style={{
                width: `${Math.round(p * 100)}%`,
                backgroundColor: p >= 1 ? '#4ade80' : p >= 0.6 ? '#facc15' : '#f87171',
              }}
            />
          </div>
        );
        return (
          <div className="rounded border border-clinical-border bg-clinical-bg/30 p-2 space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] uppercase tracking-wider text-clinical-subtle">
                {t('goals.label')}
              </span>
              <button
                type="button"
                className="text-[10px] underline text-clinical-accent hover:text-clinical-ok"
                onClick={() => setGoalsOpen((o) => !o)}
              >
                {goalsOpen ? t('goals.close') : t('goals.edit')}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div className="space-y-0.5">
                <div className="flex justify-between"><span className="text-clinical-subtle">{t('goals.cases')}</span><span>{w.casesCompleted}/{goalTargets.casesPerWeek}</span></div>
                {bar(w.progress.cases)}
              </div>
              <div className="space-y-0.5">
                <div className="flex justify-between"><span className="text-clinical-subtle">{t('goals.distinctions')}</span><span>{w.distinctions}/{goalTargets.distinctionsPerWeek}</span></div>
                {bar(w.progress.distinctions)}
              </div>
              <div className="space-y-0.5">
                <div className="flex justify-between"><span className="text-clinical-subtle">{t('goals.mean')}</span><span>{(w.meanRatio * 100).toFixed(0)}/{(goalTargets.meanRatio * 100).toFixed(0)}%</span></div>
                {bar(w.progress.meanRatio)}
              </div>
            </div>
            {w.allMet && (
              <p className="text-[11px] text-clinical-ok">{t('goals.allMet')}</p>
            )}
            {goalsOpen && (
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-clinical-border/50 text-[11px]">
                <label className="flex flex-col gap-0.5">
                  <span className="text-clinical-subtle">{t('goals.cases')}</span>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={goalTargets.casesPerWeek}
                    onChange={(e) => setGoalTargets({ casesPerWeek: Number(e.target.value) })}
                    className="bg-clinical-bg border border-clinical-border rounded px-1 py-0.5"
                  />
                </label>
                <label className="flex flex-col gap-0.5">
                  <span className="text-clinical-subtle">{t('goals.distinctions')}</span>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={goalTargets.distinctionsPerWeek}
                    onChange={(e) => setGoalTargets({ distinctionsPerWeek: Number(e.target.value) })}
                    className="bg-clinical-bg border border-clinical-border rounded px-1 py-0.5"
                  />
                </label>
                <label className="flex flex-col gap-0.5">
                  <span className="text-clinical-subtle">{t('goals.mean')} %</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={Math.round(goalTargets.meanRatio * 100)}
                    onChange={(e) => setGoalTargets({ meanRatio: Number(e.target.value) / 100 })}
                    className="bg-clinical-bg border border-clinical-border rounded px-1 py-0.5"
                  />
                </label>
              </div>
            )}
          </div>
        );
      })()}

      <div className="grid grid-cols-3 gap-2 text-[11px]">
        <Mini label={t('lb.cases')} value={`${trends.totalPlayed}/${trends.totalCases}`} />
        <Mini
          label={t('lb.avg')}
          value={`${(trends.meanRatio * 100).toFixed(0)}%`}
          colour={gradeColour(trends.meanRatio)}
        />
        <Mini label={t('trends.grade')} value={trends.totalPlayed > 0 ? meanGrade : '—'} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <Mini
          label={t('hud.streak')}
          value={streakNow > 0 ? `🔥 ${streakNow}d` : '—'}
          colour={streakNow > 0 ? '#facc15' : undefined}
        />
        <Mini
          label={t('hud.streak.best')}
          value={streakBest > 0 ? `${streakBest}d` : '—'}
        />
      </div>

      {(() => {
        const m = masteryReport(catalogue, bestScores, runHistory);
        if (m.counts.untouched === catalogue.length) return null;
        const swatch = (label: string, value: number, colour: string) => (
          <div className="flex items-center gap-1 text-[11px]" title={label}>
            <span
              className="inline-block w-2 h-2 rounded-sm"
              style={{ backgroundColor: colour }}
              aria-hidden="true"
            />
            <span className="text-clinical-subtle">{label}</span>
            <span className="font-mono text-white">{value}</span>
          </div>
        );
        return (
          <div
            className="rounded border border-clinical-border bg-clinical-bg/30 p-2 space-y-1"
            aria-label={t('mastery.label')}
          >
            <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
              {t('mastery.label')}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {swatch(t('mastery.consolidated'), m.counts.consolidated, '#4ade80')}
              {swatch(t('mastery.mastered'), m.counts.mastered, '#a3e635')}
              {swatch(t('mastery.developing'), m.counts.developing, '#facc15')}
              {swatch(t('mastery.attempted'), m.counts.attempted, '#f87171')}
              {swatch(t('mastery.untouched'), m.counts.untouched, '#475569')}
            </div>
          </div>
        );
      })()}

      {streakDays.length > 0 && (
        <div
          className="rounded border border-clinical-border bg-clinical-bg/30 p-2"
          aria-label={t('trends.heatmap')}
        >
          <div className="text-[10px] uppercase tracking-wider text-clinical-subtle mb-1">
            {t('trends.heatmap')}
          </div>
          <div className="flex gap-[2px]" role="img" aria-label={t('trends.heatmap')}>
            {buildHeatmap(streakDays, 12).map((col, i) => (
              <div key={i} className="flex flex-col gap-[2px]">
                {col.map((cell) => (
                  <div
                    key={cell.date}
                    title={cell.date}
                    className={`w-2 h-2 rounded-[2px] ${
                      cell.active
                        ? 'bg-amber-400'
                        : cell.inWindow
                        ? 'bg-clinical-border'
                        : 'bg-clinical-border/30'
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {(() => {
        const due = dueItems(runHistory);
        if (due.length === 0) return null;
        return (
          <button
            onClick={() => {
              const q = buildQuizFromDecisions(due, catalogue, 8);
              if (q.length > 0) setQuiz(q);
            }}
            className="tap-target w-full text-[11px] px-2 py-1.5 rounded border border-clinical-warn/50 bg-clinical-warn/10 text-clinical-warn hover:bg-clinical-warn/20"
            title={t('sr.reviewTip')}
          >
            {t('sr.reviewBtn', { n: Math.min(due.length, 8) })}
          </button>
        );
      })()}

      {trends.totalPlayed > 0 && (
        <button
          onClick={() => {
            const played = catalogue.filter((c) => bestScores[c.id]);
            const pool = played.length > 0 ? played : catalogue;
            const q = buildRandomQuiz(pool, 5);
            if (q.length > 0) setQuiz(q);
          }}
          className="tap-target w-full text-[11px] px-2 py-1.5 rounded border border-clinical-accent/40 bg-clinical-accent/10 text-clinical-accent hover:bg-clinical-accent/20"
        >
          {t('quiz.startBtn')}
        </button>
      )}

      {trends.totalPlayed > 0 && (
        <div className="flex gap-1" data-tour="exam">
          {(['short', 'standard', 'osce'] as const).map((preset) => (
            <button
              key={preset}
              onClick={() => {
                const config = EXAM_PRESETS[preset];
                const items = buildExam(catalogue, config.count);
                if (items.length > 0) setExam({ items, config, preset });
              }}
              title={t('exam.startTip')}
              className="tap-target flex-1 text-[10px] uppercase tracking-wider px-1 py-1.5 rounded border border-clinical-warn/40 bg-clinical-warn/5 text-clinical-warn hover:bg-clinical-warn/15"
            >
              {t(`exam.preset.${preset}`)}
            </button>
          ))}
        </div>
      )}

      {trends.totalPlayed > 0 && (
        <button
          onClick={() => setAnalyticsOpen(true)}
          className="tap-target w-full text-[11px] px-2 py-1.5 rounded border border-clinical-border text-clinical-subtle hover:text-white"
        >
          {t('analytics.open')}
        </button>
      )}

      <button
        onClick={() => setDuelOpen(true)}
        className="tap-target w-full text-[11px] px-2 py-1.5 rounded border border-amber-500/40 bg-amber-500/5 text-amber-300 hover:bg-amber-500/15"
      >
        {t('duel.open')}
      </button>

      <button
        onClick={() => setEducatorOpen(true)}
        className="tap-target w-full text-[11px] px-2 py-1.5 rounded border border-clinical-border text-clinical-subtle hover:text-white"
      >
        {t('educator.open')}
      </button>

      <button
        onClick={() => {
          void (async () => {
            const { openPrintableCheatsheet } = await import('../../lib/cheatsheet-print');
            openPrintableCheatsheet(catalogue, locale === 'zh' ? 'zh' : 'en');
          })();
        }}
        className="tap-target w-full text-[11px] px-2 py-1.5 rounded border border-clinical-border text-clinical-subtle hover:text-white"
      >
        {t('cheatsheet.open')}
      </button>

      {trends.totalPlayed > 0 && (
        <button
          onClick={() => setFlashcardsOpen(true)}
          className="tap-target w-full text-[11px] px-2 py-1.5 rounded border border-clinical-border text-clinical-subtle hover:text-white"
        >
          {t('flashcards.open')}
        </button>
      )}

      {trends.totalPlayed > 0 && (
        <button
          onClick={() => {
            void (async () => {
              const { openPrintablePortfolio } = await import('../../lib/portfolio-print');
              const learnerName = (typeof window !== 'undefined'
                ? window.prompt(t('portfolio.namePrompt'), '') ?? ''
                : '');
              const portfolio = buildPortfolio({
                learnerName,
                generatedAt: Date.now(),
                bestScores,
                runHistory,
                decisionNotes,
                bookmarks,
                catalogue,
                goals: goalTargets,
                unlockedAchievements,
                resolveTitle: (c) => tr(c.title),
                resolveDecisionPrompt: (caseId, decisionId) => {
                  const c = catalogue.find((x) => x.id === caseId);
                  const node = c?.pathway.find((n) => n.decision?.id === decisionId);
                  return node?.decision ? tr(node.decision.prompt) : null;
                },
              });
              openPrintablePortfolio(portfolio, locale === 'zh' ? 'zh' : 'en');
            })();
          }}
          className="tap-target w-full text-[11px] px-2 py-1.5 rounded border border-amber-400/40 text-amber-300 hover:bg-amber-400/10"
        >
          {t('portfolio.open')}
        </button>
      )}

      {trends.totalPlayed > 0 && (
        <button
          onClick={() => {
            if (typeof document === 'undefined') return;
            const csv = exportRunHistoryCsv(runHistory, catalogue, (v) =>
              tr(v as Parameters<typeof tr>[0]),
            );
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'sg-pathway-runs.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }}
          className="text-[10px] w-full px-2 py-1 rounded border border-clinical-border text-clinical-subtle hover:text-white"
        >
          {t('trends.exportCsv')}
        </button>
      )}

      {trends.totalPlayed > 0 && (
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
            {t('trends.recentRuns')}
          </div>
          <Sparkline ratios={ratiosOldFirst} />
        </div>
      )}

      <div className="space-y-1 border-t border-clinical-border pt-2">
        <div className="text-[10px] uppercase tracking-wider text-clinical-subtle">
          {t('trends.byCategory')}
        </div>
        {trends.byCategory.map((c) => {
          const pct = c.meanRatio * 100;
          return (
            <div key={c.category} className="space-y-0.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-clinical-subtle">
                  {t(`cases.category.${c.category}`)} · {c.cases}
                </span>
                <span className="font-mono text-white">{c.cases > 0 ? `${pct.toFixed(0)}%` : '—'}</span>
              </div>
              <div className="h-1.5 bg-clinical-bg rounded overflow-hidden">
                <div
                  className="h-full"
                  style={{
                    width: `${pct}%`,
                    backgroundColor:
                      c.cases === 0 ? '#1f2a44' : gradeColour(c.meanRatio),
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {(() => {
        const s = coachSuggestion({
          bestScores,
          catalogue,
          byCategory: trends.byCategory,
        });
        if (!s) return null;
        return (
          <section className="rounded border border-clinical-warn/40 bg-clinical-warn/5 p-2 space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-clinical-warn">
              {t('coach.heading', { category: t(`cases.category.${s.category}`) })}
            </div>
            <p className="text-[11px] text-clinical-subtle leading-snug">{t(s.reason)}</p>
            <ul className="space-y-0.5">
              {s.caseIds.map((id) => {
                const c = catalogue.find((x) => x.id === id);
                if (!c) return null;
                return (
                  <li key={id}>
                    <button
                      onClick={() => {
                        if (status !== 'idle') resetRun();
                        startCase(c);
                      }}
                      className="w-full text-left text-[11px] px-2 py-1 rounded border border-clinical-border text-clinical-subtle hover:text-white"
                    >
                      → {tr(c.title)}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })()}

      {(() => {
        const r = trends.recommendations;
        const cards: Array<{
          kind: 'practice' | 'curriculum' | 'discover';
          caseId: string;
          colour: string;
        }> = [];
        if (r.practiceCaseId)
          cards.push({ kind: 'practice', caseId: r.practiceCaseId, colour: '#facc15' });
        if (r.curriculumCaseId)
          cards.push({ kind: 'curriculum', caseId: r.curriculumCaseId, colour: '#38bdf8' });
        if (r.discoverCaseId)
          cards.push({ kind: 'discover', caseId: r.discoverCaseId, colour: '#a3e635' });
        if (cards.length === 0) return null;
        return (
          <div className="space-y-1.5">
            {cards.map(({ kind, caseId, colour }) => {
              const c = catalogue.find((x) => x.id === caseId);
              if (!c) return null;
              const best = bestScores[caseId];
              return (
                <div
                  key={kind}
                  className="border rounded p-2 text-[11px] space-y-1"
                  style={{ borderColor: `${colour}66`, backgroundColor: `${colour}1a` }}
                >
                  <div
                    className="text-[10px] uppercase tracking-wider font-semibold"
                    style={{ color: colour }}
                  >
                    {t(`trends.rec.${kind}`)}
                  </div>
                  <div className="text-white">{tr(c.title)}</div>
                  <div className="flex gap-2 mt-1 items-center">
                    <button
                      onClick={() => {
                        if (status !== 'idle') resetRun();
                        startCase(c);
                      }}
                      className="tap-target text-[11px] px-2 py-1 rounded text-white font-semibold hover:brightness-110"
                      style={{ backgroundColor: colour, color: '#0b1320' }}
                    >
                      {best ? t('trends.replay') : t('cases.startCase')}
                    </button>
                    {best && (
                      <span className="text-[10px] text-clinical-subtle font-mono">
                        {t('cases.best')} {best.score.toFixed(1)} / {best.max.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {decisionWeaknesses.length > 0 && (
        <details className="text-[11px] border-t border-clinical-border pt-2">
          <summary className="cursor-pointer text-clinical-subtle hover:text-white">
            {t('trends.weak.heading')} ({decisionWeaknesses.length})
          </summary>
          <ul className="mt-1.5 space-y-1.5 max-h-56 overflow-y-auto scrollbar-thin pr-1">
            {decisionWeaknesses.map((w) => {
              const c = catalogue.find((x) => x.id === w.caseId);
              const pct = (w.meanRatio * 100).toFixed(0);
              const colour =
                w.meanRatio < 0.25
                  ? '#f87171'
                  : w.meanRatio < 0.5
                  ? '#facc15'
                  : '#a3e635';
              return (
                <li
                  key={`${w.caseId}|${w.decisionId}`}
                  className="border-l-2 pl-2"
                  style={{ borderColor: colour }}
                >
                  <div className="text-white leading-snug">{w.prompt}</div>
                  <div className="text-[10px] text-clinical-subtle font-mono">
                    {c ? tr(c.title) : w.caseId} · {pct}% over {w.attempts}{' '}
                    {w.attempts === 1 ? 'attempt' : 'attempts'}
                  </div>
                  <div className="flex gap-1 mt-1">
                    <button
                      disabled={!c}
                      onClick={() => {
                        if (!c) return;
                        setPractice({ caseDef: c, decisionId: w.decisionId });
                      }}
                      className="text-[10px] px-2 py-0.5 rounded bg-clinical-accent text-white font-semibold disabled:opacity-40 hover:brightness-110"
                    >
                      {t('trends.weak.practice')}
                    </button>
                    <button
                      disabled={!c}
                      onClick={() => {
                        if (!c) return;
                        if (status !== 'idle') resetRun();
                        startCase(c);
                      }}
                      className="text-[10px] px-2 py-0.5 rounded border border-clinical-border text-clinical-subtle hover:text-white disabled:opacity-40"
                    >
                      {t('trends.weak.restart')}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </details>
      )}

      {(() => {
        const list = Object.values(bookmarks).sort((a, b) => b.addedAt - a.addedAt);
        if (list.length === 0) return null;
        return (
          <details className="text-[11px] border-t border-clinical-border pt-2">
            <summary className="cursor-pointer text-clinical-subtle hover:text-white">
              {t('bookmark.heading')} ({list.length})
            </summary>
            <ul className="mt-1.5 space-y-1.5 max-h-56 overflow-y-auto scrollbar-thin pr-1">
              {list.map((b) => {
                const c = catalogue.find((x) => x.id === b.caseId);
                const node = c?.pathway.find((n) => n.decision?.id === b.decisionId);
                const prompt = node?.decision ? tr(node.decision.prompt) : b.decisionId;
                return (
                  <li
                    key={`${b.caseId}|${b.decisionId}`}
                    className="border-l-2 border-amber-400/60 pl-2"
                  >
                    <div className="text-white leading-snug">{prompt}</div>
                    <div className="text-[10px] text-clinical-subtle font-mono">
                      {c ? tr(c.title) : b.caseId}
                    </div>
                    <div className="flex gap-1 mt-1">
                      <button
                        disabled={!c}
                        onClick={() => {
                          if (!c) return;
                          setPractice({ caseDef: c, decisionId: b.decisionId });
                        }}
                        className="text-[10px] px-2 py-0.5 rounded bg-clinical-accent text-white font-semibold disabled:opacity-40 hover:brightness-110"
                      >
                        {t('trends.weak.practice')}
                      </button>
                      <button
                        onClick={() => removeBookmark(b.caseId, b.decisionId)}
                        className="text-[10px] px-2 py-0.5 rounded border border-clinical-border text-clinical-subtle hover:text-white"
                      >
                        {t('bookmark.remove')}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </details>
        );
      })()}

      <details className="text-[11px] border-t border-clinical-border pt-2">
        <summary className="cursor-pointer text-clinical-subtle hover:text-white">
          {t('ach.heading')} ·{' '}
          {t('ach.progress', { done: unlockedAchievements.length, total: ACHIEVEMENTS.length })}
        </summary>
        <ul className="mt-2 grid grid-cols-2 gap-1">
          {ACHIEVEMENTS.map((a) => {
            const got = unlockedAchievements.includes(a.id);
            return (
              <li
                key={a.id}
                className={`border rounded px-2 py-1 ${
                  got
                    ? 'border-amber-400/50 bg-amber-500/10'
                    : 'border-clinical-border bg-clinical-bg/30 opacity-60'
                }`}
                title={t(`ach.desc.${a.id}`) || a.description}
              >
                <div className="text-[11px] font-semibold text-white truncate">
                  {got ? t(`ach.title.${a.id}`) || a.title : t('ach.locked')}
                </div>
                <div className="text-[9px] text-clinical-subtle truncate">
                  {t(`ach.desc.${a.id}`) || a.description}
                </div>
              </li>
            );
          })}
        </ul>
      </details>

      {(() => {
        const grouped = new Map<string, Array<{ decisionId: string; text: string }>>();
        for (const [k, text] of Object.entries(decisionNotes)) {
          const [caseId, decisionId] = k.split('|');
          if (!caseId || !decisionId) continue;
          const arr = grouped.get(caseId) ?? [];
          arr.push({ decisionId, text });
          grouped.set(caseId, arr);
        }
        if (grouped.size === 0) return null;
        const total = Array.from(grouped.values()).reduce((acc, a) => acc + a.length, 0);

        const exportAll = async () => {
          const lines: string[] = [`# ${t('trends.notes.exportHeading')}`, ''];
          for (const [caseId, arr] of grouped) {
            const c = catalogue.find((x) => x.id === caseId);
            const title = c ? tr(c.title) : caseId;
            lines.push(`## ${title}`);
            for (const { decisionId, text } of arr) {
              const node = c?.pathway.find((n) => n.decision?.id === decisionId);
              const prompt = node?.decision ? tr(node.decision.prompt) : decisionId;
              lines.push(`### ${prompt}`);
              for (const ln of text.split(/\r?\n/)) lines.push(`> ${ln}`);
              lines.push('');
            }
          }
          const md = lines.join('\n');
          try {
            await navigator.clipboard.writeText(md);
          } catch {
            // No clipboard (e.g. file://); fall through to download.
          }
          if (typeof document !== 'undefined') {
            const blob = new Blob([md], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'sg-pathway-notes.md';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }
        };

        const clearAll = () => {
          if (!confirm('Clear every reflection note? This cannot be undone.')) return;
          for (const k of Object.keys(decisionNotes)) {
            const [cid, did] = k.split('|');
            if (cid && did) setDecisionNote(cid, did, '');
          }
        };

        return (
          <details className="text-[11px] border-t border-clinical-border pt-2">
            <summary className="cursor-pointer text-clinical-subtle hover:text-white">
              {t('trends.notes.heading')} ({total})
            </summary>
            <div className="mt-2 space-y-2 max-h-72 overflow-y-auto scrollbar-thin pr-1">
              {Array.from(grouped.entries()).map(([caseId, arr]) => {
                const c = catalogue.find((x) => x.id === caseId);
                if (!c) return null;
                return (
                  <div key={caseId} className="border border-clinical-border rounded p-2 bg-clinical-bg/30">
                    <button
                      onClick={() => {
                        if (status !== 'idle') resetRun();
                        startCase(c);
                      }}
                      className="text-[11px] text-white font-semibold hover:text-clinical-accent text-left w-full"
                    >
                      {tr(c.title)} <span className="text-clinical-subtle font-normal">· {arr.length}</span>
                    </button>
                    <ul className="mt-1 space-y-1">
                      {arr.map(({ decisionId, text }) => {
                        const node = c.pathway.find((n) => n.decision?.id === decisionId);
                        const prompt = node?.decision ? tr(node.decision.prompt) : decisionId;
                        return (
                          <li key={decisionId} className="border-l border-clinical-border pl-2">
                            <div className="text-[10px] uppercase tracking-wider text-clinical-subtle truncate">
                              {prompt}
                            </div>
                            <div className="text-white/85 leading-snug whitespace-pre-wrap">
                              {text}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-1 mt-2">
              <button
                onClick={exportAll}
                className="text-[10px] px-2 py-1 rounded border border-clinical-border text-clinical-subtle hover:text-white"
              >
                {t('trends.notes.export')}
              </button>
              <button
                onClick={clearAll}
                className="text-[10px] px-2 py-1 rounded border border-clinical-danger/50 text-clinical-danger hover:bg-clinical-danger/10"
              >
                {t('trends.notes.clear')}
              </button>
            </div>
          </details>
        );
      })()}

      {trends.caseTrends.length > 0 && (
        <details className="text-[11px]">
          <summary className="cursor-pointer text-clinical-subtle hover:text-white">
            {t('trends.allCases')} ({trends.caseTrends.length})
          </summary>
          <ul className="mt-1 space-y-1 max-h-56 overflow-y-auto scrollbar-thin pr-1">
            {trends.caseTrends.map((row) => {
              const caseHistory = runHistory[row.caseId] ?? [];
              const historyRatios = caseHistory.map((e) =>
                e.max > 0 ? e.score / e.max : 0,
              );
              return (
              <li
                key={row.caseId}
                className="flex items-center gap-2 border border-clinical-border rounded px-2 py-1"
              >
                <span
                  className="w-1.5 h-6 rounded"
                  style={{ backgroundColor: CATEGORY_COLOURS[row.category] }}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-white truncate">{row.title}</div>
                  <div className="text-[9px] text-clinical-subtle uppercase tracking-wider">
                    {row.category}
                    {caseHistory.length > 1 && ` · ${caseHistory.length} runs`}
                  </div>
                </div>
                {historyRatios.length > 1 && (
                  <div className="hidden sm:flex items-end gap-px h-6 mr-1">
                    {historyRatios.slice(-6).map((r, i) => (
                      <div
                        key={i}
                        className="w-1 rounded-t"
                        style={{
                          height: `${Math.max(8, r * 100)}%`,
                          backgroundColor: gradeColour(r),
                        }}
                        title={`${(r * 100).toFixed(0)}%`}
                      />
                    ))}
                  </div>
                )}
                <div className="text-right font-mono">
                  <div className="text-white">
                    {row.score.toFixed(1)}/{row.max.toFixed(1)}
                  </div>
                  <div className="text-[9px]" style={{ color: gradeColour(row.ratio) }}>
                    {(row.ratio * 100).toFixed(0)}%
                  </div>
                </div>
              </li>
              );
            })}
          </ul>
        </details>
      )}
      <Suspense fallback={null}>
        {practice && (
          <PracticeDecisionModal
            caseDef={practice.caseDef}
            decisionId={practice.decisionId}
            onClose={() => setPractice(null)}
          />
        )}
        {quiz && (
          <QuizModal
            quiz={quiz}
            resolveCase={(id) => catalogue.find((c) => c.id === id)}
            onClose={() => setQuiz(null)}
          />
        )}
        {exam && (
          <ExamModal
            exam={exam.items}
            config={exam.config}
            presetName={exam.preset}
            resolveCase={(id) => catalogue.find((c) => c.id === id)}
            onClose={() => setExam(null)}
          />
        )}
        {educatorOpen && (
          <EducatorModal open={educatorOpen} onClose={() => setEducatorOpen(false)} />
        )}
        {analyticsOpen && (
          <AnalyticsModal open={analyticsOpen} onClose={() => setAnalyticsOpen(false)} />
        )}
        {duelOpen && (
          <DuelModal pool={catalogue} onClose={() => setDuelOpen(false)} />
        )}
        {flashcardsOpen && (() => {
          const playedIds = Object.keys(bestScores);
          const built = buildFlashcards(catalogue, playedIds.length > 0 ? playedIds : undefined);
          const deck = shuffleFlashcards(built, Math.floor(Date.now() / 86400000));
          return <FlashcardsModal deck={deck} onClose={() => setFlashcardsOpen(false)} />;
        })()}
      </Suspense>
    </section>
  );
}

function Mini({ label, value, colour }: { label: string; value: string; colour?: string }) {
  return (
    <div className="rounded border border-clinical-border bg-clinical-bg/40 px-2 py-1">
      <div className="text-[9px] uppercase tracking-wider text-clinical-subtle">{label}</div>
      <div
        className="font-mono text-[11px] text-white"
        style={colour ? { color: colour } : undefined}
      >
        {value}
      </div>
    </div>
  );
}
