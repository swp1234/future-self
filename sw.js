const CACHE_NAME = 'future-self-v2';
const urlsToCache = [
    '/future-self/',
    '/future-self/index.html',
    '/future-self/css/style.css',
    '/future-self/js/i18n.js',
    '/future-self/js/quiz-data.js',
    '/future-self/js/app.js',
    '/future-self/manifest.json',
    '/future-self/icon-192.svg',
    '/future-self/icon-512.svg'
];

/* Install event */
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache).catch(err => {
                    console.log('Cache addAll error:', err);
                });
            })
            .then(() => self.skipWaiting())
    );
});

/* Activate event */
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
        }).then(() => self.clients.claim())
    );
});

/* Fetch event - network first, fallback to cache */
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    /* Skip external requests (ads, analytics, etc.) */
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (response && response.status === 200) {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            })
            .catch(() => {
                return caches.match(event.request)
                    .then((cached) => cached || caches.match('/future-self/index.html'));
            })
    );
});
