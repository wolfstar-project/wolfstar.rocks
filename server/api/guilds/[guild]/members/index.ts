import { isNullOrUndefined } from "@sapphire/utilities";
import * as yup from "yup";

const querySchema = yup.object({
  shouldSerialize: yup.boolean().optional(),
});

export default defineWrappedResponseHandler(async (event) => {
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

  const guild = await getGuild(event, guildId);

  const api = useApi();

  const members = await api.guilds.getMembers(guildId).catch((error) => {
    logger.error("Failed to fetch members:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch members",
      data: {
        error: "members_fetch_failed",
        message: error.message || "Unknown error",
        details: error,
      },
    });
  });

  return shouldSerialize ? members.map((member) => flattenMember(member, guild)) : members;
}, {
  auth: true,
  rateLimit: { enabled: true, window: seconds(5), limit: 2 },
  onError: (logger, error) =>
    logger.error(`Members API error:\n${error.message}`),
});
