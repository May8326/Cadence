const CACHE = 'cadence-pwa-v25'; // stratégie « réseau d'abord » : plus besoin de changer ce numéro à chaque mise à jour

const APP = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg','./integrations/todoist.js','./integrations/todoist-client.json','./integrations/google-calendar.js','./integrations/drive-sync.js','./markdown.js'
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
  const request = event.request;
  if (request.method !== 'GET') return;

  // Seuls les fichiers de Cadence passent par ce cache. Les requêtes vers Google, Todoist, etc.
  // (agendas, synchronisation Drive…) ne doivent jamais être servies depuis un cache.
  if (new URL(request.url).origin !== self.location.origin) return;

  // Réseau d'abord : en ligne, on récupère toujours la dernière version publiée
  // (« no-cache » = vérification auprès du serveur, sans retélécharger si rien n'a changé).
  // Hors connexion, on utilise la dernière copie enregistrée.
  event.respondWith(
    fetch(request, { cache: 'no-cache' })
      .then(response => {
        // Ne mettre en cache que les réponses valides (évite de figer une 404/500)
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE)
            .then(cache => cache.put(request, copy))
            .catch(() => {});
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then(cached => cached || caches.match('./index.html'))
      )
  );
});
