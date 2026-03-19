/// <reference lib="WebWorker" />
/// <reference types="vite/client" />
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { clientsClaim } from "workbox-core";
import { ExpirationPlugin } from "workbox-expiration";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";

declare const self: ServiceWorkerGlobalScope;

clientsClaim();

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("message", (event) => {
	if (event.data && event.data.type === "SKIP_WAITING") {
		self.skipWaiting();
	}
});

// Only cache pages and external assets on local build + start or in production
if (import.meta.env.PROD) {
	// Include webmanifest cache
	registerRoute(
		({ request, sameOrigin }) => sameOrigin && request.destination === "manifest",
		new NetworkFirst({
			cacheName: "wolfstar-webmanifest",
			plugins: [
				new CacheableResponsePlugin({ statuses: [200] }),
				// We only need a few entries
				new ExpirationPlugin({ maxEntries: 100 }),
			],
		}),
	);

	// Cache external assets (CDNs)
	registerRoute(
		({ url }) =>
			url.origin === "https://cdn.discordapp.com" ||
			url.origin === "https://cdn.wolfstar.rocks" ||
			url.origin === "https://media.discordapp.net",
		new NetworkFirst({
			cacheName: "wolfstar-cdn-assets",
			plugins: [
				new CacheableResponsePlugin({ statuses: [200] }),
				// We only need a few entries
				new ExpirationPlugin({ maxAgeSeconds: 60 * 60 * 24 * 7, maxEntries: 100 }),
			],
		}),
	);
}
