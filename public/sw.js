// Ultra-minimal Service Worker for development
const CACHE_NAME = 'ai-humanizer-cache-v1';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([OFFLINE_URL]))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
      await self.clients.claim();
    })()
  );
});

// Offline fallback for navigations
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          return await fetch(event.request);
        } catch (error) {
          const cache = await caches.open(CACHE_NAME);
          const cached = await cache.match(OFFLINE_URL);
          return cached || new Response('Offline', { status: 503, statusText: 'Offline' });
        }
      })()
    );
  }
});