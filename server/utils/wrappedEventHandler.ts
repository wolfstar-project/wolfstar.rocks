import type { UserSessionRequired } from "#auth-utils";
import type { ConsolaInstance } from "consola";
import type { EventHandler, EventHandlerRequest, H3Error, H3Event } from "h3";
import type { CacheOptions } from "nitropack/types";
import { logger, useLogger } from "#shared/utils/logger";
import { isObject } from "@sapphire/utilities";
import { cast } from "@sapphire/utilities/cast";
import { asyncRateLimit } from "@tanstack/pacer";
import { isDevelopment } from "std-env";
import { omit } from "~~/server/utils";

const debugLogger = useLogger("@wolfstar/debug");

const rateLimitStorage = useStorage();

interface DefinedWrappedResponseHandlerOptions {
  onError?: (logger: ConsolaInstance, err: any | Error | H3Error) => void;
  auth?: boolean;
  rateLimit: RateLimitOptions;
}

interface DefinedWrappedCachedResponseHandlerOptions extends DefinedWrappedResponseHandlerOptions, CacheOptions {
}

interface RateLimitOptions {
  enabled: true;
  window?: number;
  limit: number;
  type?: "fixed" | "sliding";
}

async function getIdentifier(event: H3Event, session: UserSessionRequired | null) {
  if (session) {
    return session.user.id;
  }
  return getRequestIP(event, { xForwardedFor: true }) ?? event.node.req.socket.remoteAddress ?? event.headers.get("X-Real-IP") ?? event.headers.get("X-Cluster-Client-IP");
}

export const defineWrappedResponseHandler = <T extends EventHandlerRequest, D>(
  handler: EventHandler<T, D>,
  options: DefinedWrappedResponseHandlerOptions = {
    auth: false,
    rateLimit: { enabled: true, window: 10000, limit: 5, type: "fixed" },
  },
): EventHandler<T, D> =>
  defineEventHandler<T>(async (event) => {
    let user: UserSessionRequired | null = null;

    try {
      if (options.auth) {
        user = await requireUserSession(event, {
          statusCode: 401,
          message: "Missing session",
        });
        isDevelopment && debugLogger.debug("User session required and found", user.user.name);
      }

      const id = await getIdentifier(event, user);
      const savedState = await rateLimitStorage.getItem(`rate-limiter-state:${id}`);
      const initialState = savedState && isObject(savedState) ? savedState : {};
      isDevelopment && debugLogger.debug(`Rate limit identifier: ${id}`);

      const { enabled, limit, window, type: windowType } = cast<{ enabled: true; window: number; limit: number; type: "fixed" | "sliding" }>(options.rateLimit ?? { window: 10000, limit: 5, type: "fixed" });

      const xRateLimitLimit = limit;
      const asyncLimiter = asyncRateLimit(
        async (event: H3Event<T>) => {
          rateLimitStorage.setItem(`rate-limiter-state:${id}`, event);
          return await handler(event);
        },
        {
          onSettled(_args, rateLimiter) {
            setResponseHeader(event, "X-RateLimit-Limit", xRateLimitLimit);
            setResponseHeader(event, "X-RateLimit-Remaining", rateLimiter.getRemainingInWindow());
            setResponseHeader(event, "X-RateLimit-Reset", Math.floor((Date.now() + rateLimiter.getMsUntilNextWindow()) / 1000));
          },
          onSuccess(_result, _args, rateLimiter) {
            setResponseHeader(event, "Date", new Date().toUTCString());
            // Called after each successful execution
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
    let user: UserSessionRequired | null = null;

    try {
      if (options.auth) {
        user = await requireUserSession(event, {
          statusCode: 401,
          message: "Missing session",
        });
        isDevelopment && debugLogger.debug("User session required and found", user.user.name);
      }

      const id = await getIdentifier(event, user);
      const savedState = await rateLimitStorage.getItem(`rate-limiter-state:${id}`);
      const initialState = savedState && isObject(savedState) ? savedState : {};
      isDevelopment && debugLogger.debug(`Rate limit identifier: ${id}`);

      const { enabled, limit, window, type: windowType } = cast<{ enabled: true; window: number; limit: number; type: "fixed" | "sliding" }>(options.rateLimit ?? { window: 10000, limit: 5, type: "fixed" });

      const xRateLimitLimit = limit;
      const asyncLimiter = asyncRateLimit(
        async (event: H3Event<T>) => {
          rateLimitStorage.setItem(`rate-limiter-state:${id}`, event);
          return await handler(event);
        },
        {
          onSettled(_args, rateLimiter) {
            setResponseHeader(event, "X-RateLimit-Limit", xRateLimitLimit);
            setResponseHeader(event, "X-RateLimit-Remaining", rateLimiter.getRemainingInWindow());
            setResponseHeader(event, "X-RateLimit-Reset", Math.floor((Date.now() + rateLimiter.getMsUntilNextWindow()) / 1000));
          },
          onSuccess(_result, _args, rateLimiter) {
            setResponseHeader(event, "Date", new Date().toUTCString());
            // Called after each successful execution
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
