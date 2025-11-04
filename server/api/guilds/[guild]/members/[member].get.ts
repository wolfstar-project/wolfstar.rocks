import { isNullOrUndefined } from "@sapphire/utilities/isNullish";
import { createError } from "h3";

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

export default defineWrappedResponseHandler(async (event) => {
  // Get guild ID from params
  const guildId = getRouterParam(event, "guild");
  if (isNullOrUndefined(guildId)) {
    throw createError({
      statusCode: 400,
      message: "Guild ID is required",
    });
  }

  const user = await event.context.$authorization.resolveServerUser();
  if (!user) {
    logger.error("Unauthorized user or missing session");
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

  const memberId = getRouterParam(event, "member");
  if (isNullOrUndefined(memberId)) {
    throw createError({
      statusCode: 400,
      message: "Member ID is required",
    });
  }

  // Fetch member data
  const member = await getMember(event, guild, user as any);

  return flattenMember(member, guild);
}, {
  rateLimit: { enabled: true, window: seconds(5), limit: 2 },
  auth: true,
  onError: (logger, error) =>
    logger.error(`Members API error:\n${error.message}`),
});
