import * as Sentry from "@sentry/nuxt";
import { H3Event } from "h3";

const CACHE_ADDRESS = "nitro:fs-lite";

/**
 * Normalizes a request path by replacing numeric path segments (Discord snowflake IDs,
 * numeric IDs) with :id placeholders to keep metric cardinality bounded.
 */
export function getMetricRoute(event: H3Event): string {
	const { method } = event.node.req;
	const { pathname } = getRequestURL(event);
	const normalized = pathname
		.replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, "/:id")
		.replace(/\/[\w-]{20,}/g, "/:id");
	return `${method ?? "UNKNOWN"} ${normalized}`;
}

export function extractStatusCode(error: unknown): number {
	if (
		error &&
		typeof error === "object" &&
		"statusCode" in error &&
		typeof error.statusCode === "number"
	) {
		return error.statusCode;
	}
	if (
		error &&
		typeof error === "object" &&
		"status" in error &&
		typeof error.status === "number"
	) {
		return error.status;
	}
	return 500;
}

/**
 * Wraps a cache read operation in a Sentry cache.get span.
 * Sets cache.hit, cache.key, and cache.item_size attributes per Sentry caches module spec.
 */
export async function instrumentCacheGet<T>(
	key: string,
	fn: () => Promise<T | null>,
): Promise<T | null> {
	return Sentry.startSpan(
		{
			name: key,
			attributes: {
				"cache.key": [key],
				"network.peer.address": CACHE_ADDRESS,
			},
			op: "cache.get",
		},
		async (span) => {
			const value = await fn();
			const cacheHit = value !== null && value !== undefined;
			span.setAttribute("cache.hit", cacheHit);
			if (cacheHit) {
				span.setAttribute("cache.item_size", JSON.stringify(value).length);
			}
			return value;
		},
	);
}

/**
 * Wraps a cache write operation in a Sentry cache.put span.
 * Sets cache.key and cache.item_size attributes per Sentry caches module spec.
 */
export async function instrumentCachePut(
	key: string,
	fn: () => Promise<void>,
	itemSize?: number,
): Promise<void> {
	return Sentry.startSpan(
		{
			name: key,
			attributes: {
				"cache.key": [key],
				"network.peer.address": CACHE_ADDRESS,
				...(itemSize !== undefined && { "cache.item_size": itemSize }),
			},
			op: "cache.put",
		},
		async () => {
			await fn();
		},
	);
}

/**
 * Wraps a Discord REST API call in a Sentry span with proper attributes.
 * Tracks latency, success/failure status, and endpoint for span metrics.
 */
export async function instrumentDiscordApiCall<T>(
	endpoint: string,
	fn: () => Promise<T>,
	attributes?: Record<string, string>,
): Promise<T> {
	return Sentry.startSpan(
		{
			name: `discord.api ${endpoint}`,
			op: "http.client.discord",
			attributes: {
				"server.address": "discord.com",
				"discord.endpoint": endpoint,
				...attributes,
			},
		},
		async (span) => {
			try {
				const result = await fn();
				span.setStatus({ code: 1, message: "ok" });
				return result;
			} catch (error) {
				span.setStatus({ code: 2, message: "internal_error" });
				span.setAttribute(
					"error.type",
					error instanceof Error ? error.constructor.name : "UnknownError",
				);
				throw error;
			}
		},
	);
}

export async function withApiMetrics<T>(event: H3Event, fn: () => Promise<T>): Promise<T> {
	const startTime = Date.now();
	const route = getMetricRoute(event);
	const method = event.node.req.method ?? "unknown";

	return Sentry.startSpan(
		{
			name: route,
			op: "http.server.handler",
			attributes: {
				"http.route": route,
				"http.method": method,
			},
		},
		async (span) => {
			try {
				const result = await fn();
				span.setStatus({ code: 1, message: "ok" });
				return result;
			} catch (error) {
				const statusCode = extractStatusCode(error);
				span.setAttribute("http.status_code", statusCode);
				span.setStatus({ code: 2, message: "internal_error" });
				Sentry.metrics.count("api.error", 1, {
					attributes: { route, status: String(statusCode) },
				});
				throw error;
			} finally {
				Sentry.metrics.count("api.request", 1, {
					attributes: { route, method },
				});
				Sentry.metrics.distribution("api.request.duration", Date.now() - startTime, {
					unit: "millisecond",
					attributes: { route },
				});
			}
		},
	);
}

/**
 * Wraps a WolfStar bot API call in a Sentry span with proper attributes.
 * Tracks latency, success/failure status, and endpoint for span metrics.
 */
export async function instrumentBotApiCall<T>(
	endpoint: string,
	fn: () => Promise<T>,
	attributes?: Record<string, string>,
): Promise<T> {
	return Sentry.startSpan(
		{
			name: `bot.api ${endpoint}`,
			op: "http.client.bot",
			attributes: {
				"bot.endpoint": endpoint,
				...attributes,
			},
		},
		async (span) => {
			try {
				const result = await fn();
				span.setStatus({ code: 1, message: "ok" });
				return result;
			} catch (error) {
				span.setStatus({ code: 2, message: "internal_error" });
				span.setAttribute(
					"error.type",
					error instanceof Error ? error.constructor.name : "UnknownError",
				);
				throw error;
			}
		},
	);
}
