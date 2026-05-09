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
import { DecisionModal } from './ui/modals/DecisionModal';
import { ResultsModal } from './ui/modals/ResultsModal';
import { Tutorial } from './ui/Tutorial';
import { ResumePrompt } from './ui/ResumePrompt';
import { DisclaimerBanner } from './ui/DisclaimerBanner';
import { PhaserGame } from './game/PhaserGame';

export default function App() {
  return (
    <div className="h-full flex flex-col">
      <HUD />
      <DisclaimerBanner />

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[300px_1fr_340px] gap-3 p-3 min-h-0 overflow-y-auto lg:overflow-hidden">
        <aside className="space-y-3 lg:overflow-y-auto scrollbar-thin order-2 lg:order-1">
          <CaseList />
          <FacilityBrowser />
          <PatientPanel />
        </aside>

        <section className="rounded-lg overflow-hidden border border-clinical-border bg-clinical-panel min-h-[320px] lg:min-h-[420px] order-1 lg:order-2">
          <PhaserGame />
        </section>

        <aside className="space-y-3 lg:overflow-y-auto scrollbar-thin order-3">
          <FinancingPanel />
          <DataExchangePanel />
          <PandemicPanel />
          <TycoonDashboard />
          <DecisionLog />
          <CitationsPanel />
        </aside>
      </main>

      <DecisionModal />
      <ResultsModal />
      <Tutorial />
      <ResumePrompt />
    </div>
  );
}
