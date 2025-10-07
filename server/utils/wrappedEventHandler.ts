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

const rateLimitStorage = useStorage();

interface NormalizedRateLimitOptions {
  enabled: boolean;
  window: number;
  limit: number;
  type: "fixed" | "sliding";
}

const rateLimitDefaults: NormalizedRateLimitOptions = {
  enabled: true,
  window: 10000,
  limit: 5,
  type: "fixed",
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

  return { enabled, window, limit, type };
}

interface DefinedWrappedResponseHandlerOptions {
  onError?: (logger: ConsolaInstance, err: any | Error | H3Error) => void;
  auth?: boolean;
  rateLimit: RateLimitOptions;
}

interface DefinedWrappedCachedResponseHandlerOptions extends DefinedWrappedResponseHandlerOptions, CacheOptions {
}

interface RateLimitOptions {
  enabled: boolean;
  window?: number;
  limit: number;
  type?: "fixed" | "sliding";
}

async function getIdentifier(event: H3Event, session: UserSessionRequired | null) {
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
  options: DefinedWrappedResponseHandlerOptions,
) {
  let session: UserSessionRequired | null = null;

  if (options.auth) {
    session = await requireUserSession(event, {
      statusCode: 401,
      message: "Missing session",
    });
    isDevelopment && debugLogger.debug("User session required and found", session.user.name);
  }

  const id = await getIdentifier(event, session);
  const savedState = await rateLimitStorage.getItem(`rate-limiter-state:${id}`);
  const initialState = savedState && isObject(savedState) ? savedState : {};
  isDevelopment && debugLogger.debug(`Rate limit identifier: ${id}`);

  const { enabled, limit, window, type: windowType } = normalizeRateLimitOptions(options.rateLimit);

  const asyncLimiter = asyncRateLimit(
    async (event: H3Event<T>) => handler(event),
    {
      onSettled(_args, rateLimiter) {
        rateLimitStorage.setItem(`rate-limiter-state:${id}`, rateLimiter.store.state);
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
        setResponseStatus(event, 429, `Rate limit exceeded. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`);
      },
      windowType,
      window,
      limit,
      enabled,
      initialState,
      throwOnError: true,
    },
  );

  return await asyncLimiter(event);
}

export const defineWrappedResponseHandler = <T extends EventHandlerRequest, D>(
  handler: EventHandler<T, D>,
  options: DefinedWrappedResponseHandlerOptions = {
    auth: false,
    rateLimit: { enabled: true, window: 10000, limit: 5, type: "fixed" },
  },
): EventHandler<T, D> =>
  defineEventHandler<T>(async (event) => {
    try {
      return await applyWrappedHandlerLogic(event, handler, options);
    }
    catch (error) {
      if (options.onError) {
        options.onError(useLogger("@wolfstar/api"), error);
        throw error;
      }
      // Error handling
      return error as H3Error;
    }
  });

export const defineWrappedCachedResponseHandler = <T extends EventHandlerRequest, D> (
  handler: EventHandler<T, D>,
  options: DefinedWrappedCachedResponseHandlerOptions = {
    auth: false,
    rateLimit: { enabled: true, window: 10000, limit: 5 },
    maxAge: 60 * 60,
    swr: false,
  },
): EventHandler<T, D> =>
  cachedEventHandler<T>(async (event) => {
    try {
      return await applyWrappedHandlerLogic(event, handler, options);
    }
    catch (error) {
      if (options.onError) {
        options.onError(useLogger("@wolfstar/api"), error);
        throw error;
      }
      // Error handling
      return error as H3Error;
    }
  }, {
    ...omit(["rateLimit", "auth"], options),
  });
