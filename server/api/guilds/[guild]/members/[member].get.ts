import { isNullOrUndefined } from "@sapphire/utilities/isNullish";
import { createError } from "h3";
import useApi from "~~/server/utils/api";
import authMiddleware from "~~/server/utils/middlewares/auth";
import { manageAbility } from "~~/shared/utils/abilities";

defineRouteMeta({
  openAPI: {
    tags: ["Discord Api"],
    description: "Get guild member data",
    parameters: [
      {
        in: "path",
        name: "guild",
        required: true,
        description: "The guild ID to fetch data for",
      },
      {
        in: "path",
        name: "member",
        required: true,
        description: "The member ID to fetch data for",
      },
    ],
  },
});

export default defineEventHandler({
  onRequest: [
    authMiddleware(),
  ],
  handler: async (event) => {
    // Get guild ID from params
    const guildId = getRouterParam(event, "guild");
    if (isNullOrUndefined(guildId)) {
      throw createError({
        statusCode: 400,
        message: "Guild ID is required",
      });
    }

    // Fetch guild data
    const api = useApi();
    const guild = await api.guilds.get(guildId, { with_counts: true });
    if (isNullOrUndefined(guild)) {
      throw createError({
        statusCode: 400,
        message: "Guild not found",
      });
    }

    const user = await event.context.$authorization.resolveServerUser();
    // Check if user ID is provided
    if (isNullOrUndefined(user)) {
      throw createError({
        statusCode: 400,
        message: "User ID is required",
      });
    }

    // Fetch member data
    const member = await api.guilds.getMember(guild.id, user.id);
    if (isNullOrUndefined(member)) {
      throw createError({
        statusCode: 400,
        message: "Member not found",
      });
    }

    if (await denies(event, manageAbility, guild, member)) {
      throw createError({
        statusCode: 403,
        message: "Insufficient permissions",
      });
    }

    const memberId = getRouterParam(event, "member");
    if (isNullOrUndefined(memberId)) {
      throw createError({
        statusCode: 400,
        message: "Member ID is required",
      });
    }

    const guildMember = await api.guilds.getMember(guild.id, memberId);

    if (isNullOrUndefined(guildMember)) {
      throw createError({
        statusCode: 404,
        message: "Guild member not found",
      });
    }

    return flattenMember(guildMember, guild);
  },
});
