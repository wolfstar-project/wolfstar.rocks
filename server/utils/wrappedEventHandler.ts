import type { UserSessionRequired } from "#auth-utils";
import type { ConsolaInstance } from "consola";
import type { EventHandler, EventHandlerRequest, H3Error, H3Event } from "h3";
import type { CacheOptions } from "nitropack/types";
import { logger, useLogger } from "#shared/utils/logger";
import { isObject } from "@sapphire/utilities";
import { isDevelopment } from "std-env";
import { omit } from "~~/server/utils";

const debugLogger = useLogger("@wolfstar/debug");

const rateLimitStorage = useStorage("@wolfstar/ratelimiter");

/**
 * Normalized rate limiting options with all defaults applied
 */
interface NormalizedRateLimitOptions {
  /** Whether rate limiting is enabled */
  enabled: boolean;
  /** Time window in milliseconds */
  window: number;
  /** Maximum number of requests per window */
  limit: number;
  /** Window type: 'fixed' or 'sliding' */
  type: "fixed" | "sliding";
  /** Scope: 'global' (per-user) or 'route' (per-route per-user) */
  scope: "global" | "route";
  /** List of IP addresses to whitelist (bypass rate limiting) */
  whitelist: string[];
  /** Custom header to use for IP detection (e.g., 'CF-Connecting-IP') */
  ipHeader?: string;
}

const rateLimitDefaults: NormalizedRateLimitOptions = {
  enabled: true,
  window: 10000,
  limit: 5,
  type: "fixed",
  scope: "global",
  whitelist: [],
};

function normalizeRateLimitOptions(options: RateLimitOptions | undefined): NormalizedRateLimitOptions {
  if (!options || !isObject(options)) {
    return { ...rateLimitDefaults };
  }

  const candidate = options as unknown as Record<string, unknown>;
  const enabled = typeof candidate.enabled === "boolean" ? candidate.enabled : rateLimitDefaults.enabled;
  const window = typeof candidate.window === "number" && Number.isFinite(candidate.window) && candidate.window > 0 ? candidate.window : rateLimitDefaults.window;
  const limit = typeof candidate.limit === "number" && Number.isFinite(candidate.limit) && candidate.limit > 0 ? candidate.limit : rateLimitDefaults.limit;
  const type = candidate.type === "sliding" ? "sliding" : rateLimitDefaults.type;
  const scope = candidate.scope === "route" ? "route" : "global";
  const whitelist = Array.isArray(candidate.whitelist) ? candidate.whitelist.filter((ip): ip is string => typeof ip === "string") : rateLimitDefaults.whitelist;
  const ipHeader = typeof candidate.ipHeader === "string" && candidate.ipHeader.length > 0 ? candidate.ipHeader : undefined;

  return { enabled, window, limit, type, scope, whitelist, ipHeader };
}

interface DefinedWrappedResponseHandlerOptions<Data> {
  onError?: (logger: ConsolaInstance, error: any | Error | H3Error) => void;
  onSuccess?: (logger: ConsolaInstance, data: Awaited<Data>) => void;
  auth?: boolean;
  rateLimit: RateLimitOptions;
}

interface DefinedWrappedCachedResponseHandlerOptions<Data> extends DefinedWrappedResponseHandlerOptions<Data>, CacheOptions {
}

/**
 * Rate limiting configuration options
 * @example
 * ```typescript
 * {
 *   enabled: true,
 *   limit: 10,
 *   window: 60000, // 1 minute
 *   type: 'sliding',
 *   scope: 'route',
 *   whitelist: ['127.0.0.1', '192.168.1.1'],
 *   ipHeader: 'CF-Connecting-IP'
 * }
 * ```
 */
interface RateLimitOptions {
  /** Whether rate limiting is enabled (default: true) */
  enabled: boolean;
  /** Time window in milliseconds (default: 10000 = 10 seconds) */
  window?: number;
  /** Maximum number of requests per window (required) */
  limit: number;
  /** Window type: 'fixed' or 'sliding' (default: 'fixed') */
  type?: "fixed" | "sliding";
  /** Scope: 'global' (per-user) or 'route' (per-route per-user) (default: 'global') */
  scope?: "global" | "route";
  /** List of IP addresses to whitelist (bypass rate limiting) (default: []) */
  whitelist?: string[];
  /** Custom header to use for IP detection, e.g., 'CF-Connecting-IP' for Cloudflare (default: undefined) */
  ipHeader?: string;
}

