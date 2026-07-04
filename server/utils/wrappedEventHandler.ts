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

type WrappedLogger = ReturnType<typeof useLogger<Record<string, unknown>>>;

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
	/**
	 * Per-request authorization (e.g. guild permission checks) that must run
	 * before any cached data resolution. Unlike the handler body, this executes
	 * on EVERY request — including warm cache hits — so revoked permissions are
	 * always enforced.
	 */
	authorize?: (event: H3Event, session: UserSessionRequired | null) => Promise<void> | void;
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

// In-process keyed mutex that serializes read-modify-write cycles per storage
// key. The production driver (Cloudflare KV over HTTP) exposes no atomic
// compare-and-swap primitive, so this bounds reservation races to the single
// server instance; cross-instance races remain possible and are an accepted
// limitation of the storage backend.
const rateLimitKeyLocks = new Map<string, Promise<unknown>>();

async function withKeyLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
	const previous = rateLimitKeyLocks.get(key) ?? Promise.resolve();
	const run = previous.catch(() => undefined).then(fn);
	const tail = run.catch(() => undefined);
	rateLimitKeyLocks.set(key, tail);
	try {
		return await run;
	} finally {
		// Only the last holder clears the entry; a queued waiter has already
		// replaced it synchronously with its own tail
		if (rateLimitKeyLocks.get(key) === tail) {
			rateLimitKeyLocks.delete(key);
		}
	}
}

interface FixedWindowState {
	windowStart?: number;
	count?: number;
}

interface SlidingWindowState {
	timestamps?: number[];
}

type Reservation =
	| { allowed: false; msUntilReset: number; resetAt: number }
	| {
			allowed: true;
			remaining: number;
			resetAt: number;
			/** Identifies this request's own reservation for targeted rollback */
			token: { windowStart: number } | { timestamp: number };
	  };

async function readRateLimitState(
	storageKey: string,
	log: WrappedLogger,
): Promise<Record<string, unknown> | null> {
	// Explicit fail-open policy: if the rate-limit storage cannot be read the
	// request proceeds without a reservation instead of turning storage outages
	// into a full API outage. Writes below share the same policy.
	try {
		const saved = await instrumentCacheGet(storageKey, () =>
			rateLimitStorage.getItem(storageKey),
		);
		return saved && isObject(saved) ? cast<Record<string, unknown>>(saved) : null;
	} catch (error) {
		log.warn(`Storage read failed for ${storageKey}: ${error}`);
		return null;
	}
}

async function persistRateLimitState(
	storageKey: string,
	state: Record<string, unknown>,
	log: WrappedLogger,
): Promise<void> {
	try {
		await instrumentCachePut(storageKey, () => rateLimitStorage.setItem(storageKey, state));
	} catch (error) {
		log.warn(`Storage write failed for ${storageKey}: ${error}`);
	}
}

async function reserveFixed(
	storageKey: string,
	limit: number,
	windowMs: number,
	log: WrappedLogger,
): Promise<Reservation> {
	return withKeyLock(storageKey, async () => {
		const now = Date.now();
		const state = (await readRateLimitState(storageKey, log)) as FixedWindowState | null;
		let windowStart = typeof state?.windowStart === "number" ? state.windowStart : now;
		let count = typeof state?.count === "number" ? state.count : 0;

		// Reset window if expired
		if (now >= windowStart + windowMs) {
			windowStart = now;
			count = 0;
		}

		const resetAt = windowStart + windowMs;
		if (limit - count <= 0) {
			return { allowed: false, msUntilReset: resetAt - now, resetAt };
		}

		count += 1;
		await persistRateLimitState(storageKey, { count, windowStart }, log);
		return {
			allowed: true,
			remaining: Math.max(0, limit - count),
			resetAt,
			token: { windowStart },
		};
	});
}

async function rollbackFixed(
	storageKey: string,
	token: { windowStart: number },
	log: WrappedLogger,
): Promise<void> {
	await withKeyLock(storageKey, async () => {
		const state = (await readRateLimitState(storageKey, log)) as FixedWindowState | null;
		// Roll back only our own reservation: the decrement applies solely to
		// the window we reserved in — after a rollover the token is void
		if (
			state &&
			state.windowStart === token.windowStart &&
			typeof state.count === "number" &&
			state.count > 0
		) {
			await persistRateLimitState(storageKey, { ...state, count: state.count - 1 }, log);
		}
	});
}

async function reserveSliding(
	storageKey: string,
	limit: number,
	windowMs: number,
	log: WrappedLogger,
): Promise<Reservation> {
	return withKeyLock(storageKey, async () => {
		const now = Date.now();
		const state = (await readRateLimitState(storageKey, log)) as SlidingWindowState | null;
		const rawTimestamps = Array.isArray(state?.timestamps)
			? state.timestamps.filter((t): t is number => typeof t === "number")
			: [];
		const windowLowerBound = now - windowMs;
		const timestamps = rawTimestamps.filter((t) => t > windowLowerBound);

		if (timestamps.length >= limit) {
			const oldest = timestamps[0] ?? now;
			return {
				allowed: false,
				msUntilReset: oldest + windowMs - now,
				resetAt: oldest + windowMs,
			};
		}

		timestamps.push(now);
		await persistRateLimitState(storageKey, { timestamps }, log);
		const oldest = timestamps[0] ?? now;
		return {
			allowed: true,
			remaining: Math.max(0, limit - timestamps.length),
			resetAt: oldest + windowMs,
			token: { timestamp: now },
		};
	});
}

