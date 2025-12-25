const CACHE_NAME = 'soham-study-schedule-v1';

// Install service worker
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching app shell');
                // Only cache essential files that we know exist
                return cache.addAll([
                    './',
                    './index.html'
                ]).catch(err => {
                    console.log('Service Worker: Cache addAll error:', err);
                });
            })
    );
});

// Fetch resources
self.addEventListener('fetch', event => {
    console.log('Service Worker: Fetching', event.request.url);
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached response if found
                if (response) {
                    console.log('Service Worker: Serving from cache:', event.request.url);
                    return response;
                }
                
                // Otherwise fetch from network
                console.log('Service Worker: Fetching from network:', event.request.url);
                return fetch(event.request);
            })
            .catch(error => {
                console.log('Service Worker: Fetch failed:', error);
                // You could return a custom offline page here
            })
    );
});

// Clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
