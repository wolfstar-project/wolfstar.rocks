defineRouteMeta({
  openAPI: {
    tags: ["Bot Data"],
    summary: "Get supported languages",
    description: "Retrieves the list of all supported bot languages.",
    operationId: "getLanguages",
    responses: {
      200: {
        description: "List of supported languages",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                type: "string",
                description: "Language code",
              },
            },
          },
        },
      },
      500: {
        description: "Failed to fetch languages from bot API",
      },
    },
  },
});

export default defineWrappedCachedResponseHandler(
  async () => {
    const config = useRuntimeConfig();
    const apiBaseUrl = config.public.app.apiBaseUrl;

    if (!apiBaseUrl) {
      throw createError({
        status: 500,
        message: "Bot API base URL is not configured",
      });
    }

    const languages = await $fetch<string[]>(`${apiBaseUrl}/languages`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return languages;
  },
  {
    auth: false,
    rateLimit: {
      enabled: true,
      window: minutes(1),
      limit: 30,
      type: "sliding",
    },
    maxAge: days(1),
    swr: true,
    name: "bot-languages",
    onSuccess(logger) {
      logger.info(`Successfully fetched bot languages`);
    },
    onError(logger, error) {
      logger.error("Failed to fetch bot languages:", error);
    },
  },
);
