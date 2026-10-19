const CACHE_NAME = "trip-countdown-cache-v1";

const FILES_TO_CACHE = [
    "countdown.html",
    "styles/countdown.css",
    "scripts/countdown.js",
    "manifest.json",
    "assets/background.jpg",
    "assets/icon-192.png",
    "assets/icon-512.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
