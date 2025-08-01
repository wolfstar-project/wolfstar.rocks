import { isNullOrUndefined } from "@sapphire/utilities/isNullish";
import { createError } from "h3";
import useApi from "~~/server/utils/api";

import { manageAbility } from "~~/shared/utils/abilities";

defineRouteMeta({
  openAPI: {
    tags: ["Discord Api"],
    description: "Get guild data",
    parameters: [
      {
        in: "path",
        name: "guild",
        required: true,
        description: "The guild ID to fetch data for",
      },
      {
        in: "path",
        name: "channel",
        required: true,
        description: "The channel ID to fetch data for",
      },
    ],
  },
});

export default defineWrappedResponseHandler(async (event) => {
  // Get guild ID from params
  const guildId = getRouterParam(event, "guild");
  if (isNullOrUndefined(guildId)) {
    throw createError({
      statusCode: 400,
      message: "Guild ID is required",
      data: {
        field: "guildId",
        error: "guild_id_required",
        message: "Guild ID is required",
      },
    });
  }

  const api = useApi();

  // Fetch guild data
  const user = await event.context.$authorization.resolveServerUser();
  if (!user) {
    logger.error("Unauthorized user or missing session");
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
      data: {
        field: "user",
        error: "unauthorized",
        message: "Unauthorized",
      },
    });
  }

  // Fetch guilds with improved error handling
  logger.info(`Fetching guilds for user ${user.id}...`);
  const guild = await getGuild(event, guildId);

  // Fetch member data
  const member = await getMember(event, guild, user as any);

  // Check permissions
  if (await denies(event, manageAbility, guild, member)) {
    throw createError({
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
    throw createError({
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
    throw createError({
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
    throw createError({
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
  onError: (err) => {
    logger.error("Channels API error:", {
      message: err.message,
      statusCode: err.statusCode,
      data: err.data,
    });
  },
});
