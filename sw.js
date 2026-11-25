/* Coach Palestra – service worker: tiene in memoria i file dell'app, così funziona senza internet. */
const VERSIONE = 'cp-v5';
const FILE = ['./', 'index.html', 'style.css', 'scheda.js', 'dettagli.js', 'anim.js', 'corpo.js', 'app.js', 'stats.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  // cache: 'reload' = scarica sempre i file nuovi dal server, mai quelli vecchi rimasti in memoria nel browser
  e.waitUntil(caches.open(VERSIONE).then(c => c.addAll(FILE.map(f => new Request(f, { cache: 'reload' })))));
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
