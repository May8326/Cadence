const CACHE = 'cadence-pwa-v6'; // v2 -> v3 : force le renouvellement du cache

const APP = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg','./integrations/todoist.js','./integrations/todoist-client.json','./integrations/google-calendar.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(APP))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;

        return fetch(event.request)
          .then(response => {
            // Ne mettre en cache que les réponses valides (évite de figer une 404/500)
            if (response && response.ok) {
              const copy = response.clone();
              caches.open(CACHE)
                .then(cache => cache.put(event.request, copy))
                .catch(() => {});
            }
            return response;
          })
          .catch(() => caches.match('./index.html'));
      })
  );
});
