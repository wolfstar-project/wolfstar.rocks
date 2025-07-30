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
        error: "guild_id_required",
        message: "Guild ID is required",
      },
    });
  }
  const api = useApi();

  const user = await event.context.$authorization.resolveServerUser();
  if (!user) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
      data: {
        error: "unauthorized",
        message: "Unauthorized",
      },
    });
  }

  // Fetch guilds with improved error handling
  logger.info(`Fetching guilds for user ${user.id}...`);
  const guild = await getGuild(event, guildId);

  // Fetch member data
  const member = await getMember(event, guild, user);

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

  const channels = (await api.guilds.getChannels(guild.id)) as any;

  // Return flattened guild data
  return flattenGuild({ ...guild, channels });
}, {
  auth: true,
  onError: (err) => {
    logger.error("Guilds API error:", {
      message: err.message,
      statusCode: err.statusCode,
      data: err.data,
    });
  },
});
