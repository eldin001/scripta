const CACHE_NAME = 'scripta-cache-v1';
const urlsToCache = [
    './',  // Cache la homepage
    './index.html',
    './style.css',
    './script.js',
    './icon.png',
    // Aggiungi altri file che vuoi cache
];

// Installazione del Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching app shell');
                return cache.addAll(urlsToCache);
            })
    );
});

// Attivazione del Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Gestione delle richieste
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Risponde dalla cache se disponibile, altrimenti esegue la richiesta di rete
                return response || fetch(event.request);
            })
    );
});