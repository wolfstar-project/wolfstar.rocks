import type { RESTAPIPartialCurrentUserGuild } from "discord-api-types/v10";
import { manageAbility } from "#shared/utils/abilities";
import { isNullOrUndefined } from "@sapphire/utilities/isNullish";
import { createError } from "h3";
import * as yup from "yup";

const querySchema = yup.object({
  shouldSerialize: yup.boolean().optional(),
});

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

export default defineWrappedResponseHandler(
  async (event) => {
    const api = useApi();

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

    const { shouldSerialize } = await getValidatedQuery(event, (body) =>
      querySchema.validate(body));

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
    const guild = await api.guilds.get(guildId, { with_counts: true })
      .catch((error) => {
        throw createError({
          statusCode: 500,
          statusMessage: "Failed to fetch guilds",
          data: {
            field: "guild",
            error: "guilds_fetch_failed",
            message: error.message || "Unknown error",
            details: error,
          },
        });
      });

    // Fetch member data
    const member = await api.guilds
      .getMember(guild.id, user.id)
      .catch((error) => {
        throw createError({
          statusCode: 500,
          statusMessage: "Failed to fetch member",
          data: {
            field: "member",
            error: "member_fetch_failed",
            message: error.message || "Unknown error",
            details: error,
          },
        });
      });

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
    return shouldSerialize
      ? transformGuild(user.id, guild as RESTAPIPartialCurrentUserGuild)
      : flattenGuild({ ...guild, channels });
  },
  {
    auth: true,
    rateLimit: { enabled: true, window: seconds(5), limit: 2 },
    onError: (logger, error) => logger.error(`Guilds API error:\n${error.message}`),
  },
);
