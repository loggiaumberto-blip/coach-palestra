/* Coach Palestra – service worker: tiene in memoria i file dell'app, così funziona senza internet. */
const VERSIONE = 'cp-v1';
const FILE = ['./', 'index.html', 'style.css', 'scheda.js', 'app.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSIONE).then(c => c.addAll(FILE)));
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const nomi = await caches.keys();
    await Promise.all(nomi.filter(n => n !== VERSIONE).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});
self.addEventListener('message', e => { if (e.data === 'AGGIORNA') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin || e.request.method !== 'GET') return;
  e.respondWith((async () => {
    const c = await caches.open(VERSIONE);
    return (await c.match(e.request, { ignoreSearch: true })) || fetch(e.request);
  })());
});