/**
 * Extracts a unique identifier for rate limiting purposes
 * @param event - The H3 event object
 * @param session - The user session (if authenticated)
 * @param ipHeader - Custom header to use for IP detection (optional)
 * @returns User ID if authenticated, otherwise IP address
 */
function getIdentifier(event: H3Event, session: UserSessionRequired | null, ipHeader?: string): string {
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
  return getRequestIP(event, { xForwardedFor: true })
    ?? event.node.req.socket.remoteAddress
    ?? event.headers.get("X-Real-IP")
    ?? event.headers.get("X-Cluster-Client-IP")
    ?? "unknown";
}

async function applyWrappedHandlerLogic<T extends EventHandlerRequest, D>(
  event: H3Event<T>,
  handler: EventHandler<T, D>,
  options: DefinedWrappedResponseHandlerOptions<D>,
) {
  const session = options.auth
    ? await requireUserSession(event)
    : null;
  if (session)
    isDevelopment && debugLogger.debug("User session required and found", session.user.name);

  const id = getIdentifier(event, session, options.rateLimit?.ipHeader);

  // Normalize options (includes new `scope`)
  const { enabled, limit, window: windowMs, type: windowType, scope, whitelist } = normalizeRateLimitOptions(options.rateLimit);

  // Check if IP is whitelisted (skip rate limiting for whitelisted IPs)
  if (!session && whitelist.length > 0 && whitelist.includes(id)) {
    isDevelopment && debugLogger.debug(`IP ${id} is whitelisted, skipping rate limit`);
    return await handler(event);
  }

  // Build storage key: global (per-user) by default, or method:path:user when scope === 'route'
  const { req } = event.node;
  const method = req.method;
  const pathname = getRequestURL(event).pathname;
  const normalizedPath = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
  const scopeKey = `${method}:${normalizedPath}`;
  const storageKey = scope === "route" ? `rate-limiter-state:${scopeKey}:${id}` : `rate-limiter-state:${id}`;

  const savedState = await rateLimitStorage.getItem(storageKey);
  const initialState = savedState && isObject(savedState) ? (savedState as Record<string, unknown>) : {};
  isDevelopment && debugLogger.debug(`Rate limit identifier: ${id} scope: ${scope} storageKey: ${storageKey}`);

  // If rate limiting is disabled, run handler immediately
  if (!enabled) {
    return await handler(event);
  }

  const now = Date.now();

  // Helper: persist state safely
  async function persistState(state: Record<string, unknown> | null) {
    try {
      if (state) {
        await rateLimitStorage.setItem(storageKey, state);
      }
    }
    catch (e) {
      // Swallow storage errors to avoid breaking request handling
      isDevelopment && debugLogger.warn("Failed to persist rate limit state", e);
    }
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
        logger.info(`Rate limit exceeded for ${id}. Try again in ${msUntilReset}ms`);
        setResponseHeader(event, "x-ratelimit-limit", limit);
        setResponseHeader(event, "x-ratelimit-remaining", 0);
        setResponseHeader(event, "x-ratelimit-reset", Math.floor(timeForInterval / 1000));
        setResponseHeader(event, "retry-after", Math.ceil(msUntilReset / 1000));

        throw createError({
          statusCode: 429,
          statusMessage: "Too Many Requests",
          message: `Rate limit exceeded. Try again in ${msUntilReset}ms`,
        });
      }

      // Reserve a token before running the handler to avoid races
      count += 1;
      await persistState({ windowStart, count });

      const remainingAfter = Math.max(0, limit - count);
      setResponseHeader(event, "x-ratelimit-limit", limit);
      setResponseHeader(event, "x-ratelimit-remaining", remainingAfter);
      setResponseHeader(event, "x-ratelimit-reset", Math.floor((windowStart + windowMs) / 1000));
      setResponseHeader(event, "date", new Date().toUTCString());

      try {
        const res = await handler(event);
        return res;
      }
      catch (err) {
      // On handler error, try to roll back the reserved token so failures don't consume quota
        try {
          const cur = await rateLimitStorage.getItem(storageKey) as { count?: number } | null;
          if (cur && typeof cur.count === "number" && cur.count > 0) {
            cur.count = Math.max(0, cur.count - 1);
            await persistState(cur as Record<string, unknown>);
          }
        }
        catch (e) {
        // ignore rollback errors but log in dev
          isDevelopment && debugLogger.warn("Failed to rollback reserved token", e);
        }
        throw err;
      }
    }

    // Sliding-window algorithm (store timestamps)
    case "sliding": {
      const state = (initialState as { timestamps?: number[] }) ?? {};
      const rawTimestamps = Array.isArray(state.timestamps) ? state.timestamps.filter((t): t is number => typeof t === "number") : [];
      const windowLowerBound = now - windowMs;
      const timestamps = rawTimestamps.filter((t) => t > windowLowerBound);

      if (timestamps.length >= limit) {
        const oldest = timestamps[0];
        const msUntilReset = oldest + windowMs - now;
        const timeForInterval = oldest + windowMs;
        logger.info(`Rate limit exceeded for ${id}. Try again in ${msUntilReset}ms`);
        setResponseHeader(event, "x-ratelimit-limit", limit);
        setResponseHeader(event, "x-ratelimit-remaining", 0);
        setResponseHeader(event, "x-ratelimit-reset", Math.floor(timeForInterval / 1000));
        setResponseHeader(event, "retry-after", Math.ceil(msUntilReset / 1000));

        throw createError({
          statusCode: 429,
          statusMessage: "Too Many Requests",
          message: `Rate limit exceeded. Try again in ${msUntilReset}ms`,
        });
      }

      // Accept request: append timestamp and persist
      timestamps.push(now);
      await persistState({ timestamps });

      const oldest = timestamps[0] ?? now;
      setResponseHeader(event, "x-ratelimit-limit", limit);
      setResponseHeader(event, "x-ratelimit-remaining", Math.max(0, limit - timestamps.length));
      setResponseHeader(event, "x-ratelimit-reset", Math.floor((oldest + windowMs) / 1000));
      setResponseHeader(event, "date", new Date().toUTCString());

      try {
        const res = await handler(event);
        return res;
      }
      catch (err) {
      // On handler error, remove the appended timestamp to avoid penalizing failing requests
        try {
          const cur = await rateLimitStorage.getItem(storageKey) as { timestamps?: number[] } | null;
          if (cur && Array.isArray(cur.timestamps)) {
            cur.timestamps = cur.timestamps.slice(0, -1);
            await persistState(cur as Record<string, unknown>);
          }
        }
        catch (e) {
        // ignore rollback errors but log in dev
          isDevelopment && debugLogger.warn("Failed to rollback timestamp", e);
        }
        throw err;
      }
    }

    default:
      logger.warn(`Unknown rate limit window type: ${windowType}, proceeding without rate limiting`);
  }
  // Fallback: if an unknown windowType is provided, just run the handler
  return await handler(event);
}

