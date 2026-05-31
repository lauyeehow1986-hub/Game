import { HUD } from './ui/HUD';
import { TycoonDashboard } from './ui/panels/TycoonDashboard';
import { PatientPanel } from './ui/panels/PatientPanel';
import { CaseList } from './ui/panels/CaseList';
import { DecisionLog } from './ui/panels/DecisionLog';
import { FinancingPanel } from './ui/panels/FinancingPanel';
import { FacilityBrowser } from './ui/panels/FacilityBrowser';
import { PandemicPanel } from './ui/panels/PandemicPanel';
import { DataExchangePanel } from './ui/panels/DataExchangePanel';
import { CitationsPanel } from './ui/panels/CitationsPanel';
import { CurriculumPanel } from './ui/panels/CurriculumPanel';
import { DisclaimerBanner } from './ui/DisclaimerBanner';
import { StreakDefenseBanner } from './ui/StreakDefenseBanner';
import { AssignmentBanner } from './ui/AssignmentBanner';
import { InstallPrompt } from './ui/InstallPrompt';
import { AchievementToast } from './ui/AchievementToast';
import { LiveAnnouncer } from './ui/LiveAnnouncer';
import { KeyboardHelpModal } from './ui/modals/KeyboardHelpModal';
import { RealtimeTicker } from './ui/RealtimeTicker';
import { useT } from './lib/i18n';
import { lazy, Suspense } from 'react';
import { useMode } from './state/modeStore';

// Phaser is ~1.5 MB minified. Lazy-loading it keeps the initial HTML
// payload tiny so HUD + panels paint immediately; the canvas swaps in
// once the chunk arrives.
const PhaserGame = lazy(() =>
  import('./game/PhaserGame').then((m) => ({ default: m.PhaserGame })),
);
const OpsPanel = lazy(() =>
  import('./ui/panels/OpsPanel').then((m) => ({ default: m.OpsPanel })),
);

// Modals that are mounted unconditionally but self-gate on state — they
// only render when their trigger fires (case complete, awaiting decision,
// ?run= URL, returning user, never-seen-tutorial). Lazy-loading moves
// their cost from initial paint to first show.
const DecisionModal = lazy(() =>
  import('./ui/modals/DecisionModal').then((m) => ({ default: m.DecisionModal })),
);
const ResultsModal = lazy(() =>
  import('./ui/modals/ResultsModal').then((m) => ({ default: m.ResultsModal })),
);
const RunReviewModal = lazy(() =>
  import('./ui/modals/RunReviewModal').then((m) => ({ default: m.RunReviewModal })),
);
const WhatsNewModal = lazy(() =>
  import('./ui/modals/WhatsNewModal').then((m) => ({ default: m.WhatsNewModal })),
);
const Tutorial = lazy(() =>
  import('./ui/Tutorial').then((m) => ({ default: m.Tutorial })),
);
const ResumePrompt = lazy(() =>
  import('./ui/ResumePrompt').then((m) => ({ default: m.ResumePrompt })),
);
// TrendsPanel pulls in personal-trends + quiz + decision-weakness analytics.
// It's a side panel — rendering it a beat after first paint is invisible to
// the user and saves ~30KB raw / ~12KB gzip off the index chunk.
const TrendsPanel = lazy(() =>
  import('./ui/panels/TrendsPanel').then((m) => ({ default: m.TrendsPanel })),
);
// New in v2.0: the Campaigns panel only matters to players who care about
// multi-case shifts. Lazy so it doesn't bloat the index for first-time
// players who just want to open one case.
const CampaignPanel = lazy(() =>
  import('./ui/panels/CampaignPanel').then((m) => ({ default: m.CampaignPanel })),
);
// New in v4.1: the adaptive study plan composes spaced retrieval, weakest
// practice, curriculum continuity, daily challenge and discovery into 5
// ranked things to do. Lazy + skeleton so first paint isn't blocked.
const StudyPlanPanel = lazy(() =>
  import('./ui/panels/StudyPlanPanel').then((m) => ({ default: m.StudyPlanPanel })),
);

export default function App() {
  const mode = useMode((s) => s.mode);
  const t = useT();
  return (
    <div className="h-full flex flex-col">
      <a href="#main-content" className="skip-link">{t('a11y.skip')}</a>
      <HUD />
      <DisclaimerBanner />
      <AssignmentBanner />
      <StreakDefenseBanner />
      <InstallPrompt />

      <main id="main-content" className="flex-1 grid grid-cols-1 lg:grid-cols-[300px_1fr_340px] gap-2 sm:gap-3 p-2 sm:p-3 min-h-0 overflow-y-auto lg:overflow-hidden">
        <aside className="space-y-2 sm:space-y-3 lg:overflow-y-auto scrollbar-thin order-2 lg:order-1">
          {mode === 'case' ? (
            <>
              <CaseList />
              <Suspense fallback={null}>
                <StudyPlanPanel />
              </Suspense>
              <Suspense
                fallback={
                  <div className="bg-clinical-panel border border-clinical-border rounded-lg p-3 text-clinical-subtle text-xs">
                    Loading campaigns…
                  </div>
                }
              >
                <CampaignPanel />
              </Suspense>
              <CurriculumPanel />
              <Suspense
                fallback={
                  <div className="bg-clinical-panel border border-clinical-border rounded-lg p-3 text-clinical-subtle text-xs">
                    Loading trends…
                  </div>
                }
              >
                <TrendsPanel />
              </Suspense>
              <FacilityBrowser />
              <PatientPanel />
            </>
          ) : (
            <>
              <Suspense fallback={<div className="text-clinical-subtle text-xs p-2">Loading Ops…</div>}>
                <OpsPanel />
              </Suspense>
              <FacilityBrowser />
            </>
          )}
        </aside>

        <section data-tour="canvas" className="rounded-lg overflow-hidden border border-clinical-border bg-clinical-panel min-h-[360px] lg:min-h-[420px] order-1 lg:order-2">
          <Suspense
            fallback={
              <div className="w-full h-full grid place-items-center text-clinical-subtle text-xs">
                Loading map…
              </div>
            }
          >
            <PhaserGame />
          </Suspense>
        </section>

        <aside className="space-y-2 sm:space-y-3 lg:overflow-y-auto scrollbar-thin order-3">
          {mode === 'case' ? (
            <>
              <FinancingPanel />
              <DataExchangePanel />
              <PandemicPanel />
              <TycoonDashboard />
              <DecisionLog />
              <CitationsPanel />
            </>
          ) : (
            <>
              <PandemicPanel />
              <TycoonDashboard />
              <CitationsPanel />
            </>
          )}
        </aside>
      </main>

      <Suspense fallback={null}>
        {mode === 'case' && (
          <>
            <DecisionModal />
            <ResultsModal />
            <ResumePrompt />
          </>
        )}
        <Tutorial />
        <RunReviewModal />
        <WhatsNewModal />
      </Suspense>
      <AchievementToast />
      <LiveAnnouncer />
      <KeyboardHelpModal />
      <RealtimeTicker />
    </div>
  );
}
