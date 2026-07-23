// oxlint-disable no-console -- dev-only payload-cache diagnostics
import type { H3Event } from "h3";

/**
 * Runtime payload cache for ISR/cache-enabled public routes.
 *
 * Mirrors Nuxt's pre-render `payloadCache` at runtime (see npmx.dev PR #1643):
 * - HTML SSR for cacheable routes stashes a serialized payload on the event
 * - `_payload.json` requests check the cache first and skip a second SSR
 */

const PAYLOAD_URL_RE = /^[^?]*\/_payload\.json(?:\?.*)?$/;
const PAYLOAD_CACHE_STORAGE_KEY = "payload-cache";

/** Default TTL for cached payloads (seconds). */
const PAYLOAD_CACHE_TTL = 60;

/**
 * Grace period beyond TTL where stale payloads are still served (seconds).
 * Avoids a race where HTML is still cached but the payload entry just expired.
 */
const PAYLOAD_CACHE_STALE_TTL = PAYLOAD_CACHE_TTL * 2;

interface CachedPayload {
	body: string;
	buildId: string;
	cachedAt: number;
	headers: Record<string, string>;
	statusCode: number;
}

function getRouteFromPayloadUrl(url: string): string {
	const withoutQuery = url.replace(/\?.*$/, "");
	return withoutQuery.substring(0, withoutQuery.lastIndexOf("/")) || "/";
}

/**
 * Only cache public ISR/cache routes — never authenticated dashboard payloads.
 */
function shouldCachePayload(event: H3Event): boolean {
	const rules = getRouteRules(event);
	if (rules.auth) {
		return false;
	}
	return Boolean(rules.isr || rules.cache);
}

export default defineNitroPlugin((nitroApp) => {
	const storage = useStorage(PAYLOAD_CACHE_STORAGE_KEY);
	const buildId = String(useRuntimeConfig().app.buildId ?? "dev");

	function getCacheKey(routePath: string): string {
		return `${buildId}:${routePath}`;
	}

	nitroApp.hooks.hook("render:before", async (ctx) => {
		if (!PAYLOAD_URL_RE.test(ctx.event.path)) return;
		if (!shouldCachePayload(ctx.event)) return;

		const routePath = getRouteFromPayloadUrl(ctx.event.path);
		const cacheKey = getCacheKey(routePath);

		try {
			const cached = await storage.getItem<CachedPayload>(cacheKey);
			if (!cached) return;
			if (cached.buildId !== buildId) return;

			const age = (Date.now() - cached.cachedAt) / 1000;
			if (age > PAYLOAD_CACHE_STALE_TTL) return;

			if (import.meta.dev) {
				console.log(`[payload-cache] HIT: ${routePath} (age: ${age.toFixed(1)}s)`);
			}

			ctx.response = {
				body: cached.body,
				headers: cached.headers,
				statusCode: cached.statusCode,
				statusMessage: "OK",
			};
		} catch (error) {
			if (import.meta.dev) {
				console.warn(`[payload-cache] Cache read failed for ${routePath}:`, error);
			}
		}
	});

	nitroApp.hooks.hook("render:response", (response, ctx) => {
		if (!response.statusCode || response.statusCode >= 400) return;
		if (!shouldCachePayload(ctx.event)) return;

		const isPayloadRequest = PAYLOAD_URL_RE.test(ctx.event.path);
		const contentType = response.headers?.["content-type"];
		const isHtmlResponse = typeof contentType === "string" && contentType.includes("text/html");

		if (isPayloadRequest) {
			if (typeof response.body !== "string") return;
			const routePath = getRouteFromPayloadUrl(ctx.event.path);
			cachePayload(ctx.event, routePath, {
				body: response.body,
				headers: {
					"content-type": "application/json;charset=utf-8",
					"x-powered-by": "Nuxt",
				},
				statusCode: response.statusCode ?? 200,
			});
			return;
		}

		if (!isHtmlResponse) return;

		const cachedPayload = ctx.event.context._cachedPayloadResponse;
		if (!cachedPayload) return;

		const pathWithoutQuery = ctx.event.path.replace(/\?.*$/, "");
		const routePath = pathWithoutQuery === "/" ? "/" : pathWithoutQuery.replace(/\/$/, "");
		cachePayload(ctx.event, routePath, cachedPayload);
		delete ctx.event.context._cachedPayloadResponse;
	});

	function cachePayload(
		event: H3Event,
		routePath: string,
		payload: { body: string; headers: Record<string, string>; statusCode: number },
	) {
		const cacheKey = getCacheKey(routePath);
		const entry: CachedPayload = {
			...payload,
			buildId,
			cachedAt: Date.now(),
		};

		event.waitUntil?.(
			storage.setItem(cacheKey, entry).catch((error: unknown) => {
				if (import.meta.dev) {
					console.warn(`[payload-cache] Cache write failed for ${routePath}:`, error);
				}
			}),
		);

		if (import.meta.dev) {
			console.log(`[payload-cache] CACHED: ${routePath}`);
		}
	}
});

declare module "h3" {
	interface H3EventContext {
		_cachedPayloadResponse?: {
			body: string;
			headers: Record<string, string>;
			statusCode: number;
		};
	}
}
