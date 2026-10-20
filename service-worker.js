/* --------------------------------------------------------
  Author: David Bridge
  Last updated: 2026-10-20
  Countdown PWA Service Worker
--------------------------------------------------------- */

const CACHE_NAME = "trip-countdown-v6";   // bump this on every update

const ASSETS = [
    "/countdown/",
    "/countdown/index.html",
    "/countdown/settings.html",
    "/countdown/manifest.json",

    "/countdown/scripts/data.js",
    "/countdown/scripts/countdown.js",
    "/countdown/scripts/settings.js",
    "/countdown/scripts/snow.js",

    "/countdown/styles/countdown.css",
    "/countdown/styles/snow.css",

    "/countdown/assets/icon-192.png",
    "/countdown/assets/icon-512.png",
    "/countdown/assets/background.png"
];

// ------------------------------------------------------------
// Install: cache assets and activate immediately
// ------------------------------------------------------------
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

// ------------------------------------------------------------
// Activate: delete old caches
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
// Fetch: network-first for HTML, stale-while-revalidate for others
// ------------------------------------------------------------
self.addEventListener("fetch", event => {
    const request = event.request;

    // HTML navigation → network-first
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request).catch(() => caches.match("/countdown/index.html"))
        );
        return;
    }

    // CSS/JS/JSON/images → stale-while-revalidate
    event.respondWith(
        caches.match(request).then(cached => {
            const networkFetch = fetch(request).then(response => {
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(request, response.clone());
                });
                return response;
            });

            return cached || networkFetch;
        })
    );
});
