import { lazy, Suspense, useEffect, useState } from 'react';
import { listCases, getCase } from '../content';
import { useT } from '../lib/i18n';
import {
  assignmentRef,
  tryDecodeAssignment,
  type Assignment,
} from '../lib/assignment';
import { buildExam, EXAM_PRESETS } from '../lib/exam';
import { getCurriculum } from '../lib/curricula';
import { useGame } from '../state/gameStore';
import type { QuizItem } from '../lib/quiz';
import type { ExamConfig } from '../lib/exam';

const ExamModal = lazy(() =>
  import('./modals/ExamModal').then((m) => ({ default: m.ExamModal })),
);

/**
 * When the app is opened from an educator assignment link (?assign=...), show
 * a banner describing the assignment and a Start button. Exam assignments
 * launch the timed ExamModal (which then offers a completion token to return);
 * curriculum assignments start the first case in the curriculum.
 */
export function AssignmentBanner() {
  const t = useT();
  const startCase = useGame((s) => s.startCase);
  const resetRun = useGame((s) => s.resetRun);
  const status = useGame((s) => s.run.status);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [exam, setExam] = useState<{ items: QuizItem[]; config: ExamConfig; preset: string; ref: string } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const a = tryDecodeAssignment(window.location.href);
    if (a) setAssignment(a);
  }, []);

  if (!assignment || dismissed) return null;

  const start = () => {
    if (assignment.kind === 'exam') {
      const config = EXAM_PRESETS[assignment.target as keyof typeof EXAM_PRESETS] ?? EXAM_PRESETS.standard;
      const items = buildExam(listCases(), config.count);
      if (items.length > 0) {
        setExam({ items, config, preset: assignment.target, ref: assignmentRef(assignment) });
      }
    } else {
      const curr = getCurriculum(assignment.target);
      const firstId = curr?.caseIds[0];
      const c = firstId ? getCase(firstId) : undefined;
      if (c) {
        if (status !== 'idle') resetRun();
        startCase(c);
        setDismissed(true);
      }
    }
  };

  return (
    <>
      <div
        role="status"
        className="px-3 py-2 bg-clinical-accent/10 border-b border-clinical-accent/30 text-[12px] flex items-center justify-between gap-3"
      >
        <span className="text-white">
          📋 {t('assignment.banner', { title: assignment.title, pass: assignment.passPct })}
        </span>
        <span className="flex gap-2 shrink-0">
          <button
            onClick={start}
            className="px-3 py-1 rounded bg-clinical-accent text-white font-semibold text-[11px] hover:brightness-110"
          >
            {t('assignment.start')}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="px-2 py-1 text-clinical-subtle hover:text-white text-[11px]"
          >
            {t('common.close')}
          </button>
        </span>
      </div>
      <Suspense fallback={null}>
        {exam && (
          <ExamModal
            exam={exam.items}
            config={exam.config}
            presetName={exam.preset}
            assignmentRef={exam.ref}
            resolveCase={(id) => getCase(id)}
            onClose={() => setExam(null)}
          />
        )}
      </Suspense>
    </>
  );
}
