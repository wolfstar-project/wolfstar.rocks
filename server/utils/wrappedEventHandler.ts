import type { EventHandler, EventHandlerRequest } from "h3";
import type { CacheOptions } from "nitropack/types";

export const defineWrappedResponseHandler = <T extends EventHandlerRequest, D> (
  handler: EventHandler<T, D>,
  options: {
    onError?: (err: any) => void;
    auth?: boolean;
    rateLimit?: boolean;
  } = {
    auth: false,
    rateLimit: true,
  },
): EventHandler<T, D> =>
  defineEventHandler<T>(async (event) => {
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