export function defineWrappedResponseHandler<T extends EventHandlerRequest, D>(
  handler: EventHandler<T, D>,
  options: DefinedWrappedResponseHandlerOptions<D> = {
    auth: false,
    rateLimit: { enabled: true, window: 10000, limit: 5, type: "fixed" },
  },
): EventHandler<T, D> {
  return defineEventHandler<T>(async (event) => {
    try {
      const result = await applyWrappedHandlerLogic(event, handler, options);
      if (result && options.onSuccess && typeof options.onSuccess === "function") {
        options.onSuccess(useLogger("@wolfstar/api"), result);
      }
      return result;
    }
    catch (error) {
      if (options.onError && typeof options.onError === "function") {
        options.onError(useLogger("@wolfstar/api"), error);
      }
      throw error;
    }
  });
}
export function defineWrappedCachedResponseHandler<T extends EventHandlerRequest, D>(
  handler: EventHandler<T, D>,
  options: DefinedWrappedCachedResponseHandlerOptions<D> = {
    auth: false,
    rateLimit: { enabled: true, window: 10000, limit: 5, type: "fixed" },
    maxAge: 60 * 60,
    swr: true,
  },
): EventHandler<T, D> {
  const opts = omit(["rateLimit", "auth", "onError", "onSuccess"], options);
  return cachedEventHandler<T>(async (event) => {
    try {
      const result = await applyWrappedHandlerLogic(event, handler, options);
      if (result && options.onSuccess && typeof options.onSuccess === "function") {
        options.onSuccess(useLogger("@wolfstar/api"), result);
      }
      return result;
    }
    catch (error) {
      if (options.onError && typeof options.onError === "function") {
        options.onError(useLogger("@wolfstar/api"), error);
      }
      throw error;
    }
  }, opts);
};
