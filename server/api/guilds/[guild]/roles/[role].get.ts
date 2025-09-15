import { manageAbility } from "#shared/utils/abilities";
import { isNullOrUndefined } from "@sapphire/utilities/isNullish";
import { createError } from "h3";

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

  const roleId = getRouterParam(event, "role");
  if (isNullOrUndefined(roleId)) {
    throw createError({
      statusCode: 400,
      message: "No role id provided",
      data: {
        field: "roleId",
        error: "role_id_required",
        message: "Role ID is required",
      },
    });
  }

  const role = await api.guilds.getRole(guild.id, roleId);

  if (isNullOrUndefined(role)) {
    throw createError({
      statusCode: 400,
      message: "Guild role not found or not accessible",
      data: {
        field: "role",
        error: "role_not_found_or_not_accessible",
        message: "Guild Role not found",
      },
    });
  }

  // Return flattened guild data
  return flattenRole(guild.id, role);
}, {
  auth: true,
  rateLimit: { enabled: true, window: seconds(5), limit: 2 },
  onError: (logger, err) => {
    logger.error("Roles API error:", {
      message: err.message,
      statusCode: err.statusCode,
      data: err.data,
    });
  },
});
