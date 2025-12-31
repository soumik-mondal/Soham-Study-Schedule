const CACHE_NAME = 'soham-study-schedule-v4-' + Date.now();
const ESSENTIAL_ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json'
];

// Install service worker
self.addEventListener('install', event => {
    console.log('Service Worker: Installing v4 (cache busted)...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            // Delete all old caches
            const deletePromises = cacheNames.map(cacheName => {
                console.log('Service Worker: Deleting old cache:', cacheName);
                return caches.delete(cacheName);
            });
            return Promise.all(deletePromises);
        }).then(() => {
            // Now cache new assets
            return caches.open(CACHE_NAME)
                .then(cache => {
                    console.log('Service Worker: Caching essential assets');
                    return Promise.all(
                        ESSENTIAL_ASSETS.map(asset => {
                            return cache.add(asset).catch(err => {
                                console.log(`Service Worker: Could not cache ${asset}:`, err);
                            });
                        })
                    );
                });
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
    
    const url = event.request.url;
    
    // For script.js and other dynamic files, ALWAYS fetch from network
    if (url.includes('script.js') || url.includes('style.css') || url.includes('index.html')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    console.log('Service Worker: Fetching (network) from', url);
                    return response;
                })
                .catch(() => {
                    console.log('Service Worker: Failed to fetch', url);
                    return new Response('Network error', { status: 503 });
                })
        );
        return;
    }
    
    // For other assets, use cache-first strategy
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    console.log('Service Worker: Serving from cache:', url);
                    return response;
                }
                
                return fetch(event.request)
                    .then(response => {
                        console.log('Service Worker: Fetching', url);
                        
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }
                        
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        console.log('Service Worker: Failed to fetch', url);
                        return new Response('Network error', { status: 503 });
                    });
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
