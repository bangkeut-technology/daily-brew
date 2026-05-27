/*
 * DailyBrew service worker (hand-written, no build-step precache manifest so it
 * stays Turbopack-safe). Strategy:
 *   - /api, /oauth, token refresh        → network only, never cached (auth/data)
 *   - /_next/static immutable assets      → cache-first
 *   - navigations (HTML)                  → network-first, fall back to cache offline
 *   - other GETs                          → stale-while-revalidate
 */
const VERSION = "v1";
const STATIC_CACHE = `db-static-${VERSION}`;
const PAGES_CACHE = `db-pages-${VERSION}`;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => !k.endsWith(VERSION)).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never touch the API / OAuth / auth surfaces — always go to the network.
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/oauth/") ||
    url.pathname.startsWith("/.well-known/")
  ) {
    return;
  }

  // Immutable build assets → cache-first.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // HTML navigations → network-first so auth/redirects stay fresh.
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, PAGES_CACHE));
    return;
  }

  // Everything else (images, fonts) → stale-while-revalidate.
  event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) (await caches.open(cacheName)).put(request, response.clone());
  return response;
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) (await caches.open(cacheName)).put(request, response.clone());
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw new Error("offline and not cached");
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request);
  const network = fetch(request)
    .then(async (response) => {
      if (response.ok) (await caches.open(cacheName)).put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || network;
}
