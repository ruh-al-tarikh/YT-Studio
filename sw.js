const CACHE_NAME = 'ruh-al-tarikh-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/manuscript.css',
  '/js/app.js',
  '/js/citation.js',
  '/js/search.js',
  '/js/script.js',
  '/js/ai.js',
  '/js/research.js',
  '/js/islamic.js',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400..900&family=Manrope:wght@200..800&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@100..900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
