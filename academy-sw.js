/* Squishee Academy offline cache. Served from the domain root so scope is /. */
const CACHE = "squishee-academy-root-v4";
const SHARE_IMAGE = "/og/squishee-academy.png";

async function precacheAll() {
  const cache = await caches.open(CACHE);
  const manifestUrl = new URL("precache-manifest.json", self.registration.scope);
  const res = await fetch(manifestUrl, { cache: "no-store" });
  if (!res.ok) throw new Error("precache manifest");
  const list = await res.json();
  if (!Array.isArray(list)) throw new Error("precache manifest");
  for (let i = 0; i < list.length; i += 8) {
    const slice = list.slice(i, i + 8);
    await Promise.all(
      slice.map(async (url) => {
        if (typeof url !== "string" || !url.startsWith("/")) throw new Error("precache url");
        const hit = await fetch(url);
        if (!hit.ok) throw new Error(url);
        await cache.put(url, hit);
      }),
    );
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(precacheAll().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key.startsWith("squishee-academy-") && key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Link-preview crawlers need the PNG itself. Do not intercept, cache, or replace it with the app shell.
  if (url.pathname === SHARE_IMAGE) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(async () => {
        const hit = await caches.match(req);
        if (hit) return hit;
        if (req.mode === "navigate") {
          const indexUrl = (url.pathname.endsWith("/") ? url.pathname : url.pathname + "/") + "index.html";
          const page =
            (await caches.match(url.pathname)) ||
            (await caches.match(indexUrl)) ||
            (await caches.match("/index.html")) ||
            (await caches.match("/"));
          if (page) return page;
        }
        return new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } });
      }),
  );
});
