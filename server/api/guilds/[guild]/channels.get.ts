import { manageAbility } from "#shared/utils/abilities";
import { isNullOrUndefined } from "@sapphire/utilities/isNullish";
import { createError } from "h3";

defineRouteMeta({
  openAPI: {
    tags: ["Discord Api"],
    description: "Get guild channel data",
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

export default defineWrappedResponseHandler(
  async (event) => {
    // Get guild ID from params
    const guildId = getRouterParam(event, "guild");
    if (isNullOrUndefined(guildId)) {
      throw createError({
        statusCode: 400,
        message: "No guild id provided",
        data: {
          field: "guildId",
          error: "guild_id_required",
          message: "Guild ID is required",
        },
      });
    }
    const api = useApi();

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

    const channels = await api.guilds.getChannels(guild.id).catch((error) => {
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

    // Return flattened guild data

    return channels.map((channel) => flattenGuildChannel(channel as any));
  },
  {
    auth: true,
    rateLimit: { enabled: true, window: seconds(5), limit: 2 },
  },
);
