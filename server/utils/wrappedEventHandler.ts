import type { UserSessionRequired } from "#auth-utils";
import type { ConsolaInstance } from "consola";
import type { EventHandler, EventHandlerRequest, H3Error, H3Event } from "h3";
import type { CacheOptions } from "nitropack/types";
import { logger, useLogger } from "#shared/utils/logger";
import { isObject } from "@sapphire/utilities";
import { asyncRateLimit } from "@tanstack/pacer";
import { isDevelopment } from "std-env";
import { omit } from "~~/server/utils";

const debugLogger = useLogger("@wolfstar/debug");

const rateLimitStorage = useStorage("@wolfstar/ratelimiter");

interface NormalizedRateLimitOptions {
  enabled: boolean;
  window: number;
  limit: number;
  type: "fixed" | "sliding";
  scope: "global" | "route";
}

const rateLimitDefaults: NormalizedRateLimitOptions = {
  enabled: true,
  window: 10000,
  limit: 5,
  type: "fixed",
  scope: "global",
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

  return { enabled, window, limit, type, scope };
}

interface DefinedWrappedResponseHandlerOptions<Data> {
  onError?: (logger: ConsolaInstance, error: any | Error | H3Error) => void;
  onSuccess?: (logger: ConsolaInstance, data: Awaited<Data>) => void;
  auth?: boolean;
  rateLimit: RateLimitOptions;
}

interface DefinedWrappedCachedResponseHandlerOptions<Data> extends DefinedWrappedResponseHandlerOptions<Data>, CacheOptions {
}

interface RateLimitOptions {
  enabled: boolean;
  window?: number;
  limit: number;
  type?: "fixed" | "sliding";
  scope?: "global" | "route";
}

function getIdentifier(event: H3Event, session: UserSessionRequired | null) {
  if (session) {
    return session.user.id;
  }
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
  let session: UserSessionRequired | null = null;

  if (options.auth) {
    session = await requireUserSession(event, {
      statusCode: 401,
      message: "Missing session",
    });
    isDevelopment && debugLogger.debug("User session required and found", session.user.name);
  }

  const id = getIdentifier(event, session);

  // Normalize options (includes new `scope`)
  const normalizedRate = normalizeRateLimitOptions(options.rateLimit);
  const { enabled, limit, window: windowMs, type: windowType, scope } = normalizedRate;

  // Build storage key: global (per-user) by default, or method:path:user when scope === 'route'
  const method = String(event.node?.req?.method ?? "GET").toUpperCase();
  const pathname = getRequestURL(event).pathname;
  const normalizedPath = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
  const scopeKey = `${method}:${normalizedPath}`;
  const storageKey = scope === "route" ? `rate-limiter-state:${scopeKey}:${id}` : `rate-limiter-state:${id}`;

  const savedState = await rateLimitStorage.getItem(storageKey);
  const initialState = savedState && isObject(savedState) ? savedState : {};
  isDevelopment && debugLogger.debug(`Rate limit identifier: ${id} scope: ${scope} storageKey: ${storageKey}`);

  const asyncLimiter = asyncRateLimit(
    async (event: H3Event<T>) => handler(event),
    {
      onSettled(_args, rateLimiter) {
        // persist using the same storageKey
        rateLimitStorage.setItem(storageKey, rateLimiter.store.state);
        setResponseHeader(event, "X-RateLimit-Limit", limit);
        setResponseHeader(event, "X-RateLimit-Remaining", rateLimiter.getRemainingInWindow());
        setResponseHeader(event, "X-RateLimit-Reset", Math.floor((Date.now() + rateLimiter.getMsUntilNextWindow()) / 1000));
      },
      onSuccess(_result, _args, rateLimiter) {
        setResponseHeader(event, "Date", new Date().toUTCString());
        isDevelopment && debugLogger.info(`Request from ${id} successful.`, rateLimiter.store.state.successCount);
      },
      onReject: (_args, rateLimiter) => {
        logger.info(`Rate limit exceeded for ${id}. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`);
        const retryAfterSeconds = Math.ceil(rateLimiter.getMsUntilNextWindow() / 1000);
        setResponseHeader(event, "Retry-After", retryAfterSeconds);
        setResponseStatus(event, 429, `Rate limit exceeded. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`);
      },
      windowType,
      window: windowMs,
      limit,
      enabled,
      initialState,
      throwOnError: true,
    },
  );

  return await asyncLimiter(event);
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
