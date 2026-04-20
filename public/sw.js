const CACHE_NAME = 'plyaz-v3';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Skip cross-origin requests
    if (url.origin !== self.location.origin) return;

    // Skip API routes — always go network-only, never cache
    if (url.pathname.startsWith('/api/')) return;

    // Skip Next.js internals
    if (url.pathname.startsWith('/_next/')) return;

    // Network-first for everything else
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => networkResponse)
            .catch(() => {
                // Offline fallback — only return cached response if it exists
                return caches.match(event.request).then(async (cached) => {
                    if (cached) return cached;
                    // Return a proper offline response rather than undefined
                    return new Response('Offline', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: { 'Content-Type': 'text/plain' },
                    });
                });
            })
    );
});
