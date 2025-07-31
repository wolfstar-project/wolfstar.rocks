import type { EventHandler, EventHandlerRequest, H3Event } from "h3";
import type { CacheOptions } from "nitropack/types";
import { logger } from "#shared/utils/logger";
import { cast } from "@sapphire/utilities/cast";
import { asyncRateLimit } from "@tanstack/pacer";

const KEY = "wolfstar:rate-limiter-state";

const rateLimitStorage = useStorage<string>();

async function getIdentifier(event: H3Event, auth: boolean) {
  if (auth) {
    const session = await getUserSession(event);
    // @ts-expect-error - is bugged
    return session.user?.id;
  }
  return getRequestIP(event, { xForwardedFor: true }) ?? event.node.req.socket.remoteAddress ?? undefined;
}

export const defineWrappedResponseHandler = <T extends EventHandlerRequest, D>(
  handler: EventHandler<T, D>,
  options: {
    onError?: (err: any) => void;
    auth?: boolean;
    rateLimit: { enabled: true; window?: number; limit: number };
  } = {
    auth: false,
    rateLimit: { enabled: true, window: 10000, limit: 5 },
  },
): EventHandler<T, D> =>
  defineEventHandler<T>(async (event) => {
    try {
      if (options.auth) {
        await requireUserSession(event, {
          statusCode: 401,
          message: "Missing session",
        });
      }

      if (options.rateLimit) {
        const id = await getIdentifier(event, options.auth ?? false);
        if (id) {
          const { enabled, ...config } = cast<{ enabled: true; window: number; limit: number }>(options.rateLimit ?? { window: 10000, limit: 5 });
          const savedState = await rateLimitStorage.getItem(KEY, id);
          const initialState = savedState ? JSON.parse(savedState) : {};
          const asyncLimiter = asyncRateLimit(async () => {
            if (id) {
              await rateLimitStorage.setItem(KEY, id);
            }
          }, {
            onSuccess: (_result, rateLimiter) => {
              // Called after each successful execution
              logger.log("Async function executed", rateLimiter.store.state.successCount);
            },
            onReject: (_args, rateLimiter) => {
              const state = rateLimiter.store.state;
              setResponseHeader(event, "X-RateLimit-Limit", state);
              setResponseHeader(event, "X-RateLimit-Remaining", rateLimiter.getRemainingInWindow());
              logger.log(`Rate limit exceeded. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`);
            },
            onError: (error, _args, rateLimiter) => {
              setResponseHeader(event, "X-RateLimit-Reset", rateLimiter.getMsUntilNextWindow());
              setResponseHeader(event, "Retry-After", rateLimiter.getMsUntilNextWindow());
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
  options: {
    onError?: (err: any) => void;
    auth?: boolean;
    rateLimit?: boolean;
  } & CacheOptions = {
    auth: false,
    rateLimit: true,
    maxAge: 60 * 60,
  },
): EventHandler<T, D> =>
  defineCachedEventHandler<T>(async (event) => {
    if (options.auth) {
      await requireUserSession(event, {
        statusCode: 401,
        message: "Missing session",
      });
    }
    if (options.rateLimit) {
      // TODO: Implement rate limiting
    }
    try {
      return await handler(event);
    }
    catch (err) {
      if (options.onError) {
        options.onError(err);
      }
      // Error handling
      return { err };
    }
  }, {
    maxAge: options.maxAge,
  });
