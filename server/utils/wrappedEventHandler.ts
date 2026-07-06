import type { UserSessionRequired } from "#auth-utils";
import type { EventHandler, EventHandlerRequest, H3Error, H3Event } from "h3";
import type { CacheOptions } from "nitropack/types";
import { createHash } from "node:crypto";
import { type PartialRateLimit, type RateLimit, RateLimitSchema } from "#shared/schemas";
import { cast, isObject } from "@sapphire/utilities";
import * as Sentry from "@sentry/nuxt";
import { useLogger, createError } from "evlog";
import { isDevelopment } from "std-env";
import { ValiError, parse } from "valibot";
import { instrumentCacheGet, instrumentCachePut, withApiMetrics } from "./sentry-metrics";

/**
 * Hash a string value for logging (privacy protection)
 */
function hashValue(value: string): string {
	return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

const rateLimitStorage = useStorage("wolfstar:ratelimiter");

interface DefinedWrappedResponseHandlerOptions {
	onError?: (logger: ReturnType<typeof useLogger>, error: any | Error | H3Error) => void;
	auth?: boolean;
	rateLimit?: PartialRateLimit;
}

interface DefinedWrappedCachedResponseHandlerOptions
	extends DefinedWrappedResponseHandlerOptions, CacheOptions {}

/**
 * Extracts a unique identifier for rate limiting purposes
 * @param event - The H3 event object
 * @param session - The user session (if authenticated)
 * @param ipHeader - Custom header to use for IP detection (optional)
 * @returns User ID if authenticated, otherwise IP address
 */
function getIdentifier(
	event: H3Event,
	session: UserSessionRequired | null,
	ipHeader?: string,
): string {
	if (session) {
		return session.user.id;
	}

	// Try custom IP header first if provided
	if (ipHeader) {
		const customIp = event.headers.get(ipHeader);
		if (customIp) {
			return customIp;
		}
	}

	// Fallback to standard IP detection
	return (
		getRequestIP(event, { xForwardedFor: true }) ??
		event.node.req.socket.remoteAddress ??
		event.headers.get("X-Real-IP") ??
		event.headers.get("X-Cluster-Client-IP") ??
		"unknown"
	);
}

function normalizeRateLimitOptions(
	options: PartialRateLimit | undefined,
	log: ReturnType<typeof useLogger>,
): RateLimit {
	try {
		// Validate and normalize — valibot applies schema defaults for missing fields
		return parse(RateLimitSchema, options ?? {});
	} catch (error) {
		if (error instanceof ValiError) {
			isDevelopment && log.warn("Rate limit options validation failed, using defaults");
		}

		// Fallback to defaults on validation error
		return parse(RateLimitSchema, {});
	}
}

async function getUserSession(
	options: DefinedWrappedResponseHandlerOptions,
	event: H3Event,
): Promise<UserSessionRequired | null> {
	if (options.auth) {
		return await requireUserSession(event);
	}
	return null;
}

async function applyWrappedHandlerLogic<T extends EventHandlerRequest, D>(
	event: H3Event<T>,
	handler: EventHandler<T, D>,
	options: DefinedWrappedResponseHandlerOptions,
) {
	const log = useLogger(event, "wrappedHandler");
	const session = await getUserSession(options, event);
	const id = getIdentifier(event, session, options.rateLimit?.ipHeader);

	// Normalize options (includes new `scope`)
	const {
		enabled,
		limit,
		window: windowMs,
		type: windowType,
		scope,
		whitelist,
	} = normalizeRateLimitOptions(options.rateLimit, log);

	// Check if IP is whitelisted (skip rate limiting for whitelisted IPs)
	if (!session && whitelist.length > 0 && whitelist.includes(id)) {
		return await handler(event);
	}

	// Build storage key: global (per-user) by default, or method:path:user when scope === 'route'
	const { req } = event.node;
	const { method } = req;
	const { pathname } = getRequestURL(event);
	const normalizedPath =
		pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
	const scopeKey = `${method}:${normalizedPath}`;
	const storageKey =
		scope === "route" ? `rate-limiter-state:${scopeKey}:${id}` : `rate-limiter-state:${id}`;

	const savedState = await instrumentCacheGet(storageKey, () =>
		rateLimitStorage.getItem(storageKey),
	);
	const initialState =
		savedState && isObject(savedState) ? cast<Record<string, unknown>>(savedState) : {};

	// If rate limiting is disabled, run handler immediately
	if (!enabled) {
		return await handler(event);
	}

	const now = Date.now();

	// Helper: persist state safely
	async function persistState(state: Record<string, unknown> | null) {
		try {
			if (state) {
				await instrumentCachePut(storageKey, () =>
					rateLimitStorage.setItem(storageKey, state),
				);
			}
		} catch {}
	}

	switch (windowType) {
		// Fixed-window algorithm
		case "fixed": {
			const state = (initialState as { windowStart?: number; count?: number }) ?? {};
			let windowStart = typeof state.windowStart === "number" ? state.windowStart : now;
			let count = typeof state.count === "number" ? state.count : 0;

			// Reset window if expired
			if (now >= windowStart + windowMs) {
				windowStart = now;
				count = 0;
			}

			const remaining = Math.max(0, limit - count);

			if (remaining <= 0) {
				const msUntilReset = windowStart + windowMs - now;
				const timeForInterval = windowStart + windowMs;
				log.info("The rate limit has been exceeded", {
					idHash: hashValue(id),
					limit,
					windowType: "fixed",
					resetIn: msUntilReset,
				});
				setResponseHeader(event, "x-ratelimit-limit", limit);
				setResponseHeader(event, "x-ratelimit-remaining", 0);
				setResponseHeader(event, "x-ratelimit-reset", Math.floor(timeForInterval / 1000));
				setResponseHeader(event, "retry-after", Math.ceil(msUntilReset / 1000));

				Sentry.metrics.count("rate_limit.hit", 1, {
					attributes: { route: scopeKey, window_type: windowType },
				});

				const rateLimitSpan = Sentry.getActiveSpan();
				if (rateLimitSpan) {
					rateLimitSpan.setAttribute("rate_limit.hit", true);
					rateLimitSpan.setAttribute("rate_limit.route", scopeKey);
					rateLimitSpan.setAttribute("rate_limit.window_type", windowType);
				}

				throw createError({
					message: `Too Many Requests. Try again in ${msUntilReset}ms`,
					why: "The number of requests has exceeded the configured limit for this time window",
					fix: "Wait until the rate limit resets before making more requests",
					status: 429,
				});
			}

			// Reserve a token before running the handler to avoid races
			count += 1;
			await persistState({ count, windowStart });

			const remainingAfter = Math.max(0, limit - count);
			setResponseHeader(event, "x-ratelimit-limit", limit);
			setResponseHeader(event, "x-ratelimit-remaining", remainingAfter);
			setResponseHeader(
				event,
				"x-ratelimit-reset",
				Math.floor((windowStart + windowMs) / 1000),
			);
			setResponseHeader(event, "date", new Date().toUTCString());

			try {
				const res = await handler(event);
				return res;
			} catch (error) {
				// On handler error, try to roll back the reserved token so failures don't consume quota
				try {
					const cur = (await rateLimitStorage.getItem(storageKey)) as {
						count?: number;
					} | null;
					if (cur && typeof cur.count === "number" && cur.count > 0) {
						cur.count = Math.max(0, cur.count - 1);
						await persistState(cur as Record<string, unknown>);
					}
				} catch {}
				throw error;
			}
		}

		// Sliding-window algorithm (store timestamps)
		case "sliding": {
			const state = (initialState as { timestamps?: number[] }) ?? {};
			const rawTimestamps = Array.isArray(state.timestamps)
				? state.timestamps.filter((t): t is number => typeof t === "number")
				: [];
			const windowLowerBound = now - windowMs;
			const timestamps = rawTimestamps.filter((t) => t > windowLowerBound);

			if (timestamps.length >= limit) {
				const oldest = timestamps?.[0] ?? now;
				const msUntilReset = oldest + windowMs - now;
				const timeForInterval = oldest + windowMs;
				log.info("The rate limit has been exceeded", {
					idHash: hashValue(id),
					limit,
					windowType: "sliding",
					resetIn: msUntilReset,
				});
				setResponseHeader(event, "x-ratelimit-limit", limit);
				setResponseHeader(event, "x-ratelimit-remaining", 0);
				setResponseHeader(event, "x-ratelimit-reset", Math.floor(timeForInterval / 1000));
				setResponseHeader(event, "retry-after", Math.ceil(msUntilReset / 1000));

				Sentry.metrics.count("rate_limit.hit", 1, {
					attributes: { route: scopeKey, window_type: windowType },
				});

				const rateLimitSpan = Sentry.getActiveSpan();
				if (rateLimitSpan) {
					rateLimitSpan.setAttribute("rate_limit.hit", true);
					rateLimitSpan.setAttribute("rate_limit.route", scopeKey);
					rateLimitSpan.setAttribute("rate_limit.window_type", windowType);
				}

				throw createError({
					message: `Too Many Requests. Try again in ${msUntilReset}ms`,
					why: "The number of requests has exceeded the configured limit for this time window",
					fix: "Wait until the rate limit resets before making more requests",
					status: 429,
				});
			}

			// Accept request: append timestamp and persist
			timestamps.push(now);
			await persistState({ timestamps });

			const oldest = timestamps[0] ?? now;
			setResponseHeader(event, "x-ratelimit-limit", limit);
			setResponseHeader(
				event,
				"x-ratelimit-remaining",
				Math.max(0, limit - timestamps.length),
			);
			setResponseHeader(event, "x-ratelimit-reset", Math.floor((oldest + windowMs) / 1000));
			setResponseHeader(event, "date", new Date().toUTCString());

			try {
				const res = await handler(event);
				return res;
			} catch (error) {
				// On handler error, remove the appended timestamp to avoid penalizing failing requests
				try {
					const cur = (await rateLimitStorage.getItem(storageKey)) as {
						timestamps?: number[];
					} | null;
					if (cur && Array.isArray(cur.timestamps)) {
						cur.timestamps = cur.timestamps.slice(0, -1);
						await persistState(cur as Record<string, unknown>);
					}
				} catch {}
				throw error;
			}
		}

		default:
	}
	// Fallback: if an unknown windowType is provided, just run the handler
	return await handler(event);
}

export function defineWrappedResponseHandler<T extends EventHandlerRequest, D>(
	handler: EventHandler<T, D>,
	options: DefinedWrappedResponseHandlerOptions = {
		auth: false,
		rateLimit: { enabled: true, limit: 5, type: "fixed", window: 10_000 },
	},
): EventHandler<T, D> {
	return defineEventHandler<T>(async (event) => {
		const log = useLogger(event);
		return withApiMetrics(event, async () => {
			try {
				return await applyWrappedHandlerLogic(event, handler, options);
			} catch (error) {
				if (options.onError && typeof options.onError === "function") {
					options.onError(log, error);
				}
				throw error;
			}
		});
	});
}

export function defineWrappedCachedResponseHandler<T extends EventHandlerRequest, D>(
	handler: EventHandler<T, D>,
	options: DefinedWrappedCachedResponseHandlerOptions = {
		auth: false,
		maxAge: 60 * 60,
		rateLimit: { enabled: true, limit: 5, type: "fixed", window: 10_000 },
		swr: true,
	},
): EventHandler<T, D> {
	const opts = omit(["rateLimit", "auth", "onError"], options);
	return cachedEventHandler<T>(async (event) => {
		const log = useLogger(event);
		return withApiMetrics(event, async () => {
			try {
				return await applyWrappedHandlerLogic(event, handler, options);
			} catch (error) {
				if (options.onError && typeof options.onError === "function") {
					options.onError(log, error);
				}
				throw error;
			}
		});
	}, opts);
}
