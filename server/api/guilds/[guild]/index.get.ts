import type { RESTAPIPartialCurrentUserGuild } from "discord-api-types/v10";
import { manageAbility } from "#shared/utils/abilities";
import { isNullOrUndefined } from "@sapphire/utilities/isNullish";
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
      throw createApiError({
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
      throw createApiError({
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
        throw createApiError({
          statusCode: 500,
          message: "Failed to fetch guilds",
          error,
        });
      });

    // Fetch member data
    const member = await getMember(event, guild, user as any);

    // Check permissions
    if (await denies(event, manageAbility, guild, member)) {
      throw createApiError({
        statusCode: 403,
        message: `Insufficient permissions for: ${member.user.id} member.`,
        data: {
          error: "insufficient_permissions",
          details: {
            guild: guild.id,
            member: member.user.id,
          },
        },
      });
    }

    const channels = (await api.guilds.getChannels(guild.id).catch((error) => {
      throw createApiError({
        statusCode: 500,
        message: "Failed to fetch channels",
        error,
      });
    })) as any;

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
