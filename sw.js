const CACHE_NAME = 'future-self-v1';
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

/* Fetch event - Network first, then cache */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    /* Only handle GET requests */
    if (request.method !== 'GET') {
        return;
    }

    /* Skip external analytics and ads */
    if (url.hostname.includes('googletagmanager') ||
        url.hostname.includes('googlesyndication') ||
        url.hostname.includes('pagead')) {
        event.respondWith(fetch(request).catch(() => {
            return new Response('', { status: 408 });
        }));
        return;
    }

    /* Network first strategy for HTML/CSS/JS */
    if (request.destination === 'document' ||
        request.destination === 'script' ||
        request.destination === 'style') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response && response.status === 200 && response.type === 'basic') {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(request, responseToCache);
                            });
                    }
                    return response;
                })
                .catch(() => {
                    return caches.match(request)
                        .then((response) => {
                            return response || new Response('Offline');
                        });
                })
        );
        return;
    }

    /* Cache first strategy for assets */
    event.respondWith(
        caches.match(request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(request)
                    .then((response) => {
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(request, responseToCache);
                            });
                        return response;
                    });
            })
            .catch(() => {
                /* Return a placeholder for failed image requests */
                if (request.destination === 'image') {
                    return new Response(
                        '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#f0f0f0" width="100" height="100"/></svg>',
                        { headers: { 'Content-Type': 'image/svg+xml' } }
                    );
                }
                return new Response('Offline');
            })
    );
});
