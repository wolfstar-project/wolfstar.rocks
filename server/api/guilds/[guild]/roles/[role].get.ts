import { manageAbility } from "#shared/utils/abilities";
import { isNullOrUndefined } from "@sapphire/utilities/isNullish";

defineRouteMeta({
  openAPI: {
    tags: ["Discord Api"],
    description: "Get guild role data",
    parameters: [
      {
        in: "path",
        name: "guild",
        required: true,
        description: "The guild ID to fetch data for",
      },
      {
        in: "path",
        name: "role",
        required: true,
        description: "The role ID to fetch data for",
      },
    ],
  },
});

export default defineWrappedResponseHandler(async (event) => {
  const api = useApi();

  // Get guild ID from params
  const guildId = getRouterParam(event, "guild");
  if (isNullOrUndefined(guildId)) {
    throw createApiError({
      statusCode: 400,
      message: "No guild id provided",
      data: {
        field: "guildId",
        error: "guild_id_required",
        message: "Guild ID is required",
      },
    });
  }

  const user = await event.context.$authorization.resolveServerUser();
  if (!user) {
    logger.error("Unauthorized user or missing session");
    throw createApiError({
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
  const guild = await api.guilds.get(guildId, { with_counts: true })
    .catch((error) => {
      throw createApiError({
        statusCode: 500,
        message: "Failed to fetch guilds",
        error,
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
      throw createApiError({
        statusCode: 500,
        message: "Failed to fetch member",
        error,
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

  const roleId = getRouterParam(event, "role");
  if (isNullOrUndefined(roleId)) {
    throw createApiError({
      statusCode: 400,
      message: "No role id provided",
      data: {
        field: "roleId",
        error: "role_id_required",
        message: "Role ID is required",
      },
    });
  }

  const role = await api.guilds.getRole(guild.id, roleId).catch((error) => {
    throw createApiError({
      statusCode: 500,
      message: "Failed to fetch role",
      error,
      data: {
        error: "role_fetch_failed",
        message: error.message || "Unknown error",
        details: error,
      },
    });
  });

  // Return flattened guild data
  return flattenRole(guild.id, role);
}, {
  auth: true,
  rateLimit: { enabled: true, window: seconds(5), limit: 2 },
  onError: (logger, error) =>
    logger.error(`Roles API error:\n${error.message}`),
});
