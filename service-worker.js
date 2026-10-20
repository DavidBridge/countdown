// ------------------------------------------------------------
// Trip Countdown PWA Service Worker
// ------------------------------------------------------------

const CACHE_NAME = "trip-countdown-v1";

// All static assets required for offline operation
const ASSETS = [
    "/countdown/",
    "/countdown/index.html",
    "/countdown/settings.html",
    "/countdown/manifest.json",

    "/countdown/scripts/data.js",
    "/countdown/scripts/countdown.js",
    "/countdown/scripts/settings.js",

    "/countdown/styles/countdown.css",
    "/countdown/styles/settings.css",

    "/countdown/assets/icon-192.png",
    "/countdown/assets/icon-512.png",
    "/countdown/assets/background.png"

];

// ------------------------------------------------------------
// Install: cache all static assets
// ------------------------------------------------------------
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// ------------------------------------------------------------
// Activate: clean up old caches
// ------------------------------------------------------------
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// ------------------------------------------------------------
// Fetch: network-first for HTML, cache-first for everything else
// ------------------------------------------------------------
self.addEventListener("fetch", event => {
    const request = event.request;

    // HTML pages → network-first (ensures updates)
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request).catch(() => caches.match("/countdown/index.html"))
        );
        return;
    }

    // Static assets → cache-first
    event.respondWith(
        caches.match(request).then(cached => {
            return (
                cached ||
                fetch(request).then(response => {
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, response.clone());
                        return response;
                    });
                })
            );
        })
    );
});
