import type { FlattenedCommand } from "#shared/types/discord";

defineRouteMeta({
  openAPI: {
    tags: ["Bot Data"],
    summary: "Get bot commands",
    description: "Retrieves the list of all available bot commands with their metadata.",
    operationId: "getCommands",
    responses: {
      200: {
        description: "List of bot commands",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Command name" },
                  category: { type: "string", description: "Command category" },
                  description: { type: "string", description: "Command description" },
                  guarded: { type: "boolean", description: "Whether the command is guarded" },
                  permissionLevel: { type: "number", description: "Required permission level" },
                },
              },
            },
          },
        },
      },
      500: {
        description: "Failed to fetch commands from bot API",
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

    const commands = await $fetch<FlattenedCommand[]>(`${apiBaseUrl}/commands`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return commands;
  },
  {
    auth: false,
    rateLimit: {
      enabled: true,
      window: minutes(1),
      limit: 30,
      type: "sliding",
    },
    maxAge: hours(6),
    swr: true,
    name: "bot-commands",
    onSuccess(logger) {
      logger.info(`Successfully fetched bot commands`);
    },
    onError(logger, error) {
      logger.error("Failed to fetch bot commands:", error);
    },
  },
);
