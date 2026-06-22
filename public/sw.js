/* SG Pathway service worker.
 *
 * Strategy:
 *  - On install, precache the app shell (index.html + manifest + icons).
 *  - For navigation requests (HTML): network-first, fall back to cached shell.
 *  - For same-origin static assets (hashed JS/CSS/etc.): cache-first; if we
 *    don't have it yet, fetch from network and cache it.
 *  - For everything else (cross-origin, non-GET): pass through to network.
 *
 * Bump CACHE_VERSION when changing strategy to invalidate old caches.
 */
const CACHE_VERSION = 'sg-pathway-v9';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.svg',
  './icons/icon-512.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Navigation requests: network-first, fall back to cached shell.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('./index.html').then((m) => m || new Response('Offline', { status: 503 }))),
    );
    return;
  }

  // 3D binary assets (GLB cast / clips / HDRs): these keep stable filenames but
  // change in place across deploys, so pure cache-first would serve a stale
  // model forever (e.g. an old animation clip). Use stale-while-revalidate —
  // serve cache fast, refresh in the background so the next load self-heals
  // without needing a CACHE_VERSION bump.
  if (url.pathname.includes('/3d/')) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res && res.status === 200 && res.type !== 'opaque') {
              const copy = res.clone();
              caches.open(CACHE_VERSION).then((c) => c.put(req, copy)).catch(() => {});
            }
            return res;
          })
          .catch(() => cached || new Response('Offline', { status: 503 }));
        return cached || network;
      }),
    );
    return;
  }

  // Static assets: cache-first.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          // Don't cache opaque or error responses.
          if (!res || res.status !== 200 || res.type === 'opaque') return res;
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => cached || new Response('Offline', { status: 503 }));
    }),
  );
});
