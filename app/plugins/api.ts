import { v4 as uuidv4 } from "uuid";

/**
 * Generates a reliable request ID
 */
function generateRequestId(): string {
  return uuidv4();
}

/**
 * Determines if the request is same-origin or to the configured API base
 */
function isSameOriginOrConfiguredApi(url: string, apiOrigin: string): boolean {
  try {
    const requestUrl = new URL(url, apiOrigin);
    const currentOrigin = typeof window !== "undefined" ? window.location.origin : apiOrigin;
    const apiOriginUrl = new URL(apiOrigin);

    return requestUrl.origin === currentOrigin || requestUrl.origin === apiOriginUrl.origin;
  }
  catch {
    // If URL parsing fails, assume it's a relative URL (same-origin)
    return !url.startsWith("http");
  }
}

export default defineNuxtPlugin(async () => {
  const apiOrigin = getApiOrigin();

  const api = $fetch.create({
    baseURL: apiOrigin,
    credentials: "include",
    onRequest({ request, options }) {
      const url = typeof request === "string" ? request : request.url || "";
      const needsCustomHeaders = isSameOriginOrConfiguredApi(url, apiOrigin);

      if (needsCustomHeaders) {
        // For same-origin requests without body, still add request ID
        if (!options.headers) {
          options.headers = new Headers();
        }
        options.headers.set("X-Request-ID", generateRequestId());
      }
    },
  });

  return {
    provide: {
      api,
    },
  };
});
