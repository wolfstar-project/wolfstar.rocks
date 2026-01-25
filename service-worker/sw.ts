/// <reference lib="WebWorker" />
/// <reference types="vite/client" />
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { clientsClaim } from "workbox-core";
import { ExpirationPlugin } from "workbox-expiration";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";

declare const self: ServiceWorkerGlobalScope;

self.skipWaiting();
clientsClaim();

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

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

  // cache external assets (CDNs)
  registerRoute(
    ({ url }) =>
      url.origin === "https://cdn.discordapp.com"
      || url.origin === "https://cdn.wolfstar.rocks",
    new NetworkFirst({
      cacheName: "wolfstar-cdn-assets",
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        // we only need a few entries
        new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 }),
      ],
    }),
  );
}