async function rollbackSliding(
	storageKey: string,
	token: { timestamp: number },
	log: WrappedLogger,
): Promise<void> {
	await withKeyLock(storageKey, async () => {
		const state = (await readRateLimitState(storageKey, log)) as SlidingWindowState | null;
		if (!state || !Array.isArray(state.timestamps)) {
			return;
		}
		// Remove exactly one entry matching OUR reservation timestamp so a
		// failing request never consumes another request's token
		const index = state.timestamps.indexOf(token.timestamp);
		if (index === -1) {
			return;
		}
		const timestamps = [...state.timestamps];
		timestamps.splice(index, 1);
		await persistRateLimitState(storageKey, { timestamps }, log);
	});
}

function throwRateLimited(
	event: H3Event,
	details: { msUntilReset: number; resetAt: number },
	meta: { id: string; limit: number; windowType: string; scopeKey: string },
	log: WrappedLogger,
): never {
	log.info("The rate limit has been exceeded", {
		idHash: hashValue(meta.id),
		limit: meta.limit,
		windowType: meta.windowType,
		resetIn: details.msUntilReset,
	});
	setResponseHeader(event, "x-ratelimit-limit", meta.limit);
	setResponseHeader(event, "x-ratelimit-remaining", 0);
	setResponseHeader(event, "x-ratelimit-reset", Math.floor(details.resetAt / 1000));
	setResponseHeader(event, "retry-after", Math.ceil(details.msUntilReset / 1000));

	Sentry.metrics.count("rate_limit.hit", 1, {
		attributes: { route: meta.scopeKey, window_type: meta.windowType },
	});

	const rateLimitSpan = Sentry.getActiveSpan();
	if (rateLimitSpan) {
		rateLimitSpan.setAttribute("rate_limit.hit", true);
		rateLimitSpan.setAttribute("rate_limit.route", meta.scopeKey);
		rateLimitSpan.setAttribute("rate_limit.window_type", meta.windowType);
	}

	throw createError({
		message: `Too Many Requests. Try again in ${details.msUntilReset}ms`,
		why: "The number of requests has exceeded the configured limit for this time window",
		fix: "Wait until the rate limit resets before making more requests",
		status: 429,
	});
}

async function applyWrappedHandlerLogic<T extends EventHandlerRequest, D>(
	event: H3Event<T>,
	handler: EventHandler<T, D>,
	options: DefinedWrappedResponseHandlerOptions,
) {
	const log = useLogger(event, "wrappedHandler");
	const session = await getUserSession(options, event);
	const id = getIdentifier(event, session, options.rateLimit?.ipHeader);

	// Run per-request authorization before the (possibly cached) handler so
	// permission checks are never skipped by a warm cache hit
	const invoke = async () => {
		if (options.authorize) {
			await options.authorize(event, session);
		}
		return handler(event);
	};

	// Normalize options (includes new `scope`)
	const {
		enabled,
		limit,
		window: windowMs,
		type: windowType,
		scope,
		whitelist,
	} = normalizeRateLimitOptions(options.rateLimit, log);

	// If rate limiting is disabled, run the handler without touching storage
	if (!enabled) {
		return await invoke();
	}

	// Check if IP is whitelisted (skip rate limiting for whitelisted IPs)
	if (!session && whitelist.length > 0 && whitelist.includes(id)) {
		return await invoke();
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

	if (windowType !== "fixed" && windowType !== "sliding") {
		// Fallback: if an unknown windowType is provided, just run the handler
		return await invoke();
	}

	const reservation =
		windowType === "fixed"
			? await reserveFixed(storageKey, limit, windowMs, log)
			: await reserveSliding(storageKey, limit, windowMs, log);

	if (!reservation.allowed) {
		throwRateLimited(event, reservation, { id, limit, windowType, scopeKey }, log);
	}

	setResponseHeader(event, "x-ratelimit-limit", limit);
	setResponseHeader(event, "x-ratelimit-remaining", reservation.remaining);
	setResponseHeader(event, "x-ratelimit-reset", Math.floor(reservation.resetAt / 1000));
	setResponseHeader(event, "date", new Date().toUTCString());

	try {
		return await invoke();
	} catch (error) {
		// On handler error, roll back this request's own reservation so
		// failures don't consume quota
		if ("windowStart" in reservation.token) {
			await rollbackFixed(storageKey, reservation.token, log);
		} else {
			await rollbackSliding(storageKey, reservation.token, log);
		}
		throw error;
	}
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
	const opts = omit(["rateLimit", "auth", "onError", "authorize"], options);

	// Only the DATA RESOLUTION is cached. Authentication, rate limiting, and
	// the `authorize` hook run in the outer handler on every request — a warm
	// cache hit must never bypass request-specific security checks.
	const cached = cachedEventHandler<T>((event) => handler(event), opts);

	return defineEventHandler<T>(async (event) => {
		const log = useLogger(event);
		return withApiMetrics(event, async () => {
			try {
				return await applyWrappedHandlerLogic(event, cached, options);
			} catch (error) {
				if (options.onError && typeof options.onError === "function") {
					options.onError(log, error);
				}
				throw error;
			}
		});
	});
}
