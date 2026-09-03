// Cache-first service worker for this fully static site. CACHE_VERSION is a
// placeholder swapped for the deploy commit SHA by the CI `deploy` job (see
// .github/workflows/ci.yml) so every deploy gets its own cache name; the
// `activate` handler deletes any cache that doesn't match the current
// version, so returning visitors pick up new JS/CSS instead of being stuck
// on a stale cache indefinitely.
const CACHE_VERSION = 'dev';
const CACHE_NAME = `calc-suite-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  'index.html',
  'manifest.json',
  'css/style.css',
  'js/calc-lib.js',
  'js/calculators-registry.js',
  'js/calculators.js',
  'js/i18n.js',
  'js/i18n/es.js',
  'js/i18n/it.js',
  'js/i18n/fr.js',
  'js/i18n/zh.js',
  'js/i18n/hi.js',
  'js/i18n/de.js',
  'js/i18n/pt.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        if (response.ok && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return response;
      });
    }).catch(() => caches.match('index.html'))
  );
});
