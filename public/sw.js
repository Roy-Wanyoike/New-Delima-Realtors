/**
 * Delima Realtors — hand-written service worker (issue #67).
 * No build step: served verbatim from /public at /sw.js.
 *
 * Strategy summary:
 *  - Navigations → network-first, offline fallback to the cached shell "/".
 *  - Same-origin static assets (css/js/svg/png/woff2, /_next/static/) →
 *    cache-first with runtime cache fill.
 *  - /api/* → ALWAYS network, never cached, no fallback (fail through so
 *    the app's error states handle it).
 *  - Cross-origin requests → never intercepted.
 */
const CACHE = "delima-static-v1";
const PRECACHE = ["/", "/manifest.webmanifest", "/icon", "/logo.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // Individually tolerate failures — one missing asset must not break install.
      await Promise.allSettled(
        PRECACHE.map(async (url) => {
          try {
            const res = await fetch(new Request(url, { cache: "reload" }));
            if (res.ok) await cache.put(url, res);
          } catch {
            // Ignore: runtime caching will backfill later.
          }
        })
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE && key.startsWith("delima-"))
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

const isStaticAsset = (pathname) =>
  pathname.startsWith("/_next/static/") ||
  /\.(css|js|svg|png|woff2)$/.test(pathname);

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Cross-origin: skip entirely.
  if (url.origin !== self.location.origin) return;

  // API traffic: always network, never cached, no fallback.
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(request));
    return;
  }

  // Navigations: network-first, fall back to the cached shell.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request);
        } catch (err) {
          const cache = await caches.open(CACHE);
          const shell = (await cache.match("/")) || (await cache.match("/"));
          if (shell) return shell;
          return Response.error();
        }
      })()
    );
    return;
  }

  // Same-origin static assets: cache-first with runtime fill.
  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        const hit = await cache.match(request, { ignoreVary: true });
        if (hit) return hit;
        try {
          const res = await fetch(request);
          if (res && res.ok && res.type === "basic") {
            cache.put(request, res.clone());
          }
          return res;
        } catch (err) {
          return Response.error();
        }
      })()
    );
  }
});
