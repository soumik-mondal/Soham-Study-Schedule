const CACHE_NAME = 'soham-study-schedule-v1';
const ESSENTIAL_ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json'
];

// Install service worker
self.addEventListener('install', event => {
    console.log('Service Worker: Installing v1...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching essential assets');
                // Cache only essential files that exist
                return Promise.all(
                    ESSENTIAL_ASSETS.map(asset => {
                        return cache.add(asset).catch(err => {
                            console.log(`Service Worker: Could not cache ${asset}:`, err);
                        });
                    })
                );
            })
            .catch(err => {
                console.error('Service Worker: Cache open error:', err);
            })
    );
    
    // Force immediate activation
    self.skipWaiting();
});

// Fetch resources
self.addEventListener('fetch', event => {
    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    console.log('Service Worker: Fetching', event.request.url);
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached response if found
                if (response) {
                    console.log('Service Worker: Serving from cache:', event.request.url);
                    return response;
                }
                
                // Otherwise try to fetch from network
                return fetch(event.request)
                    .then(response => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }
                        
                        // Clone the response
                        const responseToCache = response.clone();
                        
                        // Cache successful responses for future use
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(error => {
                        console.log('Service Worker: Network fetch failed:', error);
                        // Return cached version if available, or offline page
                        return caches.match(event.request)
                            .then(response => response || new Response('Offline - this page is not cached'));
                    });
            })
            .catch(error => {
                console.log('Service Worker: Cache match error:', error);
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
    
    // Claim all clients immediately
    self.clients.claim();
});

console.log('Service Worker: Loaded and ready');
