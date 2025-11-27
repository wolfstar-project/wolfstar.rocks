import type { GuildData } from "~~/server/database";
import { manageAbility } from "#shared/utils/abilities";
import * as yup from "yup";
import { readSettings, serializeSettings } from "~~/server/database";

const querySchema = yup.object({
  shouldSerialize: yup.boolean().optional().default(false),
});

defineRouteMeta({
  openAPI: {
    tags: ["Guild Settings"],
    summary: "Get guild settings",
    description: "Retrieves the bot configuration and settings for a specific guild. Requires the user to have management permissions for the guild.",
    operationId: "getGuildSettings",
    parameters: [
      {
        in: "path",
        name: "guild",
        required: true,
        description: "The Discord snowflake ID of the guild",
        schema: { type: "string", example: "123456789012345678" },
      },
      {
        in: "query",
        name: "shouldSerialize",
        required: false,
        description: "Whether to serialize the settings data for API response (default: false)",
        schema: { type: "boolean", default: false },
      },
    ],
    responses: {
      200: {
        description: "Guild settings retrieved successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string", description: "The guild's snowflake ID", example: "123456789012345678" },
                prefix: { type: "string", description: "The bot command prefix", example: "!" },
                language: { type: "string", description: "The preferred language", example: "en-US" },
                disabledCommands: { type: "array", items: { type: "string" }, description: "List of disabled command names" },
                moderationSettings: { type: "object", description: "Moderation configuration" },
                loggingSettings: { type: "object", description: "Logging configuration" },
                welcomeSettings: { type: "object", description: "Welcome message configuration" },
                automodSettings: { type: "object", description: "Auto-moderation configuration" },
              },
            },
          },
        },
      },
      401: { description: "Authentication required" },
      403: { description: "Insufficient permissions to access this guild" },
      404: { description: "Guild not found or bot is not in the guild" },
      429: { description: "Rate limit exceeded" },
      500: { description: "Failed to fetch guild settings" },
    },
    security: [{ discordOAuth: ["identify", "guilds"] }],
  },
});

export default defineWrappedResponseHandler(
  async (event) => {
    // Get guild ID from params
    const guildId = getGuildParam(event);

    // Validate query parameters
    const { shouldSerialize } = await getValidatedQuery(event, (body) =>
      querySchema.validate(body));

    const user = await getCurrentUser(event);

    const guild = await getGuild(guildId);

    // Fetch member data
    const member = await getMember(guild, user);

    // Check permissions
    if (await denies(event, manageAbility, guild, member)) {
      throw createApiError({
        statusCode: 403,
        message: "Insufficient permissions",
        data: {
          error: "insufficient_permissions",
          message: "Insufficient permissions",
          details: {
            guild: guild.id,
            member: member.user.id,
          },
        },
      });
    }

    // Read and return settings
    const settings = await readSettings(guild.id);
    return shouldSerialize
      ? serializeSettings(settings)
      : (settings as unknown as GuildData);
  },
  {
    auth: true,
    rateLimit: { enabled: true, window: seconds(5), limit: 2 },
    onError: (logger, error) => logger.error(`Settings API error:\n${error.message}`),
  },
);
