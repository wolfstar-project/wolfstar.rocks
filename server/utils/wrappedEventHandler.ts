import type { UserSessionRequired } from "#auth-utils";
import type { EventHandler, EventHandlerRequest, H3Error, H3Event } from "h3";
import type { CacheOptions } from "nitropack/types";
import { logger } from "#shared/utils/logger";
import { isNullOrUndefined } from "@sapphire/utilities";
import { cast } from "@sapphire/utilities/cast";
import { asyncRateLimit } from "@tanstack/pacer";

const KEY = "wolfstar:rate-limiter-state";

const rateLimitStorage = useStorage<string>();

interface DefinedWrappedResponseHandlerOptions {
  onError?: (err: any | Error | H3Error) => void;
  auth?: boolean;
  rateLimit: RateLimitOptions;
}

interface DefinedWrappedCachedResponseHandlerOptions extends DefinedWrappedResponseHandlerOptions, CacheOptions {
}

interface RateLimitOptions {
  enabled: true;
  window?: number;
  limit: number;
}

async function getIdentifier(event: H3Event, user: UserSessionRequired | null) {
  if (user) {
    return user.user?.id ?? null;
  }
  return getRequestIP(event, { xForwardedFor: true }) ?? event.node.req.socket.remoteAddress ?? null;
}

export const defineWrappedResponseHandler = <T extends EventHandlerRequest, D>(
  handler: EventHandler<T, D>,
  options: DefinedWrappedResponseHandlerOptions = {
    auth: false,
    rateLimit: { enabled: true, window: 10000, limit: 5 },
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
      }

      if (options.rateLimit) {
        const id = await getIdentifier(event, user);
        if (!isNullOrUndefined(id)) {
          const { enabled, ...config } = cast<{ enabled: true; window: number; limit: number }>(options.rateLimit ?? { window: 10000, limit: 5 });
          const savedState = await rateLimitStorage.getItem(KEY);
          const initialState = savedState ? JSON.parse(savedState) : {};

          const xRateLimitLimit = config.window;
          const asyncLimiter = asyncRateLimit(async () => {
            await rateLimitStorage.setItem(KEY, id);
          }, {
            onSettled(rateLimiter) {
              const state = rateLimiter.store.state;
              if (state.isExceeded) {
                setResponseHeader(event, "X-RateLimit-Limit", xRateLimitLimit);
              }
            },
            onSuccess: (_result, rateLimiter) => {
              setResponseHeader(event, "Date", new Date().toUTCString());
              // Called after each successful execution
              logger.log("Async function executed", rateLimiter.store.state.successCount);
            },
            onReject: (_args, rateLimiter) => {
              const state = rateLimiter.store.state;
              if (state.isExceeded) {
                setResponseHeader(event, "X-RateLimit-Limit", xRateLimitLimit);
                setResponseHeader(event, "X-RateLimit-Remaining", rateLimiter.getRemainingInWindow());
                setResponseHeader(event, "X-RateLimit-Reset", Math.floor((Date.now() + rateLimiter.getMsUntilNextWindow()) / 1000));
                logger.log(`Rate limit exceeded. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`);
              }
            },
            onError: (error, _args, rateLimiter) => {
              setResponseHeader(event, "X-RateLimit-Reset", rateLimiter.getMsUntilNextWindow());
              if (options.onError) {
                options.onError(error);
              }
            },
            window: config.window,
            limit: config.limit,
            initialState,
            enabled,
            throwOnError: true,
          });
          await asyncLimiter();
        }
      }
      return await handler(event);
    }
    catch (error) {
      if (options.onError) {
        options.onError(error);
      }
      // Error handling
      return { error };
    }
  });

export const defineWrappedCachedResponseHandler = <T extends EventHandlerRequest, D> (
  handler: EventHandler<T, D>,
  options: DefinedWrappedCachedResponseHandlerOptions = {
    auth: false,
    rateLimit: { enabled: true, window: 10000, limit: 5 },
    maxAge: 60 * 60,
  },
): EventHandler<T, D> =>
  defineCachedEventHandler<T>(async (event) => {
    let user: UserSessionRequired | null = null;
    try {
      if (options.auth) {
        user = await requireUserSession(event, {
          statusCode: 401,
          message: "Missing session",
        });
      }

      if (options.rateLimit) {
        const id = await getIdentifier(event, user);
        if (!isNullOrUndefined(id)) {
          const { enabled, ...config } = cast<{ enabled: true; window: number; limit: number }>(options.rateLimit ?? { window: 10000, limit: 5 });
          const savedState = await rateLimitStorage.getItem(KEY);
          const initialState = savedState ? JSON.parse(savedState) : {};

          const xRateLimitLimit = config.window;
          const asyncLimiter = asyncRateLimit(async () => {
            await rateLimitStorage.setItem(KEY, id);
          }, {
            onSettled(rateLimiter) {
              const state = rateLimiter.store.state;
              if (state.isExceeded) {
                setResponseHeader(event, "X-RateLimit-Limit", xRateLimitLimit);
              }
            },
            onSuccess: (_result, rateLimiter) => {
              setResponseHeader(event, "Date", new Date().toUTCString());
              // Called after each successful execution
              logger.log("Async function executed", rateLimiter.store.state.successCount);
            },
            onReject: (_args, rateLimiter) => {
              const state = rateLimiter.store.state;
              if (state.isExceeded) {
                setResponseHeader(event, "X-RateLimit-Limit", xRateLimitLimit);
                setResponseHeader(event, "X-RateLimit-Remaining", rateLimiter.getRemainingInWindow());
                setResponseHeader(event, "X-RateLimit-Reset", Math.floor((Date.now() + rateLimiter.getMsUntilNextWindow()) / 1000));
                logger.log(`Rate limit exceeded. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`);
              }
            },
            onError: (error, _args, rateLimiter) => {
              setResponseHeader(event, "X-RateLimit-Reset", rateLimiter.getMsUntilNextWindow());
              if (options.onError) {
                options.onError(error);
              }
            },
            window: config.window,
            limit: config.limit,
            initialState,
            enabled,
            throwOnError: true,
          });
          await asyncLimiter();
        }
      }
      return await handler(event);
    }
    catch (error) {
      if (options.onError) {
        options.onError(error);
      }
      // Error handling
      return { error };
    }
  }, {
    maxAge: options.maxAge,
  });
