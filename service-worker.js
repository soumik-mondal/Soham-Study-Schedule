const CACHE_NAME = 'study-schedule-v1';
const urlsToCache = [
  './', // Caches the root URL (index.html or study_scheduler.html)
  './index.html', // Or './study_scheduler.html' if you didn't rename it
  'https://cdn.tailwindcss.com', // Cache Tailwind CSS
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png'
  // Add any other assets your app uses (e.g., other CSS, JS files)
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});