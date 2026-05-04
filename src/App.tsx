import { HUD } from './ui/HUD';
import { TycoonDashboard } from './ui/panels/TycoonDashboard';
import { PatientPanel } from './ui/panels/PatientPanel';
import { CaseList } from './ui/panels/CaseList';
import { DecisionLog } from './ui/panels/DecisionLog';
import { DecisionModal } from './ui/modals/DecisionModal';
import { ResultsModal } from './ui/modals/ResultsModal';
import { PhaserGame } from './game/PhaserGame';

export default function App() {
  return (
    <div className="h-full flex flex-col">
      <HUD />

      <main className="flex-1 grid grid-cols-1 md:grid-cols-[280px_1fr_320px] gap-3 p-3 min-h-0">
        <aside className="space-y-3 overflow-y-auto scrollbar-thin">
          <CaseList />
          <PatientPanel />
        </aside>

        <section className="rounded-lg overflow-hidden border border-clinical-border bg-clinical-panel min-h-[420px]">
          <PhaserGame />
        </section>

        <aside className="space-y-3 overflow-y-auto scrollbar-thin">
          <TycoonDashboard />
          <DecisionLog />
        </aside>
      </main>

      <DecisionModal />
      <ResultsModal />
    </div>
  );
}
