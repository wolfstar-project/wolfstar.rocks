import { manageAbility } from "#shared/utils/abilities";
import { isNullOrUndefined } from "@sapphire/utilities/isNullish";

defineRouteMeta({
  openAPI: {
    tags: ["Discord API"],
    summary: "Get channel by ID",
    description: "Retrieves detailed information about a specific channel within a guild. Requires the user to have management permissions for the guild.",
    operationId: "getGuildChannel",
    parameters: [
      {
        in: "path",
        name: "guild",
        required: true,
        description: "The Discord snowflake ID of the guild",
        schema: { type: "string", example: "123456789012345678" },
      },
      {
        in: "path",
        name: "channel",
        required: true,
        description: "The Discord snowflake ID of the channel to retrieve",
        schema: { type: "string", example: "987654321098765432" },
      },
    ],
    responses: {
      200: {
        description: "Channel data retrieved successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string", description: "The channel's snowflake ID", example: "987654321098765432" },
                type: { type: "integer", description: "The channel type (0 = text, 2 = voice, 4 = category, etc.)", example: 0 },
                guildId: { type: "string", description: "The guild's snowflake ID", example: "123456789012345678" },
                name: { type: "string", description: "The channel name", example: "general" },
                rawPosition: { type: "integer", description: "The channel's position in the channel list", example: 1 },
                parentId: { type: "string", nullable: true, description: "The parent category ID", example: "123456789012345679" },
                topic: { type: "string", nullable: true, description: "The channel topic", example: "Welcome to the general chat!" },
                nsfw: { type: "boolean", description: "Whether the channel is NSFW", example: false },
                createdTimestamp: { type: "integer", description: "Unix timestamp of channel creation", example: 1609459200000 },
                permissionOverwrites: { type: "array", description: "Permission overwrites for the channel" },
              },
            },
          },
        },
      },
      400: { description: "Channel ID is required or invalid" },
      401: { description: "Authentication required" },
      403: { description: "Insufficient permissions to access this guild" },
      404: { description: "Channel not found in the guild" },
      429: { description: "Rate limit exceeded" },
      500: { description: "Failed to fetch channel data from Discord" },
    },
    security: [{ discordOAuth: ["identify", "guilds"] }],
  },
});

export default defineWrappedResponseHandler(async (event) => {
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

  const channelId = getRouterParam(event, "channel");
  if (isNullOrUndefined(channelId)) {
    throw createApiError({
      statusCode: 400,
      message: "Channel ID is required",
      data: {
        error: "channel_id_required",
        message: "Channel ID is required",
      },
    });
  }

  const channels = await api.guilds.getChannels(guild.id).catch((error) => {
    logger.error("Failed to fetch channels:", error);
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

  const channel = channels.find(channel => channel.id === channelId) ?? null;

  if (isNullOrUndefined(channel)) {
    throw createApiError({
      statusCode: 404,
      message: "Channel not found",
      data: {
        error: "channel_not_found",
        message: "Channel not found",
      },
    });
  }
  // @ts-expect-error - Too much type checking
  return flattenGuildChannel(channel);
}, {
  auth: true,
  rateLimit: { enabled: true, window: seconds(5), limit: 2 },
  onError: (logger, error) => logger.error(`Channels API error:\n${error.message}`),
});
