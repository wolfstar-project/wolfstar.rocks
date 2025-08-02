import type { UserSessionRequired } from "#auth-utils";
import type { EventHandler, EventHandlerRequest, H3Error, H3Event } from "h3";
import type { CacheOptions } from "nitropack/types";
import { logger, useLogger } from "#shared/utils/logger";
import { cast } from "@sapphire/utilities/cast";
import { asyncRateLimit } from "@tanstack/pacer";
import { isDevelopment } from "std-env";

const debugLogger = isDevelopment
  ? useLogger("@wolfstar/debug")
  : {
      info: () => {},
    };

const rateLimitStorage = useStorage<string>();

interface DefinedWrappedResponseHandlerOptions {
  onError?: (logger: typeof useLogger, err: any | Error | H3Error) => void;
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
        debugLogger.info("User session required and found", user.user.name);
      }

      if (options.rateLimit) {
        const id = await getIdentifier(event, user);
        debugLogger.info(`Rate limit identifier: ${id}`);
        const KEY = `wolfstar:rate-limiter-state:${id}`;

        const { enabled, ...config } = cast<{ enabled: true; window: number; limit: number; type: "fixed" | "sliding" }>(options.rateLimit ?? { window: 10000, limit: 5, type: "fixed" });
        const savedState = await rateLimitStorage.getItem(KEY);
        const initialState = savedState ? JSON.parse(savedState) : {};

        const xRateLimitLimit = config.limit;
        const asyncLimiter = asyncRateLimit(
          async () => {
            // This function is intentionally left empty.
            // It serves as a placeholder for the rate limiter to decide whether to proceed or reject the request.
          },
          {
            async onSettled(rateLimiter) {
              const state = rateLimiter.store.state;

              if (id) {
                await rateLimitStorage.setItem(KEY, JSON.stringify(state));
              }

              setResponseHeader(event, "X-RateLimit-Limit", xRateLimitLimit);
              setResponseHeader(event, "X-RateLimit-Remaining", rateLimiter.getRemainingInWindow());
              setResponseHeader(event, "X-RateLimit-Reset", Math.floor((Date.now() + rateLimiter.getMsUntilNextWindow()) / 1000));

              if (state.isExceeded) {
                logger.info(`Rate limit exceeded for ${id}. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`);
                setResponseStatus(event, 429, `Rate limit exceeded. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`);
              }
            },
            onSuccess(_result, rateLimiter) {
              setResponseHeader(event, "Date", new Date().toUTCString());
              // Called after each successful execution
              debugLogger.info(`Request from ${id} successful.`, rateLimiter.store.state.successCount);
            },
            onError(error) {
              if (options.onError) {
                options.onError(useLogger, error);
              }
            },
            windowType: config.type,
            window: config.window,
            limit: config.limit,
            initialState,
            enabled,
            throwOnError: true,
          },
        );
        await asyncLimiter();
      }
      return await handler(event);
    }
    catch (error) {
      console.log(error);
      if (options.onError) {
        options.onError(useLogger, error);
      }
      // Error handling
      return error;
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
        debugLogger.info("User session required and found", user.user.name);
      }

      if (options.rateLimit) {
        const id = await getIdentifier(event, user);
        debugLogger.info(`Rate limit identifier: ${id}`);
        const KEY = `wolfstar:rate-limiter-state:${id}`;

        const { enabled, ...config } = cast<{ enabled: true; window: number; limit: number }>(options.rateLimit ?? { window: 10000, limit: 5 });
        const savedState = await rateLimitStorage.getItem(KEY);
        const initialState = savedState ? JSON.parse(savedState) : {};

        const xRateLimitLimit = config.limit;
        const asyncLimiter = asyncRateLimit(
          async () => {
            // This function is intentionally left empty.
            // It serves as a placeholder for the rate limiter to decide whether to proceed or reject the request.
          },
          {
            async onSettled(rateLimiter) {
              const state = rateLimiter.store.state;

              if (id) {
                await rateLimitStorage.setItem(KEY, JSON.stringify(state));
              }

              setResponseHeader(event, "X-RateLimit-Limit", xRateLimitLimit);
              setResponseHeader(event, "X-RateLimit-Remaining", rateLimiter.getRemainingInWindow());
              setResponseHeader(event, "X-RateLimit-Reset", Math.floor((Date.now() + rateLimiter.getMsUntilNextWindow()) / 1000));
            },
            onSuccess(_result, rateLimiter) {
              setResponseHeader(event, "Date", new Date().toUTCString());
              // Called after each successful execution
              debugLogger.info(`Request from ${id} successful.`, rateLimiter.store.state.successCount);
            },
            onReject: (_args, rateLimiter) => {
              const state = rateLimiter.store.state;
              if (state.isExceeded) {
                logger.info(`Rate limit exceeded for ${id}. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`);
                setResponseStatus(event, 429, `Rate limit exceeded. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`);
              }
            },
            onError(error) {
              if (options.onError) {
                options.onError(useLogger, error);
              }
            },
            window: config.window,
            limit: config.limit,
            initialState,
            enabled,
            throwOnError: true,
          },
        );
        await asyncLimiter();
      }
      return await handler(event);
    }
    catch (error) {
      if (options.onError) {
        options.onError(useLogger, error);
      }
      // Error handling
      return error;
    }
  }, {
    maxAge: options.maxAge,
  });
