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
        statusCode: 500,
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
      window: 60000, // 1 minute
      limit: 30,
      type: "sliding",
    },
    maxAge: 60 * 60 * 24, // Cache for 24 hours
    swr: true,
    name: "bot-languages",
  },
);
