import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './ui/ErrorBoundary';
import './index.css';
import { captureInstallPrompt, registerServiceWorker } from './lib/sw-register';

// Capture beforeinstallprompt before React even mounts so we don't miss it.
captureInstallPrompt();
registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);

// Once the first paint is done, prefetch the lazy chunks the user is most
// likely to hit next: starting a case fires DecisionModal then ResultsModal,
// and the canvas mount loads PhaserGame. Browsers cache the requests so when
// the React lazy() triggers, the module is already in the HTTP cache and
// resolves synchronously. Skipped on data-saver connections.
const idle =
  typeof window !== 'undefined' && 'requestIdleCallback' in window
    ? window.requestIdleCallback
    : (cb: () => void) => window.setTimeout(cb, 1500);
idle(() => {
  const conn = (navigator as { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return;
  void import('./game/PhaserGame');
  void import('./ui/modals/DecisionModal');
  void import('./ui/modals/ResultsModal');
  void import('./ui/panels/TrendsPanel');
});
