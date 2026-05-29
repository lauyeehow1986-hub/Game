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
import { TrendsPanel } from './ui/panels/TrendsPanel';
import { DecisionModal } from './ui/modals/DecisionModal';
import { ResultsModal } from './ui/modals/ResultsModal';
import { RunReviewModal } from './ui/modals/RunReviewModal';
import { WhatsNewModal } from './ui/modals/WhatsNewModal';
import { Tutorial } from './ui/Tutorial';
import { ResumePrompt } from './ui/ResumePrompt';
import { DisclaimerBanner } from './ui/DisclaimerBanner';
import { StreakDefenseBanner } from './ui/StreakDefenseBanner';
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

export default function App() {
  const mode = useMode((s) => s.mode);
  const t = useT();
  return (
    <div className="h-full flex flex-col">
      <a href="#main-content" className="skip-link">{t('a11y.skip')}</a>
      <HUD />
      <DisclaimerBanner />
      <StreakDefenseBanner />
      <InstallPrompt />

      <main id="main-content" className="flex-1 grid grid-cols-1 lg:grid-cols-[300px_1fr_340px] gap-2 sm:gap-3 p-2 sm:p-3 min-h-0 overflow-y-auto lg:overflow-hidden">
        <aside className="space-y-2 sm:space-y-3 lg:overflow-y-auto scrollbar-thin order-2 lg:order-1">
          {mode === 'case' ? (
            <>
              <CaseList />
              <CurriculumPanel />
              <TrendsPanel />
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
      <AchievementToast />
      <LiveAnnouncer />
      <KeyboardHelpModal />
      <RealtimeTicker />
    </div>
  );
}
