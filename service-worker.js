/* ================================================================
   SVB Studio — Service Worker (PWA offline-first léger)
   Version bumpée à chaque déploiement → invalide le cache.
   ================================================================ */
const SVB_VERSION = 'svb-v3.8-2026-04-25-pass-starter-not-unit-session';
const SVB_PRECACHE = 'svb-precache-' + SVB_VERSION;
const SVB_RUNTIME  = 'svb-runtime-' + SVB_VERSION;

/* Assets cruciaux pour le premier load offline */
const PRECACHE_URLS = [
  '/',
  '/assets/svb.css',
  '/assets/svb.js',
  '/assets/tailwind.css',
  '/site.webmanifest',
  '/images/favicon.jpg',
  '/images/icon-192.png',
  '/images/icon-512.png',
];

/* ---- Install : pré-cache des assets critiques ---- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SVB_PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {/* tolerant */}))
      .then(() => self.skipWaiting())
  );
});

/* ---- Activate : nettoyage des vieux caches ---- */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== SVB_PRECACHE && k !== SVB_RUNTIME)
            .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ---- Fetch strategies ----
   - HTML : network-first (toujours voir les derniers changements)
   - Assets statiques (CSS/JS/images) : cache-first
   - Tiers (GTM, Sportigo, Calendly, fonts) : pass-through (pas de cache)
*/
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Pass-through tiers (Google, Sportigo, Calendly, WhatsApp)
  if (url.origin !== self.location.origin) return;

  // HTML: network first, fallback to cache
  const accept = req.headers.get('accept') || '';
  const isHTML = req.mode === 'navigate' || accept.includes('text/html');

  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(SVB_RUNTIME).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() =>
          caches.match(req).then((hit) => hit || caches.match('/'))
        )
    );
    return;
  }

  // Static assets: cache first, fallback to network
  if (/\.(css|js|png|jpg|jpeg|webp|svg|woff2?|ico)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(SVB_RUNTIME).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => hit))
    );
  }
});
