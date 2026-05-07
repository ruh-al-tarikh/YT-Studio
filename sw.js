const CACHE_NAME = 'ruh-studio-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/manuscript.css',
  '/js/app.js',
  '/js/ai.js',
  '/js/dashboard.js',
  '/js/search.js',
  '/js/citation.js',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@400;700&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install event - caching static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Stale-While-Revalidate strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Strategy: Cache First for static assets, Stale-While-Revalidate for others
  if (STATIC_ASSETS.includes(url.pathname) || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
    );
  } else {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            // Cache a copy of the response
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Fallback for offline API requests could go here
            return cachedResponse;
          });

          return cachedResponse || fetchPromise;
        });
      })
    );
  }
});
