import { manageAbility } from "#shared/utils/abilities";

defineRouteMeta({
  openAPI: {
    tags: ["Discord API"],
    summary: "List all channels",
    description: "Retrieves a list of all channels within a guild. Requires the user to have management permissions for the guild.",
    operationId: "listGuildChannels",
    parameters: [
      {
        in: "path",
        name: "guild",
        required: true,
        description: "The Discord snowflake ID of the guild",
        schema: { type: "string", example: "123456789012345678" },
      },

    ],
    responses: {
      200: {
        description: "List of channels retrieved successfully",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string", description: "The channel's snowflake ID", example: "987654321098765432" },
                  type: { type: "integer", description: "The channel type (0 = text, 2 = voice, 4 = category, etc.)", example: 0 },
                  guildId: { type: "string", description: "The guild's snowflake ID", example: "123456789012345678" },
                  name: { type: "string", description: "The channel name", example: "general" },
                  rawPosition: { type: "integer", description: "The channel's position in the channel list", example: 1 },
                  parentId: { type: "string", nullable: true, description: "The parent category ID" },
                  topic: { type: "string", nullable: true, description: "The channel topic" },
                  nsfw: { type: "boolean", description: "Whether the channel is NSFW" },
                  createdTimestamp: { type: "integer", description: "Unix timestamp of channel creation" },
                  permissionOverwrites: { type: "array", description: "Permission overwrites for the channel" },
                },
              },
            },
          },
        },
      },
      401: { description: "Authentication required" },
      403: { description: "Insufficient permissions to access this guild" },
      429: { description: "Rate limit exceeded" },
      500: { description: "Failed to fetch channels from Discord" },
    },
    security: [{ discordOAuth: ["identify", "guilds"] }],
  },
});

export default defineWrappedResponseHandler(
  async (event) => {
    const api = useApi();

    // Get guild ID from params
    const guildId = getGuildParam(event);

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

    const channels = await api.guilds.getChannels(guild.id).catch((error) => {
      throw createApiError({
        statusCode: 500,
        message: "Failed to fetch channels",
        data: {
          error: "channels_fetch_failed",
          message: error.message || "Unknown error",
          details: error,
        },
      });
    });

    // Return flattened guild data
    return channels.map((channel) => flattenGuildChannel(channel as any));
  },
  {
    auth: true,
    rateLimit: { enabled: true, window: seconds(5), limit: 2 },

    onSuccess(logger, data) {
      const count = Array.isArray(data) ? data.length : 0;
      const guildId = Array.isArray(data) && data.length > 0 && typeof (data)[0]?.guildId === "string"
        ? (data)[0].guildId
        : "unknown";
      logger.info(`Successfully retrieved ${count} channels for guild ID: ${guildId}`);
    },
    onError(logger, error) {
      logger.error("Channels API error:", error);
    },
  },
);
