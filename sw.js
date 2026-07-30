const CACHE_NAME = 'speech-star-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS).catch(function(err) {
        console.log('Cache addAll error:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; })
          .map(function(n) { return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  if (e.request.mode === 'navigate') {
    /* Network-first for HTML pages so updates are picked up immediately */
    e.respondWith(
      fetch(e.request).then(function(response) {
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function(cache) { cache.put('./index.html', copy); });
        return response;
      }).catch(function() {
        return caches.match('./index.html');
      })
    );
  } else {
    /* Cache-first for other assets */
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  }
});
