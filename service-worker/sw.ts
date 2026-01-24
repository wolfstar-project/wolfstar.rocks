/// <reference lib="WebWorker" />
/// <reference types="vite/client" />
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";

declare const self: ServiceWorkerGlobalScope;

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING")
    self.skipWaiting();
});

const entries = self.__WB_MANIFEST;
if (import.meta.env.DEV)
  entries.push({ url: "/", revision: Math.random().toString() });

precacheAndRoute(entries);

// clean old assets
cleanupOutdatedCaches();

let allowlist: undefined | RegExp[];
if (import.meta.env.DEV)
  allowlist = [/^\/$/];

let denylist: undefined | RegExp[];
if (import.meta.env.PROD) {
  denylist = [
    /^\/api\//,
    /^\/login\//,
    /^\/oauth\//,
    // exclude sw: if the user navigates to it, fallback to index.html
    /^\/sw.js$/,
    // exclude webmanifest: has its own cache
    /^\/manifest-(.*).webmanifest$/,
  ];
}

// only cache pages and external assets on local build + start or in production
if (import.meta.env.PROD) {
  // include webmanifest cache
  registerRoute(
    ({ request, sameOrigin }) =>
      sameOrigin && request.destination === "manifest",
    new NetworkFirst({
      cacheName: "wolfstar-webmanifest",
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        // we only need a few entries
        new ExpirationPlugin({ maxEntries: 100 }),
      ],
    }),
  );
}
// to allow work offline
registerRoute(new NavigationRoute(
  createHandlerBoundToURL("/"),
  { allowlist, denylist },
));
