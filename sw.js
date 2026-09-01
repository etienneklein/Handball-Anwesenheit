// Service Worker: legt die App auf dem Geraet ab, damit sie ohne Internet startet.
// WICHTIG: Bei jeder Aenderung an index.html die Versionsnummer erhoehen,
// sonst laedt das Handy weiter die alte Fassung.
const VERSION = 'anwesenheit-v2';

const DATEIEN = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Beim Installieren alles in den Cache legen
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION)
      .then(c => c.addAll(DATEIEN))
      .then(() => self.skipWaiting())
  );
});

// Alte Caches aufraeumen, sobald eine neue Version aktiv wird
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(namen => Promise.all(
        namen.filter(n => n !== VERSION).map(n => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

// Erst aus dem Cache bedienen, im Hintergrund nach Neuem schauen
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(treffer => {
      const netz = fetch(e.request).then(res => {
        if (res && res.ok) {
          const kopie = res.clone();
          caches.open(VERSION).then(c => c.put(e.request, kopie));
        }
        return res;
      }).catch(() => treffer);
      return treffer || netz;
    })
  );
});
