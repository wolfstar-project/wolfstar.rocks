import type { RESTAPIPartialCurrentUserGuild } from "discord-api-types/v10";
import { isNullOrUndefined } from "@sapphire/utilities/isNullish";
import { createError } from "h3";
import * as yup from "yup";
import useApi from "~~/server/utils/api";
import { transformGuild } from "~~/server/utils/discord";
import { manageAbility } from "~~/shared/utils/abilities";

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

  const { shouldSerialize } = await getValidatedQuery(event, (body) => querySchema.validate(body));

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

  const channels = (await api.guilds.getChannels(guild.id)) as any;

  // Return flattened guild data
  return shouldSerialize ? transformGuild(user.id, guild as RESTAPIPartialCurrentUserGuild) : flattenGuild({ ...guild, channels });
}, {
  auth: true,
  rateLimit: { enabled: true, window: seconds(5), limit: 2 },
  onError: (logger, err) => {
    logger.error("Guilds API error:", {
      message: err.message,
      statusCode: err.statusCode,
      data: err.data,
    });
  },
});
