// Service Worker for Production PWA

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    })
  );
  self.clients.claim();
});

// Network-first strategy ONLY for local origin assets
self.addEventListener('fetch', (event) => {
  // Only intercept GET requests to our own origin
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Never intercept dev server localhost or HMR requests
  if (event.request.url.includes('localhost') || event.request.url.includes('127.0.0.1')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
