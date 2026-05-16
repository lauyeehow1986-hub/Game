/**
 * Service-worker registration. Called once from main.tsx on app boot.
 *
 *  - In production, registers the SW at the same base path as the app.
 *  - In dev, never registers (avoid stale-cache friction during HMR).
 *  - Silent on failure — PWA installability is opportunistic, never required.
 */

export function registerServiceWorker(): void {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;
  if (import.meta.env.DEV) return;

  // The SW lives at <base>/sw.js. Vite's BASE_URL is /Game/ in prod.
  const swUrl = `${import.meta.env.BASE_URL}sw.js`;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(swUrl, { scope: import.meta.env.BASE_URL }).catch(() => {
      /* PWA is best-effort. Swallow registration failures silently. */
    });
  });
}

/**
 * Stash the beforeinstallprompt event on window so the InstallPrompt
 * component can call prompt() later. We listen as early as possible to
 * not miss it.
 */
declare global {
  interface Window {
    __sgPathwayInstallEvent?: Event & {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
    };
  }
}

export function captureInstallPrompt(): void {
  if (typeof window === 'undefined') return;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.__sgPathwayInstallEvent = e as Window['__sgPathwayInstallEvent'];
    // Surface as a custom event so the UI can react without polling.
    window.dispatchEvent(new CustomEvent('sg-pathway:installable'));
  });
  window.addEventListener('appinstalled', () => {
    window.__sgPathwayInstallEvent = undefined;
    window.dispatchEvent(new CustomEvent('sg-pathway:installed'));
  });
}
