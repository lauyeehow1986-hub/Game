import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { captureInstallPrompt, registerServiceWorker } from './lib/sw-register';

// Capture beforeinstallprompt before React even mounts so we don't miss it.
captureInstallPrompt();
registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
